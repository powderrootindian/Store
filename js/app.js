import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. YOUR ACTUAL CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
  measurementId: "G-3GTKBEFJ2V"
};

const EMAILJS_PUBLIC_KEY = "lxY_3luPFEJNp2_dO";
const UPI_ID = "8788855688-2@ybl"; 
const WHATSAPP_NUM = "919096999662"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUBLIC_KEY);

let cart = [];

// --- 2. THE SHOP ---
const products = [
    { id: 1, name: "PURE ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "ARTISANAL GARLIC", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "RAW GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];

// --- 3. UI CONTROLS ---
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.showToast = (msg) => {
    const t = document.getElementById("toast");
    t.innerText = msg; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
};

// --- 4. CART LOGIC ---
window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
    updateCartUI();
    showToast("Item Added to Boutique Bag");
};

window.updateQuantity = (id, delta) => {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(x => x.id !== id);
        updateCartUI();
    }
};

function updateCartUI() {
    const list = document.getElementById('cart-items');
    let total = 0; list.innerHTML = '';
    cart.forEach(item => {
        total += (item.price * item.quantity);
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
                <div><p style="font-size:0.8rem; font-weight:700;">${item.name}</p></div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.reduce((a, b) => a + b.quantity, 0);
    validateState();
}

// --- 5. CHECKOUT & SECURITY ---
window.validateState = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value.trim();
    const gate = document.getElementById('payment-gate');
    const notice = document.getElementById('lock-notice');

    if (user && addr.length > 10 && cart.length > 0) {
        gate.classList.remove('hidden');
        notice.classList.add('hidden');
        const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
        const upiStr = `upi://pay?pa=${UPI_ID}&pn=POWDER%20ROOT&am=${total}&cu=INR&tn=Order_Verification`;
        document.getElementById('qr-code').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(upiStr)}">`;
    } else {
        gate.classList.add('hidden');
        notice.classList.remove('hidden');
    }
};

window.sendToWhatsApp = async () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value;
    const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    const items = cart.map(i => `${i.name} (x${i.quantity})`).join(", ");

    showToast("Syncing Digital Ledger...");

    try {
        // A. FIREBASE BACKUP (Status: Pending)
        await addDoc(collection(db, "orders"), {
            userId: user.uid,
            name: user.displayName,
            items: items,
            total: total,
            address: addr,
            status: "Waiting for Payment Proof",
            timestamp: serverTimestamp()
        });

        // B. WHATSAPP (Anti-Fraud Message)
        const msg = `🛒 *NEW ORDER REQUEST*\n👤 *Client:* ${user.displayName}\n💰 *Total:* ₹${total}\n📍 *Shipping:* ${addr}\n📦 *Items:* ${items}\n\n⚠️ *NOTE:* To confirm this order, please send a **Screenshot of your Payment Receipt** below.`;
        window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
        
        cart = []; updateCartUI(); toggleCart();
    } catch (e) {
        showToast("Error. Try again.");
    }
};

// --- 6. AUTH & SCROLL REVEAL ---
window.handleAuth = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => window.location.reload());

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-btn').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-img').src = user.photoURL;
    }
    validateState();
});

// Scroll Effects
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    window.scrollY > 50 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
});

// Staggered Entrance
const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('reveal'), i * 150); });
}, { threshold: 0.1 });

const grid = document.getElementById('product-grid');
products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<img src="${p.img}"><h3>${p.name}</h3><p style="color:var(--gold); margin:10px 0;">₹${p.price}</p><button class="gold-outline-btn" style="width:100%" onclick="addToCart(${p.id})">ADD TO BAG</button>`;
    grid.appendChild(card);
    observer.observe(card);
});
