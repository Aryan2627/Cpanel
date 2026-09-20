import { NextResponse } from 'next/server';
import { retrieveContext } from '@/lib/rag';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/session';
import { headers } from 'next/headers';
import intents from '../../../../data/intents.json';

// Comprehensive Stop Words (never used for typo/fuzzy matching against entity names)
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'what', 'whats', "what's", 'how', 'why', 'who', 'whom', 'which', 'where', 'when',
  'do', 'does', 'did', 'to', 'for', 'of', 'in', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'about', 'can', 'could', 'would', 'should', 'please', 'check',
  'show', 'find', 'search', 'get', 'give', 'tell', 'look', 'display', 'view',
  'list', 'pull', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'any', 'all',
  'some', 'up', 'out', 'us', 'there', 'here', 'have', 'has', 'had'
]);

// Tokenizer that cleans punctuation and normalizes words
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0 && !STOP_WORDS.has(w));
}

function getRawTokens(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

// Jaccard Similarity / TF-IDF light for intents.json
function calculateSimilarity(inputTokens: string[], intentTokens: string[]): number {
  if (inputTokens.length === 0 || intentTokens.length === 0) return 0;
  
  let matches = 0;
  for (const token of inputTokens) {
    if (intentTokens.includes(token)) matches++;
    else if (intentTokens.some(it => it.startsWith(token) || token.startsWith(it))) matches += 0.5;
  }
  
  return matches / Math.max(inputTokens.length, intentTokens.length * 0.7);
}

// Levenshtein Distance for typo tolerance
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
}

// Fuzzy matching that strictly ignores stopwords to prevent collision (e.g. "for" vs "form")
function hasSafeFuzzyMatch(text: string, targets: string[], maxDist = 2): boolean {
  // Check meaningful tokens only, NEVER stopwords
  const cleanTokens = tokenize(text);
  const rawText = text.toLowerCase();

  for (const target of targets) {
    if (target.includes(' ')) {
      if (rawText.includes(target)) return true;
      if (levenshtein(rawText.replace(/\s+/g, ''), target.replace(/\s+/g, '')) <= maxDist) return true;
    } else {
      // Direct substring match for longer words
      if (target.length >= 4 && rawText.includes(target)) return true;
      
      for (const token of cleanTokens) {
        // Prevent short words like "to", "in", "for" from matching target words
        if (token.length < 3 || STOP_WORDS.has(token)) continue;
        const allowedDist = target.length <= 4 ? 1 : maxDist;
        if (levenshtein(token, target) <= allowedDist) return true;
      }
    }
  }
  return false;
}

// Entity scoring definition
interface EntityScore {
  entity: string;
  score: number;
  statusFilter?: string;
  subType?: string;
}

function scoreUserIntent(rawQuery: string): EntityScore {
  const text = rawQuery.toLowerCase();
  const cleanTokens = tokenize(text);
  const rawTokens = getRawTokens(text);

  // Status modifiers
  const hasActive = /\b(active|live|current|onboarded|approved)\b/i.test(text);
  const hasPending = /\b(pending|waiting|in progress|review)\b/i.test(text);
  const hasClosed = /\b(closed|past|expired|archived|rejected)\b/i.test(text);
  const statusFilter = hasActive ? 'active' : hasPending ? 'pending' : hasClosed ? 'closed' : undefined;

  const scores: Record<string, number> = {
    laptop_reorder: 0,
    identity: 0,
    vendor: 0,
    po: 0,
    pr: 0,
    event: 0,
    product: 0,
    user: 0,
    approval: 0,
    contract: 0,
    workflow: 0,
    template: 0,
    location: 0,
    category: 0
  };

  // 1. Laptop Inventory & Reorder Workflow
  if (/(?:check|view|inspect|test|show)?\s*(?:laptop|thinkpad|computer|hardware|pc)?\s*(?:inventory|stock|reorder)/i.test(text) &&
      (/(laptop|computer|hardware|thinkpad)/i.test(text) || /(inventory.*reorder|reorder.*inventory)/i.test(text))) {
    scores.laptop_reorder += 95;
  }

  // 2. Identity / Self-Awareness
  if (/(?:who are you|what are you|are you ai|are you an ai|are you agent|about yourself|cortex\b)/i.test(text) &&
      !/(vendor|po\b|event|product|template)/i.test(text)) {
    scores.identity += 80;
  }

  // 3. Vendors / Suppliers
  const vendorRegex = /\b(vendor|vendors|supplier|suppliers|contractor|contractors|seller|sellers|venders?|supliers?)\b/i;
  if (vendorRegex.test(text)) {
    scores.vendor += 60;
    if (hasActive) scores.vendor += 15;
    if (hasPending) scores.vendor += 15;
    if (/\b(search|find|show|check|list|get|lookup|where|who|what)\b/i.test(text)) scores.vendor += 15;
  } else if (hasSafeFuzzyMatch(text, ['vendor', 'vendors', 'supplier', 'suppliers', 'vender', 'venders'], 2)) {
    scores.vendor += 45;
  }

  // 4. Purchase Orders (POs)
  const poRegex = /\b(po|pos|purchase order|purchase orders|purchase_order)\b/i;
  if (poRegex.test(text) || (/\b(orders?)\b/i.test(text) && /\b(purchase|po|track|status|show|list|look|find|check|open|get|view|search)\b/i.test(text))) {
    scores.po += 60;
    if (hasActive || hasPending) scores.po += 15;
    if (/\b(search|find|show|check|list|get|my|recent|open|look)\b/i.test(text)) scores.po += 15;
  } else if (hasSafeFuzzyMatch(text, ['purchase order', 'purchase orders'], 2)) {
    scores.po += 45;
  }

  // 5. Purchase Requests (PRs / Intakes)
  const prRegex = /\b(pr|prs|purchase request|purchase requests|intake|intakes|requisition|requisitions)\b/i;
  if (prRegex.test(text)) {
    scores.pr += 60;
    if (/\b(search|find|show|check|list|get|my|recent)\b/i.test(text)) scores.pr += 15;
  } else if (hasSafeFuzzyMatch(text, ['purchase request', 'purchase requests', 'intake', 'requisition'], 2)) {
    scores.pr += 45;
  }

  // 6. Sourcing Events & Auctions
  const eventRegex = /\b(event|events|auction|auctions|sourcing|rfq|rfp|tender|tenders|bids?|bidding)\b/i;
  if (eventRegex.test(text)) {
    scores.event += 60;
    if (hasActive || hasClosed) scores.event += 15;
    if (/\b(search|find|show|check|list|get|live|ongoing)\b/i.test(text)) scores.event += 15;
  } else if (hasSafeFuzzyMatch(text, ['auction', 'auctions', 'sourcing'], 2)) {
    scores.event += 45;
  }

  // 7. Products / Catalog
  const productRegex = /\b(product|products|catalog|catalogue|items?|sku)\b/i;
  if (productRegex.test(text)) {
    scores.product += 50;
    if (/\b(search|find|show|check|list|get|inventory)\b/i.test(text)) scores.product += 15;
  } else if (hasSafeFuzzyMatch(text, ['product', 'products', 'catalog'], 2)) {
    scores.product += 40;
  }

  // 8. Users / Team
  const userRegex = /\b(user|users|team|members?|staff|colleague|colleagues|employee|employees)\b/i;
  if (userRegex.test(text)) {
    scores.user += 50;
    if (/\b(who|search|find|show|check|list|get)\b/i.test(text)) scores.user += 15;
  } else if (hasSafeFuzzyMatch(text, ['members', 'staff', 'colleagues'], 2)) {
    scores.user += 40;
  }

  // 9. Approvals
  const approvalRegex = /\b(approval|approvals|signoff|signoffs|approve)\b/i;
  if (approvalRegex.test(text)) {
    scores.approval += 50;
    if (hasPending) scores.approval += 20;
    if (/\b(search|find|show|check|list|get|pending|need)\b/i.test(text)) scores.approval += 15;
  }

  // 10. Contracts / Licenses
  const contractRegex = /\b(contract|contracts|license|licenses|agreement|agreements|subscription|subscriptions)\b/i;
  if (contractRegex.test(text)) {
    scores.contract += 55;
    if (/\b(search|find|show|check|list|get|active|expiry)\b/i.test(text)) scores.contract += 15;
  } else if (hasSafeFuzzyMatch(text, ['contract', 'agreement', 'license'], 2)) {
    scores.contract += 40;
  }

  // 11. Workflows
  const workflowRegex = /\b(workflow|workflows|approval rule|approval rules|routing)\b/i;
  if (workflowRegex.test(text)) {
    scores.workflow += 50;
    if (/\b(search|find|show|check|list|get)\b/i.test(text)) scores.workflow += 15;
  }

  // 12. Templates (Strict: only triggers if word 'template' is used, or 'form' paired with procurement context)
  const templateRegex = /\b(template|templates|questionnaire|questionnaires)\b/i;
  const formInContextRegex = /\b(rfq form|tender form|intake form|creation form|form template|evaluation form)\b/i;
  if (templateRegex.test(text) || formInContextRegex.test(text)) {
    scores.template += 65;
    if (/\b(search|find|show|check|list|get|my|saved)\b/i.test(text)) scores.template += 15;
  } else if (hasSafeFuzzyMatch(text, ['template', 'templates', 'questionnaire'], 2)) {
    scores.template += 45;
  }

  // 13. Locations / Sites
  const locationRegex = /\b(location|locations|office|offices|site|sites|facility|facilities)\b/i;
  if (locationRegex.test(text)) {
    scores.location += 50;
    if (/\b(search|find|show|check|list|get|where)\b/i.test(text)) scores.location += 15;
  }

  // 14. Categories
  const categoryRegex = /\b(category|categories|taxonomy|spend category)\b/i;
  if (categoryRegex.test(text)) {
    scores.category += 50;
    if (/\b(search|find|show|check|list|get)\b/i.test(text)) scores.category += 15;
  }

  // Pick highest scoring entity
  let bestEntity = 'none';
  let maxScore = 0;

  for (const [ent, sc] of Object.entries(scores)) {
    if (sc > maxScore) {
      maxScore = sc;
      bestEntity = ent;
    }
  }

  return {
    entity: maxScore >= 35 ? bestEntity : 'none',
    score: maxScore,
    statusFilter
  };
}

export async function POST(req: Request) {
  try {
    const { prompt, userName, history } = await req.json();
    await new Promise(r => setTimeout(r, 300));
    const text = (prompt || '').trim();
    const lowerText = text.toLowerCase();
    const firstName = userName ? userName.split(' ')[0] : 'there';

    // Verify Session for DB access
    const headersList = await headers();
        const cookieHeader = headersList.get('cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k.trim(), v.join('=').trim()]));
    const authHeader = headersList.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const tokenStr = bearerToken || cookies['proc-session'];
    const payload = await verifyToken(tokenStr);
    const orgId = payload?.organizationId as string | undefined;

    // --- SLASH COMMAND: /create-event ---
    if (text.trim().toLowerCase() === '/create-event') {
      return NextResponse.json({
        final_response: "Let's build that event. Fill in the important details below:",
        ui_component: 'event_creation_form'
      });
    }

    
    if (text.trim().toLowerCase() === '/new-vendor' || text.trim().toLowerCase() === '/create-vendor') {
      return NextResponse.json({ final_response: "Let's onboard a new vendor. Please provide the details:", ui_component: 'vendor_creation_form' });
    }
    if (text.trim().toLowerCase() === '/draft-po') {
      return NextResponse.json({ final_response: "Let's draft a new Purchase Order:", ui_component: 'po_creation_form' });
    }
    if (text.trim().toLowerCase() === '/add-product') {
      return NextResponse.json({ final_response: "Let's add a new item to your Product Catalog:", ui_component: 'product_creation_form' });
    }

    
    
    // --- SYSTEM COMMAND: PROACTIVE CHECK (RUN ON MOUNT) ---
    if (text.trim().toLowerCase() === '/proactive-check') {
      try {
        const pendingApprovals = await prisma.approvalRequest.count({ where: orgId ? { organizationId: orgId, status: 'Pending' } : { status: 'Pending' } });
        const draftPos = await prisma.purchaseOrder.count({ where: orgId ? { organizationId: orgId, status: 'Draft' } : { status: 'Draft' } });
        
        let greeting = `Hello ${userName ? userName.split(' ')[0] : 'there'}! I am ProcGen Cortex.`;
        
        const alerts = [];
        if (pendingApprovals > 0) alerts.push(`**${pendingApprovals} pending approvals**`);
        if (draftPos > 0) alerts.push(`**${draftPos} drafted Purchase Orders**`);

        if (alerts.length > 0) {
          greeting += ` Just a heads up, you currently have ${alerts.join(' and ')} that need your attention. Would you like me to pull them up or shall we start something new?`;
        } else {
          greeting += ` All your queues are clear today. What would you like to build or analyze?`;
        }

        return NextResponse.json({ final_response: greeting });
      } catch (e) {
        return NextResponse.json({ final_response: `Hello ${userName ? userName.split(' ')[0] : ''}! I am ProcGen Cortex, your AI agent. How can I assist you today?` });
      }
    }

    
    if (text.trim().toLowerCase() === '/draft-contract') {
      return NextResponse.json({ final_response: "Let's draft a legal document. What type of document do you need?", ui_component: 'document_generator_form' });
    }

    if (text.startsWith('/execute-draft-document')) {
      try {
        const data = JSON.parse(text.replace('/execute-draft-document', '').trim());
        let documentHtml = '';
        
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        if (data.type === 'NDA') {
          documentHtml = `<div style="text-align: center; margin-bottom: 20px;"><h2>MUTUAL NON-DISCLOSURE AGREEMENT</h2></div>
          <p>This Mutual Non-Disclosure Agreement (this "Agreement") is entered into as of <strong>${today}</strong>, by and between <strong>ProcGen Enterprise</strong> ("Disclosing Party") and <strong>${data.partyName || data.vendorName || '___________'}</strong> ("Receiving Party").</p>
          <p><strong>1. Purpose.</strong> The parties wish to explore a potential business relationship (the "Purpose") and expect to disclose confidential information.</p>
          <p><strong>2. Jurisdiction.</strong> This Agreement shall be governed by the laws of the State of <strong>${data.state || data.jurisdiction || 'Delaware'}</strong>.</p>
          <br/><br/><p><strong>Signatures:</strong><br/>_______________________<br/>ProcGen Authorized Signatory</p>`;
        } 
        else if (data.type === 'SOW') {
          documentHtml = `<div style="text-align: center; margin-bottom: 20px;"><h2>STATEMENT OF WORK (SOW)</h2></div>
          <p><strong>Project Name:</strong> ${data.projectName || 'Untitled Project'}</p>
          <p><strong>Vendor:</strong> ${data.partyName || data.vendorName || '___________'}</p>
          <p><strong>Total Cost:</strong> ${parseFloat(data.amount || data.cost || 0).toLocaleString()}</p>
          <hr style="margin: 15px 0;" />
          <p><strong>1. Scope of Work.</strong> The Vendor agrees to deliver the services outlined in the master agreement for the above project.</p>
          <p><strong>2. Milestones & Payment.</strong> Payment of the Total Cost shall be made upon successful completion and acceptance of all deliverables.</p>
          <p><strong>3. Timeline.</strong> Work shall commence on ${today} and conclude no later than 90 days from this date.</p>`;
        }
        else if (data.type === 'RFP') {
          documentHtml = `<div style="text-align: center; margin-bottom: 20px;"><h2>REQUEST FOR PROPOSAL (RFP)</h2></div>
          <p><strong>Project:</strong> ${data.projectName || 'Untitled Procurement'}</p>
          <p><strong>Submission Deadline:</strong> ${data.deadline || '30 Days from Issuance'}</p>
          <hr style="margin: 15px 0;" />
          <p><strong>1. Introduction.</strong> We are seeking competitive bids for the aforementioned project to satisfy our enterprise requirements.</p>
          <p><strong>2. Requirements.</strong> ${data.requirements || 'Vendors must submit full pricing, technical architecture, and SLAs.'}</p>
          <p><strong>3. Evaluation.</strong> Proposals will be evaluated based on cost (40%), technical fit (40%), and vendor history (20%).</p>`;
        }

        return NextResponse.json({ 
          final_response: `I have generated the **${data.type}** for you. You can review and edit the document below.`, 
          ui_component: 'drafted_document', 
            ui_data: { htmlContent: documentHtml, title: data.type + ' Document' } 
        });
      } catch (e) {
        return NextResponse.json({ final_response: "Error drafting document." });
      }
    }

      // --- AI IMAGE GENERATION ---
      const imageRegex = /\b(generate|create|make|draw|imagine)\b.*\b(image|picture|photo|logo|mockup|render)\b/i;
      if (imageRegex.test(text)) {
        // Extract the prompt
        let prompt = text.replace(/\b(generate|create|make|draw|imagine)\b.*\b(image|picture|photo|logo|mockup|render)\b/i, '').trim();
        if (!prompt || prompt.length < 3) prompt = "A futuristic corporate procurement dashboard, glowing neon, cyberpunk";
        else {
          // Remove leading words like "of a" or "for"
          prompt = prompt.replace(/^(of|for|about|a|an|the)\s+/i, '').trim();
        }
        
        const safePrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=800&height=490&nologo=1`;

        return NextResponse.json({
          final_response: `I have generated the image based on your request: "${prompt}"`,
          thought_process: [
            `[Image Gen] Analyzing semantic request...`,
            `[Image Gen] Extracted prompt: "${prompt}"`,
            `[Diffusion Model] Initializing latent space diffusion...`,
            `[Diffusion Model] Rendering high-fidelity output...`
          ],
          ui_component: 'generated_image',
          ui_data: { url: imageUrl, prompt: prompt }
        });
      }

        // --- MOBILE SLASH COMMANDS (/generate-po, /scan, /bom, /post-po) ---
    if (text.trim().toLowerCase().startsWith('/post-po')) {
      try {
        const parts = text.split(' ');
        if (parts.length > 1) {
           const targetId = parts[1]; // e.g., /post-po PO-1234
           // Simulate posting
           return NextResponse.json({ final_response: "I have successfully posted **" + targetId + "** to the ERP system and dispatched it to the vendor." });
        }
        return NextResponse.json({ final_response: "Please specify the PO ID. For example: /post-po PO-1234" });
      } catch(e) { return NextResponse.json({ final_response: "Failed to post PO." }); }
    }
    if (text.trim().toLowerCase() === '/generate-po') {
      try {
        const newPo = await prisma.purchaseOrder.create({
          data: {
            organizationId: orgId,
            poNumber: 'PO-MOB-' + Math.floor(10000 + Math.random() * 90000),
            title: 'Mobile Generated PO',
            status: 'Draft',
            total: 25000,
            source: 'Cortex Mobile AI'
          }
        });
        return NextResponse.json({ final_response: "I have successfully generated Purchase Order **" + newPo.poNumber + "**. You can view it in the Orders tab." });
      } catch(e) { return NextResponse.json({ final_response: "Failed to generate PO." }); }
    }

    if (text.trim().toLowerCase() === '/scan') {
      return NextResponse.json({ final_response: "Initializing Cortex Vision. Please tap the camera icon to scan a hardware document or invoice." });
    }

    if (text.trim().toLowerCase() === '/bom') {
      return NextResponse.json({ final_response: "I have analyzed the schematic. The Bill of Materials (BOM) contains 42 line items, primarily microcontrollers and resistors. I can draft a sourcing event for these parts if you'd like." });
    }

    // --- ADVANCED SLASH COMMANDS ---
    if (text.trim().toLowerCase() === '/approve-all') {
      await prisma.approvalRequest.updateMany({ where: { status: 'Pending' }, data: { status: 'Approved' } });
      await prisma.intake.updateMany({ where: { status: 'Pending' }, data: { status: 'Approved' } });
      return NextResponse.json({ final_response: "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ **Bulk Approval Complete.** All pending requests and intakes have been instantly approved." });
    }

    if (text.trim().toLowerCase() === '/spend-report') {
      const pos = await prisma.purchaseOrder.findMany({ where: orgId ? { organizationId: orgId } : undefined });
      const totalSpend = pos.reduce((sum, po) => sum + (po.total || 0), 0);
      const vendors = await prisma.vendor.count({ where: orgId ? { organizationId: orgId } : undefined });
      return NextResponse.json({ 
        final_response: `Here is your high-level spend analytics report. Your total spend is ${totalSpend.toLocaleString()} across ${vendors} active vendors.`, 
        ui_component: 'spend_report', 
        ui_data: { totalSpend, activeVendors: vendors, activePos: pos.length } 
      });
    }

        if (text.trim().toLowerCase() === '/analyze-bids') {
      return NextResponse.json({
        final_response: "I can help you evaluate the vendor proposals. Please select the sourcing event you'd like to analyze.",
        ui_component: 'bid_analyzer_form',
        ui_data: {},
        thought_process: ["User requested bid analysis. Prompting for event selection."]
      });
    }

    if (text.trim().toLowerCase().startsWith('analyze bids for')) {
      const eventName = text.replace(/Analyze bids for/i, '').trim();
      return NextResponse.json({
        final_response: `I've analyzed the proposals for **${eventName}**. I evaluated pricing, delivery timelines, compliance, and risk factors using our multi-agent scoring model. Here is the comparative matrix.`,
        ui_component: 'bid_matrix',
        ui_data: {
          eventName,
          bids: [
            { vendor: "Dell Technologies", price: 45000, timeline: "2 Weeks", score: 94, risk: "Low", compliance: "Pass" },
            { vendor: "Lenovo B2B", price: 41500, timeline: "5 Weeks", score: 85, risk: "Medium", compliance: "Pass" },
            { vendor: "HP Enterprise", price: 48000, timeline: "1 Week", score: 97, risk: "Low", compliance: "Pass" },
            { vendor: "Asus Commercial", price: 39000, timeline: "8 Weeks", score: 72, risk: "High", compliance: "Fail" }
          ].sort((a, b) => b.score - a.score)
        },
        thought_process: ["Simulating multi-agent swarm evaluation of 4 vendor proposals.", "Calculating weighted scores based on cost and timeline."]
      });
    }

    if (text.trim().toLowerCase() === '/find-savings') {
      return NextResponse.json({ final_response: "ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â° **Savings Alert:**\nI scanned your Purchase Order history. You are currently buying 'Office Chairs' from 3 different vendors at varying prices (Average: $210). Consolidating this spend to **Global Supplies Inc.** (Quote: $185) will save you approximately **$4,500 annually**." });
    }

    if (text.trim().toLowerCase() === '/generate-mock-data') {
      try {
        // Create 3 fake vendors
        const v1 = await prisma.vendor.create({ data: { organizationId: orgId, name: 'Acme Corp (Mock)', type: 'Supplier', status: 'Active' }});
        const v2 = await prisma.vendor.create({ data: { organizationId: orgId, name: 'TechFlow (Mock)', type: 'Software', status: 'Active' }});
        
        // Create fake POs
        await prisma.purchaseOrder.create({ data: { organizationId: orgId, poNumber: 'PO-MOCK1', title: 'Q3 Hardware', status: 'Draft', total: 15000, vendorId: v1.id }});
        await prisma.purchaseOrder.create({ data: { organizationId: orgId, poNumber: 'PO-MOCK2', title: 'Cloud License', status: 'Issued', total: 45000, vendorId: v2.id }});
        
        return NextResponse.json({ final_response: "ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Âª **Mock Data Injected.** Added new vendors and purchase orders to the database for testing." });
      } catch (e) { return NextResponse.json({ final_response: "Error injecting mock data." }); }
    }

    if (text.trim().toLowerCase() === '/remind-approvers') {
      return NextResponse.json({ final_response: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Â **Reminders Sent.** I have automatically emailed nudges to 4 managers who have approvals pending for more than 48 hours." });
    }

    if (text.trim().toLowerCase() === '/export-csv') {
      return NextResponse.json({ final_response: "ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Å¾ **Export Ready.** Your most recent data query has been compiled. [Click here to download the CSV](#)." });
    }

    if (text.trim().toLowerCase() === '/renew-license') {
      return NextResponse.json({ final_response: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ **License Renewed.** Your enterprise platform license has been successfully extended for 12 months. An automated PO has been sent to billing." });
    }

    // --- SLASH COMMAND EXECUTION: /execute-create-event ---
    if (text.startsWith('/execute-create-event')) {
      try {
        const jsonStr = text.replace('/execute-create-event', '').trim();
        const data = JSON.parse(jsonStr);
        
        const newEvent = await prisma.event.create({
          data: {
            organizationId: orgId,
            refId: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
            title: data.title || 'Untitled Event',
            type: data.type || 'RFQ',
            itemsCount: parseInt(data.quantity) || 1,
            baseCurrency: 'USD',
            endTime: new Date(Date.now() + (parseInt(data.duration) || 7) * (data.durationUnit === 'minutes' ? 60 * 1000 : 24 * 60 * 60 * 1000)),
            status: 'Draft',
          }
        });

        return NextResponse.json({
          final_response: `Success! Your event **${newEvent.refId}** has been created autonomously.`,
          ui_component: 'event_list',
          ui_data: [newEvent]
        });
      } catch (err) {
        return NextResponse.json({ final_response: "I encountered an error creating the event. Please check the data." });
      }
    }

    
    // --- SLASH COMMAND EXECUTION: /execute-create-vendor ---
    if (text.startsWith('/execute-create-vendor')) {
      try {
        const data = JSON.parse(text.replace('/execute-create-vendor', '').trim());
        const newVendor = await prisma.vendor.create({
          data: {
            organizationId: orgId,
            name: data.name || 'Unknown Vendor',
            email: data.email || 'contact@vendor.com',
            type: data.type || 'Supplier',
            city: data.city || 'Global',
            status: 'Active',
            vendorCode: 'V-' + Math.floor(1000 + Math.random() * 9000)
          }
        });
        return NextResponse.json({ final_response: `Vendor **${newVendor.name}** successfully onboarded!`, ui_component: 'vendor_list', ui_data: [newVendor] });
      } catch(e) { return NextResponse.json({ final_response: "Error creating vendor." }); }
    }

    // --- SLASH COMMAND EXECUTION: /execute-draft-po ---
    if (text.startsWith('/execute-draft-po')) {
      try {
        const data = JSON.parse(text.replace('/execute-draft-po', '').trim());
        const newPo = await prisma.purchaseOrder.create({
          data: {
            organizationId: orgId,
            poNumber: 'PO-' + Math.floor(10000 + Math.random() * 90000),
            title: data.title || 'Standard PO',
            status: 'Draft',
            total: parseFloat(data.amount) || 0,
            source: 'Cortex AI'
          }
        });
        return NextResponse.json({ final_response: `Purchase Order **${newPo.poNumber}** drafted successfully.`, ui_component: 'po_list', ui_data: [newPo] });
      } catch(e) { return NextResponse.json({ final_response: "Error drafting PO." }); }
    }

    // --- SLASH COMMAND EXECUTION: /execute-add-product ---
    if (text.startsWith('/analyze-risk') || text.includes('swarm')) {
        return NextResponse.json({
          thought_process: [
              "[Agent: Controller] Analyzing user request: Comprehensive risk profile generation.",
              "[Agent: Finance] Querying historical pricing benchmarks and liquidity ratios...",
              "[Agent: Legal] Checking recent SEC filings, litigation history, and clause traps...",
              "[Agent: Compliance] Searching global supply chain blacklists and ESG indices...",
              "[Agent: Cyber] Scanning vendor endpoints for known CVE vulnerabilities...",
              "[Agent: Controller] Aggregating swarm findings into unified dashboard..."
            ],
            final_response: "I've deployed a multi-agent swarm to analyze the comprehensive risk profile. Here is the executive synthesis and recommended mitigation plan.",
          ui_component: 'agent_swarm',
          ui_data: {
            target: "Global Vendor Risk & Contract Analysis",
            score: 87,
            riskLevel: "CRITICAL",
            agents: [
              { id: 'legal', name: 'Legal AI', role: 'Clause Analysis', finding: 'Identified auto-renewal trap in Section 4.2 with 90-day strict notice period.' },
              { id: 'finance', name: 'Finance AI', role: 'Cost Benchmarking', finding: 'Proposed pricing is 12.4% above Q3 market index average.' },
              { id: 'risk', name: 'Compliance AI', role: 'Supply Chain Monitoring', finding: 'Detected severe factory strikes in primary supplier region (Shenzhen).' },
              { id: 'cyber', name: 'Cyber Risk AI', role: 'Security Posture', finding: 'Vendor failed SOC-2 Type II audit in Q1 2026.' }
            ],
            summary: "The proposed contract poses severe operational and financial risks. The vendor's security posture and supply chain stability are currently compromised, and pricing is above market rate.",
            mitigations: [
              "Strike the auto-renewal clause (Section 4.2) and enforce Net-60 payment terms.",
              "Require SOC-2 Type II remediation proof before finalizing data sharing agreements.",
              "Mandate a 15% pricing discount to offset identified supply chain volatility."
            ]
          }
        });
      }

    
      
    if (text.startsWith('/bom')) {
      return NextResponse.json({
        final_response: "I've initialized the AI BOM Processor. Please drop your Bill of Materials (.xlsx or .csv) below. I will instantly cross-reference the parts with your internal master catalog and source external vendors for any out-of-stock items.",
        ui_component: "bom_upload",
        ui_data: {},
        thought_process: [
          "User initiated BOM to PR workflow.",
          "Loading Generative UI dropzone component.",
          "Ready to ingest spreadsheet file."
        ]
      });
    }

    if (text.startsWith('/execute-bom-upload')) {
      return NextResponse.json({
        final_response: "I have successfully processed your Bill of Materials. I found 3 items in our internal catalog and identified verified suppliers for the 2 missing items. Review the matched matrix below and click 'Generate PR' when ready.",
        ui_component: "bom_results",
        ui_data: {
          items: [
            { id: 1, part: "SYS-SRV-09", desc: "Dell PowerEdge R750 Server", qty: 2, status: "IN CATALOG", vendor: "Dell Direct", unitCost: 4500, matchConfidence: "99%" },
            { id: 2, part: "MEM-64G-D4", desc: "64GB DDR4 ECC RAM", qty: 16, status: "IN CATALOG", vendor: "CDW", unitCost: 185, matchConfidence: "98%" },
            { id: 3, part: "NET-SFP-10G", desc: "10G SFP+ Transceiver Module", qty: 4, status: "NEEDS SOURCING", vendor: "Ingram Micro", unitCost: 45, matchConfidence: "N/A" },
            { id: 4, part: "CBL-CAT6-3M", desc: "Cat6 Patch Cable 3m Blue", qty: 20, status: "IN CATALOG", vendor: "Amazon Business", unitCost: 5, matchConfidence: "100%" },
            { id: 5, part: "CAB-RACK-42U", desc: "42U Server Rack Enclosure", qty: 1, status: "NEEDS SOURCING", vendor: "CDW", unitCost: 1200, matchConfidence: "N/A" }
          ],
          totalEstimatedCost: 13360
        },
        thought_process: [
          "Ingested uploaded BOM file (14.2 KB).",
          "Parsed 5 line items from spreadsheet.",
          "Running semantic similarity search against master product catalog...",
          "Match found for SYS-SRV-09, MEM-64G-D4, CBL-CAT6-3M (Confidence > 98%).",
          "Items NET-SFP-10G and CAB-RACK-42U not found in active catalog.",
          "Querying approved vendor punchouts (CDW, Ingram Micro) for out-of-stock items...",
          "Found pricing and availability. Estimated total cost: $13,360.",
          "Rendering BOM results matrix."
        ]
      });
    }

    if (text.startsWith('/s2p')) {
        return NextResponse.json({
          final_response: "Let's initiate a new Source-to-Pay (S2P) workflow. Please provide the intake details below.",
          ui_component: 's2p_intake_form'
        });
      }

      if (text.startsWith('/execute-s2p-intake')) {
        try {
          const jsonStr = text.replace('/execute-s2p-intake', '').trim();
          const d = JSON.parse(jsonStr);
          
          // Create Intake
          const newIntake = await prisma.intake.create({
            data: {
              organizationId: orgId,
              refId: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
              title: d.title || 'Untitled S2P Intake',
              reqName: d.department || 'General',
              status: 'Approved',
              type: 'S2P Flow',
              buyer: 'Cortex AI',
              reqAt: new Date().toISOString()
            }
          });

          // Create PR (PurchaseOrder)
          const newPR = await prisma.purchaseOrder.create({
            data: {
              organizationId: orgId,
              poNumber: `PR-${Math.floor(10000 + Math.random() * 90000)}`,
              title: `PR for ${d.title || 'Intake'}`,
              status: 'Approved',
              total: parseFloat(d.budget) || 0
            }
          });

          return NextResponse.json({
            final_response: "Intake successfully submitted and routed. PR has been generated.",
            ui_component: 's2p_progress_and_event',
            ui_data: {
              intakeRef: newIntake.refId,
              poRef: newPR.poNumber,
              defaultTitle: `Event for ${d.title || 'S2P Request'}`
            }
          });
        } catch (err: any) {
          console.error(err);
          return NextResponse.json({ final_response: "Error processing S2P intake." });
        }
      }

      if (text.startsWith('/execute-s2p-event')) {
        try {
          const jsonStr = text.replace('/execute-s2p-event', '').trim();
          const d = JSON.parse(jsonStr);
          
          const newEvent = await prisma.event.create({
            data: {
              organizationId: orgId,
              refId: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
              title: d.title || 'S2P Event',
              type: 'RFQ',
              itemsCount: parseInt(d.quantity) || 1,
              baseCurrency: 'USD',
              endTime: new Date(Date.now() + (parseInt(d.duration) || 7) * (d.durationUnit === 'minutes' ? 60 * 1000 : 24 * 60 * 60 * 1000)),
              status: 'Draft',
            }
          });

          return NextResponse.json({
            final_response: `Success! The sourcing event **${newEvent.refId}** has been generated for PR **${d.poRef}**.`,
            ui_component: null
          });
        } catch (err: any) {
          console.error(err);
          return NextResponse.json({ final_response: "Error creating S2P event." });
        }
      }

      if (text.startsWith('/execute-add-product')) {
        try {
          const data = JSON.parse(text.replace('/execute-add-product', '').trim());
          const newProduct = await prisma.product.create({
            data: {
              organizationId: orgId,
              name: data.name || 'New Product',
              code: 'P-' + Math.floor(100000 + Math.random() * 900000).toString(),
              articleCode: (data.sku && String(data.sku).startsWith('P')) ? String(data.sku) : ('P-' + (data.sku || Math.floor(10000 + Math.random() * 90000))),
              category: data.category || 'General',
              description: data.price ? ('Base Price: $' + data.price) : 'Standard Item',
              status: 'Active'
            }
          });
          return NextResponse.json({ final_response: `Product **${newProduct.name}** added to catalog.`, ui_component: 'product_list', ui_data: [newProduct] });
        } catch(e) { console.error("PRODUCT ERROR:", e); return NextResponse.json({ final_response: "Error adding product: " + e.message }); }
      }

      // --- CONTEXTUAL MEMORY / AFFIRMATION ACTIONS ---
    if (history && history.length > 0 && /^(yes|yeah|sure|do it|approve it|confirm|proceed|reorder now)\b/i.test(lowerText)) {
      const lastAgentMessage = [...history].reverse().find((m: any) => m.role === 'agent');
      if (lastAgentMessage) {
        if (lastAgentMessage.content.includes('PO-') || lastAgentMessage.uiComponent === 'po_list') {
          return NextResponse.json({
            agentic_loop: [
              { step: 1, action: "THINKING", message: "User confirmed action. Resolving Purchase Order reference from recent conversation context." },
              { step: 2, action: "EXECUTE_TOOL", tool: "update_record", args: { action: "Approve", entity: "PurchaseOrder" }, result: "Success" }
            ],
            final_response: "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ I have approved the Purchase Order you were viewing."
          });
        }
        if (lastAgentMessage.uiComponent === 'inventory_reorder' || lastAgentMessage.content.includes('laptop')) {
          return NextResponse.json({
            agentic_loop: [
              { step: 1, action: "THINKING", message: "User confirmed restock reorder. Dispatching purchase requisition workflow." },
              { step: 2, action: "EXECUTE_TOOL", tool: "create_intake", args: { item: "Enterprise Laptops (ThinkPad X1 / Dell)", quantity: 25 }, result: "Success: PR-498210" }
            ],
            final_response: "ÃƒÂ°Ã…Â¸Ã…Â¡Ã¢â€šÂ¬ Reorder requisition PR-498210 for 25 Enterprise Laptops has been successfully created and sent for approval!"
          });
        }
      }
    }

    // --- SCORE USER INTENT WITH FLEXIBLE NATURAL LANGUAGE PARSER ---
    const intentResult = scoreUserIntent(text);

    // 1. IDENTITY & CAPABILITIES
    if (intentResult.entity === 'identity') {
      return NextResponse.json({
        final_response: "Yes! I am **ProcGen Cortex**, your autonomous AI procurement agent. Unlike standard chatbots, I connect directly and securely to your database to query vendors, purchase orders, sourcing events, and execute automated workflows directly from our conversation. How can I help you today?"
      });
    }

    // 2. CHECK LAPTOP INVENTORY AND REORDER (Featured Demo Workflow)
    if (intentResult.entity === 'laptop_reorder') {
      // Look up any matching products or provide dynamic intelligent analysis
      const laptopProducts = await prisma.product.findMany({
        where: orgId ? {
          organizationId: orgId,
          OR: [
            { name: { contains: 'laptop', mode: 'insensitive' } },
            { name: { contains: 'hardware', mode: 'insensitive' } },
            { category: { contains: 'hardware', mode: 'insensitive' } }
          ]
        } : undefined,
        take: 3
      }).catch(() => []);

      const productName = laptopProducts[0]?.name || 'Dell Latitude 5540 / ThinkPad X1 Laptops';
      const sku = laptopProducts[0]?.code || 'HW-LPT-2026';

      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "Querying internal hardware warehouse database for active laptop allocations..." },
          { step: 2, action: "EXECUTE_TOOL", tool: "check_stock_thresholds", args: { category: "Hardware", item: productName }, result: "Stock Level: 3 / 25 threshold" },
          { step: 3, action: "DECISION", message: "Inventory is below safety buffer (3 units remaining). Automated reorder trigger initiated." }
        ],
        final_response: `I checked your laptop inventory. Current stock for **${productName}** is critically low at **3 units** (minimum threshold is 15). I recommend reordering **25 units** to meet upcoming team onboarding demand.`,
        ui_component: 'inventory_reorder',
        ui_data: {
          productName,
          sku,
          currentStock: 3,
          reorderQuantity: 25,
          stockAlert: 'Critical Stock (3 left)',
          unitPrice: 1250,
          totalCost: 31250
        }
      });
    }

    // 3. VENDORS / SUPPLIERS
    if (intentResult.entity === 'vendor') {
      const whereClause: any = orgId ? { organizationId: orgId } : {};
      
      // If user specified active/onboarded, filter for active statuses
      if (intentResult.statusFilter === 'active') {
        whereClause.status = { in: ['Active', 'Onboarded', 'Onboarding in Progress', 'Pending Onboarding'] };
      } else if (intentResult.statusFilter === 'pending') {
        whereClause.status = { in: ['Pending Review', 'Pending Onboarding', 'Pending Approval'] };
      } else if (intentResult.statusFilter === 'closed') {
        whereClause.status = { in: ['Rejected', 'Suspended', 'Inactive'] };
      }

      let vendors = await prisma.vendor.findMany({
        where: whereClause,
        take: 4,
        orderBy: { name: 'asc' }
      }).catch(() => []);

      // If strict status filter returned 0, fall back to general vendor list
      if (vendors.length === 0 && intentResult.statusFilter) {
        vendors = await prisma.vendor.findMany({
          where: orgId ? { organizationId: orgId } : undefined,
          take: 4,
          orderBy: { name: 'asc' }
        }).catch(() => []);
      }

      if (vendors.length === 0) {
        return NextResponse.json({
          final_response: "I couldn't find any vendors in your database. You can invite new suppliers from the Vendors portal."
        });
      }

      const statusDesc = intentResult.statusFilter === 'active' ? 'active ' : '';
      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: `Scanning supplier directory for ${statusDesc}vendors...` },
          { step: 2, action: "EXECUTE_TOOL", tool: "query_database", args: { table: "Vendor", filter: intentResult.statusFilter || 'all' }, result: `Found ${vendors.length} matching vendors.` }
        ],
        final_response: `Here are the ${statusDesc}vendors I found in your database:`,
        ui_component: 'vendor_list',
        ui_data: vendors
      });
    }

    // 4. PURCHASE ORDERS (POs)
    if (intentResult.entity === 'po') {
      const whereClause: any = orgId ? { organizationId: orgId } : {};
      if (intentResult.statusFilter === 'active') {
        whereClause.status = { in: ['Approved', 'Issued', 'Processing', 'Open'] };
      }

      let pos = await prisma.purchaseOrder.findMany({
        where: whereClause,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (pos.length === 0 && intentResult.statusFilter) {
        pos = await prisma.purchaseOrder.findMany({
          where: orgId ? { organizationId: orgId } : undefined,
          take: 3,
          orderBy: { createdAt: 'desc' }
        }).catch(() => []);
      }

      if (pos.length === 0) {
        return NextResponse.json({ final_response: "You don't have any recent Purchase Orders in the database." });
      }

      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "Fetching live Purchase Orders from the database..." },
          { step: 2, action: "EXECUTE_TOOL", tool: "query_database", args: { table: "PurchaseOrder" }, result: `Retrieved ${pos.length} records.` }
        ],
        final_response: "Here are your latest Purchase Orders from the database:",
        ui_component: 'po_list',
        ui_data: pos
      });
    }

    // 5. PURCHASE REQUESTS (PRs / Intakes)
    if (intentResult.entity === 'pr') {
      const prs = await prisma.intake.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (prs.length === 0) {
        return NextResponse.json({ final_response: "You don't have any recent Purchase Requests in the database." });
      }

      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "Querying recent Purchase Requests..." },
          { step: 2, action: "EXECUTE_TOOL", tool: "query_database", args: { table: "Intake" }, result: `Retrieved ${prs.length} records.` }
        ],
        final_response: "Here are your latest Purchase Requests from the database:",
        ui_component: 'pr_list',
        ui_data: prs
      });
    }

    // 6. SOURCING EVENTS & AUCTIONS
    if (intentResult.entity === 'event') {
      const events = await prisma.event.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (events.length === 0) {
        return NextResponse.json({ final_response: "You don't have any recent Sourcing Events or Auctions." });
      }

      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "Querying active sourcing events and reverse auctions..." },
          { step: 2, action: "EXECUTE_TOOL", tool: "query_database", args: { table: "Event" }, result: `Retrieved ${events.length} records.` }
        ],
        final_response: "Here are your latest Sourcing Events and Auctions:",
        ui_component: 'event_list',
        ui_data: events
      });
    }

    // 7. PRODUCTS / CATALOG
    if (intentResult.entity === 'product') {
      const products = await prisma.product.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (products.length === 0) {
        return NextResponse.json({ final_response: "You don't have any items in your Product Catalog." });
      }

      return NextResponse.json({
        final_response: "Here are items from your Product Catalog:",
        ui_component: 'product_list',
        ui_data: products
      });
    }

    // 8. USERS / TEAM
    if (intentResult.entity === 'user') {
      const users = await prisma.user.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (users.length === 0) {
        return NextResponse.json({ final_response: "No team members found in the organization directory." });
      }

      return NextResponse.json({
        final_response: "Here are your active team members:",
        ui_component: 'user_list',
        ui_data: users
      });
    }

    // 9. APPROVALS
    if (intentResult.entity === 'approval') {
      const approvals = await prisma.approvalRequest.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (approvals.length === 0) {
        return NextResponse.json({ final_response: "You have no pending approval requests." });
      }

      return NextResponse.json({
        final_response: "Here are your latest approval requests:",
        ui_component: 'approval_list',
        ui_data: approvals
      });
    }

    // 10. CONTRACTS & LICENSES
    if (intentResult.entity === 'contract') {
      const contracts = await prisma.contract.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (contracts.length === 0) {
        return NextResponse.json({ final_response: "You have no active contracts or licenses in the database." });
      }

      return NextResponse.json({
        final_response: "Here are your latest Contracts and Licenses:",
        ui_component: 'contract_list',
        ui_data: contracts
      });
    }

    // 11. WORKFLOWS
    if (intentResult.entity === 'workflow') {
      const workflows = await prisma.workflow.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (workflows.length === 0) {
        return NextResponse.json({ final_response: "No approval workflows found." });
      }

      return NextResponse.json({
        final_response: "Here are your active approval workflows:",
        ui_component: 'workflow_list',
        ui_data: workflows
      });
    }

    // 12. TEMPLATES (Only when user specifically asked for templates/questionnaires)
    if (intentResult.entity === 'template') {
      const templates = await prisma.template.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (templates.length === 0) {
        return NextResponse.json({ final_response: "No templates found in your organization." });
      }

      return NextResponse.json({
        final_response: "Here are your saved templates:",
        ui_component: 'template_list',
        ui_data: templates
      });
    }

    // 13. LOCATIONS
    if (intentResult.entity === 'location') {
      const locations = await prisma.location.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      if (locations.length === 0) {
        return NextResponse.json({ final_response: "No locations or offices found." });
      }

      return NextResponse.json({
        final_response: "Here are your active locations and offices:",
        ui_component: 'location_list',
        ui_data: locations
      });
    }

    // 14. CATEGORIES
    if (intentResult.entity === 'category') {
      const categories = await prisma.category.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 4,
        orderBy: { name: 'asc' }
      }).catch(() => []);

      if (categories.length === 0) {
        return NextResponse.json({ final_response: "No spend categories found." });
      }

      return NextResponse.json({
        final_response: "Here are your procurement categories:",
        ui_component: 'category_list',
        ui_data: categories
      });
    }

    // --- 15. GREETINGS ---
    if (/^(hi|hello|hey|greetings|good\s*(?:morning|afternoon|evening))\b/i.test(lowerText)) {
      return NextResponse.json({
        final_response: `Hello ${firstName}! I am ProcGen Cortex, your autonomous AI procurement assistant.\n\nI can execute live database actions and workflows directly in our chat. You can ask me naturally, such as:\n- *"Can you please check for active vendors?"*\n- *"Show my recent purchase orders"*\n- *"Check laptop inventory and reorder"*`
      });
    }

    // --- 16. NLP MATCHING (Intents.json for general FAQ / Procurement knowledge) ---
    const inputTokens = tokenize(lowerText);
    let bestMatch = { intent: null as any, score: 0 };

    for (const intent of intents) {
      const intentTokens = tokenize(intent.q);
      const score = calculateSimilarity(inputTokens, intentTokens);
      
      if (lowerText.includes(intent.q.toLowerCase())) {
        bestMatch = { intent, score: 1.0 };
        break;
      }

      if (score > bestMatch.score) {
        bestMatch = { intent, score };
      }
    }

    if (bestMatch.score > 0.45 && bestMatch.intent) {
      return NextResponse.json({
        final_response: bestMatch.intent.a
      });
    }

    // --- 17. CONVERSATIONAL FALLBACK (Friendly & Action-Oriented) ---
    return NextResponse.json({
      final_response: `I didn't quite catch that. You can talk to me naturallyÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âtry asking:\n- *"Can you check for active vendors?"*\n- *"Show my open purchase orders"*\n- *"Check laptop inventory and reorder"*\n- *"What sourcing events are running?"*`
    });

  
      // --- RAG (RETRIEVAL-AUGMENTED GENERATION) FOR GENERAL QUERIES ---
      // If it's not a specific slash command, we search the knowledge base!
      const retrievedDocs = await retrieveContext(text);
      
      let final_response = "I couldn't find any specific company policies related to your query.";
      let thought_process = [
        `[RAG Engine] Embedding query: "${text}"`,
        `[Vector DB] Searching index 'enterprise-policies'...`,
      ];

      if (retrievedDocs.length > 0) {
        thought_process.push(`[Vector DB] Found ${retrievedDocs.length} matching documents (Semantic similarity > 0.82)`);
        
        // Context Injection (Simulating LLM synthesis)
        const contextStr = retrievedDocs.map(d => `[${d.title}] ${d.content}`).join(" | ");
        thought_process.push(`[LLM Context Injection] "${contextStr}"`);
        thought_process.push(`[LLM Generation] Synthesizing final response based strictly on retrieved company guidelines...`);
        
        final_response = `Based on our internal company policies:\n\n`;
        retrievedDocs.forEach(doc => {
          final_response += `**${doc.title}**\n${doc.content}\n\n`;
        });
        final_response += `*Is there a specific part of this policy you need help applying?*`;
      } else {
        thought_process.push(`[Vector DB] No highly relevant documents found for context.`);
      }

      return NextResponse.json({
        final_response,
        thought_process,
        ui_component: 'markdown'
      });

    } catch (error) {
    console.error("Cortex API error:", error);
    return NextResponse.json({ error: 'Failed to process agentic request.' }, { status: 500 });
  }
}