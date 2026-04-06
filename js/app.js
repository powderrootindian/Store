import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
  measurementId: "G-3GTKBEFJ2V"
};

const EMAILJS_KEY = "lxY_3luPFEJNp2_dO";
const UPI_ID = "8788855688-2@ybl";
const WHATSAPP_NUM = "919096999662";

// --- 2. INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_KEY);

let cart = [];
const products = [
    { id: 1, name: "PURE ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "ARTISANAL GARLIC", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "RAW GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];

// --- 3. CART LOGIC (With Add/Subtract) ---
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const p = products.find(x => x.id === id);
    const existing = cart.find(x => x.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({...p, qty: 1});
    }
    updateUI();
    showToast("Added to Bag");
};

window.changeQty = (id, delta) => {
    const item = cart.find(x => x.id === id);
    if (!item) return;

    item.qty += delta;

    // Remove item if quantity drops to 0
    if (item.qty <= 0) {
        cart = cart.filter(x => x.id !== id);
    }
    updateUI();
};

function updateUI() {
    const list = document.getElementById('cart-items');
    let total = 0; 
    list.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        list.innerHTML += `
            <div class="cart-item-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #222; padding-bottom:15px;">
                <div style="flex:1;">
                    <p style="font-weight:700; font-size:0.85rem; color:white; margin-bottom:4px;">${item.name}</p>
                    <p style="color:var(--gold); font-size:0.8rem;">₹${item.price}</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px; margin: 0 15px;">
                    <button onclick="changeQty(${item.id}, -1)" style="background:#1a1a1a; color:white; border:1px solid var(--gold); width:28px; height:28px; cursor:pointer; font-weight:bold;">-</button>
                    <span style="font-weight:800; min-width:15px; text-align:center;">${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)" style="background:#1a1a1a; color:white; border:1px solid var(--gold); width:28px; height:28px; cursor:pointer; font-weight:bold;">+</button>
                </div>
                <div style="font-weight:700; width:60px; text-align:right;">₹${itemTotal}</div>
            </div>
        `;
    });

    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.reduce((a, b) => a + b.qty, 0);
    validateState();
}

// --- 4. CHECKOUT & SECURITY GATE ---
window.validateState = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value.trim();
    const gate = document.getElementById('payment-gate');
    const notice = document.getElementById('lock-notice');
    const qrContainer = document.getElementById('qr-code');

    if (user && addr.length > 10 && cart.length > 0) {
        gate.classList.remove('hidden');
        notice.classList.add('hidden');
        
        const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
        
        // FIXED: Construction of the UPI string for Google Charts
        const pa = "8788855688-2@ybl";
        const pn = "POWDER ROOT";
        const upiData = `upi://pay?pa=${pa}&pn=${pn}&am=${total}&cu=INR`;
        
        // Use a 300x300 size for better scanability on mobile
        const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(upiData)}&choe=UTF-8`;
        
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="Scan to Pay" style="display:block; margin:auto; max-width:100%; height:auto;">`;
    } else {
        gate.classList.add('hidden');
        notice.classList.remove('hidden');
    }
};
window.sendToWhatsApp = async () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value;
    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const items = cart.map(i => `${i.name} x${i.qty}`).join(", ");

    try {
        await addDoc(collection(db, "orders"), { 
            name: user.displayName, 
            items, total, addr, 
            timestamp: serverTimestamp() 
        });
        const msg = `🛒 *ORDER FROM POWDER ROOT*\n👤 *Customer:* ${user.displayName}\n📦 *Items:* ${items}\n💰 *Total:* ₹${total}\n📍 *Addr:* ${addr}`;
        window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
        cart = []; updateUI(); toggleCart();
    } catch (e) { alert("Sync Error: " + e.message); }
};

// --- 5. AUTHENTICATION ---
window.handleAuth = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-btn').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-img').src = user.photoURL;
    }
    validateState();
});

// --- 6. UI RENDER ---
const grid = document.getElementById('product-grid');
products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.innerHTML = `
        <img src="${p.img}">
        <h3>${p.name}</h3>
        <p style="color:var(--gold); margin:10px 0; font-weight:800;">₹${p.price}</p>
        <button class="gold-solid-btn" style="width:100%" onclick="addToCart(${p.id})">ADD TO BAG</button>
    `;
    grid.appendChild(card);
});

function showToast(m) { 
    const t = document.getElementById('toast'); 
    t.innerText = m; t.classList.add('show'); 
    setTimeout(() => t.classList.remove('show'), 3000); 
}
