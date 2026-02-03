import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface InsertResult {
  insertId: number;
}

// POST - Dodaj mesečno plaćanje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, amount, date, time, note } = body;

    const result = await query(
      'INSERT INTO monthly_payments (table_id, amount, date, time, note) VALUES (?, ?, ?, ?, ?)',
      [tableId, amount, date, time, note || null]
    ) as InsertResult;

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating monthly payment:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


