import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// YOUR CONFIGURATION
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

// Initialize Services
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

window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const p = products.find(x => x.id === id);
    const ex = cart.find(x => x.id === id);
    ex ? ex.qty++ : cart.push({...p, qty: 1});
    updateUI();
    showToast("Added to Bag");
};

function updateUI() {
    const list = document.getElementById('cart-items');
    let total = 0; list.innerHTML = '';
    cart.forEach(item => {
        total += (item.price * item.qty);
        list.innerHTML += `<div class="bill-row" style="margin-bottom:10px;"><span>${item.name} (x${item.qty})</span><span>₹${item.price * item.qty}</span></div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.reduce((a, b) => a + b.qty, 0);
    validateState();
}

window.validateState = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value.trim();
    const gate = document.getElementById('payment-gate');
    const notice = document.getElementById('lock-notice');
    const qr = document.getElementById('qr-code');

    if (user && addr.length > 10 && cart.length > 0) {
        gate.classList.remove('hidden'); notice.classList.add('hidden');
        const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
        // Clean URL for QR Generation
        const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=upi://pay?pa=${UPI_ID}%26pn=POWDER%20ROOT%26am=${total}%26cu=INR`;
        qr.innerHTML = `<img src="${qrUrl}" alt="Payment QR">`;
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
        // Log to Firebase
        await addDoc(collection(db, "orders"), { 
            client: user.displayName, 
            items, total, addr, 
            timestamp: serverTimestamp() 
        });
        
        // Sync with WhatsApp
        const msg = `🛒 *NEW ORDER: POWDER ROOT*\n👤 *Client:* ${user.displayName}\n📦 *Items:* ${items}\n💰 *Total:* ₹${total}\n📍 *Shipping:* ${addr}\n\n*Please send payment screenshot below.*`;
        window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
        
        cart = []; updateUI(); toggleCart();
        showToast("Order Logged Successfully");
    } catch (e) { alert("Error: Check Firebase Permissions."); }
};

// Authentication Controls
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

// Build Product Cards
const grid = document.getElementById('product-grid');
products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<img src="${p.img}"><h3>${p.name}</h3><p style="color:var(--gold); margin:10px 0;">₹${p.price}</p><button class="gold-solid-btn" style="width:100%" onclick="addToCart(${p.id})">ADD TO BAG</button>`;
    grid.appendChild(card);
});

function showToast(m) { const t = document.getElementById('toast'); t.innerText = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
