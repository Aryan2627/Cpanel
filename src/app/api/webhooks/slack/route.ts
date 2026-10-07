import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. Verify Slack Request Signature (Security)
    const rawBody = await request.clone().text();
    const slackSignature = request.headers.get('x-slack-signature');
    const slackTimestamp = request.headers.get('x-slack-request-timestamp');
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (signingSecret && slackSignature && slackTimestamp) {
      const sigBasestring = 'v0:' + slackTimestamp + ':' + rawBody;
      const mySignature = 'v0=' + crypto.createHmac('sha256', signingSecret).update(sigBasestring).digest('hex');
      if (crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(slackSignature)) === false) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Parse Payload
    const formData = await request.formData();
    const payloadStr = formData.get('payload');
    if (!payloadStr) return NextResponse.json({ success: true }); // Acknowledge silently
    
    const payload = JSON.parse(payloadStr as string);
    
    // Slack sends interactive button clicks as block_actions
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      const [actionType, approvalId] = action.value.split(':'); // e.g., "approve:12345"

      const approval = await prisma.approvalRequest.findUnique({ where: { id: approvalId } });
      if (!approval) return NextResponse.json({ replace_original: true, text: "Error: Approval request not found." });

      const userEmail = payload.user.username; // Note: Slack requires email lookup in production

      if (actionType === 'approve') {
        await prisma.approvalRequest.update({
          where: { id: approvalId },
          data: { status: 'Approved' }
        });
        
        // Notify Slack to replace the message
        return NextResponse.json({
          replace_original: true,
          text: `✅ Approved by ${payload.user.name}`
        });
      } else if (actionType === 'reject') {
        await prisma.approvalRequest.update({
          where: { id: approvalId },
          data: { status: 'Rejected' }
        });
        
        return NextResponse.json({
          replace_original: true,
          text: `❌ Rejected by ${payload.user.name}`
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slack Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
