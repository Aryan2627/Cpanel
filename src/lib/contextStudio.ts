import { prisma } from './prisma';

export async function getContextRulesForAgent(organizationId: string, agentName: string): Promise<string> {
  if (!organizationId || organizationId === '__unauthenticated__') return '';

  try {
    const rules = await prisma.contextDefinition.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { consumedBy: agentName },
          { consumedBy: 'All' },
          { consumedBy: 'Global' }
        ]
      }
    });

    if (rules.length === 0) return '';

    let contextString = `\n\n=== STRICT ORGANIZATIONAL CONTEXT & RULES (MUST OBEY) ===\n`;
    contextString += `You must strictly follow these global organization rules defined in Context Studio:\n\n`;

    rules.forEach((rule, idx) => {
      contextString += `Rule ${idx + 1} (${rule.name}):\n${rule.content}\n\n`;
    });

    contextString += `=========================================================\n`;
    return contextString;
  } catch (err) {
    console.error(`Failed to fetch context rules for agent ${agentName}:`, err);
    return '';
  }
}
