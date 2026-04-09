import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
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

// Stability fix for browser security policies
provider.setCustomParameters({ prompt: 'select_account' });

// --- STATE MANAGEMENT ---
let cart = [];
const products = [
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg", desc: "Premium dehydrated pink onions sourced from Nashik." },
    { id: 2, name: "GARLIC DUST", price: 179, img: "assets/images/garlic.jpg", desc: "Artisanal hand-ground garlic dust for potent flavor." },
    { id: 3, name: "GINGER DUST", price: 299, img: "assets/images/gINGER.jpg", desc: "Aromatic flavouring dust." }
];

// --- AUTHENTICATION LOGIC ---
onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('auth-btn');
    const userProfile = document.getElementById('user-profile');
    const userImg = document.getElementById('user-img');
    const paymentGate = document.getElementById('payment-gate');
    const lockNotice = document.getElementById('lock-notice');

    if (user) {
        authBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userImg.src = user.photoURL;
        if (lockNotice) lockNotice.classList.add('hidden');
        if (paymentGate) paymentGate.classList.remove('hidden');
    } else {
        authBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
        if (lockNotice) lockNotice.classList.remove('hidden');
        if (paymentGate) paymentGate.classList.add('hidden');
    }
});

window.handleAuth = () => signInWithPopup(auth, provider).catch(err => console.error("Login Error:", err));
window.handleLogout = () => signOut(auth).then(() => location.reload());

// --- NAVIGATION & UI ---
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('fade-out');
    }, 1000);

    // Scroll Reveal Logic
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(0)";
            }
        });
    });
    document.querySelectorAll('.product-card').forEach(c => observer.observe(c));
});

window.toggleCart = () => {
    const drawer = document.getElementById('cart-drawer');
    const isOpen = drawer.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
};

window.showProduct = (id) => {
    const p = products.find(x => x.id === id);
    const detail = document.getElementById('detail-view');
    document.getElementById('home-view').classList.add('hidden');
    detail.classList.remove('hidden');
    window.scrollTo(0, 0);

    detail.innerHTML = `
        <div class="detail-container">
            <button class="back-link" onclick="showHome()">← BACK TO COLLECTION</button>
            <div class="detail-grid">
                <div class="detail-img-box">
                    <img src="${p.img}" alt="${p.name}">
                </div>
                <div class="detail-info">
                    <h2 class="cinzel">${p.name}</h2>
                    <p class="price-tag">₹${p.price}</p>
                    <p class="description">${p.desc}</p>
                    <button class="add-btn-large" onclick="addToCart(${p.id})">ADD TO BAG</button>
                </div>
            </div>
        </div>`;
};

window.showHome = () => {
    document.getElementById('home-view').classList.remove('hidden');
    document.getElementById('detail-view').classList.add('hidden');
};

// --- CART FUNCTIONALITY ---
window.addToCart = (id) => {
    const p = products.find(x => x.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...p, qty: 1 });
    }
    updateUI();
    showToast(`${p.name} ADDED TO BAG`);
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateUI();
};

function updateUI() {
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('bag-count');
    
    let total = 0;
    list.innerHTML = '';

    cart.forEach(item => {
        total += (item.price * item.qty);
        list.innerHTML += `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} x ${item.qty}</p>
                </div>
                <button onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });

    totalEl.innerText = `₹${total}`;
    countEl.innerText = cart.reduce((a, b) => a + b.qty, 0);
}

// --- CHECKOUT ---
window.sendToWhatsApp = async () => {
    const user = auth.currentUser;
    const address = document.getElementById('shipping-address').value;

    if (!user || !address || cart.length === 0) {
        alert("Please login, add items, and provide an address.");
        return;
    }

    const orderID = "PR-" + Math.floor(Math.random() * 10000);
    const orderDetails = cart.map(i => `${i.name} (${i.qty})`).join(", ");
    const total = document.getElementById('cart-total').innerText;

    // Save to Firestore
    await addDoc(collection(db, "orders"), {
        orderID,
        customer: user.displayName,
        email: user.email,
        items: orderDetails,
        total,
        address,
        status: "Pending",
        timestamp: serverTimestamp()
    });

    const msg = `*NEW ORDER: ${orderID}*%0A%0A*Name:* ${user.displayName}%0A*Items:* ${orderDetails}%0A*Total:* ${total}%0A*Address:* ${address}`;
    window.open(`https://wa.me/917249117652?text=${msg}`, '_blank');
};

// --- INITIAL RENDER ---
const grid = document.getElementById('product-grid');
if (grid) {
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="card-inner">
                <img src="${p.img}" onclick="showProduct(${p.id})">
                <div class="card-content">
                    <h3>${p.name}</h3>
                    <p>₹${p.price}</p>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
