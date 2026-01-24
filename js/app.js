import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const PHONE_NUMBER = "919876543210"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUB_KEY);

const products = [
    { id: 1, name: "Artisanal Onion", price: 450, img: "assets/images/onion.jpg", desc: "Hand-milled shallots." },
    { id: 2, name: "Roasted Garlic", price: 550, img: "assets/images/garlic.jpg", desc: "Slow-aged essence." },
    { id: 3, name: "Infused Ginger", price: 500, img: "assets/images/ginger.jpg", desc: "Organic refined root." }
];

let cart = [];

onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    if (user) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        document.getElementById('user-img').src = user.photoURL;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());

window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    cart.push(products.find(x => x.id === id));
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
    const qrSection = document.getElementById('qr-payment-section');
    
    list.innerHTML = "";
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                <div>
                    <div style="font-size:0.9rem; font-weight:600; color:white;">${item.name}</div>
                    <div style="color:#ff4d4d; font-size:0.7rem; cursor:pointer;" onclick="removeItem(${idx})">REMOVE</div>
                </div>
                <span style="color:#D4AF37;">₹${item.price}</span>
            </div>`;
    });

    totalDisp.innerText = `₹${total.toFixed(2)}`;
    document.getElementById('cart-count').innerText = cart.length;

    if (qrSection) qrSection.style.display = cart.length > 0 ? 'block' : 'none';
}

window.checkoutViaWhatsApp = async () => {
    const activeUser = auth.currentUser;
    if (!activeUser) {
        alert("Please login with Google to complete your order.");
        try { await signInWithPopup(auth, provider); return; } catch (e) { return; }
    }

    if (cart.length === 0) return alert("Your bag is empty.");
    const addr = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    const zip = document.getElementById('cust-zip').value;
    if (!addr || !city || !zip) return alert("Please fill shipping details.");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const fullAddress = `${addr}, ${city} - ${zip}`;

    const templateParams = {
        to_name: activeUser.displayName,
        user_email: activeUser.email, 
        order_details: cart.map(i => i.name).join(", "),
        total_price: `₹${total}`,
        shipping_address: fullAddress
    };

    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams);

    let waText = `✨ *NEW ORDER: POWDER ROOT* ✨\n\n👤 *CUSTOMER:* ${activeUser.displayName}\n🛍️ *ITEMS:* ${cart.map(i => i.name).join(", ")}\n💰 *TOTAL:* ₹${total}\n📍 *ADDRESS:* ${fullAddress}\n💳 *PAYMENT:* QR Scanned`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
};

const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p style="color:#D4AF37;">₹${p.price}</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
