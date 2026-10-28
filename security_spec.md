# AnnaSetu Security Specification & Access Control Model

## 1. Data Invariants
1. **User Identity Invariant**: A user profile document ID matches their Firebase Auth `uid`. Users can never self-assign `ADMIN` role.
2. **Organization Integrity Invariant**: All operating addresses, pickup origins, and delivery destinations must strictly have country code `'IN'` (India-only rule).
3. **Verification Invariant**: Only platform administrators can change an organization's status to `VERIFIED`. Donors and recipients cannot publish or accept live deliveries without verification.
4. **Food Safety Invariant**: Donations require explicit safety declarations and cannot be marked available if safe collection deadline has passed.
5. **Quantity Consistency Invariant**: Reserved, collected, and delivered quantities cannot exceed total donation quantity.
6. **Handover Single-Use Invariant**: Logistics handover code is verified upon physical exchange between volunteer and recipient.
7. **Immutable Audit Invariant**: `audit_logs` entries can be written by actors, but can never be modified or deleted by anyone.

## 2. Dirty Dozen Negative Test Payloads
1. Attempting to create a user profile with role `ADMIN`. (Denied)
2. Attempting to update another user's profile. (Denied)
3. Modifying an organization's `verificationStatus` directly as a regular donor/recipient. (Denied)
4. Submitting a donation with country outside India (e.g., `'US'`). (Denied)
5. Modifying someone else's donation without ownership or admin role. (Denied)
6. Updating a donation without accepting food safety declaration. (Denied)
7. Deleting system audit logs. (Denied)
8. Reading other users' private notifications. (Denied)
9. Modifying resolution notes on a safety incident as a regular user. (Denied)
10. Marking a donation status to an invalid lifecycle jump. (Denied)
11. Bypassing unverified recipient checks to confirm reservations. (Denied)
12. Creating orphaned records without an authenticated session. (Denied)
