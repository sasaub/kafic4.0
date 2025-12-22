import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Login attempt:', { username, password: password ? '***' : 'empty' });

    const users: any = await query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    console.log('Query result:', users);

    const usersArray = Array.isArray(users) ? users : [];
    if (usersArray.length === 0) {
      console.log('No user found with these credentials');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = usersArray[0];
    console.log('Login successful:', { id: user.id, username: user.username, role: user.role });
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

