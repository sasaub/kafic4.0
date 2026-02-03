import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const users = await query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    ) as User[];

    const usersArray = Array.isArray(users) ? users : [];
    if (usersArray.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = usersArray[0];
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error during login:', error);
    if (errorStack) console.error('Error stack:', errorStack);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

