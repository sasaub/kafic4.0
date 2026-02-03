import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ColumnRow {
  COLUMN_NAME: string;
}

interface OrderRow {
  id: number;
  table_name: string;
  total: number | string;
  status: string;
  time: string;
  date: string | Date;
  priority: string;
  destination: string;
  waiter_id?: number | null;
}

interface OrderItemRow {
  name: string;
  quantity: number;
  price: number | string;
  category: string | null;
  comment?: string | null;
}

interface CategoryRow {
  id: number;
  name: string;
  type: string;
}

interface InsertResult {
  insertId: number;
}

interface MySQLError extends Error {
  code?: string;
}

// Funkcija za proveru i dodavanje waiter_id kolone ako ne postoji
async function ensureWaiterIdColumn() {
  try {
    // Proveri da li kolona postoji
    const columns = await query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'orders' 
       AND COLUMN_NAME = 'waiter_id'`
    ) as ColumnRow[];
    
    if (!Array.isArray(columns) || columns.length === 0) {
      // Kolona ne postoji, dodaj je
      await query(`ALTER TABLE orders ADD COLUMN waiter_id INT NULL`);
      
      // Zatim dodaj foreign key ako ne postoji
      try {
        await query(
          `ALTER TABLE orders 
           ADD FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE SET NULL`
        );
      } catch (fkError) {
        // Ako foreign key već postoji ili ima problem, ignoriši
        const mysqlError = fkError as MySQLError;
        if (mysqlError.code !== 'ER_DUP_KEYNAME' && mysqlError.code !== 'ER_CANT_CREATE_TABLE') {
          console.error('Error adding foreign key:', fkError);
        }
      }
    }
  } catch (error) {
    // Ako već postoji kolona, ignoriši grešku
    const mysqlError = error as MySQLError;
    if (mysqlError.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error checking/adding waiter_id column:', error);
    }
  }
}

// POST - Potvrdi porudžbinu i kreiraj kuhinjsku porudžbinu ako ima hrane
export async function POST(request: NextRequest) {
  try {
    // Proveri i dodaj waiter_id kolonu ako ne postoji
    await ensureWaiterIdColumn();
    
    const body = await request.json();
    const { id, waiter_id } = body;

    // Uzmi porudžbinu
    const orders = await query('SELECT * FROM orders WHERE id = ?', [id]) as OrderRow[];
    const ordersArray = Array.isArray(orders) ? orders : [];
    if (ordersArray.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = ordersArray[0];
    
    // Proveri da li je već potvrđena
    if (order.status === 'Potvrđeno') {
      return NextResponse.json({ error: 'Order already confirmed' }, { status: 400 });
    }

    // Uzmi stavke
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [id]) as OrderItemRow[];
    const orderItems = Array.isArray(items) ? items : [];

    // Uzmi kategorije
    const categories = await query('SELECT * FROM categories') as CategoryRow[];
    const allCategories = Array.isArray(categories) ? categories : [];

    // Razdvoji hranu
    const foodItems = orderItems.filter((item: OrderItemRow) => {
      const category = allCategories.find((c: CategoryRow) => c.name === item.category);
      return category?.type === 'Hrana';
    });

    // Ako ima hrane, prosledi istu porudžbinu (isti ID) kuhinji
    // Promeni destination na 'kitchen' i ostavi status 'Novo' da kuhinja vidi u sekciji "Novi"
    if (foodItems.length > 0) {
      // Ažuriraj destination na 'kitchen' i ostavi status 'Novo' za kuhinju (isti ID)
      await query('UPDATE orders SET destination = ? WHERE id = ?', ['kitchen', id]);
      // Status ostaje 'Novo' - kuhinja će videti porudžbinu u sekciji "Novi"
      
      // Kreiraj kopiju porudžbine za waiter sa statusom 'Potvrđeno' (za admin/waiter prikaz)
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      
      // Proveri da li priority postoji, ako ne, koristi 'low'
      const priority = (order.priority && ['low', 'medium', 'high'].includes(order.priority)) ? order.priority : 'low';
      const total = parseFloat(String(order.total)) || 0;
      const tableName = String(order.table_name || '');
      
      // SQL upit: 7 kolona, ali status i destination su hardkodovani, tako da treba 6 parametara
      // table_name=?, total=?, status='Potvrđeno' (hardkodovano), time=?, date=?, priority=?, destination='waiter' (hardkodovano), waiter_id=?
      const waiterOrderResult = await query(
        `INSERT INTO orders (table_name, total, status, time, date, priority, destination, waiter_id) 
         VALUES (?, ?, 'Potvrđeno', ?, ?, ?, 'waiter', ?)`,
        [tableName, total, time, date, priority, waiter_id || null]
      ) as InsertResult;
      
      const waiterOrderId = waiterOrderResult.insertId;
      
      // Kopiraj sve stavke u novu waiter porudžbinu
      for (const item of orderItems) {
        const itemName = String(item.name || '');
        const itemQuantity = parseInt(String(item.quantity)) || 1;
        const itemPrice = parseFloat(String(item.price)) || 0;
        const itemCategory = item.category ? String(item.category) : null;
        const itemComment = item.comment ? String(item.comment) : null;
        
        await query(
          `INSERT INTO order_items (order_id, name, quantity, price, category, comment) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [waiterOrderId, itemName, itemQuantity, itemPrice, itemCategory, itemComment]
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Order confirmed and forwarded to kitchen (same ID for kitchen, new ID for waiter)'
      });
    } else {
      // Ako nema hrane, samo ažuriraj status na 'Potvrđeno' i waiter_id
      await query('UPDATE orders SET status = ?, waiter_id = ? WHERE id = ?', ['Potvrđeno', waiter_id || null, id]);
      
      return NextResponse.json({ success: true, message: 'Order confirmed' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error confirming order:', error);
    if (errorStack) console.error('Error stack:', errorStack);
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

