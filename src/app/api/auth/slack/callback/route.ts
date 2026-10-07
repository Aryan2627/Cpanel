import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/client/settings/integrations?error=no_code', request.url));
  }

  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.redirect(new URL('/login', request.url));

    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/slack/callback`;

    const res = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        redirect_uri: redirectUri
      })
    });

    const data = await res.json();
    
    if (!data.ok) {
      console.error('Slack OAuth Error:', data);
      return NextResponse.json({ error: 'SLACK_OAUTH_FAILED', details: data, sentRedirectUri: redirectUri }, { status: 400 });
    }

    // Save to database
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        slackToken: data.access_token,
        slackTeamId: data.team.id,
        slackTeamName: data.team.name
      }
    });

    return NextResponse.redirect(new URL('/client/settings/integrations?success=slack_connected', request.url));
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', details: error.message }, { status: 500 });
  }
}
