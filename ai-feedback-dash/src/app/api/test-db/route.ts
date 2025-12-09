import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('test');
    
    // Test a simple database operation
    const testDoc = { test: 'connection', timestamp: new Date() };
    await collection.insertOne(testDoc);
    
    // Count documents
    const count = await collection.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB!',
      testDocument: testDoc,
      documentCount: count
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
