# Network CMS Dashboard

A React admin console for the Express + Sequelize network-marketing backend in `backend.zip`.

Every screen here is wired to an endpoint that already exists in that backend. Nothing calls a
made-up API. Where the backend is missing something the frontend would normally use, there is a
`TODO(backend)` comment at the exact spot instead of fake data — all of them are listed under
[Known gaps](#known-gaps-in-the-backend).

---

## Table of contents

1. [Quick start](#quick-start)
2. [Environment](#environment)
3. [Test mode: signing in without a backend](#test-mode-signing-in-without-a-backend)
4. [Tech stack](#tech-stack)
5. [Folder structure](#folder-structure)
6. [How a request flows](#how-a-request-flows)
7. [Where each component is imported](#where-each-component-is-imported)
8. [API map](#api-map)
9. [Adding a new CRUD page](#adding-a-new-crud-page)
10. [Known gaps in the backend](#known-gaps-in-the-backend)
11. [Backend changes you need before this runs](#backend-changes-you-need-before-this-runs)
12. [Conventions](#conventions)

---

## Quick start

```bash
# 1. install
npm install

# 2. point the app at your backend
cp .env.example .env
#    then edit .env if your API isn't on http://localhost:5000

# 3. run
npm run dev          # http://localhost:3000

# other scripts
npm run build        # production build into dist/
npm run preview      # serve the production build locally
```

You need Node 18 or newer.

Start the backend first (`node src/server.js` in the backend folder). If the API is down, every
page still loads — you get a "Can't reach the server" toast and an inline error state with a
**Try again** button rather than a blank screen.

---

## Environment

Two variables, in `.env` at the project root:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_FAKE_AUTH=true
```

No trailing slash. It must end in `/api`, because the backend mounts every router under that
prefix in `src/app.js`.

It is read in exactly one place — `src/api/axios.js` — via `import.meta.env.VITE_API_BASE_URL`.
No URL is hardcoded anywhere else. `.env` is gitignored; `.env.example` is committed as the
template.

`VITE_USE_FAKE_AUTH` is the test-mode switch — see the next section.

Vite only exposes variables prefixed with `VITE_`, and it reads `.env` at **startup**, so restart
the dev server after changing either of them.

---

## Test mode: signing in without a backend

The backend in `backend.zip` can't start as shipped (no `package.json`, no CORS), so there is a
switch that lets you reach the dashboard anyway.

```
VITE_USE_FAKE_AUTH=true     # in .env, then restart the dev server
```

With it on:

- The login page prefills the form and shows a **"Skip sign-in and open the dashboard"** button.
- Any email and password are accepted. No request is sent to `/api/auth/login`.
- You arrive as `Test Administrator` with the `ADMIN` role, so nothing is gated off.
- A striped banner sits at the top of every page so a faked session is never mistaken for a
  real one.
- The 401 auto-logout is suspended. Without this, a live protected backend rejecting the fake
  token would bounce you back to `/login` the instant any page loaded.

### What it does *not* fake

**Only the login is faked. Your data is not.** Every page still calls the real API, exactly as
before. With no backend running you will see "Can't reach the server" toasts and each table
will show *"Couldn't load this list"* with a **Try again** button.

That is deliberate. You asked for no fake APIs, and this keeps that rule — you get to test the
real layout, routing, sidebar, modals, forms, Yup validation, empty states and error handling,
without inventing records that don't exist. The dashboard still renders all eight stat cards
(showing zeros) so you can check the layout.

If you also want seeded data to click through, say so and I'll add a `VITE_USE_MOCK_DATA` flag
alongside this one.

### Turning it off

Set `VITE_USE_FAKE_AUTH=false` (or delete the line) and restart. `.env.example` ships with it
set to `false`, so a fresh clone defaults to real authentication. The banner disappearing is
your confirmation.

Everything lives in `src/services/fakeAuth.js`. Deleting that file and the four small
`isFakeAuthEnabled()` checks that reference it (in `authService.js`, `api/axios.js`,
`LoginPage.jsx` and `TestModeBanner.jsx`) removes the feature entirely.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| UI | React 18, function components and hooks only |
| Language | JavaScript / JSX — no TypeScript |
| Routing | React Router 6 |
| HTTP | Axios, one configured instance |
| Forms | React Hook Form |
| Validation | Yup, via `@hookform/resolvers` |
| Notifications | React Hot Toast |
| Styling | One CSS file: `src/styles/twinline.css` |
| Build | Vite 5 |

### About the styling

All CSS lives in `src/styles/twinline.css`, imported once in `src/main.jsx`. No component ships
its own stylesheet and there are no inline style objects for anything reusable. The file is
organised into 15 numbered sections — design tokens, reset, utilities, then one section per
component family — so you can find any rule by searching for the class name.

Colours, spacing, fonts and shadows are CSS custom properties declared at the top under
`:root`. Change the brand colour once there and it updates everywhere.

---

## Folder structure

```
src/
├── api/
│   ├── axios.js              configured axios instance + interceptors
│   └── endpoints.js          every backend path, in one object
│
├── assets/                   images and static files
│
├── components/               reusable UI, one folder per component
│   ├── button/Button.jsx
│   ├── card/Card.jsx, StatCard.jsx
│   ├── chart/BarChart.jsx, DonutChart.jsx
│   ├── confirmationModal/ConfirmationModal.jsx
│   ├── dataTable/DataTable.jsx
│   ├── emptyState/EmptyState.jsx
│   ├── form/DynamicForm.jsx, FormField.jsx
│   ├── input/Input.jsx, Textarea.jsx
│   ├── layout/Breadcrumb.jsx, PageHeader.jsx, DetailList.jsx, Footer.jsx
│   ├── loading/Spinner.jsx, PageLoader.jsx, TableSkeleton.jsx
│   ├── modal/Modal.jsx
│   ├── pagination/Pagination.jsx
│   ├── search/SearchInput.jsx
│   ├── select/Select.jsx, Checkbox.jsx
│   ├── sidebar/Sidebar.jsx
│   ├── statusBadge/StatusBadge.jsx
│   ├── table/Table.jsx
│   ├── toaster/AppToaster.jsx
│   └── topbar/Topbar.jsx
│
├── constants/
│   ├── appConstants.js       backend enums, page size, error copy
│   └── routes.js             every URL in the app
│
├── hooks/
│   ├── useAuth.jsx           auth context + provider
│   ├── useCrud.js            list/create/edit/view/delete state
│   ├── useDebounce.js        delays the search box
│   ├── useFetch.js           load-once-on-mount helper
│   └── useTableControls.js   search + sort + paginate
│
├── layouts/
│   ├── authLayout.jsx        two-panel shell for login/register
│   └── dashboardLayout.jsx   sidebar + topbar + content + footer
│
├── pages/
│   ├── crud/
│   │   ├── CrudPage.jsx        the generic CRUD engine
│   │   ├── columnHelpers.jsx   shared column + detail builders
│   │   └── optionBuilders.js   lookup lists -> select options
│   ├── landing/LandingPage.jsx
│   ├── login/LoginPage.jsx
│   ├── register/RegisterPage.jsx
│   ├── dashboard/DashboardPage.jsx
│   ├── profile/ProfilePage.jsx
│   ├── settings/SettingsPage.jsx
│   ├── roles/RolesPage.jsx
│   ├── notFound/NotFoundPage.jsx
│   └── <module>/              one folder per backend module, each holding
│       ├── <module>Config.js    columns, form fields, Yup schema, detail view
│       └── <Module>Page.jsx     3-line wrapper around CrudPage
│
├── routes/
│   ├── appRoutes.jsx         the whole route table
│   └── privateRoute.jsx      redirects signed-out users to /login
│
├── services/
│   ├── createCrudService.js  factory: getAll/getById/create/update/remove
│   ├── authService.js        login, register, logout
│   ├── dashboardService.js   derives stats from the list endpoints
│   ├── fakeAuth.js           TEST MODE: fake sign-in, off by default
│   └── <module>Service.js    one per backend module (16 of them)
│
├── styles/
│   └── twinline.css          the only stylesheet
│
├── utils/
│   ├── helpers.js            formatting, sorting, search matching
│   ├── storage.js            the only file that touches localStorage
│   └── validators.js         shared Yup rules
│
├── App.jsx                   routes + toaster
└── main.jsx                  React root, router, auth provider, CSS import
```

---

## How a request flows

Take "load the products list" as the example. Every module works the same way.

```
ProductsPage.jsx
    └── renders <CrudPage config={productsConfig} />
            │
            ├── useCrud(productService, "Product")     ← state: rows, loading, modals
            │       └── productService.getAll()
            │               └── createCrudService("/products", ...)
            │                       └── api.get("/products")        ← src/api/axios.js
            │                               ├── request interceptor attaches the JWT
            │                               ├── ...backend responds { success, data }
            │                               └── response interceptor:
            │                                     · 401 → clear storage, go to /login
            │                                     · any error → one friendly toast
            │
            └── <DataTable columns={...} rows={crud.rows} />
                    └── useTableControls()  ← search, sort, paginate in the browser
                            └── <Table />, <SearchInput />, <Pagination />,
                                <EmptyState />, <TableSkeleton />
```

Creating or editing follows the same path in reverse: `DataTable` fires `onEdit(row)` →
`useCrud` opens the modal → `DynamicForm` builds the inputs from `productsConfig.fields` and
validates against `productsConfig.schema` → `useCrud.saveRow()` → `productService.update()` →
success toast → list reloads.

### Error handling

All of it lives in the response interceptor in `src/api/axios.js`. Pages never write
`try/catch` around an axios call for the purpose of showing a message.

| Situation | What the user sees |
| --- | --- |
| 400 | "That request wasn't valid. Check the highlighted fields and try again." |
| 401 | "Your session expired. Sign in again to continue." + redirect to `/login` |
| 403 | "You don't have permission to do that." |
| 404 | "We couldn't find that record. It may have been deleted." |
| 422 | "Some fields didn't pass validation. Review them and resubmit." |
| 500 | "The server hit an error. Try again in a moment." |
| No response | "Can't reach the server. Check your connection or the API URL." |
| Timeout (20s) | "The request timed out. Try again." |

If the backend sends its own `message`, that wins over the generic copy — the backend
controllers all return `{ success: false, message }`, so the real reason usually surfaces.

Pass `{ skipErrorToast: true }` in the axios config to suppress the toast and handle an error
yourself. The dashboard uses this so nine parallel failures don't produce nine toasts.

### Loading states

| Where | Component |
| --- | --- |
| Whole page | `PageLoader` |
| Inside a table | `TableSkeleton` (shimmer rows) |
| On a button | `<Button isLoading />` |
| Anywhere small | `Spinner` |

---

## Where each component is imported

Use this to find the right existing component before writing a new one.

| Component | Path | Imported by |
| --- | --- | --- |
| `Button` | `components/button/Button.jsx` | `DynamicForm`, `ConfirmationModal`, `EmptyState`, `Topbar`, `CrudPage`, `DataTable`, `LoginPage`, `RegisterPage`, `LandingPage`, `DashboardPage`, `ProfilePage`, `SettingsPage`, `RolesPage`, `NotFoundPage` |
| `Card` | `components/card/Card.jsx` | `CrudPage`, `DashboardPage`, `ProfilePage`, `SettingsPage`, `RolesPage` |
| `StatCard` | `components/card/StatCard.jsx` | `DashboardPage` |
| `BarChart` / `DonutChart` | `components/chart/` | `DashboardPage` |
| `ConfirmationModal` | `components/confirmationModal/` | `CrudPage` (delete), `Topbar` (sign out), `SettingsPage` (clear session) |
| `DataTable` | `components/dataTable/DataTable.jsx` | `CrudPage` — so every one of the 16 module pages |
| `EmptyState` | `components/emptyState/` | `DataTable`, `DashboardPage`, `ProfilePage`, `RolesPage` |
| `DynamicForm` | `components/form/DynamicForm.jsx` | `CrudPage` |
| `FormField` | `components/form/FormField.jsx` | `DynamicForm` |
| `Input` | `components/input/Input.jsx` | `FormField`, `LoginPage`, `RegisterPage`, `ProfilePage` |
| `Textarea` | `components/input/Textarea.jsx` | `FormField`, `ProfilePage` |
| `Select` | `components/select/Select.jsx` | `FormField` |
| `Checkbox` | `components/select/Checkbox.jsx` | `FormField` |
| `Breadcrumb` | `components/layout/Breadcrumb.jsx` | `PageHeader` |
| `PageHeader` | `components/layout/PageHeader.jsx` | `CrudPage`, `DashboardPage`, `ProfilePage`, `SettingsPage`, `RolesPage` |
| `DetailList` | `components/layout/DetailList.jsx` | `CrudPage` (view modal), `ProfilePage`, `SettingsPage` |
| `Footer` | `components/layout/Footer.jsx` | `dashboardLayout` |
| `TestModeBanner` | `components/layout/TestModeBanner.jsx` | `dashboardLayout`, `authLayout` — renders nothing unless test mode is on |
| `Spinner` | `components/loading/Spinner.jsx` | `PageLoader` |
| `PageLoader` | `components/loading/PageLoader.jsx` | `DashboardPage`, `ProfilePage`, `RolesPage` |
| `TableSkeleton` | `components/loading/TableSkeleton.jsx` | `DataTable` |
| `Modal` | `components/modal/Modal.jsx` | `CrudPage`, `ConfirmationModal` |
| `Pagination` | `components/pagination/Pagination.jsx` | `DataTable` |
| `SearchInput` | `components/search/SearchInput.jsx` | `DataTable` |
| `Sidebar` | `components/sidebar/Sidebar.jsx` | `dashboardLayout` |
| `StatusBadge` | `components/statusBadge/` | `columnHelpers`, `DashboardPage`, `ProfilePage`, `SettingsPage`, `RolesPage` |
| `Table` | `components/table/Table.jsx` | `DataTable`, `DashboardPage`, `ProfilePage`, `RolesPage` |
| `AppToaster` | `components/toaster/AppToaster.jsx` | `App.jsx` — mounted once |
| `Topbar` | `components/topbar/Topbar.jsx` | `dashboardLayout` |

Hooks:

| Hook | Imported by |
| --- | --- |
| `useAuth` | `privateRoute`, `Topbar`, `LoginPage`, `RegisterPage`, `ProfilePage`, `SettingsPage` |
| `useCrud` | `CrudPage` |
| `useTableControls` | `DataTable` |
| `useDebounce` | `useTableControls` |
| `useFetch` | `DashboardPage`, `ProfilePage`, `RolesPage` |

Mounting order, top to bottom:

```
main.jsx
 └── <BrowserRouter>
      └── <AuthProvider>            ← hooks/useAuth.jsx
           └── <App>                ← App.jsx
                ├── <AppRoutes>     ← routes/appRoutes.jsx
                │    ├── <LandingPage>              (public, no layout)
                │    ├── <AuthLayout>               (public)
                │    │    ├── <LoginPage>
                │    │    └── <RegisterPage>
                │    └── <PrivateRoute>             (everything under /app)
                │         └── <DashboardLayout>
                │              ├── <Sidebar>
                │              ├── <Topbar>
                │              ├── <Outlet>         ← the current page
                │              └── <Footer>
                └── <AppToaster>
```

---

## API map

Read from `backend/src/app.js` and `backend/src/routes/*.js`. Every controller answers with
`{ success: true, data }` or `{ success: false, message }`, which is why
`createCrudService` returns `response.data.data`.

| Module | Base path | Operations | Service |
| --- | --- | --- | --- |
| Auth | `/api/auth` | `POST /login`, `POST /register` | `authService.js` |
| Members | `/api/users` | full CRUD | `userService.js` |
| Network paths | `/api/network-paths` | full CRUD | `networkPathService.js` |
| Products | `/api/products` | full CRUD | `productService.js` |
| Packages | `/api/packages` | full CRUD | `packageService.js` |
| Package items | `/api/package-items` | full CRUD | `packageItemService.js` |
| Orders | `/api/orders` | full CRUD | `orderService.js` |
| Order items | `/api/order-items` | full CRUD + `GET /order/:orderId` | `orderItemService.js` |
| Commissions | `/api/commissions` | full CRUD + `GET /user/:userId` | `commissionService.js` |
| Commission rules | `/api/commission-rules` | full CRUD | `commissionRuleService.js` |
| Level configuration | `/api/level-configurations` | full CRUD | `levelConfigurationService.js` |
| Payments | `/api/payments` | full CRUD | `paymentService.js` |
| Payment methods | `/api/payment-methods` | full CRUD | `paymentMethodService.js` |
| Withdrawals | `/api/withdrawal-requests` | full CRUD + `GET /user/:userId` | `withdrawalRequestService.js` |
| Wallet ledger | `/api/wallet-transactions` | **GET + POST only** | `walletTransactionService.js` |
| Notifications | `/api/notifications` | full CRUD + `GET /user/:userId` | `notificationService.js` |
| KYC documents | `/api/kyc` | full CRUD | `kycService.js` |

The wallet ledger has no edit or delete because the router doesn't define `PUT` or `DELETE` —
the `WalletTransaction` model sets `updatedAt: false`, so it is append-only by design. Its page
hides those buttons via `canEdit: false, canDelete: false`.

### Auth

`POST /api/auth/login` returns `{ user: { id, fullName, email, role }, token }`. The token goes
into storage and is attached to every later request as `Authorization: Bearer <token>`. It
expires after 7 days (set in `backend/src/utils/jwt.js`).

`POST /api/auth/register` takes `fullName`, `email`, `phone`, `password` and an optional
`referralCode`. It hashes the password, generates a referral code, links the sponsor and builds
the network-path rows. It does **not** return a token, so the register page sends you to sign in.

---

## Adding a new CRUD page

Five steps, roughly ten minutes. Copying `pages/products/` is the fastest start.

**1. Add the endpoints** — `src/api/endpoints.js`

```js
INVOICES: {
  BASE: "/invoices",
  BY_ID: (id) => `/invoices/${id}`,
},
```

**2. Add the service** — `src/services/invoiceService.js`

```js
import ENDPOINTS from "../api/endpoints";
import createCrudService from "./createCrudService";

const invoiceService = createCrudService(
  ENDPOINTS.INVOICES.BASE,
  ENDPOINTS.INVOICES.BY_ID
);

export default invoiceService;
```

**3. Add the config** — `src/pages/invoices/invoicesConfig.js`

```js
import * as yup from "yup";
import invoiceService from "../../services/invoiceService";
import { requiredText, requiredNumber } from "../../utils/validators";
import { idColumn, strongColumn, moneyColumn, detail, timestampDetails }
  from "../crud/columnHelpers";

export const invoicesConfig = {
  key: "invoices",
  title: "Invoices",
  singular: "Invoice",
  description: "What this page is for, in one line.",
  service: invoiceService,

  searchFields: ["reference", "status"],   // which fields the search box scans
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    strongColumn("reference", "Reference"),
    moneyColumn("total", "Total"),
  ],

  fields: [
    { name: "reference", label: "Reference", type: "text", required: true },
    { name: "total", label: "Total", type: "number", step: "0.01", required: true },
  ],

  schema: yup.object({
    reference: requiredText("Reference"),
    total: requiredNumber("Total", 0),
  }),

  detailItems: (row) => [
    detail("Reference", row.reference),
    ...timestampDetails(row),
  ],
};

export default invoicesConfig;
```

**4. Add the page** — `src/pages/invoices/InvoicesPage.jsx`

```jsx
import CrudPage from "../crud/CrudPage";
import invoicesConfig from "./invoicesConfig";

const InvoicesPage = () => <CrudPage config={invoicesConfig} />;

export default InvoicesPage;
```

**5. Wire it up** — add the path to `constants/routes.js`, a `<Route>` in `routes/appRoutes.jsx`
and a link in `components/sidebar/Sidebar.jsx`.

You now have list, search, sort, pagination, create, edit, view, delete, confirmation and toasts.

### Config reference

| Key | Purpose |
| --- | --- |
| `title`, `singular`, `description` | Page heading, button labels, toast copy |
| `service` | Must expose `getAll`, `create`, `update`, `remove` |
| `columns` | Table columns — build them with `columnHelpers` |
| `fields` | Form inputs (static) |
| `buildFields(lookups)` | Form inputs that need dropdowns from another endpoint |
| `lookups` | `{ users: userService }` — fetched once, handed to `buildFields` |
| `schema` | Yup object schema |
| `detailItems(row, lookups)` | Rows for the view modal; omit to hide the view button |
| `searchFields` | Fields the search box looks at |
| `canCreate` / `canEdit` / `canDelete` | Default `true`; set `false` to hide a button |
| `notice` | A banner above the table, for anything an operator should know first |
| `toPayload(values, row)` | Optional last transform before the request |

### Field types

`text`, `email`, `tel`, `password`, `number`, `textarea`, `select`, `checkbox`, `date`,
`datetime`. Add `wide: true` to make a field span both form columns, `hint` for helper text
under the input, `required` for the red asterisk (which is cosmetic — Yup does the enforcing).

---

## Known gaps in the backend

Each of these has a `TODO(backend)` comment at the relevant line. None of them is worked around
with invented data.

| Gap | Where it bites | What the frontend does instead |
| --- | --- | --- |
| No `GET /auth/me` | Restoring a session on refresh | Reads the user object saved at login (`authService.getCurrentUser`) |
| No stats endpoint | Dashboard | `dashboardService.getOverview()` calls the real list endpoints in parallel and aggregates in the browser |
| No query parameters on list endpoints | Every table | Search, sort and pagination run client-side in `useTableControls`. `DataTable` already accepts a `serverSide` flag for when this changes |
| No roles resource | Roles page | `role` is an `ENUM("ADMIN","MEMBER")` column on `users`, so the page is read-only and counts holders |
| No settings resource | Settings page | Reports the environment and offers session controls; saves nothing server-side |
| `POST /api/users` writes the model directly | Members create form | The form asks for `passwordHash`, not `password`, and says so in a banner. Only `/auth/register` hashes |
| `kycDocumentRoutes.js` is dead code | — | Not mounted in `app.js` and its controller file is missing. The KYC page uses `/api/kyc`, which serves the same model |
| No PUT/DELETE on wallet transactions | Wallet ledger | Edit and delete buttons hidden; the page explains to post a reversal instead |
| `authMiddleware` exists but is applied to no route | Everything | The token is still sent on every request, so protecting the routes later needs no frontend change |

---

## Backend changes you need before this runs

Two blockers in `backend.zip` that stop any browser from reaching the API. Until they are
fixed, use [test mode](#test-mode-signing-in-without-a-backend) to get into the UI.

**1. There's no `package.json`.** Create one and install what the code requires:

```bash
cd backend
npm init -y
npm install express sequelize mysql2 bcrypt jsonwebtoken dotenv cors
```

**2. CORS isn't enabled.** The browser will block every request until it is. In
`backend/src/app.js`:

```js
const cors = require("cors");

app.use(cors({ origin: "http://localhost:3000" }));   // add this
app.use(express.json());                              // existing line
```

Worth doing at the same time, though not blockers:

- `src/routes/index.js` is empty and `src/services/networkPathService` has no `.js` extension —
  which will fail to resolve on a case-sensitive filesystem.
- Apply `authMiddleware` to the routes that should be protected. The frontend already sends the
  token, so nothing here changes.

---

## Conventions

**Naming**

| Thing | Style | Example |
| --- | --- | --- |
| Folders | lowercase / camelCase | `components/statusBadge/` |
| Files that export a component | PascalCase | `DataTable.jsx` |
| Every other file | camelCase | `userService.js`, `appRoutes.jsx` |
| Components | PascalCase | `const StatusBadge = () => ...` |
| Variables and functions | camelCase | `const isLoading = ...` |
| Constants | UPPER_CASE | `export const PAGE_SIZE = 10;` |

**Rules the codebase sticks to**

- `localStorage` is touched only in `utils/storage.js`. Everywhere else uses
  `storage.getToken()`, `storage.setUser()` and friends.
- API paths live only in `api/endpoints.js`.
- The base URL lives only in `.env`, read only in `api/axios.js`.
- CSS lives only in `styles/twinline.css`.
- Components take props and render; data fetching happens in hooks and services.
- `async/await` throughout — no `.then()` chains outside `Promise.allSettled` fan-outs.
- Comments explain *why*, and flag anything surprising about the backend. Obvious code is left
  uncommented.

**Accessibility**

Keyboard focus is visible on every interactive element, modals close on `Escape` and lock the
page behind them, icon-only buttons carry `aria-label`, sortable headers report `aria-sort`,
and `prefers-reduced-motion` is respected.

**Responsive**

The layout adapts at 1080px, 900px, 820px (sidebar collapses to a drawer) and 640px (tables
scroll horizontally, forms drop to one column).
