import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TableRow {
  id: number;
  number: number | string;
  capacity: number;
  status: string;
  qr_code: string;
  monthly_payment: number;
}

interface MonthlyPaymentRow {
  id: number;
  amount: number | string;
  date: string;
  time: string;
  note: string | null;
}

interface InsertResult {
  insertId: number;
}

// GET - Vrati sve stolove
export async function GET() {
  try {
    const tables = await query('SELECT * FROM tables ORDER BY number') as TableRow[];
    
    // Uzmi mesečna plaćanja za svaki sto
    const tablesWithPayments = await Promise.all(
      (Array.isArray(tables) ? tables : []).map(async (table: TableRow) => {
        const payments = await query(
          'SELECT * FROM monthly_payments WHERE table_id = ? ORDER BY date DESC, time DESC',
          [table.id]
        ) as MonthlyPaymentRow[];
        return {
          id: table.id,
          number: String(table.number),
          capacity: table.capacity,
          status: table.status,
          qrCode: table.qr_code,
          monthlyPayment: table.monthly_payment === 1,
          monthlyPayments: (Array.isArray(payments) ? payments : []).map((p: MonthlyPaymentRow) => ({
            id: p.id,
            amount: parseFloat(String(p.amount)),
            date: p.date,
            time: p.time,
            note: p.note,
          })),
        };
      })
    );

    return NextResponse.json(tablesWithPayments);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Dodaj novi sto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, capacity, status, monthlyPayment } = body;

    const tableNumberStr = number.toString().replace(/\s+/g, '-');
    const qrCode = `QR-${tableNumberStr.padStart(3, '0')}`;

    const result = await query(
      'INSERT INTO tables (number, capacity, status, qr_code, monthly_payment) VALUES (?, ?, ?, ?, ?)',
      [number, capacity, status || 'Slobodan', qrCode, monthlyPayment ? 1 : 0]
    ) as InsertResult;

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating table:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT - Ažuriraj sto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, monthlyPayment } = body;

    const updates: string[] = [];
    const params: (string | number)[] = [];

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating table:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

