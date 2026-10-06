import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: Request) {
  try {
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
        orderBy: { updatedAt: 'desc' }
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

    return NextResponse.json({ success: true, newAmount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
