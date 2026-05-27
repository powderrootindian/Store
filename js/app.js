// 1. IMPORT NECESSARY SERVICES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    signOut, 
    GoogleAuthProvider, 
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. CONFIGURATIONS
const firebaseConfig = {
    apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
    authDomain: "powderroot26.firebaseapp.com",
    projectId: "powderroot26",
    storageBucket: "powderroot26.firebasestorage.app",
    messagingSenderId: "776300724322",
    appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
};

const PHONE_NUMBER = "919096999662"; 
const UPI_ID = "8788855688-2@ybl"; 

// 3. INITIALIZE SERVICES
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Initialize EmailJS with your credentials
emailjs.init("lxY_3luPFEJNp2_dO");

// Apply persistence configuration to handle browser tracking preventions gracefully
setPersistence(auth, browserLocalPersistence)
    .catch((error) => console.error("Persistence configuration issue:", error));

// 4. PRODUCT DATA SOURCE
const products = [
    { id: 1, name: "Artisanal Onion", price: 299, img: "assets/images/onion.jpg", desc: "Hand-milled sun-dried shallots." },
    { id: 2, name: "Roasted Garlic", price: 199, img: "assets/images/garlic.jpg", desc: "Slow-aged for deep umami essence." },
    { id: 3, name: "Infused Ginger", price: 199, img: "assets/images/ginger.jpg", desc: "Sharply refined organic root." }
];

let cart = [];
let currentUser = null;

// 5. AUTHENTICATION HUB
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userImg = document.getElementById('user-img');

    if (user) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userImg.src = user.photoURL;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
        userImg.src = "";
    }
});

window.handleAuth = () => signInWithPopup(auth, provider).catch(err => console.error("Login closed:", err));
window.handleLogout = () => signOut(auth).then(() => location.reload()).catch(err => console.error("Logout issue:", err));

// 6. TOGGLE VISIBILITY EXTENSION
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

// 7. CART ENGINE INTERACTION MANAGERS
window.addToCart = (id) => {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        const product = products.find(p => p.id === id);
        cart.push({ ...product, qty: 1 });
    }
    renderCart();
    if (!document.getElementById('cart-drawer').classList.contains('active')) {
        window.toggleCart();
    }
};

window.updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty < 1) {
            cart = cart.filter(i => i.id !== id);
        }
        renderCart();
    }
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const countDisp = document.getElementById('cart-count');
    
    if (cart.length === 0) {
        list.innerHTML = `<p style="text-align:center;color:#666;margin-top:40px;font-size:0.85rem;letter-spacing:1px;">YOUR BAG IS EMPTY</p>`;
        totalDisp.innerText = "₹0.00";
        countDisp.innerText = "0";
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div class="item-meta">
                <span class="item-name">${item.name}</span>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <span class="gold-text">₹${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalDisp.innerText = `₹${total.toFixed(2)}`;
    countDisp.innerText = cart.reduce((sum, item) => sum + item.qty, 0);
}

// 8. STEPPED DRAWER CONTROLLERS
window.nextStep = (stepNumber) => {
    if (stepNumber === 2) {
        if (cart.length === 0) return alert("Please add products to your bag first.");
        if (!currentUser) return alert("Please log in to continue with your checkout.");
    }
    
    if (stepNumber === 3) {
        const addr = document.getElementById('cust-address').value.trim();
        const city = document.getElementById('cust-city').value.trim();
        const zip = document.getElementById('cust-zip').value.trim();
        
        if (!addr || !city || !zip) return alert("Please fill completely across all shipping fields.");
        
        // Render generated QR logic onto container viewport interface
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=PowderRoot&am=${total}&cu=INR`;
        const qrContainer = document.getElementById('qr-container');
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}" alt="Scan to Pay">`;
    }

    document.querySelectorAll('.cart-step').forEach(step => step.classList.add('hidden'));
    document.getElementById(`step-${stepNumber}`).classList.remove('hidden');
};

// 9. WHATSAPP & SILENT EMAIL SYNC DISPATCHER
window.checkoutViaWhatsApp = () => {
    const addr = document.getElementById('cust-address').value.trim();
    const city = document.getElementById('cust-city').value.trim();
    const zip = document.getElementById('cust-zip').value.trim();
    const fullAddress = `${addr}, ${city} - ${zip}`;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const itemDetails = cart.map(i => `${i.name} (x${i.qty})`).join(", ");

    // Dispatches administrative tracking record values silently
    emailjs.send("service_cs926jb", "template_ojt95o7", {
        customer_name: currentUser ? currentUser.displayName : "Authenticated Customer",
        customer_email: currentUser ? currentUser.email : "N/A",
        order_details: itemDetails,
        total_price: `₹${total}`,
        address: fullAddress
    }).then(() => console.log("Order backup sent successfully."))
      .catch(err => console.error("EmailJS background failure:", err));

    // Construct format mapping for WhatsApp redirection links
    let msg = `*NEW ORDER - POWDER ROOT*%0A`;
    msg += `--------------------------%0A`;
    cart.forEach(i => msg += `• ${i.name} x${i.qty} (₹${i.price * i.qty})%0A`);
    msg += `--------------------------%0A`;
    msg += `*TOTAL:* ₹${total}%0A%0A`;
    msg += `*SHIPPING ADDRESS:*%0A${fullAddress}`;

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${msg}`, '_blank');
};

// 10. PRODUCT INITIAL CARDS GENERATOR RENDERS
const productContainer = document.getElementById('product-container');
if (productContainer) {
    products.forEach(p => {
        productContainer.innerHTML += `
            <div class="product-card reveal">
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p class="desc">${p.desc}</p>
                <p class="gold">₹${p.price}.00</p>
                <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
            </div>`;
    });
}

// Reveal Animation Framework Integration Hooks
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
// Initialize empty placeholder layout state elements explicitly
renderCart();
