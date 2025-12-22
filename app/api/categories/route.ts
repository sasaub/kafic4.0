import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Vrati sve kategorije
export async function GET() {
  try {
    const categories: any = await query('SELECT * FROM categories ORDER BY type, name');
    const result = (Array.isArray(categories) ? categories : []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
    }));
    return NextResponse.json(result);
  } catch (error: any) {
    // Ako tabela ne postoji, vrati prazan array umesto greške
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
      console.log('Categories table does not exist yet, returning empty array');
      return NextResponse.json([]);
    }
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Dodaj novu kategoriju
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type } = body;

    const result: any = await query(
      'INSERT INTO categories (name, type) VALUES (?, ?)',
      [name, type]
    );

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Obriši kategoriju
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await query('DELETE FROM categories WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

