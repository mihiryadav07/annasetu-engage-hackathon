# AnnaSetu — Every Meal Finds Its Way

AnnaSetu connects restaurants, hotels, caterers and food donors with verified NGOs and community kitchens to redistribute eligible surplus food through coordinated pickups and verified deliveries in India.

---

## 1. System Architecture & Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (v4)
- **Backend & Database**: Firebase Authentication, Google Cloud Firestore
- **Security & Authorization**: Attribute-Based Access Control (ABAC), Firestore Security Rules (`firestore.rules`), immutable audit trail
- **Geography & Logistics**: India-only territorial validation (28 States & 8 UTs, 6-digit Indian PIN codes, geospatial bounding box), Haversine straight-line distance, Google Maps Platform integration ready
- **Food Safety Governance**: FSSAI 2019 surplus food recovery guidelines, 4-hour ambient cooked meal limit, microbiological danger zone (5°C to 60°C) enforcement, Emergency Safety Hold circuit breaker

---

## 2. User Roles & Access Control

1. **DONOR**: Commercial food businesses (Hotels, Restaurants, Banquets, Caterers) with 14-digit FSSAI licenses. Can list surplus batches with signed safety declarations.
2. **RECIPIENT**: Verified NGOs, shelters, and community kitchens (NGO Darpan / 12A/80G). Can browse ranked offers via deterministic matching, reserve quantities safely, and generate single-use handover confirmation codes.
3. **VOLUNTEER**: Authorized delivery coordinators who progress milestones (`ASSIGNED` → `EN_ROUTE_TO_PICKUP` → `ARRIVED_AT_PICKUP` → `COLLECTED` → `EN_ROUTE_TO_RECIPIENT` → `ARRIVED_AT_RECIPIENT` → `DELIVERED`) and verify physical deliveries with the recipient's 6-digit code.
4. **ADMIN**: Explicitly authorized administrators (`mihiryadav1100@gmail.com`). Handles organization verification, emergency safety holds, incident investigations, audit logs, and analytics.

---

## 3. Automated Test Suite

Run the in-app automated test suite directly via the top navbar button or in the terminal:

```bash
npx tsx -e "import { runAutomatedVerificationSuite } from './src/tests/automatedTests'; console.log(runAutomatedVerificationSuite());"
```

The 12 test cases verify:
- TC-01: Rejection of out-of-country destinations (US address)
- TC-02: Acceptance of valid Indian addresses with coordinates
- TC-03: Rejection of malformed 5-digit PIN codes
- TC-04: Food safety hold for expired collection deadlines
- TC-05: Food safety hold for missing safety declarations
- TC-06: Enforcement of FSSAI 4-hour ambient temp limit on cooked meals
- TC-07: Hard dietary constraint priority (Non-veg food excluded for pure-veg shelters)
- TC-08: Zero remaining quantity excluded from matching
- TC-09: Secure 6-digit handover code format
- TC-10: Accurate Haversine distance calculations
- TC-11: Zero-trust RBAC preventing self-assigned admin privileges
- TC-12: Immutability of system audit logs

---

## 4. Production Deployment & Build

```bash
# Build production bundle
npm run build

# Run TypeScript type check
npm run lint
```
