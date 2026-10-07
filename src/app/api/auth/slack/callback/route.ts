import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getTenantId } from '../../../../../../lib/tenant';

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
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/slack/callback';

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
      return NextResponse.redirect(new URL('/client/settings/integrations?error=slack_oauth_failed', request.url));
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
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/client/settings/integrations?error=internal_error', request.url));
  }
}
