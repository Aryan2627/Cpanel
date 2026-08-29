import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    
    const { 
      companyCode, tradeLicense, taxId, city, phone, type,
      entityType, registeredAddress, contactPerson, pan, gstin, cin, msme,
      productsOffered, productCategory, bankAccountName, bankAccountNumber, bankIfsc,
      companyProfile, certifications, previousExperience,
      documents
    } = data;

    // Backend Validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const bankAccRegex = /^\d{9,18}$/;

    if (pan && !panRegex.test(pan.toUpperCase())) return NextResponse.json({ error: 'Invalid PAN format.' }, { status: 400 });
    if (gstin && !gstinRegex.test(gstin.toUpperCase())) return NextResponse.json({ error: 'Invalid GSTIN format.' }, { status: 400 });
    if (bankIfsc && !ifscRegex.test(bankIfsc.toUpperCase())) return NextResponse.json({ error: 'Invalid IFSC format.' }, { status: 400 });
    if (bankAccountNumber && !bankAccRegex.test(bankAccountNumber)) return NextResponse.json({ error: 'Invalid Bank Account format.' }, { status: 400 });


    const onboardingData = {
      entityType, registeredAddress, contactPerson, pan, gstin, cin, msme,
      productsOffered, productCategory, bankAccountName, bankAccountNumber, bankIfsc,
      companyProfile, certifications, previousExperience,
      documents
    };

    const vendor = await prisma.vendor.update({
      where: { id: decoded.id },
      data: {
        companyCode,
        tradeLicense,
        taxId,
        city,
        phone,
        type,
        status: 'Approval Pending',
        onboardingData
      }
    });

    return NextResponse.json({ success: true, vendor }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error: any) {
    console.error('[vendor-onboarding]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
