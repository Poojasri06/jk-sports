/**
 * One-time seeding script: pushes scripts/products-seed.json into the
 * Firestore `products` collection.
 *
 * Usage:
 *   1. Firebase Console → Project Settings → Service Accounts →
 *      "Generate new private key" → save as scripts/serviceAccountKey.json
 *      (do NOT commit this file — it's already gitignored below)
 *   2. cd scripts && npm install firebase-admin
 *   3. node seed.js
 *
 * All prices are placeholders (₹499) — edit real prices afterwards
 * either in the admin dashboard or directly in Firestore.
 */
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const products = require("./products-seed.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function seed() {
  const batchSize = 400; // Firestore batch limit is 500
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = db.batch();
    products.slice(i, i + batchSize).forEach((product) => {
      const { id, ...data } = product;
      batch.set(db.collection("products").doc(id), data);
    });
    await batch.commit();
    console.log(`Seeded ${Math.min(i + batchSize, products.length)}/${products.length}`);
  }
  console.log("Done. All products default to price ₹499 — edit real prices in the admin dashboard.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
