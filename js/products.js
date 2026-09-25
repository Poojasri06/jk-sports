/* ════════════════════════════════════════════════════════════
   PRODUCTS — loads live product data (price + stock) from Firestore
   and rebuilds window.CATALOG in the shape script.js already expects,
   then re-renders whichever catalog modal is open.
════════════════════════════════════════════════════════════ */
import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

async function loadProductsFromFirestore() {
  try {
    var q = query(collection(db, 'products'), where('active', '==', true), orderBy('order'));
    var snap = await getDocs(q);
    var catalog = {};

    snap.forEach(function (doc) {
      var p = doc.data();
      var key = p.category;
      if (!catalog[key]) {
        catalog[key] = { title: p.categoryTitle, tag: p.categoryTag, desc: p.categoryDesc, items: [] };
      }
      catalog[key].items.push({
        id: doc.id,
        img: p.img,
        name: p.name,
        desc: p.desc,
        price: p.price,
        mrp: p.mrp,
        stock: p.stockQty > 0
      });
    });

    if (Object.keys(catalog).length > 0) {
      window.CATALOG = catalog;
      if (typeof window.refreshCatalogIssues === 'function') window.refreshCatalogIssues();
      // If a catalog modal is already open, re-render it with live data
      var openKey = document.body.getAttribute('data-open-catalog');
      if (openKey && typeof window.openCatalog === 'function') window.openCatalog(openKey);
    }
  } catch (err) {
    // Firestore not configured yet, or offline — the site keeps working
    // off the static catalog.json fallback already loaded by script.js.
    console.warn('Live product data unavailable, using static catalog.json fallback.', err);
  }
}

loadProductsFromFirestore();
