import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface UserRow {
  id: number;
  username: string;
  role: string;
  created_at: string | Date;
}

interface InsertResult {
  insertId: number;
}

// GET - Vrati sve korisnike
export async function GET() {
  try {
    const users = await query(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    ) as UserRow[];

    return NextResponse.json(Array.isArray(users) ? users : []);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Kreiraj novog korisnika
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password i role su obavezni' },
        { status: 400 }
      );
    }

    // Proveri da li korisnik već postoji
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    ) as Array<{ id: number }>;

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Korisnik sa tim korisničkim imenom već postoji' },
        { status: 400 }
      );
    }

    // Kreiraj korisnika
    const result = await query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    ) as InsertResult;

    return NextResponse.json({
      id: result.insertId,
      username,
      role,
      success: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating user:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Obriši korisnika
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID je obavezan' }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
