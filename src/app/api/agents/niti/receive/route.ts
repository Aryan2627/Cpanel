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
import { prisma } from '../../../../../lib/prisma';
import crypto from 'crypto';

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-niti-signature') || 
                      request.headers.get('x-resend-signature') || 
                      request.headers.get('x-sendgrid-signature') || 
                      request.headers.get('x-webhook-signature');

    const webhookSecret = process.env.NITI_WEBHOOK_SECRET || process.env.RESEND_WEBHOOK_SECRET;

    // HMAC Signature / Auth Verification
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Unauthorized: Missing webhook signature' }, { status: 401 });
      }

      const bodyText = await request.clone().text();
      const hmac = crypto.createHmac('sha256', webhookSecret).update(bodyText).digest('hex');
      const expectedSignature = `sha256=${hmac}`;

      if (signature !== hmac && signature !== expectedSignature) {
        return NextResponse.json({ error: 'Unauthorized: Invalid webhook signature' }, { status: 401 });
      }
    } else {
      // Fallback auth header check if env secret is not set
      const authHeader = request.headers.get('authorization') || request.headers.get('x-webhook-secret');
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized: Webhook authentication header missing' }, { status: 401 });
      }
    }

    let text = '';
    let fromEmail = '';

    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await request.json();
      text = data.text || data.html || data.payload?.text || '';
      fromEmail = data.from || data.payload?.from || '';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      text = (formData.get('text') as string) || (formData.get('html') as string) || '';
      fromEmail = (formData.get('from') as string) || '';
    }

    // Extract email from "Name <email@domain.com>" format
    const emailMatch = fromEmail.match(/<(.+)>/);
    const parsedEmail = emailMatch ? emailMatch[1] : fromEmail;

    if (!parsedEmail) {
      return NextResponse.json({ error: 'Missing from email' }, { status: 400 });
    }

    const vendor = await prisma.vendor.findFirst({
        where: { email: { contains: parsedEmail, mode: 'insensitive' } }
    });

    if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' });
    }

    const bid = await prisma.bid.findFirst({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' }
    });

    if (!bid) {
        return NextResponse.json({ error: 'Bid not found' });
    }

    let newAmount = bid.amount;
    const discountMatch = text.match(/(\d+)%\s*discount/i);
    if (discountMatch) {
        const discount = parseInt(discountMatch[1]) / 100;
        newAmount = bid.amount * (1 - discount);
    } else {
        const priceMatch = text.match(/\$([\d,]+(\.\d+)?)/);
        if (priceMatch) {
            newAmount = parseFloat(priceMatch[1].replace(/,/g, ''));
        }
    }

    await prisma.bid.update({
        where: { id: bid.id },
        data: { amount: newAmount }
    });

    // Record audit log entry for automated bid update
    await prisma.auditLog.create({
      data: {
        action: 'NITI_DISCOUNT_APPLIED',
        actorEmail: parsedEmail,
        entityType: 'Bid',
        entityRef: bid.id,
        details: JSON.stringify({ oldAmount: bid.amount, newAmount, emailTextSnippet: text.substring(0, 200) })
      }
    });

    return NextResponse.json({ success: true, newAmount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
