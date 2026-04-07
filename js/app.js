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
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg", desc: "Premium dehydrated Nashik Pink Onions." },
    { id: 2, name: "GARLIC DUST", price: 179, img: "assets/images/garlic.jpg", desc: "Fine-ground artisanal garlic dust." }
];

// Preloader & Scroll Reveal
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('fade-out'), 1000);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }});
    });
    document.querySelectorAll('.product-card').forEach(c => observer.observe(c));
});

// Navigation Logic
window.showProduct = (id) => {
    const p = products.find(x => x.id === id);
    const detail = document.getElementById('detail-view');
    document.getElementById('home-view').classList.add('hidden');
    detail.classList.remove('hidden');
    window.scrollTo(0,0);
    detail.innerHTML = `
        <a onclick="showHome()" style="cursor:pointer; color:var(--grey); position:absolute; top:120px;">← BACK</a>
        <div style="display:flex; gap:50px; padding-top:50px;">
            <img src="${p.img}" style="width:50%; border:1px solid var(--charcoal);">
            <div>
                <h2 style="font-family:'Cinzel'; font-size:3rem;">${p.name}</h2>
                <p style="color:var(--gold); font-size:1.5rem; margin:20px 0;">₹${p.price}</p>
                <p style="color:var(--grey); line-height:1.8;">${p.desc}</p>
                <button onclick="addToCart(${p.id}, this)" style="margin-top:30px; padding:15px 30px; border:1px solid var(--gold); background:none; color:white; cursor:pointer;">ADD TO BAG</button>
            </div>
        </div>`;
};

window.showHome = () => {
    document.getElementById('home-view').classList.remove('hidden');
    document.getElementById('detail-view').classList.add('hidden');
};

// Auth State Fix
onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('auth-btn');
    const userProfile = document.getElementById('user-profile');
    if (user) {
        authBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        document.getElementById('user-img').src = user.photoURL;
    } else {
        authBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

// Render Home Grid
const grid = document.getElementById('product-grid');
products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<img src="${p.img}" onclick="showProduct(${p.id})"><h3 style="margin-top:15px; font-family:'Cinzel';">${p.name}</h3>`;
    grid.appendChild(card);
});

window.handleAuth = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');
