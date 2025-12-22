import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Vrati sve meni stavke
export async function GET() {
  try {
    const items: any = await query(`
      SELECT m.*, c.name as category_name, c.type as category_type
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      ORDER BY c.type, c.name, m.name
    `);

    // Ako nema rezultata ili je greška, vrati prazan array
    if (!items || !Array.isArray(items)) {
      return NextResponse.json([]);
    }

    const menuItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: parseFloat(item.price),
      category: item.category_name,
    }));

    return NextResponse.json(menuItems);
  } catch (error: any) {
    // Ako tabela ne postoji, vrati prazan array umesto greške
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
      console.log('Menu items table does not exist yet, returning empty array');
      return NextResponse.json([]);
    }
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Dodaj novu meni stavku
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category } = body;

    // Pronađi category_id
    const categories: any = await query('SELECT id FROM categories WHERE name = ?', [category]);
    const categoriesArray = Array.isArray(categories) ? categories : [];
    if (categoriesArray.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const categoryId = categoriesArray[0].id;

    const result: any = await query(
      'INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)',
      [name, description || null, price, categoryId]
    );

    return NextResponse.json({ id: result.insertId, success: true });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Ažuriraj meni stavku
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, category } = body;

    let categoryId = null;
    if (category) {
      const categories: any = await query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categories.length > 0) {
        categoryId = categories[0].id;
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

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
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

