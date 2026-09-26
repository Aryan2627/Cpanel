import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Global prisma instance
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { clicks } = await req.json();
    
    if (!clicks || !Array.isArray(clicks) || clicks.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Try to extract user email from authorization headers or cookies if possible
    // Defaulting to "Anonymous" if unauthenticated
    let actorEmail = "Anonymous User";
    
    // Quick parse of common token patterns in Cpanel
    const authCookie = req.headers.get('cookie') || '';
    if (authCookie.includes('next-auth.session-token') || authCookie.includes('token')) {
       // Just marking that it was an authenticated session action
       actorEmail = "Authenticated Client User";
    }

    // Since we're tracking a specific client stream, we group them into an AuditLog
    // to reuse the robust AuditLog table structure without modifying DB schema.
    await prisma.auditLog.create({
      data: {
        actorEmail: actorEmail,
        action: "CLICKSTREAM_BATCH",
        entityType: "Telemetry",
        entityRef: clicks[0].path || "/",
        details: JSON.stringify({ 
          eventCount: clicks.length, 
          sessionTime: new Date().toISOString(),
          events: clicks 
        })
      }
    });

    return NextResponse.json({ success: true, recorded: clicks.length });
  } catch (err) {
    console.error("Clickstream Telemetry Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
