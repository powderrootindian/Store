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
provider.setCustomParameters({ prompt: 'select_account' });

let cart = [];
const products = [
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg", desc: "Artisanal pink onion powder." },
    { id: 2, name: "GARLIC DUST", price: 179, img: "assets/images/garlic.jpg", desc: "Potent garlic seasoning." },
    { id: 3, name: "GINGER POWDER", price: 299, img: "assets/images/ginger.jpg", desc: "fresh aromatic seasoning." }
];

// CART TOGGLE (Fixes the Drawer behavior)
window.toggleCart = () => {
    document.getElementById('cart-drawer').classList.toggle('active');
};

// Auth UI Fix (Circular Image and No Flicker)
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

window.handleAuth = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());

// Update UI and Render Logic
function updateUI() {
    const list = document.getElementById('cart-items');
    let total = 0;
    list.innerHTML = '';
    cart.forEach(item => {
        total += (item.price * item.qty);
        list.innerHTML += `<div class="cart-item"><span>${item.name} x${item.qty}</span><span>₹${item.price * item.qty}</span></div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.reduce((a, b) => a + b.qty, 0);
}

// Initial Grid Rendering
const grid = document.getElementById('product-grid');
products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<img src="${p.img}" onclick="showProduct(${p.id})"><h3>${p.name}</h3>`;
    grid.appendChild(card);
});
