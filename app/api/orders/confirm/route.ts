import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Potvrdi porudžbinu i kreiraj kuhinjsku porudžbinu ako ima hrane
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    // Uzmi porudžbinu
    const orders: any = await query('SELECT * FROM orders WHERE id = ?', [id]);
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
    const items: any = await query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    const orderItems = Array.isArray(items) ? items : [];

    // Uzmi kategorije
    const categories: any = await query('SELECT * FROM categories');
    const allCategories = Array.isArray(categories) ? categories : [];

    // Razdvoji hranu
    const foodItems = orderItems.filter((item: any) => {
      const category = allCategories.find((c: any) => c.name === item.category);
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
      
      console.log('Creating waiter order with params:', {
        table_name: tableName,
        total: total,
        time: time,
        date: date,
        priority: priority,
        destination: 'waiter'
      });
      
      // SQL upit: 6 kolona, ali status i destination su hardkodovani, tako da treba 5 parametara
      // table_name=?, total=?, status='Potvrđeno' (hardkodovano), time=?, date=?, priority=?, destination='waiter' (hardkodovano)
      const waiterOrderResult: any = await query(
        `INSERT INTO orders (table_name, total, status, time, date, priority, destination) 
         VALUES (?, ?, 'Potvrđeno', ?, ?, ?, 'waiter')`,
        [tableName, total, time, date, priority]
      );
      
      const waiterOrderId = waiterOrderResult.insertId;
      
      // Kopiraj sve stavke u novu waiter porudžbinu
      for (const item of orderItems) {
        const itemName = String(item.name || '');
        const itemQuantity = parseInt(String(item.quantity)) || 1;
        const itemPrice = parseFloat(String(item.price)) || 0;
        const itemCategory = item.category ? String(item.category) : null;
        const itemComment = item.comment ? String(item.comment) : null;
        
        console.log('Inserting order item:', {
          order_id: waiterOrderId,
          name: itemName,
          quantity: itemQuantity,
          price: itemPrice,
          category: itemCategory,
          comment: itemComment
        });
        
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
      // Ako nema hrane, samo ažuriraj status na 'Potvrđeno'
      await query('UPDATE orders SET status = ? WHERE id = ?', ['Potvrđeno', id]);
      
      return NextResponse.json({ success: true, message: 'Order confirmed' });
    }
  } catch (error: any) {
    console.error('Error confirming order:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

