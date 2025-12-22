import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Dodaj mesečno plaćanje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, amount, date, time, note } = body;

    const result: any = await query(
      'INSERT INTO monthly_payments (table_id, amount, date, time, note) VALUES (?, ?, ?, ?, ?)',
      [tableId, amount, date, time, note || null]
    );

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error: any) {
    console.error('Error creating monthly payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


