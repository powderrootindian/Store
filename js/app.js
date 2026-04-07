import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
  measurementId: "G-3GTKBEFJ2V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let cart = [];
const products = [
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "GARLIC DUST", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "GINGER ROOT", price: 179, img: "assets/images/ginger.jpg" }
];

// --- EDITORIAL SCROLL REVEAL ---
const revealOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card').forEach(card => observer.observe(card));
};

// --- CART LOGIC ---
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const p = products.find(x => x.id === id);
    const ex = cart.find(x => x.id === id);
    ex ? ex.qty++ : cart.push({...p, qty: 1});
    updateUI();
    showToast("Added to Bag");
};

window.changeQty = (id, delta) => {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
    updateUI();
};

function updateUI() {
    const list = document.getElementById('cart-items');
    let total = 0; list.innerHTML = '';
    cart.forEach(item => {
        total += (item.price * item.qty);
        list.innerHTML += `
            <div class="cart-item-row" style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <div><p style="font-weight:700;">${item.name}</p></div>
                <div style="display:flex; gap:10px;">
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
                <div>₹${item.price * item.qty}</div>
            </div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.reduce((a, b) => a + b.qty, 0);
    validateState();
}

// --- SECURE QR GATE ---
window.validateState = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value.trim();
    const gate = document.getElementById('payment-gate');
    const notice = document.getElementById('lock-notice');
    const qr = document.getElementById('qr-code');

    if (user && addr.length > 10 && cart.length > 0) {
        gate.classList.remove('hidden'); notice.classList.add('hidden');
        const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
        const upi = `upi://pay?pa=8788855688-2@ybl&pn=POWDER%20ROOT&am=${total}&cu=INR`;
        const url = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(upi)}&choe=UTF-8`;
        qr.innerHTML = `<img src="${url}" alt="QR">`;
    } else {
        gate.classList.add('hidden'); notice.classList.remove('hidden');
    }
};

window.sendToWhatsApp = async () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value;
    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const items = cart.map(i => `${i.name} x${i.qty}`).join(", ");
    try {
        await addDoc(collection(db, "orders"), { customer: user.displayName, items, total, addr, timestamp: serverTimestamp() });
        emailjs.send('service_default', 'template_powderroot', { from_name: user.displayName, order_details: items, total_price: total, shipping_address: addr });
        window.open(`https://wa.me/919096999662?text=${encodeURIComponent("Order Confirmed: " + items)}`, '_blank');
        cart = []; updateUI(); toggleCart();
    } catch (e) { console.log(e); }
};

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

// INITIAL RENDER
const grid = document.getElementById('product-grid');
products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${p.img}">
        <div class="product-info">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button class="add-btn" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
    grid.appendChild(card);
});

revealOnScroll();
window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    window.scrollY > 50 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
});

function showToast(m) { const t = document.getElementById('toast'); t.innerText = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
