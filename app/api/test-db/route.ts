import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Test konekcije sa bazom
export async function GET() {
  try {
    // Proveri da li može da čita iz orders tabele (ovo će proveriti i bazu i tabelu)
    const ordersCount: any = await query('SELECT COUNT(*) as count FROM orders');
    
    // Proveri da li tabele postoje
    const tables: any = await query('SHOW TABLES');
    
    return NextResponse.json({ 
      success: true,
      database: 'qr_restaurant connected',
      tables: Array.isArray(tables) ? tables.length : 0,
      tableNames: Array.isArray(tables) ? tables.map((t: any) => Object.values(t)[0]) : [],
      ordersCount: ordersCount && ordersCount[0] ? ordersCount[0].count : 0,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

