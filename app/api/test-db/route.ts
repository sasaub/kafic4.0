import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface CountResult {
  count: number;
}

interface TableRow {
  [key: string]: string;
}

interface MySQLError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
}

// GET - Test konekcije sa bazom
export async function GET() {
  try {
    // Proveri da li može da čita iz orders tabele (ovo će proveriti i bazu i tabelu)
    const ordersCount = await query('SELECT COUNT(*) as count FROM orders') as CountResult[];
    
    // Proveri da li tabele postoje
    const tables = await query('SHOW TABLES') as TableRow[];
    
    return NextResponse.json({ 
      success: true,
      database: 'qr_restaurant connected',
      tables: Array.isArray(tables) ? tables.length : 0,
      tableNames: Array.isArray(tables) ? tables.map((t: TableRow) => Object.values(t)[0]) : [],
      ordersCount: ordersCount && ordersCount[0] ? ordersCount[0].count : 0,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD
      }
    });
  } catch (error) {
    const mysqlError = error as MySQLError;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: errorMessage,
      success: false,
      code: mysqlError.code,
      errno: mysqlError.errno,
      sqlState: mysqlError.sqlState,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

