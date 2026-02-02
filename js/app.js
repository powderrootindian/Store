import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
  measurementId: "G-3GTKBEFJ2V"
};

// 2. SETTINGS
const EMAILJS_SERVICE = "service_cs926jb", EMAILJS_TEMPLATE = "template_ojt95o7", EMAILJS_KEY = "lxY_3luPFEJNp2_dO";
const UPI_ID = "8788855688-2@ybl"; 
const PHONE = "919096999662"; // Your WhatsApp Number

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_KEY);

const products = [
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "GARLIC POWDER", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];
let cart = [];

// --- GLOBAL FUNCTIONS (Fixes buttons not working) ---

window.handleLogin = () => {
    signInWithPopup(auth, provider).catch(error => console.error(error));
};

// ADDED LOGOUT FUNCTION
window.handleLogout = () => {
    signOut(auth).then(() => {
        alert("Logged out successfully");
        window.location.reload();
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
};

window.toggleCart = () => {
    document.getElementById('cart-drawer').classList.toggle('active');
};

window.addToCart = (id) => {
    const item = products.find(p => p.id === id);
    if(item) { 
        cart.push(item); 
        renderCart(); 
        window.toggleCart(); 
    }
};

window.syncOrderToWhatsApp = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('cust-address').value;
    const total = cart.reduce((a, b) => a + b.price, 0);
    const items = cart.map(i => i.name).join(", ");

    // EmailJS
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { 
        customer_name: user.displayName, 
        order_details: items, 
        total_price: `₹${total}`, 
        shipping_address: addr 
    });

    // WhatsApp
    const msg = `✨ *POWDER ROOT ORDER* ✨\n👤 *Client:* ${user.displayName}\n💰 *Total:* ₹${total}\n📍 *Address:* ${addr}\n📦 *Items:* ${items}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
};

// --- AUTH STATE MONITOR ---
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileDiv = document.getElementById('user-profile');
    
    if (user) {
        // User is logged in
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        profileDiv.classList.remove('hidden');
        document.getElementById('user-img').src = user.photoURL;
    } else {
        // User is logged out
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        profileDiv.classList.add('hidden');
    }
    window.validateCheckout(); // Re-check cart validation
});

// --- RENDER & VALIDATION ---
function renderCart() {
    const list = document.getElementById('cart-items-list');
    let total = 0; 
    list.innerHTML = '';
    
    cart.forEach(item => {
        total += item.price;
        list.innerHTML += `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #333;"><span>${item.name}</span><span>₹${item.price}</span></div>`;
    });
    
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;
    window.validateCheckout();
}

window.validateCheckout = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('cust-address').value;
    const payZone = document.getElementById('secure-payment-zone');
    const lockMsg = document.getElementById('checkout-lock-msg');

    // UNLOCK CONDITIONS: User Logged In AND Address Typed AND Cart has items
    if (user && addr.length > 3 && cart.length > 0) {
        payZone.classList.remove('hidden');
        lockMsg.classList.add('hidden');
        
        // Generate QR & Link
        const total = cart.reduce((a, b) => a + b.price, 0);
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=PowderRoot&am=${total}&cu=INR`;
        document.getElementById('qr-container').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(upiUrl)}">`;
        document.getElementById('upi-intent-link').href = upiUrl;
    } else {
        payZone.classList.add('hidden');
        lockMsg.classList.remove('hidden');
    }
};

// Initial Render
products.forEach(p => {
    document.getElementById('product-container').innerHTML += `
        <div class="product-card">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/300'">
            <h3>${p.name}</h3>
            <p style="color:#D4AF37; margin:10px 0;">₹${p.price}</p>
            <button class="btn-gold-nav" style="width:100%" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
