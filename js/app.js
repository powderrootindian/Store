// 1. IMPORT NECESSARY SERVICES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. CONFIGURATIONS (Change these to your real keys!)
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
const PHONE_NUMBER = "919096999662"; // Your WhatsApp number

// 3. INITIALIZE SERVICES
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUB_KEY);

// 4. PRODUCT DATA
const products = [
    { id: 1, name: "Artisanal Onion", price: 45, img: "assets/images/onion.jpg", desc: "Hand-milled sun-dried shallots." },
    { id: 2, name: "Roasted Garlic", price: 55, img: "assets/images/garlic.jpg", desc: "Slow-aged for deep umami essence." },
    { id: 3, name: "Infused Ginger", price: 50, img: "assets/images/ginger.jpg", desc: "Sharply refined organic root." }
];

let cart = [];
let currentUser = null;

// 5. AUTHENTICATION LOGIC
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userImg = document.getElementById('user-img');

    if (user) {
        currentUser = user;
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userImg.src = user.photoURL;
    }
});

document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);

// 6. CART & UI LOGIC
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const product = products.find(x => x.id === id);
    cart.push(product);
    renderCart();
    // Auto-open cart when adding item
    if(!document.getElementById('cart-drawer').classList.contains('active')) {
        window.toggleCart();
    }
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
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                <div>
                    <div style="font-size:0.9rem; font-weight:600;">${item.name}</div>
                    <div style="color:#ff4d4d; font-size:0.7rem; cursor:pointer; margin-top:5px;" onclick="removeItem(${idx})">REMOVE</div>
                </div>
                <span style="color:#D4AF37">$${item.price}</span>
            </div>`;
    });

    totalDisp.innerText = `$${total.toFixed(2)}`;
    countDisp.innerText = cart.length;
}

// 7. CHECKOUT (WHATSAPP + EMAIL)// --- CONFIGURATION ---
window.checkoutViaWhatsApp = async () => {
    if(cart.length === 0) return alert("Please add products to your bag first.");

    // Capture Address Data
    const addr = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    const zip = document.getElementById('cust-zip').value;

    if(!addr || !city || !zip) {
        return alert("Please provide complete shipping details.");
    }

    const total = cart.reduce((a,b) => a + b.price, 0);
    const fullAddress = `${addr}, ${city} - ${zip}`;
    const itemNames = cart.map(i => i.name).join(", ");

    // Step A: Send EmailJS (Silent background process)
    if(currentUser) {
        const templateParams = {
            to_name: currentUser.displayName,
            user_email: currentUser.email,
            order_details: itemNames,
            total_price: `$${total}`,
            shipping_address: fullAddress
        };
        
        emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams)
            .then(() => console.log("Email Notification Sent"))
            .catch(err => console.error("Email Error:", err));
    }

    // Step B: Formulate WhatsApp Message
    let waText = `*NEW ORDER - POWDER ROOT*%0A`;
    waText += `--------------------------%0A`;
    cart.forEach(i => waText += `• ₹{i.name} ($₹{i.price})`);
    waText += `--------------------------%0A`;
    waText += `*TOTAL: $₹{total}`;
    waText += `*SHIPPING TO:{fullAddress}`;

    // Step C: Open WhatsApp
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
};

// 8. RENDER PRODUCTS & SCROLL ANIMATION
const productContainer = document.getElementById('product-container');
products.forEach(p => {
    productContainer.innerHTML += `
        <div class="product-card reveal">
            <img src="${p.img}" alt="${p.name}">
            <h3 style="font-family:'Cinzel'; margin-top:20px; letter-spacing:2px;">${p.name}</h3>
            <p style="font-size:0.75rem; color:#888; margin:10px 0; text-transform:uppercase;">${p.desc}</p>
            <p style="color:#D4AF37; font-weight:bold; margin-bottom:20px;">₹${p.price}.00</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>
    `;
});

// Intersection Observer for the "Reveal" effect
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });


document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
