// Simple cart logic for the single-page shop
const PRODUCTS = [
  {id:1,name:'Reusable Bamboo Cutlery Set',price:12.99,img:'https://picsum.photos/seed/p1/400/300'},
  {id:2,name:'Organic Cotton Tote Bag',price:9.5,img:'https://picsum.photos/seed/p2/400/300'},
  {id:3,name:'Beeswax Wraps (3-pack)',price:14.0,img:'https://picsum.photos/seed/p3/400/300'},
  {id:4,name:'Solar LED Lantern',price:29.99,img:'https://picsum.photos/seed/p4/400/300'},
  {id:5,name:'Glass Reusable Bottle',price:18.75,img:'https://picsum.photos/seed/p5/400/300'},
  {id:6,name:'Plantable Seed Paper Cards',price:6.0,img:'https://picsum.photos/seed/p6/400/300'}
];

const LS_KEY = 'sp_ecom_cart';
let cart = {}; // { productId: qty }

// Utilities
const fmt = n => n.toLocaleString(undefined,{style:'currency',currency:'USD'});

function loadCart(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    cart = raw ? JSON.parse(raw) : {};
  }catch(e){cart={};}
}
function saveCart(){
  localStorage.setItem(LS_KEY,JSON.stringify(cart));
}

// Single clean cart script for the demo shop
const PRODUCTS = [
  {id:1,name:'Reusable Bamboo Cutlery Set',price:12.99,img:'https://picsum.photos/seed/p1/400/300'},
  {id:2,name:'Organic Cotton Tote Bag',price:9.5,img:'https://picsum.photos/seed/p2/400/300'},
  {id:3,name:'Beeswax Wraps (3-pack)',price:14.0,img:'https://picsum.photos/seed/p3/400/300'},
  {id:4,name:'Solar LED Lantern',price:29.99,img:'https://picsum.photos/seed/p4/400/300'},
  {id:5,name:'Glass Reusable Bottle',price:18.75,img:'https://picsum.photos/seed/p5/400/300'},
  {id:6,name:'Plantable Seed Paper Cards',price:6.0,img:'https://picsum.photos/seed/p6/400/300'}
];

const LS_KEY = 'sp_ecom_cart';
let cart = {}; // { productId: qty }

// Utilities
const fmt = n => n.toLocaleString(undefined,{style:'currency',currency:'USD'});

function loadCart(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    cart = raw ? JSON.parse(raw) : {};
  }catch(e){cart={};}
}
function saveCart(){
  localStorage.setItem(LS_KEY,JSON.stringify(cart));
}

// Render products
function renderProducts(){
  const container = document.getElementById('products');
  container.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <div class="card-body">
        <h4 class="card-title">${p.name}</h4>
        <div class="card-price">${fmt(p.price)}</div>
        <div class="card-actions">
          <button class="btn add-to-cart" data-id="${p.id}">Add to cart</button>
          <button class="btn-outline" onclick="window.open('https://en.wikipedia.org/wiki/Sustainability','_blank')">Learn</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  // attach listeners
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click',e => {
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id);
    });
  });
}

function addToCart(productId, qty = 1){
  cart[productId] = (cart[productId]||0) + qty;
  saveCart();
  updateCartCount();
  showCart();
}

function removeFromCart(productId){
  delete cart[productId];
  saveCart();
  renderCartItems();
  updateCartCount();
}

function changeQty(productId, qty){
  if(qty <= 0){ removeFromCart(productId); return; }
  cart[productId] = qty;
  saveCart();
  renderCartItems();
  updateCartCount();
}

function cartItemCount(){
  return Object.values(cart).reduce((s,n)=>s+n,0);
}

function updateCartCount(){
  document.getElementById('cart-count').textContent = cartItemCount();
}

// Cart UI
function renderCartItems(){
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  const ids = Object.keys(cart).map(x=>Number(x));
  if(ids.length===0){
    container.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('cart-total').textContent = fmt(0);
    return;
  }
  let total = 0;
  ids.forEach(id => {
    const product = PRODUCTS.find(p=>p.id===id);
    const qty = cart[id];
    const line = product.price * qty;
    total += line;

    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${product.img}" alt="${product.name}" />
      <div class="meta">
        <div>${product.name}</div>
        <div style="color:var(--muted);font-size:0.95rem">${fmt(product.price)} × ${qty} = ${fmt(line)}</div>
        <div class="qty-controls">
          <button class="qty-decr" data-id="${id}">−</button>
          <span>${qty}</span>
          <button class="qty-incr" data-id="${id}">+</button>
          <button class="btn-outline btn-sm remove" data-id="${id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
  document.getElementById('cart-total').textContent = fmt(total);

  // attach internal listeners
  container.querySelectorAll('.qty-incr').forEach(b=>b.addEventListener('click',e=>{
    const id = Number(e.currentTarget.dataset.id); changeQty(id, cart[id]+1);
  }));
  container.querySelectorAll('.qty-decr').forEach(b=>b.addEventListener('click',e=>{
    const id = Number(e.currentTarget.dataset.id); changeQty(id, cart[id]-1);
  }));
  container.querySelectorAll('.remove').forEach(b=>b.addEventListener('click',e=>{
    const id = Number(e.currentTarget.dataset.id); removeFromCart(id);
  }));
}

// Cart modal toggles
function showCart(){
  const modal = document.getElementById('cart-modal');
  modal.setAttribute('aria-hidden','false');
  renderCartItems();
}
function hideCart(){
  const modal = document.getElementById('cart-modal');
  modal.setAttribute('aria-hidden','true');
}

function clearCart(){
  cart = {};
  saveCart();
  renderCartItems();
  updateCartCount();
}

function checkout(){
  const count = cartItemCount();
  if(count===0){ alert('Your cart is empty.'); return; }
  // Simulate a checkout flow
  alert(`Thank you! Your order for ${count} item(s) has been placed.`);
  clearCart();
  hideCart();
}

// Setup UI events
document.addEventListener('DOMContentLoaded',()=>{
  loadCart();
  renderProducts();
  updateCartCount();

  document.getElementById('cart-button').addEventListener('click',showCart);
  document.getElementById('close-cart').addEventListener('click',hideCart);
  document.getElementById('cart-backdrop').addEventListener('click',hideCart);
  document.getElementById('clear-cart').addEventListener('click',()=>{
    if(confirm('Clear cart?')) clearCart();
  });
  document.getElementById('checkout').addEventListener('click',checkout);
});