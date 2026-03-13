# SUVIDHA — Smart Urban Virtual Interactive Digital Helpdesk Assistant

<p align="center">
  <img src="public/img/india-emblem.png" alt="SUVIDHA Logo" width="80" />
</p>

<p align="center">
  <strong>A unified, secure, and inclusive self-service civic kiosk platform for smart urban governance in India.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/shadcn/ui-Components-000000?logo=shadcnui&logoColor=white" alt="shadcn/ui" />
</p>

---

## What is SUVIDHA?

SUVIDHA is a **touch- and voice-enabled multilingual kiosk application** built for the **C-DAC / MeitY Smart City Mission**. It replaces fragmented civic office counters with a **single self-service digital helpdesk** covering **Electricity, Water, Gas, and Municipal services** — featuring AI-assisted document validation, multi-step service wizards, integrated payments, and a role-based admin governance dashboard.

---

## Problem It Solves

Urban civic offices suffer from long queues, repeated document submission across departments, opaque grievance resolution, high staff workload, and accessibility barriers for elderly/semi-literate citizens. SUVIDHA consolidates all of this into one kiosk with voice guidance, multilingual support, and transparent tracking.

---

## Key Features

### For Citizens
- **4 Departments, 17+ Services** — Bill payment, new connections, complaints, certificates, property tax and more across Electricity, Water, Gas & Municipal
- **Voice Assistant** — 20+ voice intents (EN/HI) with Web Speech API; hands-free navigation, service selection, and page narrations across all 14 screens
- **Multilingual** — Full English & Hindi UI (70+ translated keys); 6 more languages planned
- **Dual Authentication** — SUVIDHA ID + OTP login *or* QR scan via mobile app; 5-step new registration with Aadhaar verification
- **Document Vault** — Upload once, reuse everywhere; AI pre-check for blur, format & completeness
- **Unified Payments** — UPI/QR (GPay, PhonePe, Paytm), Cards (Visa, Mastercard, RuPay), Net Banking (SBI, HDFC, PNB) with digital receipt
- **Real-time Tracking** — Visual progress timeline per ticket (Submitted → Processing → Resolved)
- **Session Security** — 5-minute auto-timeout with 30-second warning

### For Administration
- **3-tier RBAC** — Master Admin (city-wide read-only), Department Admin (approve/reject), Staff/Verifier
- **AI-assisted Document Verification** — Priority queue (failed → needs_review → passed), full-screen viewer with zoom/rotate, enforced complete review before decision
- **Human-in-the-loop** — "AI suggestions only — Staff decision is final"
- **Department Analytics** — Stats cards, workload distribution, trend indicators, audit logs

---

## Services Catalogue

| Department | Services | Complaint Types |
|---|---|---|
| ⚡ Electricity | Bill Payment, New Connection, Disconnection, Name Transfer, Load Change | Power Outage, Voltage Fluctuation, Billing, Meter Problem |
| 💧 Water | Bill Payment, New Connection, Disconnection, Name Transfer, Meter Issue | No Supply, Low Pressure, Quality, Leakage |
| 🔥 Gas | Bill Payment, New Connection, Cylinder Booking, Name Transfer | Connection Issue, Low Pressure, Billing, Gas Leak |
| 🏛️ Municipal | Property Tax, Birth Certificate, Death Certificate, Trade License | Pothole, Street Light, Sanitation, Garbage Collection |

---

## Architecture

```
Citizen → Kiosk (Touch/Voice) → React Frontend → AI Document Pre-Check
                                       ↕
                              Admin Dashboard (RBAC)
                         Staff Verify → Approve/Reject → Status Update → Citizen
```

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Radix UI  
**State:** React Context + TanStack Query · **Forms:** React Hook Form + Zod  
**Voice:** Web Speech API (recognition + synthesis) · **Charts:** Recharts  
**Planned Backend:** Node.js/FastAPI + PostgreSQL + Redis + MinIO + OpenCV/Tesseract OCR

---

## Getting Started

```bash
git clone https://github.com/your-username/suvidha-citizen-hub.git
cd suvidha-citizen-hub
npm install
npm run dev        # → http://localhost:8080
```

### Try It Out

| Login as | SUVIDHA ID | What you'll see |
|---|---|---|
| Citizen | `SUV2024001234` | Dashboard, services, payments, complaints |
| Master Admin | `MASTER` | City-wide governance overview |
| Dept Admin | `DEPT_ELEC` | Electricity request queue & doc verification |
| Verifier | `STAFF` | Document verification panel |

> **OTP:** Any 6-digit code works in demo mode.

---

## Application Routes

| Route | Purpose |
|---|---|
| `/` | Language selection + login |
| `/register` | 5-step SUVIDHA ID registration |
| `/dashboard` | Citizen home — services, quick actions, activity feed |
| `/service/:type` | Multi-step service wizard (select → docs → confirm → pay → done) |
| `/complaint/register` | 3-step complaint with ticket generation |
| `/status` | Ticket lookup with visual progress timeline |
| `/documents` | Document vault with AI status indicators |
| `/admin` | Role-based admin dashboard |

---

## Design Highlights

- **Kiosk-first UX** — All touch targets ≥ 64px, primary actions ≥ 80px; `user-select: none` prevents accidental selection
- **Government Branding** — India tri-color header (saffron → white → green), national emblem, MeitY attribution
- **Custom Design Tokens** — Kiosk-specific CSS classes (`.kiosk-btn`, `.kiosk-card`, `.service-tile`) with touch-optimized sizing
- **Animations** — Slide-up, scale-in, shimmer, pulse effects with staggered delays
- **Light/Dark Mode** — Full CSS variable-based theming
- **DPDP Compliant** — Consent-based data usage, minimal retention, encrypted storage, audit trails

---

## Future Scope

- DigiLocker integration · Aadhaar biometric auth · Advanced AI fraud detection
- 6+ language conversational voice assistant · District-to-national scaling
- SUVIDHA Mobile App · E-receipts with digital signatures · Policy analytics dashboard

---

## Team

| Name | Role|
|---|---|
| Divyansh Bhargava | Team Lead (UI/UX, Frontend Developer)|
| Hitaishee Engla |Full Stack Developer | 
| Aditya Chaturvedhi |AI,Backend Developer | 

---

## License

Developed for **hackathon demonstration** under the SUVIDHA Smart City concept.

---

## Acknowledgment

Inspired by the **Smart City Mission, C-DAC, and MeitY** digital governance initiatives for inclusive, transparent public services in India.

