# ProcGen Procurement Portal: Complete Architectural & Technical Guide
*A comprehensive, beginner-friendly handbook on the system architecture, workflows, tech stack, and file relationships.*

---

## Table of Contents
1. [Executive Summary: What is ProcGen?](#1-executive-summary-what-is-procgen)
2. [Procurement 101: Core Concepts for Beginners](#2-procurement-101-core-concepts-for-beginners)
3. [The Complete End-to-End Workflow](#3-the-complete-end-to-end-workflow)
4. [System Architecture & Multi-Tenant Design](#4-system-architecture--multi-tenant-design)
5. [The Technology Stack & Why Each Tool Was Chosen](#5-the-technology-stack--why-each-tool-was-chosen)
6. [Comprehensive Directory & File Breakdown](#6-comprehensive-directory--file-breakdown)
7. [How Files are Interconnected (The Connection Web)](#7-how-files-are-interconnected-the-connection-web)
8. [Explanation of the Root Patch & Migration Scripts](#8-explanation-of-the-root-patch--migration-scripts)
9. [Crucial Topics You Didn't Ask About (Hidden Gems & Pro Secrets)](#9-crucial-topics-you-didnt-ask-about-hidden-gems--pro-secrets)
10. [Local Development, Deployment, & Operations](#10-local-development-deployment--operations)

---

## 1. Executive Summary: What is ProcGen?

### The Problem it Solves
In large corporations and modern enterprises, buying goods and services (everything from 500 MacBooks to cleaning services, raw steel, or software licenses) is notoriously slow, chaotic, and manual. Employees send emails or spreadsheets asking for items, procurement managers struggle to collect quotes from vendors, negotiate prices manually, verify compliance, get managerial sign-offs, and track purchase orders in complex ERP systems like SAP.

### What ProcGen Does
**ProcGen (Procurement Generation Portal)** is an enterprise-grade, multi-tenant B2B **e-Procurement and Strategic Sourcing Platform**. It digitizes and automates the entire B2B purchasing lifecycle:

1. **Intake & Requisitions**: Employees request goods or services through a shopping-cart-style interface or manual PR (Purchase Request) forms.
2. **Approval Engine**: Dynamic approval matrices automatically route high-dollar purchases to department heads, finance, and legal based on custom business rules.
3. **Sourcing Events & Reverse e-Auctions**: Sourcing managers launch RFQs (Request for Quotations) or live Reverse Auctions where suppliers compete in real-time, driving prices down for the buyer.
4. **Autonomous AI Procurement Agents**: An autonomous negotiator bot powered by **NVIDIA Nemotron LLMs** can negotiate directly against suppliers within set budgets and concession rules.
5. **Vendor Portal**: A dedicated, secure portal where suppliers log in, submit sealed bids, compete in live dynamic auctions, and sign contracts.
6. **Purchase Orders & ERP Integration**: Automatically generates POs, creates legally binding digital contracts with e-signatures, and synchronizes data with enterprise systems like SAP S/4HANA.
7. **In-App AI Copilot ("Jarvis")**: A contextual voice and chat copilot with short-term memory that can execute platform actions, summarize bidding events, pull supplier risk profiles, and navigate users.

---

## 2. Procurement 101: Core Concepts for Beginners

If you are new to corporate procurement or software engineering, here are the essential industry terms used throughout the code:

| Concept | Plain English Explanation | Where in Code |
| :--- | :--- | :--- |
| **Purchase Requisition (PR) / Intake** | An internal request made by an employee stating: *"Our team needs 20 monitors and 5 ergonomic chairs."* | `src/app/client/intake/`, `src/app/client/pr/` |
| **NFA (Note for Approval)** | A formal justification document explaining why the company needs to spend money, submitted before money is committed. | `model Intake` (`type: "Standalone NFA"`) |
| **RFQ (Request for Quotation)** | Sending a formal inquiry to multiple vetted vendors asking: *"Give us your best itemized price and terms for these items."* | `src/app/client/events/create/single-stage/` |
| **Reverse Auction** | In a normal auction (like eBay), buyers bid prices UP. In a **Reverse Auction**, suppliers bid prices **DOWN** to win the buyer's business. | `src/app/client/events/create/auction/` |
| **Japanese Reverse Auction** | A specialized clock auction where the platform systematically decreases the price at scheduled intervals (e.g. drops $500 every 2 minutes). Suppliers must accept the lower price or get knocked out. The last remaining vendor wins. | `src/app/client/events/create/auction/` (`japTickInterval`, `japDropAmount`) |
| **Sealed vs Open Bidding** | **Sealed**: Suppliers submit blind bids without seeing what competitors bid. **Open**: Suppliers see the current lowest bid or their real-time rank (e.g., *"You are currently Rank #2"*). | `model Event` (`feedbackMode: "Sealed"` / `"Rank"`) |
| **Surrogate Bidding** | When a supplier calls in or emails their quote because they can't log in, a buyer can place the bid on their behalf with an audit trail. | `src/app/client/events/[id]/` (`surrogate`) |
| **Purchase Order (PO)** | The legally binding commercial document sent to a vendor authorizing them to deliver goods and invoice the company. | `src/app/client/po/`, `src/app/api/pos/` |
| **ERP (Enterprise Resource Planning)** | The massive accounting/operations system (like SAP or Oracle) where companies officially record finances and inventory. | `src/lib/erp/SAPConnector.ts` |
| **Multi-Tenancy** | A single software deployment that securely serves multiple different companies (tenants) without their data ever leaking to each other. | `src/lib/tenant.ts`, `model Organization` |

---

## 3. The Complete End-to-End Workflow

Here is how data flows through the application from the moment a need arises to the final supplier payout:

```mermaid
flowchart TD
    A[Employee / Buyer] -->|Creates Request| B[Intake / PR Module]
    B -->|Requires Approval| C{Approval Workflow Engine}
    C -->|Exceeds Dollar Threshold| D[Managers / Approvers Review]
    D -->|Approved| E[Sourcing Event Studio]
    C -->|Pre-Approved / Low Value| E
    
    E -->|Select Type| F{Event Strategy}
    F -->|Option 1: RFQ| G[Single-Stage Tender]
    F -->|Option 2: Reverse Auction| H[Dynamic Live e-Auction]
    F -->|Option 3: AI Agent| I[Autonomous AI Negotiator]
    
    G & H & I -->|Email Notifications| J[Vendor Portal]
    J -->|Suppliers Log In| K[Vendor Submits Quotes / Bids]
    
    K -->|Real-Time Bidding Engine| L[Tender Evaluation & Scoring]
    L -->|Award Winning Bid| M[Generate PO & Digital Contract]
    M -->|e-Signatures| N[Client & Vendor E-Sign]
    M -->|ERP Connector| O[Sync PO into SAP S/4HANA]
```

### Stage-by-Stage Breakdown

#### Step 1: Demand Generation (Intake & PR)
- An employee visits `/client/intake` or uses the AI Copilot ("Jarvis, create intake for 50 Dell monitors").
- Alternatively, they can open the **Product Catalog**, browse pre-negotiated corporate items, add them to the **CartOverlay**, and check out.
- The system generates an internal tracking ID (`PR-xxxxxx` or `NFA-xxxxxx`).

#### Step 2: Automated Approval Routing
- Once submitted, the system checks configured `Workflow` rules (`src/app/api/workflows`).
- If the intake or tender matches specific criteria (e.g. category = "IT Hardware" or amount > $10,000), an `ApprovalRequest` is instantiated.
- Approvers receive notifications and approve or reject it from `/client/approvals`.

#### Step 3: Event Creation (Tenders & Auctions)
- Sourcing officers convert approved requests into Sourcing Events (`EVT-xxxxx`).
- They can choose:
  - **Single-Stage RFQ**: Static quotes and technical questionnaires.
  - **Multi-Stage Auction**: Stage 1 = Technical Qualification questionnaire; Stage 2 = Commercial Live Bidding.
  - **Japanese Clock Auction**: Automated scheduled price drops.
- Vendors are selected from the global directory or matched using the interactive **Vendor Matchmaking** module.

#### Step 4: Vendor Invitation & Bidding
- Nodemailer sends automated email invites to suppliers with magic links.
- Vendors log into their specialized portal (`/vendor`), view the specification, upload trade licenses/tax certifications, and place bids.
- The platform calculates live currency exchange rates (e.g., converting EUR or INR bids to base USD) and updates rankings.

#### Step 5: Autonomous AI Negotiation (Agent Alpha)
- Buyers can deploy **ProcGen Agent Alpha** against stubborn vendors (`/client/ai-agents`).
- The buyer sets constraints: Target Price ($8,000), Max Budget ($9,500), and concessions (e.g. "Net-15 payment terms", "Multi-year volume guarantee").
- The NVIDIA Nemotron LLM negotiates in natural language via API, pushing the vendor for discounts without leaking internal thresholds. When agreed, it locks the contract.

#### Step 6: Contracting, PO Issuance, & ERP Sync
- The winning bidder is selected.
- A legally binding `PurchaseOrder` (`PO-xxxxx`) is minted.
- A `Contract` is drafted for mutual electronic signature (`clientSigned` & `vendorSigned`).
- The background `after()` hook or manual trigger invokes `SAPConnector.ts`, pushing the PO into SAP S/4HANA.

---

## 4. System Architecture & Multi-Tenant Design

ProcGen is architected as a **modular monolithic SaaS** built on Next.js 16 and PostgreSQL, containerized with Docker, and orchestrable via Kubernetes.

```mermaid
graph TB
    subgraph Client Tier
        UI_Buyer["Buyer Web App (/client)"]
        UI_Vendor["Vendor Portal (/vendor)"]
        UI_Admin["Superadmin Panel (/admin)"]
    end

    subgraph Edge & Routing Tier
        MW["Next.js Edge Middleware (src/middleware.ts)"]
        AUTH["Auth & Session Layer (Jose JWT & NextAuth)"]
        TENANT["Tenant Resolver (src/lib/tenant.ts)"]
    end

    subgraph Application & Business Logic Tier
        API_Events["/api/events (Tenders & Auctions)"]
        API_Bids["/api/bids (Surrogate & Live Bidding)"]
        API_AI["/api/ai/negotiate (NVIDIA Nemotron LLM)"]
        API_Jarvis["/api/jarvis (Copilot & In-Memory State)"]
        API_ERP["/api/erp & SAPConnector (Sync Engine)"]
    end

    subgraph Data & Storage Tier
        Prisma["Prisma ORM (src/lib/prisma.ts)"]
        Postgres[(PostgreSQL Database)]
    end

    UI_Buyer & UI_Vendor & UI_Admin --> MW
    MW --> AUTH
    AUTH --> TENANT
    TENANT --> API_Events & API_Bids & API_AI & API_Jarvis & API_ERP
    API_Events & API_Bids & API_AI & API_Jarvis & API_ERP --> Prisma
    Prisma --> Postgres
```

### Multi-Tenancy Architecture
Every major database table (`User`, `Event`, `Intake`, `PurchaseOrder`, `Bid`, `Vendor`, `Workflow`) has an `organizationId` foreign key.
- **How Tenant Isolation Works**: When an incoming HTTP request hits the API, `src/lib/tenant.ts` inspects the verified `proc-session` JWT token.
- It extracts the user's `organizationId`.
- Every subsequent Prisma query strictly appends: `where: { organizationId: orgId }`.
- Even if Company A and Company B share the same database, Company A can never view, update, or guess the records of Company B.

---

## 5. The Technology Stack & Why Each Tool Was Chosen

| Technology | Version / Tool | Why It Was Chosen |
| :--- | :--- | :--- |
| **Next.js** | `^16.3.4` (App Router) | Combines frontend React server components with backend API routes in a single unified codebase. Provides the `after()` API for zero-latency background processing. |
| **React** | `19.2.4` | The industry-standard declarative UI library, paired with React 19's enhanced concurrency, server actions, and transition hooks. |
| **TypeScript** | `^5` | Enforces strict static type safety across API request/response payloads, database models, and UI props, eliminating runtime bugs. |
| **Prisma ORM** | `^5.22.0` | Modern, type-safe database toolkit. Generates an auto-typed client based on `schema.prisma`, making database queries reliable and self-documenting. |
| **PostgreSQL** | PostgreSQL | Robust, ACID-compliant relational database. Perfect for transactional enterprise data (orders, currency floats, audit trails, and multi-tenant relations). |
| **TailwindCSS** | `^4` (with PostCSS) | Modern utility-first CSS engine. Version 4 provides ultra-fast builds, CSS variable theming, and eliminates huge CSS bundle sizes. |
| **Jose & NextAuth** | `jose: ^6.2`, `next-auth: ^4` | High-performance JSON Web Token (JWT) signing and verification compatible with Edge runtimes, preventing auth latency. |
| **NVIDIA Nemotron AI** | `nemotron-3-nano-30b` | State-of-the-art LLM hosted on NVIDIA's integrated API for complex natural language reasoning and autonomous price bargaining. |
| **Nodemailer** | `^9.0.5` | Standard Node.js email sending library for dispatching invitation emails and bid notifications to vendors. |
| **Twilio** | `^6.1.0` | SMS notification pipeline for critical auction alerts and two-factor authentication. |
| **Driver.js** | `^1.8.0` | Interactive product tour engine that guides new users through dashboard components (`TourButton.tsx`). |
| **Lucide React** | `^1.27.0` | Clean, modern, lightweight SVG iconography across all portal views. |
| **XLSX** | `^0.18.5` | Spreadsheet parser enabling enterprise buyers to bulk-upload product line items or download auction bid histories. |
| **Playwright** | `^1.62.1` | End-to-end browser automation testing framework for validating critical user paths (login, bidding, approvals). |
| **Docker & Kubernetes**| Multi-stage Dockerfile | Containerizes the app into an alpine Linux micro-container; Kubernetes YAMLs (`deployment.yaml`, `hpa.yaml`) handle auto-scaling. |

---

## 6. Comprehensive Directory & File Breakdown

Below is the file map of the application, explaining the purpose of each key folder and file.

### Root Level Configurations
- **`package.json`**: Declares dependencies, scripts (`dev`, `build`, `start`, `lint`, `postinstall: prisma generate`), and pre-commit hooks.
- **`next.config.mjs` / `next.config.ts`**: Next.js framework configuration (optimizations, headers, webpack/turbopack rules).
- **`server.js`**: Custom Node.js HTTP server wrapper for running the production build in standalone Docker containers.
- **`Dockerfile`**: 3-stage production Docker build (Stage 1: `deps`, Stage 2: `builder` with Prisma compilation, Stage 3: minimal Alpine `runner`).
- **`k8s/`**:
  - `deployment.yaml`: Kubernetes Deployment specification defining pod replicas, container ports, environment variables, and resource limits.
  - `hpa.yaml`: Horizontal Pod Autoscaler (scales pods from 2 to 10 based on CPU/memory usage).
  - `service.yaml`: Exposes the pods internally via a cluster IP / LoadBalancer.
- **`.github/workflows/ci.yml`**: GitHub Actions pipeline that triggers on push to `main` to install dependencies, run linting, and verify builds.

---

### Database Layer: `prisma/`
- **`prisma/schema.prisma`**: The source of truth for the entire database. It defines:
  - `Organization`: The tenant boundary (stores branding, custom features, domain).
  - `User`: Corporate employees with roles (Admin, Buyer, Approver).
  - `Vendor`: Registered external suppliers.
  - `Event`: RFQs and Reverse Auctions with stages and JSON metadata.
  - `Bid`: Vendor bids with currency, exchange rates, and line-item prices.
  - `PurchaseOrder`: Official PO records linked to awarded events.
  - `Workflow` & `ApprovalRequest`: Hierarchical approval rules and history.
  - `JarvisMemory`: Short-term context memory for the AI assistant.
  - `AuditLog`: Immutable history of critical system actions.

---

### Core Library: `src/lib/`
- **`src/lib/prisma.ts`**: Global PrismaClient singleton ensuring the database connection pool is reused without exhausting PostgreSQL connections.
- **`src/lib/session.ts`**: Lightweight JWT signing and verification using `jose` (`signToken`, `verifyToken`).
- **`src/lib/auth.ts`**: NextAuth options and credentials provider for password validation using `bcryptjs`.
- **`src/lib/tenant.ts`**: Multi-tenant resolution utility (`getTenantId()`) extracting tenant identity from cookies with safe fallbacks.
- **`src/lib/audit.ts`**: Helper to record audit events into the database for compliance.
- **`src/lib/email-service.ts`**: Transporter using `nodemailer` to dispatch vendor invitations and alert emails.
- **`src/lib/erp/`**:
  - `ERPConnector.ts`: TypeScript interface defining how ERP systems must interact with ProcGen.
  - `SAPConnector.ts`: Concrete implementation simulating SAP S/4HANA PR fetching and PO syncing.

---

### Global Middleware & State: `src/middleware.ts` & `src/context/`
- **`src/middleware.ts`**: Intercepts requests to `/client/*`, `/vendor/*`, and `/admin/*`. If no session token (`proc-session`, `auth_token`, or NextAuth cookie) exists, redirects immediately to `/login`.
- **`src/context/IntakeContext.tsx`**: Global React Context providing reactive access to line items in the cart and drafts.
- **`src/context/ToastContext.tsx`**: Notification toast banner provider for success/error alerts.

---

### The Client Portal: `src/app/client/`
This is the command center for enterprise procurement teams:
- **`layout.tsx`**: Main dashboard layout featuring collapsible sidebar navigation, user profile header, flyout menus, and the license expiry guard.
- **`page.tsx`**: Executive overview dashboard displaying KPI metric cards (Total Spend, Active Tenders, Savings Realized, Pending Approvals, Recent POs).
- **`JarvisAssistant.tsx`**: The voice-enabled floating AI copilot widget.
- **`SpotlightSearch.tsx`**: Quick-action search modal (triggered via `Ctrl+K`) to jump to any PO, event, or supplier instantly.
- **`TourButton.tsx`**: Interactive onboarding walkthrough powered by Driver.js.
- **`CartOverlay.tsx`**: Slide-out shopping cart for requisitioning items directly from the catalog.
- **Sub-pages**:
  - `events/`: Listing of tenders and auctions (`page.tsx`) and the real-time event control room (`[id]/page.tsx`).
  - `events/create/auction/`: High-powered wizard for configuring Japanese and English Reverse Auctions.
  - `events/create/single-stage/`: Wizard for standard RFQ / RFP tenders.
  - `intake/`: Purchase request tracker and standalone NFA submission form.
  - `approvals/`: Management interface to review, approve, or reject pending spending requests.
  - `ai-agents/`: Autonomous AI Negotiator control panel to launch bot-to-supplier bargaining sessions.
  - `vendors/`: Global supplier directory, risk scoring, and in-app vendor chat (`messages/`).
  - `po/`: Purchase order management, splitting items across vendors, and ERP dispatch.
  - `manage/`: Master data administration (`products`, `templates`, `users`, `workflows`).
  - `license/`: Enterprise software license asset tracker, contract expiry alarms, and renewal PO generator.

---

### The Vendor Portal: `src/app/vendor/`
A streamlined, secure environment built specifically for external suppliers:
- **`page.tsx`**: Vendor home showing invitations, awarded orders, and pending actions.
- **`events/[id]/page.tsx`**: Live bidding console where suppliers watch the auction timer, see their rank/competitor bids, and submit counter-offers.

---

### The Superadmin Portal: `src/app/admin/`
- **`page.tsx`**: Platform management dashboard for global system administrators.
- **`audit/page.tsx`**: Compliance view tracking system-wide logins, data modifications, and security actions.

---

### Backend API Routes: `src/app/api/`
Next.js serverless route handlers:
- **`api/auth/*` & `api/vendor-auth/*`**: Authentication endpoints (login, registration, session checks).
- **`api/events/*`**: CRUD operations for tenders/auctions; invokes Next.js `after()` for non-blocking notifications.
- **`api/bids/*` & `api/vendor-bids/*`**: Bid recording, validation, surrogate bid entry, and history tracking.
- **`api/ai/negotiate/route.ts`**: NVIDIA Nemotron API bridge handling automated negotiation prompts and constraints.
- **`api/jarvis/chat/route.ts`**: Copilot natural-language parser that converts user intentions into system queries and UI navigation.
- **`api/pos/*` & `api/vendor-pos/*`**: PO creation, line-item splitting, and status updates.
- **`api/erp/*`**: Endpoints triggering bi-directional synchronizations with external ERPs like SAP.
- **`api/license/*`**: License validation, renewal PO triggers, and grace period calculations.
- **`api/exchange-rates/*`**: Multi-currency conversion calculation service.

---

## 7. How Files are Interconnected (The Connection Web)

To understand how code actually executes, consider this real-world user scenario: **A buyer creates a new Reverse Auction**.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    participant UI as client/events/create/auction/page.tsx
    participant Context as context/IntakeContext.tsx
    participant Route as api/events/route.ts
    participant Tenant as lib/tenant.ts
    participant Prisma as lib/prisma.ts
    participant DB as PostgreSQL
    participant Email as lib/email-service.ts
    participant VendorUI as vendor/events/[id]/page.tsx

    Buyer->>UI: Fills auction details (title, dates, items) & clicks "Publish"
    UI->>Context: Reads linked PR items from cart
    UI->>Route: POST /api/events (JSON payload)
    Route->>Tenant: getTenantId()
    Tenant-->>Route: returns "org-uuid-123"
    Note over Route: Next.js after() initiates background tasks
    Route-->>UI: Immediate response 201 Created (Instant UI redirect)
    
    rect rgb(240, 248, 255)
        Note over Route,Email: Background Execution (after())
        Route->>Prisma: prisma.event.create(...)
        Prisma->>DB: INSERT into "Event"
        Route->>Prisma: prisma.jarvisMemory.create(...)
        Prisma->>DB: INSERT into "JarvisMemory"
        Route->>Email: sendVendorInvitation(...)
        Email-->>Buyer: Vendor notified via email
    end

    Buyer->>UI: Redirected to client/events/[id]/page.tsx (Live Dashboard)
    VendorUI->>Route: GET /api/events/[id] (Vendor logs in to bid)
```

1. **Frontend User Action**:
   The user fills out the form at `src/app/client/events/create/auction/page.tsx`.
2. **Context & State Integration**:
   The page pulls line-item data from `src/context/IntakeContext.tsx`.
3. **HTTP API Request**:
   The client makes a `fetch('/api/events', { method: 'POST' })` request.
4. **Middleware Protection**:
   `src/middleware.ts` verifies the session cookie.
5. **Tenant Isolation**:
   `src/app/api/events/route.ts` calls `getTenantId()` from `src/lib/tenant.ts`.
6. **Optimistic Zero-Latency Response**:
   The API immediately generates a UUID and responds to the browser within ~15 milliseconds so the user interface never freezes.
7. **Background Persistence (`after()`)**:
   In the background, Next.js's `after()` function saves the `Event` via `src/lib/prisma.ts`, registers a memory in `JarvisMemory`, checks approval workflows, and dispatches vendor invitation emails via `src/lib/email-service.ts`.
8. **Vendor Real-Time Interaction**:
   Invited vendors log into `src/app/vendor/events/[id]/page.tsx` and begin submitting bids through `/api/vendor-bids`.

---

## 8. Explanation of the Root Patch & Migration Scripts

When you open the root folder of this project, you will notice dozens of standalone JavaScript files like:
- `fix_split.cjs`, `fix_events_page.cjs`, `fix_cs_calc.cjs`, `fix_modal_auction.cjs`
- `patch_ai_logic.cjs`, `patch_auth.cjs`, `patch_signup.js`, `patch_search.js`
- `check_db.cjs`, `check_org.cjs`, `seed-templates.js`, `seed_vendors.js`

### What are these files?
In rapid software prototyping and production maintenance:
1. **Hotfix & Refactoring Scripts (`fix_*.cjs`, `patch_*.js`)**: 
   These are programmatic code-modification scripts. When adjusting hundreds of JSX components or modifying database models across dozens of files simultaneously, automated Node scripts were run to replace syntax, inject icons, or fix state bugs across the codebase.
2. **Data Seeders (`seed_*.js`)**: 
   Scripts used to populate the database with realistic mock data (e.g., creating 50 test vendors, IT hardware product catalogs, and sample RFQ templates).
3. **Database Health Checks (`check_*.cjs`)**: 
   Diagnostic scripts used by developers to query PostgreSQL directly via Prisma to verify schema integrity, validate tenant IDs, and ensure foreign keys are intact.

> [!NOTE]
> These root scripts are **not part of the runtime web application**. The actual running application lives completely inside the `src/` directory. You can safely ignore them during normal daily development.

---

## 9. Crucial Topics You Didn't Ask About (Hidden Gems & Pro Secrets)

### 1. Next.js `after()` API for Zero-Latency Performance
In standard web apps, when a user creates an event, the server waits until it writes to the database, sends 10 emails, and creates memory records before replying. This causes a slow 3-5 second delay for the user. 
ProcGen utilizes the Next.js `after()` API in `src/app/api/events/route.ts`:
```typescript
// The response is sent immediately to the user!
return NextResponse.json({ id: eventId, refId: generatedRefId }, { status: 201 });

// This block executes asynchronously in the background AFTER the response:
after(async () => {
   await prisma.event.create(...);
   await sendVendorInvitation(...);
});
```

### 2. Autonomous AI Procurement Agent Guardrails
Inside `src/app/api/ai/negotiate/route.ts`, the autonomous agent is governed by strict system prompts:
- It is given a secret **Maximum Budget** that it is instructed *never* to reveal to the vendor.
- It is supplied with non-price **concessions** (e.g., faster payment terms) that it can trade for lower prices.
- When an agreeable price is reached, it emits an exact token: `CONTRACT SECURED`. The frontend detects this string to automatically trigger contract drafting.

### 3. Grace Periods and License Gating
In `src/app/client/layout.tsx`, the platform checks the customer's SaaS license status. If `licenseStatus === 'Expired'`, the entire screen locks out access to all procurement tools and displays a specialized paywall that allows the user to self-generate a 14-day renewal PO.

### 4. Dynamic Multi-Currency Floating Conversion
When international vendors bid in Euros (`EUR`) or Rupees (`INR`) on an event denominated in US Dollars (`USD`), the system uses `src/app/api/exchange-rates` to normalize all bids into base currency on the fly, allowing fair apples-to-apples comparison on the buyer's evaluation dashboard.

---

## 10. Local Development, Deployment, & Operations

### Prerequisites
- **Node.js**: Version 20+
- **PostgreSQL Database**: Local or hosted (Supabase, Neon, AWS RDS)
- **npm** or **pnpm**

### Environment Variables (`.env`)
Create a `.env` file inside the `Cpanel/` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/procgen?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/procgen?schema=public"
NEXTAUTH_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"
VENDOR_PORTAL_URL="http://localhost:3000"
```

### Local Setup Instructions
```bash
# 1. Navigate to the Cpanel directory
cd Cpanel

# 2. Install dependencies
npm install

# 3. Generate Prisma client & sync schema
npx prisma generate
npx prisma db push

# 4. (Optional) Seed the database with sample vendors and templates
node seed_vendors.js
node seed-templates.js

# 5. Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker & Production Deployment
To build and run the production-optimized Docker container:
```bash
docker build -t procgen-portal:latest .
docker run -p 3000:3000 --env-file .env procgen-portal:latest
```

For Kubernetes deployments:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

---
*Document prepared for the engineering team. Maintained under the ProcGen repository.*
