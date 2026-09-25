# JK Sports — E-commerce Setup Guide
Your site stays on GitHub Pages (static hosting, free). Cart, payments, and
admin management run on **Firebase** (database + auth + backend functions)
and **Razorpay** (payment gateway). Follow these steps in order.
## What's new in this codebase
| File/Folder | Purpose |
|---|---|
| `js/firebase-config.js` | Firebase connection settings — you fill this in |
| `js/cart.js` | Shopping cart (localStorage), used on every page |
| `js/products.js` | Loads live prices/stock from Firestore into the site |
| `checkout.html` | Customer details form + Razorpay payment |
| `order-success.html` | Order confirmation page |
| `admin/` | Password-protected dashboard to edit prices/stock and view orders |
| `functions/` | Backend code (Cloud Functions) — creates orders, verifies payments |
| `firestore.rules` | Security rules — who can read/write what |
| `scripts/products-seed.json` | Your 67 existing products, ready to upload (price defaulted to ₹499 — **edit these before going live**) |
| `scripts/seed.js` | One-time script to upload the products above |
## Step 1 — Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Name it (e.g. "jk-sports-namakkal") → follow the prompts (Google Analytics is optional).
## Step 2 — Enable the services you need
In the Firebase Console, left sidebar:
- **Build → Firestore Database** → Create database → Start in **production mode** → pick a region close to India (e.g. `asia-south1`).
- **Build → Authentication** → Get started → enable **Email/Password** sign-in method.
- **Upgrade to the Blaze (pay-as-you-go) plan** — click the plan name at the bottom of the sidebar. This is required for Cloud Functions to call out to Razorpay. You only pay for what you use; Firebase has a generous free tier, so a small shop's traffic typically costs very little per month.
## Step 3 — Get your Razorpay account
1. Sign up at [razorpay.com](https://razorpay.com).
2. Complete KYC (business PAN/GST details) — required before you can accept **live** payments. You can test everything with **Test Mode** keys before KYC finishes.
3. Dashboard → **Settings → API Keys** → Generate Test Key → note the **Key ID** and **Key Secret**.
## Step 4 — Install the Firebase CLI locally
On your computer (not this chat):
```bash
npm install -g firebase-tools
firebase login
```
## Step 5 — Link this project folder to your Firebase project
1. Open `.firebaserc` in this folder and replace `
jk-sports-f263d` with your actual project ID (found in Firebase Console → Project Settings → General).
## Step 6 — Set your Razorpay keys as secrets
From this project folder:
```bash
firebase functions:secrets:jk-sports-f263d
firebase functions:secrets:set ZiMbW8F8P1bSvob5ynl7cL6P
```
(Paste the values when prompted — these are stored securely in Google Secret Manager, never in your code.)
## Step 7 — Install function dependencies and deploy
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
firebase deploy --only firestore:rules
```
## Step 8 — Get your web app config
Firebase Console → Project Settings (gear icon) → scroll to **Your apps** → click **Web** (`</>`) → register an app (nickname anything) → copy the `firebaseConfig` object shown.
Paste those values into `js/firebase-config.js`, replacing the `REPLACE_ME` placeholders.
## Step 9 — Create your admin login
Firebase Console → Authentication → Users → **Add user** → enter your real admin email and choose a password. That's your login for `admin/index.html`.
## Step 10 — Add yourself to the admin allowlist
Firebase Console → Firestore Database → **Start collection** → collection ID `config` → document ID `admins` → add a field:
- Field: `emails`, type: **array**, value: `["your-admin-email@example.com"]`
This one document is the single source of truth for who's an admin — both `firestore.rules` and the Cloud Functions (`updateOrderStatus`, etc.) check against it, so there's nothing to keep in sync across files. To add a second admin later, just add another email to this array.
## Step 11 — Upload your products
```bash
cd scripts
npm install firebase-admin
```
Then download a service account key: Firebase Console → Project Settings → Service Accounts → **Generate new private key** → save it as `scripts/serviceAccountKey.json` (this file is gitignored — never commit it or share it).
```bash
node seed.js
```
This uploads all 67 existing products with a **placeholder price of ₹499**. Log into `admin/index.html` afterwards and set the real price and stock count for each item — the storefront won't show a product's "Add to Cart" button correctly priced until you do.
## Step 12 — Push to GitHub
Commit and push all these files to your `jk-sports` repo as usual. GitHub Pages will serve the updated static files (`index.html`, `checkout.html`, `admin/`, etc.) exactly like before — Firebase and Razorpay run independently in the background, so no GitHub Pages settings need to change.
## Step 13 — Test end-to-end
1. Visit your live site → open a product catalog → Add to Cart → Checkout.
2. Use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-upi-details/) (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV) to simulate a payment.
3. Confirm the order appears in `admin/index.html` under Orders with status "paid".
4. Log into the admin dashboard and confirm you can edit prices/stock and mark an order "fulfilled".
## Step 14 — Go live
Once KYC is approved on Razorpay:
1. Razorpay Dashboard → switch to **Live Mode** → generate live API keys.
2. Re-run Step 6 with the live keys (`firebase functions:secrets:set RAZORPAY_KEY_ID` etc.) — this overwrites the test values.
3. Redeploy functions: `firebase deploy --only functions`.
---
### Notes on how it works
- **Prices are never trusted from the browser.** `createOrder` re-reads every price from Firestore before creating the order — so nobody can tamper with the cart in their browser to pay less.
- **Stock is reserved at checkout, not at payment time.** `createOrder` checks and decrements stock inside a single Firestore transaction the moment an order (COD or online) is created — not when payment is confirmed. This is what stops two customers from both successfully "buying" the last unit of something at the same time.
- **Payment verification is server-side.** Razorpay signs every successful payment; `verifyPayment` checks that signature using your secret key before marking an order "paid". A payment can't be faked by calling the frontend directly.
- **Abandoned online orders release their stock automatically.** If someone closes the Razorpay popup without paying, their reserved stock would otherwise sit locked forever. A scheduled function (`releaseAbandonedOrders`) runs every 10 minutes and cancels + restocks any online order still unpaid after 20 minutes. (This requires the Blaze plan and the Cloud Scheduler API, which Firebase enables automatically the first time you deploy a scheduled function.)
- **Orders can never be created or edited directly from the browser** — not even by a logged-in admin. Order creation (`createOrder`), payment confirmation (`verifyPayment`), and status changes / cancellation+restocking (`updateOrderStatus`) all run as Cloud Functions with the Admin SDK, which bypass Firestore rules entirely. The admin dashboard calls these functions rather than writing to `orders` directly.
- **Order status pipeline:** `confirmed → packed → shipped → out_for_delivery → delivered`, with `cancelled`/`returned` available as needed. Cancelling or returning an order automatically restocks its items. This is separate from `paymentStatus` (`pending`/`paid`/`failed`), so a COD order can be "confirmed" and "packed" while payment is still "pending" until it's collected on delivery.
- If Firestore/Firebase is ever unreachable, the site falls back to the original static `catalog.json` (no prices/cart) rather than breaking — but checkout requires Firebase to be configured correctly.
### What this update does NOT include yet
This is still the Firebase-based order system, not the MySQL/Node-Express/Shiprocket architecture from the original full spec. Not yet built: customer accounts/login/"My Orders", product detail pages with size/variant selection, the shipping service layer (Shiprocket/Delhivery), and the fuller admin dashboard (categories, customers, payments tabs). Those are next per the agreed roadmap. 