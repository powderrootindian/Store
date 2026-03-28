import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. CONFIGURATION (Replace with your keys) ---
const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
  measurementId: "G-3GTKBEFJ2V"
};

const EMAILJS_SERVICE = "service_cs926jb"; 
const EMAILJS_TEMPLATE = "template_ojt95o7"; 
const EMAILJS_PUBLIC_KEY = "lxY_3luPFEJNp2_dO";

const UPI_ID = "8788855688-2@ybl"; 
const WHATSAPP_NUM = "919096999662"; 

// --- 2. INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUBLIC_KEY);

let cart = [];

// --- 3. AUTHENTICATION LOGIC ---
window.handleAuth = () => signInWithPopup(auth, provider).catch(err => console.error("Login Error:", err));

window.handleLogout = () => signOut(auth).then(() => {
    alert("Logged out safely.");
    window.location.reload();
});

onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profile = document.getElementById('user-profile');
    
    if (user) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        profile.classList.remove('hidden');
        document.getElementById('user-img').src = user.photoURL;
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        profile.classList.add('hidden');
    }
    window.validateState(); 
});

// --- 4. SHOP & CART LOGIC ---
const products = [
    { id: 1, name: "PURE ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "ARTISANAL GARLIC", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "RAW GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];

window.addToCart = (id) => {
    const p = products.find(x => x.id === id);
    if(p) {
        cart.push(p);
        updateCartUI();
        document.getElementById('cart-drawer').classList.add('active');
    }
};

window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

function updateCartUI() {
    const list = document.getElementById('cart-items');
    let total = 0; 
    list.innerHTML = '';
    
    cart.forEach((item, index) => {
        total += item.price;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:0.8rem; border-bottom:1px solid #1a1a1a; padding-bottom:8px;">
                <span>${item.name}</span>
                <span style="color:var(--gold)">₹${item.price}</span>
            </div>`;
    });
    
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.length;
    window.validateState();
}

// --- 5. CHECKOUT VALIDATION ---
window.validateState = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value.trim();
    const gate = document.getElementById('payment-gate');
    const notice = document.getElementById('lock-notice');

    // UNLOCK CONDITIONS: Logged In + Address Provided + Cart Not Empty
    if (user && addr.length > 5 && cart.length > 0) {
        gate.classList.remove('hidden');
        notice.classList.add('hidden');
        
        const total = cart.reduce((a, b) => a + b.price, 0);
        const upiStr = `upi://pay?pa=${UPI_ID}&pn=POWDER%20ROOT&am=${total}&cu=INR&tn=Boutique%20Order`;
        
        // Update QR Code
        document.getElementById('qr-code').innerHTML = `
            <img src="https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(upiStr)}" alt="Payment QR">
        `;
        document.getElementById('upi-link').href = upiStr;
    } else {
        gate.classList.add('hidden');
        notice.classList.remove('hidden');
    }
};

// --- 6. FINAL ORDER SYNC (EmailJS + WhatsApp) ---
window.sendToWhatsApp = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value;
    const total = cart.reduce((a, b) => a + b.price, 0);
    const items = cart.map(i => i.name).join(", ");

    // Step A: Log to EmailJS for your records
    const emailParams = {
        customer_name: user.displayName,
        customer_email: user.email,
        order_details: items,
        total_price: `₹${total}`,
        shipping_address: addr
    };

    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, emailParams)
        .then(() => console.log("Success: Order logged to EmailJS"))
        .catch((err) => console.error("EmailJS Error:", err));

    // Step B: Direct WhatsApp Message
    const msg = `✨ *POWDER ROOT LUXURY ORDER* ✨\n\n👤 *Client:* ${user.displayName}\n💰 *Amount:* ₹${total}\n📍 *Shipping:* ${addr}\n📦 *Items:* ${items}\n\n_Order via Boutique Web_`;
    
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
};

// --- 7. INITIAL PRODUCT RENDER ---
const grid = document.getElementById('product-grid');
products.forEach(p => {
    grid.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/400?text=${p.name}'">
            <h3 style="font-family:'Cinzel'; letter-spacing:2px; font-size:1rem;">${p.name}</h3>
            <p style="color:var(--gold); margin:15px 0; font-weight:700;">₹${p.price}</p>
            <button class="gold-outline-btn" style="width:100%" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
// Force Video Autoplay on Load
window.addEventListener('load', () => {
    const video = document.getElementById('bg-video');
    if (video) {
        video.play().catch(error => {
            console.log("Autoplay was prevented. Waiting for user interaction.");
            // If prevented, play it on the first click anywhere on the page
            document.body.addEventListener('click', () => {
                video.play();
            }, { once: true });
        });
    }
});
