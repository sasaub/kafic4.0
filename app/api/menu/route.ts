import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface MenuItemRow {
  id: number;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number | string;
  category_name: string;
  category_name_en: string | null;
  category_type: string;
}

interface CategoryRow {
  id: number;
}

interface InsertResult {
  insertId: number;
}

interface MySQLError extends Error {
  code?: string;
}

// GET - Vrati sve meni stavke
export async function GET() {
  try {
    // Proveri da li postoje engleske kolone
    const hasEnglishColumns = await query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'menu_items'
      AND COLUMN_NAME = 'name_en'
    `) as Array<{ count: number }>;
    
    const hasEnglish = hasEnglishColumns[0]?.count > 0;
    
    let items: MenuItemRow[];
    
    if (hasEnglish) {
      // Ako postoje engleske kolone, uključi ih u query
      items = await query(`
        SELECT m.*, m.name_en, m.description_en, 
               c.name as category_name, c.name_en as category_name_en, c.type as category_type
        FROM menu_items m
        JOIN categories c ON m.category_id = c.id
        ORDER BY c.type, c.name, m.name
      `) as MenuItemRow[];
    } else {
      // Ako ne postoje, koristi samo srpske nazive
      items = await query(`
        SELECT m.*, NULL as name_en, NULL as description_en,
               c.name as category_name, NULL as category_name_en, c.type as category_type
        FROM menu_items m
        JOIN categories c ON m.category_id = c.id
        ORDER BY c.type, c.name, m.name
      `) as MenuItemRow[];
    }

    // Ako nema rezultata ili je greška, vrati prazan array
    if (!items || !Array.isArray(items)) {
      return NextResponse.json([]);
    }

    const menuItems = items.map((item: MenuItemRow) => ({
      id: item.id,
      name: item.name,
      name_en: item.name_en || null,
      description: item.description || '',
      description_en: item.description_en || null,
      price: parseFloat(String(item.price)),
      category: item.category_name,
      category_en: item.category_name_en || null,
    }));

    return NextResponse.json(menuItems);
  } catch (error) {
    // Ako tabela ne postoji, vrati prazan array umesto greške
    const mysqlError = error as MySQLError;
    if (mysqlError.code === 'ER_NO_SUCH_TABLE' || mysqlError.code === '42S02') {
      return NextResponse.json([]);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Dodaj novu meni stavku
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category } = body;

    // Pronađi category_id
    const categories = await query('SELECT id FROM categories WHERE name = ?', [category]) as CategoryRow[];
    const categoriesArray = Array.isArray(categories) ? categories : [];
    if (categoriesArray.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const categoryId = categoriesArray[0].id;

    const result = await query(
      'INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)',
      [name, description || null, price, categoryId]
    ) as InsertResult;

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT - Ažuriraj meni stavku
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, category } = body;

    let categoryId: number | null = null;
    if (category) {
      const categories = await query('SELECT id FROM categories WHERE name = ?', [category]) as CategoryRow[];
      if (categories.length > 0) {
        categoryId = categories[0].id;
      }
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (categoryId) {
      updates.push('category_id = ?');
      params.push(categoryId);
    }

    params.push(id);

    await query(
      `UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Obriši meni stavku
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await query('DELETE FROM menu_items WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

