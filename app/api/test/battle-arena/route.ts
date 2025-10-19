// API route to test battle arena database schema
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Test if battle tables exist by querying their structure
    const tableNames = [
      'battles',
      'battle_participants',
      'battle_rounds',
      'battle_submissions',
      'battle_ratings',
    ];

    const tableStatus: Record<string, boolean> = {};

    // Check each table
    for (const tableName of tableNames) {
      try {
        // Try to query the table structure
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        // If we get here without an error, the table exists
        // (Even if it returns no data, that's still success)
        tableStatus[tableName] = !error || error.code !== '42P01'; // 42P01 = undefined_table
      } catch (err) {
        tableStatus[tableName] = false;
      }
    }

    // Check if all tables exist
    const allTablesExist = Object.values(tableStatus).every(status => status);

    return NextResponse.json({
      success: true,
      message: allTablesExist
        ? 'All battle arena tables exist'
        : 'Some battle arena tables are missing',
      tableStatus,
      allTablesExist,
    });
  } catch (error) {
    console.error('Error testing battle arena database:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to test database schema',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
