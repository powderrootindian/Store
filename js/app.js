import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. CONFIGURATION (Replace with your actual keys) ---
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
emailjs.init(EMAILJS_PUBLIC_KEY); // Activates the Email service

let cart = [];

// --- 3. UI ENHANCEMENTS (Video & Glassmorphism) ---

// Fix for Background Video Autoplay
window.addEventListener('load', () => {
    const video = document.getElementById('bg-video');
    if (video) {
        video.play().catch(() => {
            // If browser blocks, play on the first click anywhere on the site
            document.body.addEventListener('click', () => {
                video.play();
            }, { once: true });
        });
    }
});

// Scroll Listener for Glassmorphism Navbar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 60) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// --- 4. AUTHENTICATION LOGIC ---
window.handleAuth = () => signInWithPopup(auth, provider).catch(err => console.error("Login Error:", err));

window.handleLogout = () => signOut(auth).then(() => {
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

// --- 5. SHOP & CART LOGIC (With Quantity & Removal) ---
const products = [
    { id: 1, name: "PURE ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "ARTISANAL GARLIC", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "RAW GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];

window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    document.getElementById('cart-drawer').classList.add('active');
};

window.updateQuantity = (id, delta) => {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(x => x.id !== id);
        }
        updateCartUI();
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter(x => x.id !== id);
    updateCartUI();
};

window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

function updateCartUI() {
    const list = document.getElementById('cart-items');
    let total = 0; 
    list.innerHTML = '';
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        list.innerHTML += `
            <div class="cart-item">
                <div class="item-info">
                    <p style="font-size:0.8rem; letter-spacing:1px;">${item.name}</p>
                    <p style="color:var(--gold); font-size:0.7rem;">₹${item.price}</p>
                </div>
                <div style="display:flex; align-items:center;">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span style="font-size:0.8rem;">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <i class="fa-solid fa-trash-can remove-item" onclick="removeFromCart(${item.id})"></i>
                </div>
            </div>`;
    });
    
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('bag-count').innerText = cart.reduce((acc, curr) => acc + curr.quantity, 0);
    window.validateState();
}

// --- 6. CHECKOUT FLOW (UPI QR + Brand Masking) ---
window.validateState = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value.trim();
    const gate = document.getElementById('payment-gate');
    const notice = document.getElementById('lock-notice');

    if (user && addr.length > 5 && cart.length > 0) {
        gate.classList.remove('hidden');
        notice.classList.add('hidden');
        
        const total = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        // "pn=POWDER%20ROOT" ensures the brand name shows in banking apps
        const upiStr = `upi://pay?pa=${UPI_ID}&pn=POWDER%20ROOT&am=${total}&cu=INR&tn=Order_For_${user.displayName.replace(/ /g, '_')}`;
        
        document.getElementById('qr-code').innerHTML = `
            <img src="https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(upiStr)}" alt="Payment QR">
        `;
    } else {
        gate.classList.add('hidden');
        notice.classList.remove('hidden');
    }
};

// --- 7. FINAL DUAL-SYNC (EmailJS + WhatsApp) ---
window.sendToWhatsApp = () => {
    const user = auth.currentUser;
    const addr = document.getElementById('shipping-address').value;
    const total = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const items = cart.map(i => `${i.name} (x${i.quantity})`).join(", ");

    // Step A: Send Email Record (Digital Ledger)
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { 
        customer_name: user.displayName, 
        customer_email: user.email,
        order_details: items, 
        total_price: `₹${total}`, 
        shipping_address: addr 
    }).then(() => {
        console.log("Order logged to EmailJS");
    }, (err) => {
        console.error("EmailJS Error:", err);
    });

    // Step B: Direct WhatsApp Message
    const msg = `✨ *POWDER ROOT LUXURY ORDER* ✨\n\n👤 *Client:* ${user.displayName}\n💰 *Amount:* ₹${total}\n📍 *Shipping:* ${addr}\n📦 *Items:* ${items}\n\n_Receipt synced to Boutique Database_`;
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
    
    // Cleanup
    cart = [];
    updateCartUI();
    window.toggleCart();
    alert("Order synced! Redirecting to WhatsApp for receipt confirmation.");
};

// --- 8. INITIAL PRODUCT RENDER ---
const grid = document.getElementById('product-grid');
products.forEach(p => {
    grid.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/400'">
            <h3 style="font-family:'Cinzel'; letter-spacing:2px;">${p.name}</h3>
            <p style="color:var(--gold); margin:15px 0;">₹${p.price}</p>
            <button class="gold-outline-btn" style="width:100%" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
