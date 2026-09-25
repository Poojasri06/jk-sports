import { auth, db, functionsClient } from '../js/firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-functions.js";

var ORDER_STATUSES = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

var loginBox = document.getElementById('loginBox');
var dashboard = document.getElementById('dashboard');
var adminNavLinks = document.getElementById('adminNavLinks');
var loginError = document.getElementById('loginError');

document.getElementById('loginBtn').addEventListener('click', async function () {
  loginError.textContent = '';
  var email = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = 'Login failed: ' + err.message;
  }
});

document.getElementById('logoutBtn').addEventListener('click', function () {
  signOut(auth);
});

onAuthStateChanged(auth, function (user) {
  if (user) {
    loginBox.style.display = 'none';
    dashboard.style.display = 'block';
    adminNavLinks.style.display = 'block';
    loadProducts();
    loadOrders();
  } else {
    loginBox.style.display = 'block';
    dashboard.style.display = 'none';
    adminNavLinks.style.display = 'none';
  }
});

// Tabs
document.querySelectorAll('.admin-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    var target = tab.getAttribute('data-tab');
    document.getElementById('tabProducts').style.display = target === 'products' ? 'block' : 'none';
    document.getElementById('tabOrders').style.display = target === 'orders' ? 'block' : 'none';
  });
});

function formatINR(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }

// ── Products ──
async function loadProducts() {
  var tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = '<tr><td colspan="6">Loading…</td></tr>';

  var q = query(collection(db, 'products'), orderBy('order'));
  var snap = await getDocs(q);
  var rows = [];

  snap.forEach(function (docSnap) {
    var p = docSnap.data();
    var id = docSnap.id;
    rows.push(
      '<tr data-id="' + id + '">' +
        '<td>' + p.name + '</td>' +
        '<td>' + p.categoryTitle + '</td>' +
        '<td><input type="number" class="edit-price" value="' + p.price + '" /></td>' +
        '<td><input type="number" class="edit-stock" value="' + p.stockQty + '" /></td>' +
        '<td><input type="checkbox" class="edit-active" ' + (p.active ? 'checked' : '') + ' /></td>' +
        '<td><button type="button" class="save-product-btn">Save</button></td>' +
      '</tr>'
    );
  });
  tbody.innerHTML = rows.join('');

  tbody.querySelectorAll('.save-product-btn').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var row = btn.closest('tr');
      var id = row.getAttribute('data-id');
      var price = parseFloat(row.querySelector('.edit-price').value) || 0;
      var stockQty = parseInt(row.querySelector('.edit-stock').value, 10) || 0;
      var active = row.querySelector('.edit-active').checked;
      btn.textContent = 'Saving…';
      await updateDoc(doc(db, 'products', id), { price: price, stockQty: stockQty, active: active });
      btn.textContent = 'Saved ✓';
      setTimeout(function () { btn.textContent = 'Save'; }, 1200);
    });
  });
}

// ── Orders ──
function nextStatusOptions(current) {
  // Only offer sensible forward moves + cancel/return, not every status.
  var flow = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  var idx = flow.indexOf(current);
  var options = idx >= 0 ? flow.slice(idx) : [current];
  if (current !== 'delivered' && current !== 'cancelled' && current !== 'returned') {
    options = options.concat(['cancelled']);
  }
  if (current === 'delivered') options = options.concat(['returned']);
  // de-dupe while preserving order
  return options.filter(function (v, i) { return options.indexOf(v) === i; });
}

async function loadOrders() {
  var tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '<tr><td colspan="8">Loading…</td></tr>';

  var q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  var snap = await getDocs(q);
  var rows = [];

  snap.forEach(function (docSnap) {
    var o = docSnap.data();
    var id = docSnap.id;
    var placed = o.createdAt && o.createdAt.toDate ? o.createdAt.toDate().toLocaleString('en-IN') : '—';
    var paymentLabel = (o.paymentMethod === 'cod' ? 'COD' : 'Online') + ' · ' + o.paymentStatus;
    var statusOptions = nextStatusOptions(o.orderStatus).map(function (s) {
      return '<option value="' + s + '"' + (s === o.orderStatus ? ' selected' : '') + '>' + s.replace(/_/g, ' ') + '</option>';
    }).join('');

    rows.push(
      '<tr data-id="' + id + '">' +
        '<td>' + id.slice(0, 8) + '…</td>' +
        '<td>' + (o.customer ? o.customer.name : '—') + '</td>' +
        '<td>' + (o.customer ? o.customer.phone : '—') + '</td>' +
        '<td>' + formatINR(o.amount) + '</td>' +
        '<td>' + paymentLabel + '</td>' +
        '<td><span class="admin-status-pill admin-status-' + (o.orderStatus || 'created') + '">' + (o.orderStatus || 'created') + '</span></td>' +
        '<td>' + placed + '</td>' +
        '<td><select class="order-status-select">' + statusOptions + '</select> <button type="button" class="update-status-btn">Update</button></td>' +
      '</tr>'
    );
  });
  tbody.innerHTML = rows.join('') || '<tr><td colspan="8">No orders yet.</td></tr>';

  tbody.querySelectorAll('.update-status-btn').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var row = btn.closest('tr');
      var id = row.getAttribute('data-id');
      var newStatus = row.querySelector('.order-status-select').value;
      btn.textContent = 'Updating…';
      try {
        var updateOrderStatus = httpsCallable(functionsClient, 'updateOrderStatus');
        await updateOrderStatus({ orderId: id, newStatus: newStatus });
        loadOrders();
      } catch (err) {
        alert('Could not update order: ' + err.message);
        btn.textContent = 'Update';
      }
    });
  });
}
