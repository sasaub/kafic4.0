import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Category {
  id: number;
  name: string;
  name_en: string | null;
  type: string;
}

interface InsertResult {
  insertId: number;
}

interface MySQLError extends Error {
  code?: string;
}

// GET - Vrati sve kategorije
export async function GET() {
  try {
    // Proveri da li postoje engleske kolone
    const hasEnglishColumns = await query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'categories'
      AND COLUMN_NAME = 'name_en'
    `) as Array<{ count: number }>;
    
    const hasEnglish = hasEnglishColumns[0]?.count > 0;
    
    let categories: Category[];
    
    if (hasEnglish) {
      categories = await query('SELECT id, name, name_en, type FROM categories ORDER BY type, name') as Category[];
    } else {
      categories = await query('SELECT id, name, NULL as name_en, type FROM categories ORDER BY type, name') as Category[];
    }
    
    const result = (Array.isArray(categories) ? categories : []).map((cat: Category) => ({
      id: cat.id,
      name: cat.name,
      name_en: cat.name_en || null,
      type: cat.type,
    }));
    return NextResponse.json(result);
  } catch (error) {
    // Ako tabela ne postoji, vrati prazan array umesto greške
    const mysqlError = error as MySQLError;
    if (mysqlError.code === 'ER_NO_SUCH_TABLE' || mysqlError.code === '42S02') {
      return NextResponse.json([]);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Dodaj novu kategoriju
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type } = body;

    const result = await query(
      'INSERT INTO categories (name, type) VALUES (?, ?)',
      [name, type]
    ) as InsertResult;

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating category:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

