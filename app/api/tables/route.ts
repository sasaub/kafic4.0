import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Vrati sve stolove
export async function GET() {
  try {
    const tables: any = await query('SELECT * FROM tables ORDER BY number');
    
    // Uzmi mesečna plaćanja za svaki sto
    const tablesWithPayments = await Promise.all(
      (Array.isArray(tables) ? tables : []).map(async (table: any) => {
        const payments: any = await query(
          'SELECT * FROM monthly_payments WHERE table_id = ? ORDER BY date DESC, time DESC',
          [table.id]
        );
        return {
          id: table.id,
          number: String(table.number),
          capacity: table.capacity,
          status: table.status,
          qrCode: table.qr_code,
          monthlyPayment: table.monthly_payment === 1,
          monthlyPayments: (Array.isArray(payments) ? payments : []).map((p: any) => ({
            id: p.id,
            amount: parseFloat(p.amount),
            date: p.date,
            time: p.time,
            note: p.note,
          })),
        };
      })
    );

    return NextResponse.json(tablesWithPayments);
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Dodaj novi sto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, capacity, status, monthlyPayment } = body;

    const tableNumberStr = number.toString().replace(/\s+/g, '-');
    const qrCode = `QR-${tableNumberStr.padStart(3, '0')}`;

    const result: any = await query(
      'INSERT INTO tables (number, capacity, status, qr_code, monthly_payment) VALUES (?, ?, ?, ?, ?)',
      [number, capacity, status || 'Slobodan', qrCode, monthlyPayment ? 1 : 0]
    );

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error: any) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Ažuriraj sto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, monthlyPayment } = body;

    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (monthlyPayment !== undefined) {
      updates.push('monthly_payment = ?');
      params.push(monthlyPayment ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    params.push(id);
    await query(`UPDATE tables SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Obriši sto
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await query('DELETE FROM tables WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

