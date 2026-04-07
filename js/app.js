import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let cart = [];
const products = [
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg", desc: "Hand-harvested Nashik onions, slow-dehydrated to lock in pungent sweetness." },
    { id: 2, name: "GARLIC DUST", price: 179, img: "assets/images/garlic.jpg", desc: "Artisanal garlic cloves ground into a fine, potent dust for luxury seasoning." },
    { id: 3, name: "GINGER ROOT", price: 179, img: "assets/images/ginger.jpg", desc: "Pure, raw ginger root powder with an intense, earthy heat." }
];

// --- PRELOADER & REVEAL ---
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('fade-out'), 1000);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }});
    }, { threshold: 0.1 });
    document.querySelectorAll('.product-card').forEach(c => observer.observe(c));
});

// --- DYNAMIC VIEWS ---
window.showProduct = (id) => {
    const p = products.find(x => x.id === id);
    const detail = document.getElementById('detail-view');
    document.getElementById('home-view').classList.add('hidden');
    detail.classList.remove('hidden');
    window.scrollTo(0,0);
    detail.innerHTML = `
        <a onclick="showHome()" class="back-link">← BACK TO COLLECTION</a>
        <div class="detail-img-container"><img src="${p.img}"></div>
        <div class="detail-info">
            <h2>${p.name}</h2>
            <p style="color:var(--gold); font-size:1.5rem; margin:20px 0;">₹${p.price}</p>
            <p style="color:var(--grey); line-height:1.8;">${p.desc}</p>
            <button class="add-btn" onclick="addToCart(${p.id}, this)" style="margin-top:40px; padding:15px 40px; background:none; border:1px solid var(--gold); color:white; cursor:pointer;">ADD TO BAG</button>
        </div>`;
};

window.showHome = () => {
    document.getElementById('home-view').classList.remove('hidden');
    document.getElementById('detail-view').classList.add('hidden');
};

// --- CART & TOAST ---
function showToast(m) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div'); t.className = 'toast'; t.innerText = m;
    c.appendChild(t); setTimeout(() => t.remove(), 3000);
}

window.addToCart = (id, btn = null) => {
    if(btn) btn.classList.add('btn-loading');
    setTimeout(() => {
        const p = products.find(x => x.id === id);
        const ex = cart.find(x => x.id === id);
        ex ? ex.qty++ : cart.push({...p, qty: 1});
        updateUI(); showToast(`${p.name} ADDED`);
        if(btn) btn.classList.remove('btn-loading');
    }, 500);
};

window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

function updateUI() {
    const list = document.getElementById('cart-items');
    let total = 0; list.innerHTML = '';
    cart.forEach(item => {
        total += (item.price * item.qty);
        list.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:15px;"><span>${item.name} x${item.qty}</span><span>₹${item.price * item.qty}</span></div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.reduce((a, b) => a + b.qty, 0);
    validateState();
}

// --- SECURE CHECKOUT ---
window.validateState = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value.trim();
    const gate = document.getElementById('payment-gate');
    const notice = document.getElementById('lock-notice');
    if (user && addr.length > 10 && cart.length > 0) {
        gate.classList.remove('hidden'); notice.classList.add('hidden');
        const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
        const upi = `upi://pay?pa=8788855688-2@ybl&pn=POWDER%20ROOT&am=${total}&cu=INR`;
        document.getElementById('qr-code').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(upi)}&choe=UTF-8">`;
    } else { gate.classList.add('hidden'); notice.classList.remove('hidden'); }
};

window.sendToWhatsApp = async () => {
    const btn = document.getElementById('confirm-btn'); btn.classList.add('btn-loading');
    const user = auth.currentUser; const addr = document.getElementById('shipping-address').value;
    const items = cart.map(i => `${i.name} x${i.qty}`).join(", ");
    try {
        await addDoc(collection(db, "orders"), { customer: user.displayName, items, addr, timestamp: serverTimestamp() });
        emailjs.send('service_default', 'template_powderroot', { from_name: user.displayName, order_details: items, shipping_address: addr });
        window.open(`https://wa.me/919096999662?text=${encodeURIComponent("New Order: " + items)}`, '_blank');
        cart = []; updateUI(); toggleCart();
    } catch (e) { console.error(e); } finally { btn.classList.remove('btn-loading'); }
};

// --- AUTH ---
window.handleAuth = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());

onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('auth-btn');
    const userProfile = document.getElementById('user-profile');
    if (user) { authBtn.classList.add('hidden'); userProfile.classList.remove('hidden'); document.getElementById('user-img').src = user.photoURL; }
    else { authBtn.classList.remove('hidden'); userProfile.classList.add('hidden'); }
    validateState();
});

// --- RENDER GRID ---
const grid = document.getElementById('product-grid');
products.forEach(p => {
    const card = document.createElement('div'); card.className = 'product-card';
    card.innerHTML = `<img src="${p.img}" onclick="showProduct(${p.id})"><h3>${p.name}</h3><button onclick="addToCart(${p.id}, this)">QUICK ADD</button>`;
    grid.appendChild(card);
});
