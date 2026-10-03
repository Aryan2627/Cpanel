import { NextResponse } from 'next/server';

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
