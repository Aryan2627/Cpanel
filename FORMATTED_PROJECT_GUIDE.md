# ProcGen Procurement Portal: Complete Architectural & Technical Guide
*A comprehensive, beginner‑friendly handbook on the system architecture, workflows, tech stack, and file relationships.*

---

## Table of Contents
1. [Executive Summary: What is ProcGen?](#1-executive-summary-what-is-procgen)
2. [Procurement 101: Core Concepts for Beginners](#2-procurement-101-core-concepts-for-beginners)
3. [The Complete End‑to‑End Workflow](#3-the-complete-end-to-end-workflow)
4. [System Architecture & Multi‑Tenant Design](#4-system-architecture--multi-tenant-design)
5. [The Technology Stack & Why Each Tool Was Chosen](#5-the-technology-stack--why-each-tool-was-chosen)
6. [Comprehensive Directory & File Breakdown](#6-comprehensive-directory--file-breakdown)
7. [How Files are Interconnected (The Connection Web)](#7-how-files-are-interconnected-the-connection-web)
8. [Explanation of the Root Patch & Migration Scripts](#8-explanation-of-the-root-patch--migration-scripts)
9. [Crucial Topics You Didn't Ask About (Hidden Gems & Pro Secrets)](#9-crucial-topics-you-didnt-ask-about-hidden-gems--pro-secrets)
10. [Local Development, Deployment & Operations](#10-local-development-deployment--operations)

---

## 1. Executive Summary: What is ProcGen?

### The Problem it Solves
In large corporations and modern enterprises, buying goods and services (everything from 500 MacBooks to cleaning services, raw steel, or software licenses) is notoriously slow, chaotic, and manual. Employees send emails or spreadsheets asking for items, procurement managers struggle to collect quotes from vendors, negotiate prices manually, verify compliance, get managerial sign‑offs, and track purchase orders in complex ERP systems like SAP.

### What ProcGen Does
**ProcGen (Procurement Generation Portal)** is an enterprise‑grade, multi‑tenant B2B **e‑Procurement and Strategic Sourcing Platform**. It digitizes and automates the entire B2B purchasing lifecycle:
1. **Intake & Requisitions** – Employees request goods or services through a shopping‑cart‑style interface or manual PR (Purchase Request) forms.
2. **Approval Engine** – Dynamic approval matrices automatically route high‑value purchases to department heads, finance, and legal based on custom business rules.
3. **Sourcing Events & Reverse e‑Auctions** – Sourcing managers launch RFQs (Request for Quotations) or live Reverse Auctions where suppliers compete in real‑time, driving prices down for the buyer.
4. **Autonomous AI Procurement Agents** – An autonomous negotiator bot powered by **NVIDIA Nemotron LLMs** can negotiate directly against suppliers within set budgets and concession rules.
5. **Vendor Portal** – A dedicated, secure portal where suppliers log in, submit sealed bids, compete in live dynamic auctions, and sign contracts.
6. **Purchase Orders & ERP Integration** – Automatically generates POs, creates legally binding digital contracts with e‑signatures, and synchronizes data with enterprise systems like SAP S/4HANA.
7. **In‑App AI Copilot ("Jarvis")** – A contextual voice and chat copilot with short‑term memory that can execute platform actions, summarize bidding events, pull supplier risk profiles, and navigate users.

---

## 2. Procurement 101: Core Concepts for Beginners

If you are new to corporate procurement or software engineering, here are the essential industry terms used throughout the code:

| Concept | Plain English Explanation | Where in Code |
| :--- | :--- | :--- |
| **Purchase Requisition (PR) / Intake** | An internal request made by an employee stating: *"Our team needs 20 monitors and 5 ergonomic chairs."* | `src/app/client/intake/`, `src/app/client/pr/` |
| **NFA (Note for Approval)** | A formal justification document explaining why the company needs to spend money, submitted before money is committed. | `model Intake` (`type: "Standalone NFA"`) |
| **RFQ (Request for Quotation)** | Sending a formal inquiry to multiple vetted vendors asking: *"Give us your best itemized price and terms for these items."* | `src/app/client/events/create/single-stage/` |
| **Reverse Auction** | In a normal auction (like eBay), buyers bid prices UP. In a **Reverse Auction**, suppliers bid prices **DOWN** to win the buyer's business. | `src/app/client/events/create/auction/` |
| **Japanese Reverse Auction** | A specialized clock auction where the platform systematically decreases the price at scheduled intervals (e.g., drops $500 every 2 minutes). Suppliers must accept the lower price or get knocked out. The last remaining vendor wins. | `src/app/client/events/create/auction/` (`japTickInterval`, `japDropAmount`) |
| **Sealed vs Open Bidding** | **Sealed**: Suppliers submit blind bids without seeing what competitors bid. **Open**: Suppliers see the current lowest bid or their real‑time rank (e.g., *"You are currently Rank #2"*). | `model Event` (`feedbackMode: "Sealed"` / `"Rank"`) |
| **Surrogate Bidding** | When a supplier calls in or emails their quote because they can't log in, a buyer can place the bid on their behalf with an audit trail. | `src/app/client/events/[id]/` (`surrogate`) |
| **Purchase Order (PO)** | The legally binding commercial document sent to a vendor authorizing them to deliver goods and invoice the company. | `src/app/client/po/`, `src/app/api/pos/` |
| **ERP (Enterprise Resource Planning)** | The massive accounting/operations system (like SAP or Oracle) where companies officially record finances and inventory. | `src/lib/erp/SAPConnector.ts` |
| **Multi‑Tenancy** | A single software deployment that securely serves multiple different companies (tenants) without their data ever leaking to each other. | `src/lib/tenant.ts`, `model Organization` |

---

## 3. The Complete End‑to‑End Workflow

```mermaid
flowchart TD
    A[Employee / Buyer] -->|Creates Request| B[Intake / PR Module]
    B -->|Requires Approval| C{Approval Workflow Engine}
    C -->|Exceeds Dollar Threshold| D[Managers / Approvers Review]
    D -->|Approved| E[Sourcing Event Studio]
    C -->|Pre‑Approved / Low Value| E
    
    E -->|Select Type| F{Event Strategy}
    F -->|Option 1: RFQ| G[Single‑Stage Tender]
    F -->|Option 2: Reverse Auction| H[Dynamic Live e‑Auction]
    F -->|Option 3: AI Agent| I[Autonomous AI Negotiator]
    
    G & H & I -->|Email Notifications| J[Vendor Portal]
    J -->|Suppliers Log In| K[Vendor Submits Quotes / Bids]
    
    K -->|Real‑Time Bidding Engine| L[Tender Evaluation & Scoring]
    L -->|Award Winning Bid| M[Generate PO & Digital Contract]
    M -->|e‑Signatures| N[Client & Vendor E‑Sign]
    M -->|ERP Connector| O[Sync PO into SAP S/4HANA]
```

### Stage‑by‑Stage Breakdown

#### Step 1: Demand Generation (Intake & PR)
- An employee visits `/client/intake` or uses the AI Copilot ("Jarvis, create intake for 50 Dell monitors").
- Alternatively, they can open the **Product Catalog**, browse pre‑negotiated corporate items, add them to the **CartOverlay**, and check out.
- The system generates an internal tracking ID (`PR-xxxxxx` or `NFA-xxxxxx`).

#### Step 2: Automated Approval Routing
- Once submitted, the system checks configured `Workflow` rules (`src/app/api/workflows`).
- If the intake or tender matches specific criteria (e.g., category = "IT Hardware" or amount > $10,000), an `ApprovalRequest` is instantiated.
- Approvers receive notifications and approve or reject it from `/client/approvals`.

#### Step 3: Event Creation (Tenders & Auctions)
- Sourcing officers convert approved requests into Sourcing Events (`EVT-xxxxx`).
- They can choose:
  - **Single‑Stage RFQ**: Static quotes and technical questionnaires.
  - **Multi‑Stage Auction**: Stage 1 = Technical Qualification questionnaire; Stage 2 = Commercial Live Bidding.
  - **Japanese Clock Auction**: Automated scheduled price drops.
- Vendors are selected from the global directory or matched using the interactive **Vendor Matchmaking** module.

#### Step 4: Vendor Invitation & Bidding
- Nodemailer sends automated email invites to suppliers with magic links.
- Vendors log into their specialized portal (`/vendor`), view the specification, upload trade licenses/tax certifications, and place bids.
- The platform calculates live currency exchange rates (e.g., converting EUR or INR bids to base USD) and updates rankings.

#### Step 5: Autonomous AI Negotiation (Agent Alpha)
- Buyers can deploy **ProcGen Agent Alpha** against stubborn vendors (`/client/ai-agents`).
- The buyer sets constraints: Target Price ($8,000), Max Budget ($9,500), and concessions (e.g., "Net‑15 payment terms", "Multi‑year volume guarantee").
- The NVIDIA Nemotron LLM negotiates in natural language via API, pushing the vendor for discounts without leaking internal thresholds. When agreed, it locks the contract.

#### Step 6: Contracting, PO Issuance & ERP Sync
- The winning bidder is selected.
- A legally binding `PurchaseOrder` (`PO-xxxxx`) is minted.
- A `Contract` is drafted for mutual electronic signature (`clientSigned` & `vendorSigned`).
- The background `after()` hook or manual trigger invokes `SAPConnector.ts`, pushing the PO into SAP S/4HANA.

---

## 4. System Architecture & Multi‑Tenant Design

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
        API_Jarvis["/api/jarvis (Copilot & In‑Memory State)"]
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

### Multi‑Tenant Architecture
Every major table (`User`, `Event`, `Intake`, `PurchaseOrder`, `Bid`, `Vendor`, `Workflow`) includes an `organizationId` foreign key. `src/lib/tenant.ts` extracts the tenant ID from the verified JWT (`proc-session`) and forces every Prisma query to include `where: { organizationId: orgId }`, guaranteeing strict data isolation.

---

## 5. The Technology Stack & Why Each Tool Was Chosen

| Technology | Version / Tool | Why It Was Chosen |
| :--- | :--- | :--- |
| **Next.js** | `^16.3.4` (App Router) | Unified React server components + API routes; provides `after()` for zero‑latency background work. |
| **React** | `19.2.4` | Industry‑standard UI library with concurrency features. |
| **TypeScript** | `^5` | Guarantees static type safety across the full stack. |
| **Prisma ORM** | `^5.22.0` | Type‑safe database client generated from `schema.prisma`. |
| **PostgreSQL** | PostgreSQL | ACID‑compliant, ideal for transactional enterprise data. |
| **TailwindCSS** | `^4` | Utility‑first CSS for rapid, consistent styling. |
| **Jose & NextAuth** | `jose: ^6.2`, `next-auth: ^4` | Fast JWT handling and flexible auth flows. |
| **NVIDIA Nemotron AI** | `nemotron-3-nano-30b` | State‑of‑the‑art LLM for autonomous negotiation. |
| **Nodemailer** | `^9.0.5` | Reliable email delivery for vendor invitations. |
| **Twilio** | `^6.1.0` | SMS alerts for critical auction events. |
| **Driver.js** | `^1.8.0` | Interactive product tours (`TourButton`). |
| **Lucide React** | `^1.27.0` | Clean SVG icon set. |
| **XLSX** | `^0.18.5` | Bulk import/export of tabular data. |
| **Playwright** | `^1.62.1` | End‑to‑end testing of critical flows. |
| **Docker & Kubernetes** | Multi‑stage Dockerfile | Containerization and auto‑scaling in production. |

---

## 6. Comprehensive Directory & File Breakdown

### Root Configurations
- `package.json` – Dependencies & scripts.
- `next.config.mjs` – Next.js build optimizations.
- `server.js` – Custom server wrapper for Docker.
- `Dockerfile` – 3‑stage production build.
- `k8s/` – `deployment.yaml`, `hpa.yaml`, `service.yaml`.
- `.github/workflows/ci.yml` – CI pipeline.

### Database Layer (`prisma/`)
- `schema.prisma` – Defines `Organization`, `User`, `Vendor`, `Event`, `Bid`, `PurchaseOrder`, `Workflow`, `JarvisMemory`, `AuditLog`.

### Core Library (`src/lib/`)
- `prisma.ts` – Singleton Prisma client.
- `session.ts` – JWT helpers.
- `auth.ts` – NextAuth config.
- `tenant.ts` – Tenant resolution.
- `audit.ts` – Audit logging.
- `email-service.ts` – Nodemailer wrapper.
- `erp/` – `ERPConnector.ts` (interface) & `SAPConnector.ts` (implementation).

### Middleware & Context
- `src/middleware.ts` – Session enforcement.
- `src/context/IntakeContext.tsx` – Cart state.
- `src/context/ToastContext.tsx` – Global toast notifications.

### Client Portal (`src/app/client/`)
- `layout.tsx` – Dashboard layout.
- `page.tsx` – KPI overview.
- `JarvisAssistant.tsx` – Voice copilot.
- `SpotlightSearch.tsx` – Quick navigation.
- `TourButton.tsx` – Guided tours.
- `CartOverlay.tsx` – Shopping cart.
- Sub‑pages: `events/`, `events/create/auction/`, `events/create/single-stage/`, `intake/`, `approvals/`, `ai‑agents/`, `vendors/`, `po/`, `manage/`, `license/`.

### Vendor Portal (`src/app/vendor/`)
- `page.tsx` – Vendor dashboard.
- `events/[id]/page.tsx` – Live bidding console.

### Superadmin Portal (`src/app/admin/`)
- `page.tsx` – Global admin UI.
- `audit/page.tsx` – Compliance logs.

### API Routes (`src/app/api/`)
- Auth endpoints (`auth/*`, `vendor-auth/*`).
- Event management (`events/*`).
- Bidding (`bids/*`, `vendor-bids/*`).
- AI negotiation (`ai/negotiate/route.ts`).
- Jarvis chat (`jarvis/chat/route.ts`).
- PO handling (`pos/*`, `vendor-pos/*`).
- ERP sync (`erp/*`).
- License management (`license/*`).
- Currency conversion (`exchange-rates/*`).

---

## 7. How Files are Interconnected (The Connection Web)

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    participant UI as client/events/create/auction/page.tsx
    participant Ctx as context/IntakeContext.tsx
    participant API as api/events/route.ts
    participant Tenant as lib/tenant.ts
    participant Prisma as lib/prisma.ts
    participant DB as PostgreSQL
    participant Email as lib/email-service.ts
    participant VendorUI as vendor/events/[id]/page.tsx

    Buyer->>UI: Fill auction details & click "Publish"
    UI->>Ctx: Pull linked PR items
    UI->>API: POST /api/events
    API->>Tenant: getTenantId()
    Tenant-->>API: org‑uuid‑123
    Note over API: `after()` spawns background tasks
    API-->>UI: 201 Created (instant UI redirect)
    
    rect rgb(240,248,255)
        Note over API,Email: Background work
        API->>Prisma: prisma.event.create(...)
        Prisma->>DB: INSERT Event
        API->>Prisma: prisma.jarvisMemory.create(...)
        Prisma->>DB: INSERT JarvisMemory
        API->>Email: sendVendorInvitation(...)
        Email-->>Buyer: Invitation email
    end

    Buyer->>UI: Redirect to live event dashboard
    VendorUI->>API: GET /api/events/[id]
```

The diagram illustrates the flow from front‑end action, through middleware, tenant resolution, database persistence, background email dispatch, and finally vendor interaction.

---

## 8. Explanation of the Root Patch & Migration Scripts

The repository contains utility scripts used during development:
- **Hotfix / Refactor (`fix_*.cjs`, `patch_*.js`)** – Automated codebase wide modifications.
- **Seeders (`seed_*.js`)** – Populate mock data for local testing.
- **Health Checks (`check_*.cjs`)** – Verify DB integrity and tenant configuration.

> **NOTE**: These scripts live at the repository root and are **not** part of the runtime application. The production code resides exclusively under `src/`.

---

## 9. Crucial Topics You Didn't Ask About (Hidden Gems & Pro Secrets)

### 1. Next.js `after()` API
Enables instant HTTP responses while deferring heavy work (DB writes, emails, AI calls) to a background micro‑task, dramatically improving perceived latency.

### 2. AI Agent Guardrails
The negotiation endpoint enforces a hidden maximum budget and only exposes allowed concessions. When the LLM reaches an agreement, it returns the token `CONTRACT SECURED`, which the front‑end watches to auto‑finalize the contract.

### 3. License Gating
`src/app/client/layout.tsx` checks `licenseStatus`. An expired license locks the UI and presents a self‑service renewal PO flow.

### 4. Multi‑Currency Normalisation
`src/app/api/exchange-rates` normalises all vendor bids to a base currency (USD) in real time, ensuring fair comparison across regions.

---

## 10. Local Development, Deployment & Operations

### Prerequisites
- Node.js 20+
- PostgreSQL (local or cloud)
- npm or pnpm

### Environment (`.env` in `Cpanel/`)
```
DATABASE_URL="postgresql://user:password@localhost:5432/procgen?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/procgen?schema=public"
NEXTAUTH_SECRET="super‑secret‑jwt"
NEXTAUTH_URL="http://localhost:3000"
VENDOR_PORTAL_URL="http://localhost:3000"
```

### Quick Start
```bash
cd Cpanel
npm install
npx prisma generate
npx prisma db push   # push schema
node seed_vendors.js   # optional mock data
npm run dev            # http://localhost:3000
```

### Production
```bash
# Docker
docker build -t procgen-portal:latest .
docker run -p 3000:3000 --env-file .env procgen-portal:latest
```

### Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

---

*Document prepared for the engineering team. Maintained under the ProcGen repository.*
