// 1. SERVICE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. CONFIGURATIONS (REPLACE WITH YOUR KEYS)
const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
};

const EMAILJS_PUB_KEY = "lxY_3luPFEJNp2_dO";
const EMAILJS_SERVICE = "service_cs926jb";
const EMAILJS_TEMPLATE = "template_ojt95o7";
const PHONE_NUMBER = "919096999662"; // Your number (Format: 91...)

// 3. INITIALIZE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUB_KEY);

// 4. PRODUCT CATALOG (Currency: ₹)
const products = [
    { id: 1, name: "Artisanal Onion", price: 450, img: "assets/images/onion.jpg", desc: "Hand-milled sun-dried shallots." },
    { id: 2, name: "Roasted Garlic", price: 550, img: "assets/images/garlic.jpg", desc: "Slow-aged for deep umami essence." },
    { id: 3, name: "Infused Ginger", price: 500, img: "assets/images/ginger.jpg", desc: "Sharply refined organic root." }
];

let cart = [];
let currentUser = null;

// 5. AUTHENTICATION (Login & Logout)
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userImg = document.getElementById('user-img');

    if (user) {
        currentUser = user;
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userImg.src = user.photoURL;
    } else {
        currentUser = null;
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);

window.handleLogout = () => {
    signOut(auth).then(() => {
        alert("Logged out successfully.");
        location.reload();
    });
};

// 6. CART LOGIC
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const product = products.find(x => x.id === id);
    cart.push(product);
    renderCart();
    if(!document.getElementById('cart-drawer').classList.contains('active')) window.toggleCart();
};

window.removeItem = (index) => {
    cart.splice(index, 1);
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const countDisp = document.getElementById('cart-count');
    
    list.innerHTML = "";
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                <div>
                    <div style="font-size:0.9rem; font-weight:600;">${item.name}</div>
                    <div style="color:#ff4d4d; font-size:0.7rem; cursor:pointer; margin-top:4px;" onclick="removeItem(${idx})">REMOVE</div>
                </div>
                <span style="color:#D4AF37; font-weight:600;">₹${item.price}</span>
            </div>`;
    });

    totalDisp.innerText = `₹${total.toFixed(2)}`;
    countDisp.innerText = cart.length;
}

// 7. THE CLEAN WHATSAPP CHECKOUT
window.checkoutViaWhatsApp = async () => {
    if(cart.length === 0) return alert("Your bag is empty.");

    const addr = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    const zip = document.getElementById('cust-zip').value;

    if(!addr || !city || !zip) return alert("Please fill in your shipping address.");

    const total = cart.reduce((a,b) => a + b.price, 0);
    const fullAddress = `${addr}, ${city} - ${zip}`;

    // Elegant Text Message
    let waText = `✨ *NEW ORDER: POWDER ROOT* ✨\n`;
    waText += `──────────────────\n\n`;
    waText += `🛍️ *ORDER SUMMARY:*\n`;
    cart.forEach((item, i) => waText += `${i+1}. ${item.name} — ₹${item.price}\n`);
    waText += `\n💰 *TOTAL PAYABLE:* ₹${total}.00\n`;
    waText += `──────────────────\n\n`;
    waText += `📍 *SHIPPING TO:*\n${fullAddress}\n\n`;

    if(currentUser) {
        waText += `👤 *CUSTOMER:*\n${currentUser.displayName}\n(${currentUser.email})\n`;
    }
    waText += `──────────────────\n`;
    waText += `_Thank you for choosing Powder Root_`;

    // EmailJS (Background Notification)
    if(currentUser) {
        const templateParams = {
            to_name: currentUser.displayName,
            user_email: currentUser.email,
            order_details: cart.map(i => i.name).join(", "),
            total_price: `₹${total}`,
            shipping_address: fullAddress
        };
        emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams);
    }

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
};

// 8. PAGE LOAD & ANIMATIONS
const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card reveal">
            <img src="${p.img}" alt="${p.name}">
            <h3 style="font-family:'Cinzel'; margin-top:20px; letter-spacing:1px;">${p.name}</h3>
            <p style="font-size:0.7rem; color:#777; margin:10px 0; letter-spacing:1px;">${p.desc}</p>
            <p style="color:#D4AF37; font-weight:bold; font-size:1.1rem; margin-bottom:15px;">₹${p.price}</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>
    `;
});

// Scroll Reveal Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

