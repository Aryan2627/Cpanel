/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It serves as a backend API endpoint, handling data transactions securely.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { NextResponse } from 'next/server';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET() {
  const departments = [
    { id: 'dept-1', name: 'Information Technology' },
    { id: 'dept-2', name: 'Finance & Accounting' },
    { id: 'dept-3', name: 'Human Resources' },
    { id: 'dept-4', name: 'Operations' },
    { id: 'dept-5', name: 'Legal & Compliance' },
    { id: 'dept-6', name: 'Marketing' },
    { id: 'dept-7', name: 'General' }
  ];
  return NextResponse.json(departments);
}
