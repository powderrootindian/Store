import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURATION (REPLACE THESE) ---
const firebaseConfig = { 
    apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds", 
    authDomain: "powderroot26.firebaseapp.com", 
    projectId: "powderroot26",
    // Add other firebase config lines here
};

const EMAILJS_PUB_KEY = "lxY_3luPFEJNp2_dO";
const EMAILJS_SERVICE = "service_cs926jb";
const EMAILJS_TEMPLATE = "template_ojt95o7";

const UPI_ID = " 8788855688-2@ybl"; 
const BUSINESS_NAME = "Powder Root Boutique";
const PHONE_NUMBER = "919096999662"; 

// --- INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUB_KEY);

const products = [
    { id: 1, name: "Onion powder", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "Garlic powder", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "Ginger powder", price: 179, img: "assets/images/ginger.jpg" }
];

let cart = [];

// --- AUTH LOGIC ---
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    if (user) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.style.display = 'flex';
        document.getElementById('user-img').src = user.photoURL;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

window.handleLogout = () => signOut(auth).then(() => location.reload());
document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);

// --- CART LOGIC ---
window.toggleCart = () => {
    document.getElementById('cart-drawer').classList.toggle('active');
    document.body.classList.toggle('cart-open'); // PC Overlay Effect
};

window.addToCart = (id) => {
    cart.push(products.find(x => x.id === id));
    renderCart();
    document.getElementById('cart-drawer').classList.add('active');
    document.body.classList.add('cart-open');
    window.toggleCart = () => {
window.removeItem = (index) => {
window.checkoutViaWhatsApp = async () => {
window.handleLogout = () => {

};

window.removeItem = (index) => {
    cart.splice(index, 1);
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const qrSection = document.getElementById('qr-payment-section');
    
    // Clear list
    list.innerHTML = cart.length === 0 
        ? '<p style="text-align:center; color:#666; font-size:0.9rem; margin-top:40px;">Your boutique bag is empty.</p>' 
        : '';
        
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #222; padding-bottom:10px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${item.img}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid #333;">
                    <div>
                        <p style="margin:0; font-size:0.85rem; font-weight:600;">${item.name}</p>
                        <p style="margin:0; font-size:0.7rem; color:#D4AF37;">₹${item.price}</p>
                    </div>
                </div>
                <i class="fa-solid fa-trash" style="color:#666; cursor:pointer; font-size:0.8rem; transition:0.3s;" onmouseover="this.style.color='#ff4d4d'" onmouseout="this.style.color='#666'" onclick="removeItem(${idx})"></i>
            </div>`;
    });

    totalDisp.innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;

    // Handle Payment Section & QR
    if (cart.length > 0) {
        qrSection.style.display = 'block';
        const upi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${total}&cu=INR`;
        document.getElementById('upi-pay-link').href = upi;
        document.getElementById('qr-container').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encodeURIComponent(upi)}&choe=UTF-8" alt="Scan to Pay">`;
    } else {
        qrSection.style.display = 'none';
    }
}

// --- CHECKOUT LOGIC ---
window.checkoutViaWhatsApp = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please Login with Google first.");
    if (cart.length === 0) return alert("Your bag is empty.");
    
    const addr = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    const zip = document.getElementById('cust-zip').value;

    if (!addr || !city) return alert("Please enter shipping details for delivery.");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const itemNames = cart.map(i => i.name).join(", ");
    const fullAddr = `${addr}, ${city} - ${zip}`;

    // 1. Send Backup Email
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { 
        to_name: "Admin", 
        from_name: user.displayName, 
        user_email: user.email, 
        order_details: itemNames, 
        total_price: `₹${total}`, 
        shipping_address: fullAddr 
    });

    // 2. Open WhatsApp
    let text = `✨ *POWDER ROOT BOUTIQUE ORDER* ✨\n\n`;
    text += `👤 *CLIENT:* ${user.displayName}\n`;
    text += `🛍️ *SELECTION:* ${itemNames}\n`;
    text += `💰 *TOTAL:* ₹${total}\n`;
    text += `📍 *SHIPPING:* ${fullAddr}\n\n`;
    text += `💳 _Payment Verified via QR_`;
    
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
};

// --- RENDER PRODUCTS ---
const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <h3 style="font-family:'Cinzel'; margin-bottom:5px;">${p.name}</h3>
            <p style="color:var(--gold); font-weight:bold; margin-bottom:15px;">₹${p.price}</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
    window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.removeItem = removeItem;
window.checkoutViaWhatsApp = checkoutViaWhatsApp;
window.handleLogout = handleLogout;
});
