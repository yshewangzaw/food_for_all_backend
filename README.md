# Food for All — API Specification (Non-CRUD)

Everything here is **in addition to** the standard CRUD routes already implemented
(`GET /resource`, `GET /resource/:id`, `POST /resource`, `PATCH /resource/:id`, `DELETE /resource/:id`).

## Contents

1. [Users, Auth & KYC](#1-users-auth--kyc) — `User`, `KycDocument`
2. [Network](#2-network) — `NetworkPath`
3. [Products & Packages](#3-products--packages) — `Product`, `Package`, `PackageItem`
4. [Commissions](#4-commissions) — `LevelConfiguration`, `CommissionRule`, `Commission`
5. [Orders & Payments](#5-orders--payments) — `Order`, `OrderItem`, `PaymentMethod`, `Payment`
6. [Wallet & Withdrawals](#6-wallet--withdrawals) — `WalletTransaction`, `WithdrawalRequest`
7. [Notifications](#7-notifications) — `Notification`
8. [Reports](#8-reports)
9. [Scheduled & Maintenance Jobs](#9-scheduled--maintenance-jobs)
10. [Schema Gaps](#10-schema-gaps)

---

## Conventions

**Route prefixes**

- `/me/*` — the authenticated member acting on their own data. No `:id` in the path.
- `/admin/*` — admin-only operations that affect other users or system state.
- `/users/:id/*` — admin reading or acting on a specific member.
- `/jobs/*` — long-running or scheduled operations.

**Standard query parameters** — accepted on every list endpoint:

```
?page=1&limit=25&sort=createdAt&order=desc&search=&createdFrom=&createdTo=
```

**Standard list response shape**

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 25, "total": 340, "totalPages": 14 }
}
```

**Exports** — every list and report endpoint accepts `?format=json|csv|xlsx|pdf`
instead of separate `/export` routes.

**Periods** — anywhere a `period` is accepted, use `YYYY-MM` (e.g. `2026-07`).
Date ranges use `from` / `to` in ISO 8601.

**Idempotency** — money-moving endpoints (payment approval, commission processing,
withdrawal payout) must accept an `Idempotency-Key` header and be safe to retry.

**State changes are POSTs, not PATCHes.** `POST /payments/:id/approve` rather than
`PATCH /payments/:id { status: "APPROVED" }` — the approval has side effects
(order paid, user activated, commissions run, notifications sent) that a generic
field update must never trigger.

---


---

## 1. Users, Auth & KYC

Entities: `User`, `KycDocument`

---

### 1.1 Foreign-key / relationship endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/:id/sponsor` | The upline user — resolves `sponsorId` |
| GET | `/users/:id/direct-referrals` | Users whose `sponsorId` = `:id`, paginated |
| GET | `/users/:id/downline?maxLevel=3` | Descendants resolved through NetworkPath |
| GET | `/users/:id/upline` | Full ancestor chain up to the root account |
| GET | `/users/:id/kyc-documents` | All KYC submissions by this user |
| GET | `/users/:id/orders` | Orders where `buyerUserId` = `:id` |
| GET | `/users/:id/payments` | Payments this user submitted |
| GET | `/users/:id/commissions/earned` | Where `beneficiaryUserId` = `:id` |
| GET | `/users/:id/commissions/generated` | Where `sourceUserId` = `:id` — what their purchases paid out to others |
| GET | `/users/:id/wallet-transactions` | Ledger rows for this user |
| GET | `/users/:id/withdrawals` | Withdrawal history |
| GET | `/users/:id/notifications` | Notification feed |
| GET | `/kyc-documents/:id/user` | Owner of a KYC submission |
| GET | `/kyc-documents/:id/reviewer` | Admin who decided (needs `reviewedById` — see schema gaps) |

---

### 1.2 Business logic

#### Registration & session

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register?ref=CODE` | Signup under a referral code. Creates the User, generates `referralCode` + QR, and writes all NetworkPath rows — one transaction, all or nothing |
| GET | `/referral/validate/:code` | Pre-signup check: does the code exist, is the sponsor ACTIVE, return sponsor display name |
| POST | `/auth/login` | Returns access + refresh token |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/forgot-password` | Send reset link/OTP |
| POST | `/auth/reset-password` | Consume token, set new `passwordHash` |
| POST | `/auth/otp/send` | Send phone verification code |
| POST | `/auth/otp/verify` | On success sets `phoneVerifiedAt` |

#### Self-service

| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Current profile with wallet + network summary |
| PATCH | `/me` | Update own profile fields (never role, status, or referralCode) |
| POST | `/me/change-password` | Requires current password |
| POST | `/me/avatar` | Avatar upload, sets `avatarUrl` |
| GET | `/me/referral-link` | Referral URL + QR image; generates and stores the QR if `qrImageUrl` is null |
| POST | `/users/:id/regenerate-qr` | Rebuild the QR asset (admin, or after a domain change) |

#### Status & activation

| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/users/:id/status` | ACTIVE / INACTIVE / SUSPENDED / BLOCKED with a required reason. Must cascade the rules — a blocked or inactive user is skipped by the commission engine |
| POST | `/users/:id/activate` | Manual activation without a package payment. Edge case only — audit every call |
| GET | `/users/:id/qualification-status?period=2026-07` | Did this member meet the monthly duty? Returns period, qualified yes/no, and the qualifying order |
| GET | `/me/qualification-status` | Same for the logged-in member — drives the dashboard banner |

#### KYC

| Method | Endpoint | Description |
|---|---|---|
| POST | `/kyc` | Member submits document type, number, and images |
| POST | `/kyc/:id/approve` | Admin approves; sets `User.kycStatus = APPROVED` |
| POST | `/kyc/:id/reject` | Requires `rejectionReason`; sets `kycStatus = REJECTED` and notifies |
| POST | `/kyc/:id/resubmit` | Member replaces a rejected submission |
| GET | `/kyc/queue` | Pending review queue, oldest first |

---

### 1.3 Filter / list

```
GET /users
  ?role=ADMIN|MEMBER
  &status=PENDING|ACTIVE|INACTIVE|SUSPENDED|BLOCKED
  &kycStatus=NOT_SUBMITTED|PENDING|APPROVED|REJECTED
  &city=
  &sponsorId=
  &depth=              # exact depth
  &minDepth= &maxDepth=
  &minDirectReferrals=
  &activated=true|false        # activatedAt is / is not null
  &phoneVerified=true|false
  &hasWalletBalance=true|false
  &createdFrom= &createdTo=
  &search=             # fullName, email, phone, referralCode
  &sort=createdAt|fullName|directReferralCount|depth
  &page= &limit=
```

```
GET /kyc-documents
  ?status=PENDING|APPROVED|REJECTED
  &documentType=NATIONAL_ID|PASSPORT|DRIVING_LICENCE
  &userId=
  &submittedFrom= &submittedTo=
```

---

## 2. Network

Entity: `NetworkPath` (closure table over the referral tree)

---

### 2.1 Foreign-key / relationship endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/network/:userId/ancestors` | Rows where `descendantId` = `:userId`, ordered by level — the upline |
| GET | `/network/:userId/descendants?maxLevel=3` | Flat descendant list, each with its level |
| GET | `/network/:userId/level/:level` | Everyone at exactly level N below this user |
| GET | `/network/:userId/relationship/:otherId` | Are these two related, and at what distance |

---

### 2.2 Business logic

| Method | Endpoint | Description |
|---|---|---|
| GET | `/network/:userId/tree?depth=3` | Nested tree object for the genealogy UI. Cap the depth — never let this return an unbounded tree |
| GET | `/me/network/tree?depth=3` | Same for the logged-in member |
| GET | `/network/:userId/stats` | Count per level, active vs inactive, total downline size, new joins this period |
| GET | `/network/:userId/legs?type=horizontal\|vertical` | Splits the downline using the `type` field on NetworkPath |
| GET | `/network/:userId/path-to/:descendantId` | The chain of sponsors between two members — useful for disputes |
| GET | `/network/leaderboard/recruiters?period=&limit=20` | Top sponsors by new activated referrals |
| GET | `/network/:userId/export?format=csv\|xlsx` | Genealogy export |
| POST | `/admin/network/rebuild` | Recompute the entire closure table from `sponsorId`. You will need this after any manual data fix — build it now, not later |
| POST | `/admin/network/rebuild/:userId` | Rebuild one subtree only |
| GET | `/admin/network/integrity-check` | Detects cycles, orphans, missing level-0 rows, and mismatches between `depth` and actual ancestor count |
| POST | `/admin/users/:id/move` | Reassign a member to a different sponsor and rewrite the affected paths. High-risk — audit it, and consider disallowing it after commissions have been paid |

---

### 2.3 Filter / list

```
GET /network-paths
  ?ancestorId=
  &descendantId=
  &level=
  &minLevel= &maxLevel=
  &type=horizontal|vertical
```

```
GET /network/:userId/descendants
  ?maxLevel=
  &status=ACTIVE|INACTIVE|...
  &qualifiedThisMonth=true|false
  &joinedFrom= &joinedTo=
  &city=
  &sort=level|joinedAt|directReferralCount
```

---

## 3. Products & Packages

Entities: `Product`, `Package`, `PackageItem`

---

### 3.1 Product

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products/:id/packages` | Packages that contain this product, via PackageItem |
| GET | `/products/:id/order-items` | Every sale line for this product |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/products/:id/activate` | Set `isActive = true` |
| PATCH | `/products/:id/deactivate` | Retire without deleting — history must stay intact |
| POST | `/products/:id/image` | Upload / replace `imageUrl` |
| POST | `/products/bulk-import` | CSV or XLSX catalog upload with a dry-run validation mode |
| GET | `/products/categories` | Distinct categories, for filter dropdowns |
| GET | `/products/:id/sales-stats?from=&to=` | Units sold, revenue, PV generated |

#### Filter

```
GET /products
  ?category=
  &isActive=true|false
  &unitOfMeasure=kg|litre|pcs
  &minPrice= &maxPrice=
  &minPv= &maxPv=
  &search=            # name, sku, description
  &sort=price|pvValue|name|createdAt
```

---

### 3.2 Package

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/packages/:id/items` | Contents, with product details joined in |
| GET | `/packages/:id/orders` | Orders that included this package |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| GET | `/packages/entry` | The currently active entry package — what the signup checkout uses |
| GET | `/packages/qualifying` | Active packages that satisfy the monthly duty |
| GET | `/packages/active?on=2026-07-31` | Packages valid on a given date, honouring `effectiveFrom` / `effectiveTo` |
| POST | `/packages/:id/supersede` | Close the current package (`effectiveTo = now`) and open its replacement in one call. Safer than editing price in place — editing rewrites history |
| PATCH | `/packages/:id/activate` / `/deactivate` | Toggle `isActive` |
| GET | `/packages/:id/computed-value` | Sum of item prices and PV vs the package's own `price` / `pvValue`, so you can catch mismatches before publishing |
| GET | `/packages/:id/sales-stats?period=` | Units sold, revenue, PV, commission paid out |
| POST | `/packages/:id/image` | Upload `imageUrl` |

#### Filter

```
GET /packages
  ?isActive=true|false
  &cycle=MONTHLY|ONE_TIME
  &isEntryPackage=true|false
  &isQualifying=true|false
  &effectiveOn=2026-07-31
  &minPrice= &maxPrice=
  &search=name|code
```

---

### 3.3 PackageItem

| Method | Endpoint | Description |
|---|---|---|
| POST | `/packages/:id/items` | Add a product line to a package |
| PATCH | `/packages/:id/items/:itemId` | Change quantity |
| DELETE | `/packages/:id/items/:itemId` | Remove a line |
| PUT | `/packages/:id/items` | Replace the whole contents in one call — easier for the admin UI than per-row edits |
| GET | `/package-items/:id/product` | Resolve `productId` |
| GET | `/package-items/:id/package` | Resolve `packageId` |

---

## 4. Commissions

Entities: `LevelConfiguration`, `CommissionRule`, `Commission`

This is the part of the system that pays people money. Every endpoint here needs
an audit trail, and every write needs to be idempotent.

---

### 4.1 LevelConfiguration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/level-configurations/:id/rules` | CommissionRules bound to this configuration |
| GET | `/level-configurations/active` | The configuration currently in force |
| POST | `/level-configurations/:id/activate` | Switch the active plan. Only one active at a time — deactivate the others in the same transaction |
| PATCH | `/level-configurations/:id/deactivate` | Retire a plan |
| POST | `/level-configurations/:id/clone` | Copy a config plus its rules as a draft, so you can change the plan without touching the live one |

```
GET /level-configurations?isActive=&isCommissionEligible=&maxDepth=
```

---

### 4.2 CommissionRule

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/commission-rules/:id/level-configuration` | Resolve `levelConfigurationId` |
| GET | `/commission-rules/:id/commissions?period=` | Payouts this rule generated |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| GET | `/commission-rules/active` | Rules in force right now — this is what the engine reads |
| POST | `/commission-rules/simulate` | **Dry run.** Given an order amount and a buyer, return every beneficiary, level, and amount **without writing any rows**. Build this before you go live; it is how you test the plan |
| GET | `/commission-rules/validate` | Sanity check across the active set: total payout percentage per level vs package margin, gaps in level coverage, overlapping rules |
| PATCH | `/commission-rules/:id/activate` / `/deactivate` | Toggle `isActive` |

```
GET /commission-rules
  ?commissionType=DIRECT_SALE|REFERRAL
  &levelConfigurationId=
  &isActive=true|false
  &minPV= &maxPV=
```

---

### 4.3 Commission

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/commissions/:id/beneficiary` | The earner |
| GET | `/commissions/:id/source-user` | The member whose purchase generated it |
| GET | `/commissions/:id/rule` | The rule applied |
| GET | `/commissions/:id/order` | The originating sale — **requires adding `orderId`, see schema gaps** |
| GET | `/commissions/:id/wallet-transaction` | The ledger row that credited it |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/:id/commissions/process` | Run the engine for one order. Must be idempotent — a second call returns the existing run, it does not pay twice |
| POST | `/orders/:id/commissions/reverse` | Reverse the whole run on refund: writes REVERSED rows and the matching wallet reversals |
| GET | `/orders/:id/commissions/preview` | What this order *would* pay, before payment approval |
| POST | `/commissions/:id/credit` | PENDING → CREDITED. Posts a `COMMISSION_CREDIT` wallet row and notifies the earner |
| POST | `/commissions/:id/reverse` | Single reversal with a reason |
| POST | `/commissions/:id/forfeit` | Mark forfeited with `forfeitReason` — typically the beneficiary was not qualified that month |
| POST | `/admin/commissions/batch-credit` | Credit a whole pending batch at period close. Returns a job id |
| POST | `/admin/commissions/recalculate` | Re-run the engine for a period after a rule fix. Guarded, admin-only, fully audited |
| GET | `/commissions/pending/summary` | Total pending liability, grouped by user and level — read this before approving a batch |
| GET | `/me/commissions/summary?period=` | Member view: earned, pending, forfeited, reversed, split by level |
| GET | `/me/commissions/by-source` | Which downline members generate the most income |
| GET | `/me/commissions/timeline?groupBy=month` | Earnings trend for charts |

#### Filter

```
GET /commissions
  ?beneficiaryUserId=
  &sourceUserId=
  &commissionRuleId=
  &status=PENDING|CREDITED|REVERSED
  &commissionType=DIRECT_SALE|REFERRAL
  &levelId=
  &period=2026-07
  &dateFrom= &dateTo=
  &creditedFrom= &creditedTo=
  &minAmount= &maxAmount=
  &sort=commissionAmount|createdAt|creditedAt
```

---

## 5. Orders & Payments

Entities: `Order`, `OrderItem`, `PaymentMethod`, `Payment`

---

### 5.1 Order

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders/:id/items` | Line items with frozen prices |
| GET | `/orders/:id/payments` | All payment attempts against this order |
| GET | `/orders/:id/commissions` | Payouts generated — needs `Commission.orderId`, see schema gaps |
| GET | `/orders/:id/buyer` | Buyer profile |
| GET | `/order-items/:id/product` / `/package` | Resolve the nullable FKs |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/quote` | Price a cart without persisting anything — totals, PV, applicable payment methods |
| POST | `/orders/checkout` | Create the order and its items, freeze `unitPrice` / `itemName` / `pvTotal`, compute `subtotal`, `totalAmount`, `totalPv`, return the payable amount and payment instructions |
| POST | `/orders/:id/cancel` | PENDING_PAYMENT → CANCELLED. Blocked once a payment is APPROVED |
| POST | `/orders/:id/refund` | PAID → REFUNDED. Must trigger commission reversal and wallet reversals in the same transaction |
| GET | `/orders/:id/invoice?format=pdf` | Printable invoice / receipt |
| GET | `/me/orders/current-month` | Has this member ordered in the current cycle — drives the "renew now" prompt |
| GET | `/orders/next-number` | Reserve the next `orderNumber` in sequence |
| POST | `/admin/orders/:id/recalculate-pv` | Recompute totals after a data fix, admin-only |

#### Filter

```
GET /orders
  ?orderType=ACTIVATION|MONTHLY_QUALIFICATION|RESALE|CUSTOMER_PURCHASE
  &status=PENDING_PAYMENT|PAID|CANCELLED|REFUNDED
  &commissionStatus=NOT_PROCESSED|PROCESSED|REVERSED
  &buyerUserId=
  &packageId= &productId=
  &period=2026-07
  &dateFrom= &dateTo=
  &minTotal= &maxTotal=
  &minPv= &maxPv=
  &search=orderNumber
  &sort=createdAt|totalAmount|totalPv
```

---

### 5.2 PaymentMethod

| Method | Endpoint | Description |
|---|---|---|
| GET | `/payment-methods/:id/payments` | All payments received through this channel |
| GET | `/payment-methods/active` | Channels shown at checkout — account details, instructions, min/max |
| GET | `/payment-methods/available?amount=2500` | Only the channels whose `minAmount` / `maxAmount` allow this amount |
| PATCH | `/payment-methods/:id/activate` / `/deactivate` | Toggle |

```
GET /payment-methods?methodType=BANK_TRANSFER|MOBILE_MONEY|CASH&isActive=
```

---

### 5.3 Payment

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/payments/:id/order` | The order being paid |
| GET | `/payments/:id/method` | The channel used |
| GET | `/payments/:id/user` | The payer |
| GET | `/payments/:id/reviewer` | Admin who decided — resolves `reviewedById` |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments` | Buyer declares the transfer, uploads proof, supplies `referenceNo` |
| POST | `/payments/:id/approve` | **The critical transaction.** Order → PAID; activate the user and stamp `activatedAt` if `orderType = ACTIVATION`; record the monthly qualification; trigger the commission run; send notifications. All in one DB transaction, all or nothing |
| POST | `/payments/:id/reject` | Requires `rejectionReason`; notifies the payer so they can resubmit |
| POST | `/payments/:id/cancel` | Member withdraws their own submission before review |
| POST | `/payments/:id/resubmit-proof` | Replace a bad proof image without creating a new payment row |
| GET | `/payments/queue` | Admin review queue, oldest first, with proof image and order context |
| GET | `/payments/check-reference?referenceNo=` | Detect a duplicate or reused bank reference **before** approving. This is your main fraud control on manual payments |
| POST | `/payments/bulk-approve` | Approve several verified payments at once. Returns per-item success/failure |

#### Filter

```
GET /payments
  ?status=SUBMITTED|APPROVED|REJECTED|CANCELLED
  &paymentMethodId=
  &userId=
  &orderId=
  &reviewedById=
  &referenceNo=
  &hasProof=true|false
  &dateFrom= &dateTo=
  &reviewedFrom= &reviewedTo=
  &minAmount= &maxAmount=
  &sort=createdAt|amount|reviewedAt
```

---

## 6. Wallet & Withdrawals

Entities: `WalletTransaction`, `WithdrawalRequest`

The ledger is append-only. There is no update or delete endpoint on
`WalletTransaction` — corrections are posted as new rows.

---

### 6.1 Wallet

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/wallet-transactions/:id/user` | Owner of the row |
| GET | `/wallet-transactions/:id/reference` | Resolve the polymorphic `referenceType` + `referenceId` to the actual Commission / Withdrawal record |
| GET | `/wallet-transactions/:id/created-by` | Admin who posted a manual adjustment |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| GET | `/me/wallet` | Available balance, locked balance, lifetime earned, lifetime withdrawn, pending commissions |
| GET | `/users/:id/wallet` | Admin view of the same |
| GET | `/users/:id/wallet/transactions` | Paginated ledger with running balance |
| GET | `/me/wallet/statement?from=&to=&format=pdf` | Downloadable statement |
| POST | `/admin/wallet/adjustments` | Manual credit or debit with a required description. Writes `ADJUSTMENT_CREDIT` / `ADJUSTMENT_DEBIT` and stamps `createdById` |
| POST | `/admin/wallet/reversal` | Post a `REVERSAL` row against a specific prior transaction |
| GET | `/admin/wallet/reconcile` | Compare each user's latest `balanceAfter` against the sum of their rows. Catches ledger drift — run it nightly |
| GET | `/admin/wallet/liability` | Total owed across all wallets, split available vs locked |

#### Filter

```
GET /wallet-transactions
  ?userId=
  &transactionType=COMMISSION_CREDIT|WITHDRAWAL_LOCK|WITHDRAWAL_DEBIT
                  |WITHDRAWAL_REFUND|ADJUSTMENT_CREDIT|ADJUSTMENT_DEBIT|REVERSAL
  &direction=CREDIT|DEBIT
  &referenceType=COMMISSION|WITHDRAWAL|MANUAL
  &referenceId=
  &createdById=
  &dateFrom= &dateTo=
  &minAmount= &maxAmount=
  &sort=createdAt|amount
```

---

### 6.2 WithdrawalRequest

#### Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/withdrawals/:id/user` | Requesting member |
| GET | `/withdrawals/:id/payment-method` | Payout channel |
| GET | `/withdrawals/:id/wallet-transactions` | The lock, debit, and refund rows tied to this request |

#### Business logic

| Method | Endpoint | Description |
|---|---|---|
| GET | `/me/withdrawals/eligibility` | Available balance, minimum amount, KYC approved, any pending request, next allowed date. Call this before rendering the form |
| POST | `/withdrawals` | Submit. Moves the amount from available to locked with a `WITHDRAWAL_LOCK` row |
| POST | `/withdrawals/:id/cancel` | Member cancels while PENDING; releases the lock via `WITHDRAWAL_REFUND` |
| POST | `/withdrawals/:id/review` | PENDING → UNDER_REVIEW, claims it for one admin so two admins can't pay it twice |
| POST | `/withdrawals/:id/approve` | Approved, awaiting the actual transfer |
| POST | `/withdrawals/:id/reject` | Requires `rejectionReason`; releases the lock back to available |
| POST | `/withdrawals/:id/mark-paid` | Attach `paymentReference` and `proofImageUrl`, set `paidAt`, post the `WITHDRAWAL_DEBIT` that clears the lock |
| GET | `/withdrawals/queue?status=` | Admin work queue |
| GET | `/withdrawals/payout-batch?date=` | Pending payouts grouped by payment method, ready for a bulk bank or telebirr transfer |
| POST | `/withdrawals/bulk-mark-paid` | Close out a payout batch, one reference per row |

#### Filter

```
GET /withdrawals
  ?status=PENDING|UNDER_REVIEW|APPROVED|REJECTED|PAID|CANCELLED
  &userId=
  &paymentMethodId=
  &accountNumber=
  &dateFrom= &dateTo=
  &paidFrom= &paidTo=
  &minAmount= &maxAmount=
  &sort=createdAt|amount|paidAt
```

---

## 7. Notifications

Entity: `Notification`

---

### 7.1 Foreign-key / relationship

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications/:id/user` | Recipient |

---

### 7.2 Business logic

| Method | Endpoint | Description |
|---|---|---|
| GET | `/me/notifications?category=&isRead=` | The member's feed |
| GET | `/me/notifications/unread-count` | Badge counter — keep it cheap, it gets polled |
| POST | `/me/notifications/:id/read` | Mark one as read, sets `readAt` |
| POST | `/me/notifications/read-all?category=` | Bulk mark read |
| DELETE | `/me/notifications/:id` | Dismiss from the feed |
| POST | `/admin/notifications/broadcast` | Send to all members or a segment (status, city, depth, level, qualified/unqualified). This is what the `news` category is for |
| POST | `/admin/notifications/send` | Send to one specific user |
| POST | `/admin/notifications/:id/resend-email` | Retry a failed email, updates `emailSentAt` |
| GET | `/admin/notifications/delivery-stats?category=&period=` | Sent, read, email-failed counts |

**Emitted automatically** — no endpoint, but worth listing so nothing is missed:

| Trigger | Category |
|---|---|
| Payment approved / rejected | ORDER |
| Commission credited | COMMISSION |
| Withdrawal approved / rejected / paid | WITHDRAWAL |
| New direct referral joins | NETWORK |
| KYC approved / rejected | KYC |
| Monthly qualification deadline approaching | SYSTEM |
| Account status changed | SYSTEM |

---

### 7.3 Filter

```
GET /notifications
  ?userId=
  &category=news|COMMISSION|WITHDRAWAL|ORDER|NETWORK|KYC|SYSTEM
  &isRead=true|false
  &emailSent=true|false
  &dateFrom= &dateTo=
  &search=title|body
  &sort=createdAt|readAt
```

---

## 8. Reports

Every endpoint here accepts `?format=json|csv|xlsx|pdf` and, where relevant,
`?from=`, `?to=`, `?period=YYYY-MM`, `?groupBy=day|week|month`.

---

### 8.1 Admin — overview

| Endpoint | Description |
|---|---|
| `GET /reports/dashboard` | Total members, actives, today's revenue, pending payments, pending withdrawals, total wallet liability |
| `GET /reports/dashboard/trends?days=30` | Sparkline data for the dashboard cards |

### 8.2 Sales

| Endpoint | Description |
|---|---|
| `GET /reports/sales?groupBy=day\|week\|month&from=&to=` | Revenue and PV over time |
| `GET /reports/sales/by-product` | Best sellers by units, revenue, PV |
| `GET /reports/sales/by-package` | Package performance |
| `GET /reports/sales/by-order-type` | Activation vs monthly vs resale vs customer split |
| `GET /reports/sales/by-region` | Grouped by `User.city` |
| `GET /reports/sales/by-payment-method` | Which channels the money actually arrives through |

### 8.3 Commissions

| Endpoint | Description |
|---|---|
| `GET /reports/commissions/summary?period=` | Generated, credited, pending, forfeited, reversed |
| `GET /reports/commissions/by-level` | Payout distribution across levels 1..N |
| `GET /reports/commissions/by-type` | DIRECT_SALE vs REFERRAL |
| `GET /reports/commissions/top-earners?period=&limit=20` | Ranked earners |
| `GET /reports/commissions/margin?period=` | **Revenue vs total commission paid — your real margin.** Watch this one every month; it is the number that tells you whether the plan is sustainable |
| `GET /reports/commissions/forfeited?period=` | What was lost to non-qualification, and by whom |

### 8.4 Network & members

| Endpoint | Description |
|---|---|
| `GET /reports/network/growth?groupBy=day` | Signups and activations over time |
| `GET /reports/network/depth-distribution` | How many members sit at each depth |
| `GET /reports/network/active-ratio` | Active vs inactive per level |
| `GET /reports/members/qualification?month=` | Who met and who missed the monthly duty |
| `GET /reports/members/inactive?months=2` | No qualifying order in N cycles |
| `GET /reports/members/churn?period=` | Activated vs gone inactive |
| `GET /reports/members/new?period=` | New registrations with their sponsors |
| `GET /reports/leaderboard/recruiters?period=` | Top sponsors by new activated referrals |

### 8.5 Money & compliance

| Endpoint | Description |
|---|---|
| `GET /reports/wallet/liability` | Total owed across all wallets, available vs locked |
| `GET /reports/withdrawals/summary?period=` | Requested, paid, rejected, average turnaround time |
| `GET /reports/withdrawals/aging` | Pending requests bucketed by age — surfaces anything stuck |
| `GET /reports/payments/reconciliation?date=` | Approved payments vs order totals, per channel |
| `GET /reports/payments/rejection-reasons?period=` | Why payments fail; usually points at unclear instructions |
| `GET /reports/kyc/summary` | Breakdown by status and average review time |
| `GET /reports/audit/admin-actions?adminId=&from=` | Who approved what, and when |

---

### 8.6 Member-facing

| Endpoint | Description |
|---|---|
| `GET /me/dashboard` | Wallet, this month's earnings, downline count, qualification status, pending items |
| `GET /me/reports/earnings?groupBy=month&from=&to=` | Earnings trend |
| `GET /me/reports/earnings/by-level` | Where the income comes from |
| `GET /me/reports/network-growth?groupBy=month` | Downline growth over time |
| `GET /me/reports/team-performance?period=` | Which downline members are active, qualified, and producing |
| `GET /me/reports/purchases?from=&to=` | Own order history summary |
| `GET /me/reports/statement?from=&to=&format=pdf` | Full personal statement: orders, commissions, wallet, withdrawals |

---

## 9. Scheduled & Maintenance Jobs

These run on a schedule, but expose each one as an admin-triggerable endpoint —
you will need to re-run them by hand at some point, and it should not require a
database console.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/jobs/qualification-run?period=2026-07` | Close the month: mark who qualified, forfeit commissions whose beneficiary was not qualified |
| POST | `/jobs/deactivate-lapsed` | Flip ACTIVE → INACTIVE for members who missed the cycle |
| POST | `/jobs/commission-batch-credit?period=` | Credit all PENDING commissions at period close |
| POST | `/jobs/network-rebuild` | Rebuild the NetworkPath closure table from `sponsorId` |
| POST | `/jobs/wallet-reconcile` | Verify every wallet balance against its ledger, report drift |
| POST | `/jobs/qualification-reminder` | Notify members who have not made their qualifying purchase, a few days before the deadline |
| POST | `/jobs/payment-expiry` | Cancel orders left in PENDING_PAYMENT past the window |
| POST | `/jobs/notification-email-retry` | Retry notifications where `emailSentAt` is still null |
| GET | `/jobs` | Registered jobs, schedules, and last run status |
| GET | `/jobs/:runId/status` | Progress, records processed, errors |
| GET | `/jobs/history?jobName=&from=` | Past runs |
| POST | `/jobs/:runId/cancel` | Stop a running job |

**Rules for all of these**

- Every job returns a `runId` immediately and executes asynchronously. Nothing here
  should run inside an HTTP request timeout.
- Every job is idempotent. Running the qualification job twice for `2026-07` must not
  forfeit the same commission twice or credit anything twice.
- Every job supports `?dryRun=true`, returning what it *would* change. Use it before
  every first real run.
- Every job writes an audit record: who triggered it, when, what changed.

---

## 10. Schema Gaps

Problems in the current entity list that block endpoints in the previous files.
Roughly in order of how much pain each one causes.

---

#### 1. `Commission` has no `orderId` — fix this first

Without it you cannot trace a payout back to the sale, cannot reverse a run when an
order is refunded, and cannot build `GET /orders/:id/commissions`.

```
Commission.orderId (FK → Order)   # required
```

---

#### 2. No monthly qualification entity

Your Payment notes say "the buyer's monthly activity is updated" — but nothing stores
it. Every qualification check then becomes a scan over Orders, and the commission
engine does that check for every beneficiary on every sale.

```
MemberQualification
  id (PK)
  userId (FK → User)
  period            # "2026-07"
  orderId (FK → Order)
  isQualified
  qualifiedAt
  unique on (userId, period)
```

---

#### 3. `User.wallet` is a single field, but the withdrawal flow needs two

Your own flow says funds move from available to locked and back. One number cannot
represent that. Either:

```
User.availableBalance
User.lockedBalance
```

or split it into a `Wallet` entity with `userId`, `availableBalance`, `lockedBalance`,
`lifetimeEarned`, `lifetimeWithdrawn`, and a version column for optimistic locking.

---

#### 4. No `AuditLog` entity

With manual payment approval, manual wallet adjustments, and manual status changes,
you need an immutable record of who did what.

```
AuditLog
  id (PK)
  actorUserId (FK → User)
  action            # PAYMENT_APPROVED, WALLET_ADJUSTED, USER_BLOCKED, ...
  entityType
  entityId
  beforeJson / afterJson
  ipAddress
  createdAt
```

---

#### 5. `WithdrawalRequest` is missing reviewer fields

`Payment` has `reviewedById` and `reviewedAt`; withdrawals — which move more money —
have neither. Add both, plus `approvedById` / `paidById` if different people do those steps.

---

#### 6. `Commission.levelid` points at nothing clear

If it is the level from NetworkPath, make it a plain integer (`level`). If it is meant
to be a foreign key, there is no `Level` table in the schema to point at.

---

#### 7. `NetworkPath.type` (horizontal / vertical) does not fit a closure table

A path in a closure table is fully defined by its ancestor, descendant, and level.
Adding a direction suggests you may actually want a binary/matrix plan rather than a
pure unilevel referral tree. Clarify what this represents before building the tree
endpoints on top of it — the two designs have very different commission engines.

---

#### 8. `Order` has no fulfilment fields

You are shipping physical food. There is nowhere to record a delivery address,
delivery status, pickup point, or dispatch date.

```
Order.deliveryAddress
Order.deliveryStatus   # PENDING | DISPATCHED | DELIVERED | FAILED
Order.deliveredAt
Order.pickupPointId
```

---

#### 9. Smaller items

- `KycDocument` has no `reviewedById` / `reviewedAt` — same problem as withdrawals.
- `Order` has no `sponsorIdAtPurchase`. If a member is ever moved to a new sponsor,
  historic commission attribution becomes unexplainable without it.
- `Payment` has no unique constraint on `referenceNo` per payment method. Add one, or
  the duplicate-reference check is advisory only.
- `Product.unitPrice` and `Package.price` need a currency field, or a documented
  system-wide assumption of ETB.
- Consider `deletedAt` (soft delete) on `Product` and `Package` rather than hard
  deletes, since OrderItem only copies the name and price.
