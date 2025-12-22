import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Vrati sve porudžbine
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');

    // Prvo uzmi sve porudžbine
    let sql = `
      SELECT o.*
      FROM orders o
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    if (destination) {
      sql += ' AND o.destination = ?';
      params.push(destination);
    }
    if (date) {
      sql += ' AND o.date = ?';
      params.push(date);
    }

    sql += ' ORDER BY o.created_at DESC';

    let ordersResult: any;
    try {
      ordersResult = await query(sql, params);
    } catch (dbError: any) {
      // Ako tabela ne postoji ili nema podataka, vrati prazan array
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.code === '42S02') {
        console.log('Orders table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      throw dbError;
    }

    // Ako nema rezultata, vrati prazan array
    if (!ordersResult || !Array.isArray(ordersResult) || ordersResult.length === 0) {
      return NextResponse.json([]);
    }

    // Za svaku porudžbinu, uzmi stavke
    const orders = await Promise.all(
      ordersResult.map(async (order: any) => {
        const itemsResult: any = await query(
          'SELECT name, quantity, price, category, comment FROM order_items WHERE order_id = ?',
          [order.id]
        );

        const items = Array.isArray(itemsResult) ? itemsResult.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          category: item.category,
          comment: item.comment || undefined,
        })) : [];

        // Formatiraj datum - MySQL vraća DATE kao string 'YYYY-MM-DD' ili Date objekat
        let formattedDate = order.date;
        
        // Debug log
        console.log(`Order ${order.id} - Raw date from DB:`, order.date, 'Type:', typeof order.date, 'Is Date:', order.date instanceof Date);
        
        if (order.date instanceof Date) {
          // Ako je Date objekat, koristi lokalno vreme (ne UTC)
          const year = order.date.getFullYear();
          const month = String(order.date.getMonth() + 1).padStart(2, '0');
          const day = String(order.date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } else if (typeof order.date === 'string') {
          if (order.date.includes('T')) {
            // Ako je ISO string sa vremenom, uzmi samo datum deo
            formattedDate = order.date.split('T')[0];
          } else if (order.date.includes('.')) {
            // Ako je u DD.MM.YYYY formatu, konvertuj u YYYY-MM-DD
            const [day, month, year] = order.date.split('.');
            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else if (order.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Ako je već u YYYY-MM-DD formatu, koristi ga direktno
            formattedDate = order.date;
          }
        }
        
        console.log(`Order ${order.id} - Formatted date:`, formattedDate);

        return {
          id: order.id,
          table: order.table_name,
          items: items,
          total: parseFloat(order.total),
          status: order.status,
          time: order.time,
          date: formattedDate, // YYYY-MM-DD format
          priority: order.priority,
          destination: order.destination,
        };
      })
    );

    return NextResponse.json(orders, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// POST - Kreiraj novu porudžbinu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, items, total } = body;

    // Koristi lokalno vreme, ne UTC
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    // Formatiraj datum u lokalnom vremenu (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    let priority: 'low' | 'medium' | 'high' = 'low';
    if (total > 2000) priority = 'high';
    else if (total > 1000) priority = 'medium';

    // Kreiraj porudžbinu
    const orderResult: any = await query(
      `INSERT INTO orders (table_name, total, status, time, date, priority, destination) 
       VALUES (?, ?, 'Novo', ?, ?, ?, 'waiter')`,
      [table, total, time, date, priority]
    );

    const orderId = orderResult.insertId;

    // Dodaj stavke
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, name, quantity, price, category, comment) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.name, item.quantity, item.price, item.category || null, item.comment || null]
      );
    }

    return NextResponse.json({ id: orderId, success: true });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Ažuriraj porudžbinu
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, destination } = body;

    // Proveri da li je porudžbina već "Potvrđeno" - ne dozvoljava menjanje statusa
    // Status "Potvrđeno" se ne može menjati - samo waiter/waiter-admin može potvrditi
    const existingOrder: any = await query('SELECT status FROM orders WHERE id = ?', [id]);
    if (existingOrder && existingOrder.length > 0 && existingOrder[0].status === 'Potvrđeno' && status) {
      return NextResponse.json({ error: 'Ne možete menjati status potvrđene porudžbine. Status "Potvrđeno" se ne može menjati.' }, { status: 400 });
    }

    if (status) {
      await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }
    if (destination) {
      await query('UPDATE orders SET destination = ? WHERE id = ?', [destination, id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Obriši (storniraj) porudžbinu
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Obriši porudžbinu (order_items će se obrisati automatski zbog CASCADE)
    await query('DELETE FROM orders WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

