/* ════════════════════════════════════════════════════════════
   CART — localStorage-backed, shared across index.html / checkout.html
   Cart shape: [{ id, name, price, img, qty }]
════════════════════════════════════════════════════════════ */
const CART_KEY = 'jkCart';

function getCart() {
  try {
    var raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(product) {
  var cart = getCart();
  var existing = cart.find(function (i) { return i.id === product.id; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
  }
  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(id) {
  saveCart(getCart().filter(function (i) { return i.id !== id; }));
}

function setQty(id, qty) {
  qty = Math.max(1, parseInt(qty, 10) || 1);
  var cart = getCart();
  var item = cart.find(function (i) { return i.id === id; });
  if (item) item.qty = qty;
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce(function (sum, i) { return sum + i.qty; }, 0);
}

function cartTotal() {
  return getCart().reduce(function (sum, i) { return sum + i.qty * i.price; }, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  var badge = document.getElementById('cartBadge');
  if (!badge) return;
  var count = cartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function formatINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function renderCartDrawer() {
  var itemsEl = document.getElementById('cartDrawerItems');
  var totalEl = document.getElementById('cartDrawerTotal');
  var emptyEl = document.getElementById('cartDrawerEmpty');
  if (!itemsEl) return; // drawer not on this page

  var cart = getCart();
  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    itemsEl.innerHTML = cart.map(function (item) {
      return (
        '<div class="cart-line">' +
          '<img src="' + item.img + '" alt="" />' +
          '<div class="cart-line-body">' +
            '<p class="cart-line-name">' + item.name + '</p>' +
            '<p class="cart-line-price">' + formatINR(item.price) + '</p>' +
            '<div class="cart-line-qty">' +
              '<button type="button" onclick="setQty(\'' + item.id + '\', ' + (item.qty - 1) + ')">−</button>' +
              '<input type="number" min="1" value="' + item.qty + '" onchange="setQty(\'' + item.id + '\', this.value)" />' +
              '<button type="button" onclick="setQty(\'' + item.id + '\', ' + (item.qty + 1) + ')">+</button>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="cart-line-remove" onclick="removeFromCart(\'' + item.id + '\')" aria-label="Remove">&#10005;</button>' +
        '</div>'
      );
    }).join('');
  }
  if (totalEl) totalEl.textContent = formatINR(cartTotal());
}

function openCartDrawer() {
  var drawer = document.getElementById('cartDrawer');
  if (drawer) { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeCartDrawer() {
  var drawer = document.getElementById('cartDrawer');
  if (drawer) { drawer.classList.remove('open'); document.body.style.overflow = ''; }
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.setQty = setQty;
window.clearCart = clearCart;
window.getCart = getCart;
window.cartTotal = cartTotal;
window.cartCount = cartCount;
window.formatINR = formatINR;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;

document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();
  renderCartDrawer();
  var openBtn = document.getElementById('cartOpenBtn');
  if (openBtn) openBtn.addEventListener('click', openCartDrawer);
  var closeBtn = document.getElementById('cartCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  var overlay = document.getElementById('cartDrawer');
  if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCartDrawer(); });
});
