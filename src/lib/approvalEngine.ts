import { prisma } from './prisma';

export async function evaluateApprovalMatrix(
  organizationId: string,
  approvalType: string,
  dataPayload: any // The object being created/updated
): Promise<{ requiresApproval: boolean; approvers: string[]; workflowName: string }> {
  
  // 1. Fetch matching rules for this specific approval flow type
  const rules = await prisma.approvalRule.findMany({
    where: { organizationId, approvalType },
    orderBy: { createdAt: 'asc' }
  });

  if (rules.length === 0) {
    return { requiresApproval: false, approvers: [], workflowName: '' };
  }

  let triggeredApprovers: string[] = [];

  // 2. Evaluate all rules
  for (const rule of rules) {
    let matches = false;
    
    // Extract the field value dynamically from the payload based on the rule type mapping
    // "PO Value" or "TPA" maps to payload.total
    // "itemsCount" maps to payload.itemsCount
    // "PR Price" maps to payload.price etc...
    let targetValue: any = 0;
    
    if (['TPA', 'PO Value', 'Total Proposal Value', 'estimatedValue'].includes(rule.type)) {
      targetValue = parseFloat(dataPayload.total || dataPayload.estimatedValue || dataPayload.budget || 0);
    } else if (rule.type === 'Intake Request Condition Type' || rule.type === 'Category') {
      targetValue = dataPayload.type || dataPayload.category || '';
    } else if (rule.type === 'Auction Rank' || rule.type === 'TNA score count') {
      targetValue = parseFloat(dataPayload.rank || dataPayload.score || 0);
    } else if (rule.type === 'itemsCount') {
      targetValue = parseInt(dataPayload.itemsCount || 0);
    } else {
      // Generic fallback
      targetValue = dataPayload[rule.type] || 0;
    }

    const ruleValue1 = parseFloat(rule.value1) || rule.value1;
    const ruleValue2 = rule.value2 ? (parseFloat(rule.value2) || rule.value2) : 0;

    if (rule.logic === 'More than' && typeof targetValue === 'number' && targetValue > (ruleValue1 as number)) matches = true;
    else if (rule.logic === 'Less than' && typeof targetValue === 'number' && targetValue < (ruleValue1 as number)) matches = true;
    else if (rule.logic === '>=' && typeof targetValue === 'number' && targetValue >= (ruleValue1 as number)) matches = true;
    else if (rule.logic === '<=' && typeof targetValue === 'number' && targetValue <= (ruleValue1 as number)) matches = true;
    else if (rule.logic === 'Between' && typeof targetValue === 'number' && targetValue >= (ruleValue1 as number) && targetValue <= (ruleValue2 as number)) matches = true;
    else if ((rule.logic === '==' || rule.logic === 'Equals') && targetValue == ruleValue1) matches = true;
    else if (rule.logic === 'Contains' && typeof targetValue === 'string' && targetValue.includes(ruleValue1 as string)) matches = true;
    
    // Always trigger if it's a catch-all rule (e.g. value1 is 'ALL' or empty)
    if (!rule.value1 || rule.value1 === 'ALL') matches = true;

    if (matches) {
      try {
        const ruleApprovers = JSON.parse(rule.approvers);
        if (Array.isArray(ruleApprovers)) {
          triggeredApprovers.push(...ruleApprovers);
        }
      } catch (e) {}
    }
  }

  // 3. Deduplicate approvers while maintaining sequence order
  triggeredApprovers = [...new Set(triggeredApprovers)].filter(Boolean);

  return {
    requiresApproval: triggeredApprovers.length > 0,
    approvers: triggeredApprovers,
    workflowName: `Matrix Approval - ${approvalType}`
  };
}

export async function createPendingApproval(
  organizationId: string,
  eventId: string | null,
  workflowName: string,
  approvers: string[],
  poId?: string,
  type?: string // 'PO_APPROVAL', 'INTAKE_APPROVAL', 'USER_APPROVAL'
) {
  const workflow = await prisma.workflow.create({
    data: {
      name: workflowName,
      category: 'Dynamic Matrix Approval',
      approvers: JSON.stringify(approvers),
      isActive: true
    }
  });

  const approval = await prisma.approvalRequest.create({
    data: {
      organizationId: organizationId,
      eventId: eventId || 'GLOBAL', 
      workflowId: workflow.id,
      status: 'Pending',
      currentStep: 0,
      history: JSON.stringify([{ 
        action: 'Created', 
        by: 'System (Matrix Engine)', 
        date: new Date().toISOString(),
        poId: poId || null,
        type: type || 'GENERIC_APPROVAL'
      }])
    }
  });

  // Slack Integration - Notify First Approver
  if (approvers.length > 0) {
    try {
      const org = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (org?.slackToken) {
        const approverEmail = approvers[0];
        
        // Convert poId or eventId to a display string
        const targetRef = poId ? `PO #${poId.split('-')[0]}` : `Event #${(eventId||'').split('-')[0]}`;
        const titleText = type === 'PRODUCT_APPROVAL' ? 'New Product' : type === 'USER_APPROVAL' ? 'New User Access' : 'Purchase Order';

        const slackPayload = {
          channel: approverEmail, // Slack routes by email if channel ID isn't found for enterprise grid
          text: `Approval Required: ${titleText}`,
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: `🚨 Approval Required: ${titleText}` }
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: `You have been requested to approve *${targetRef}*.\n*Workflow:* ${workflowName}` }
            },
            {
              type: "actions",
              elements: [
                { type: "button", text: { type: "plain_text", text: "Approve" }, style: "primary", value: `approve:${approval.id}` },
                { type: "button", text: { type: "plain_text", text: "Reject" }, style: "danger", value: `reject:${approval.id}` }
              ]
            }
          ]
        };

        // First, lookup user by email to get their Slack Member ID
        const lookupRes = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(approverEmail)}`, {
          headers: { 'Authorization': `Bearer ${org.slackToken}` }
        });
        const lookupData = await lookupRes.json();
        
        if (lookupData.ok && lookupData.user?.id) {
          slackPayload.channel = lookupData.user.id;
          
          await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${org.slackToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(slackPayload)
          });
        } else {
          console.log(`Slack user not found for email ${approverEmail}`);
        }
      }
    } catch (e) {
      console.error("Failed to send Slack notification:", e);
    }
  }

  return approval;
}
