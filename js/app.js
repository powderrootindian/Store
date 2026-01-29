import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURATION ---
const firebaseConfig = { 
    apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
    authDomain: "powderroot26.firebaseapp.com",
    projectId: "powderroot26",
};

const EMAILJS_PUB_KEY = "lxY_3luPFEJNp2_dO";
const EMAILJS_SERVICE = "service_cs926jb";
const EMAILJS_TEMPLATE = "template_ojt95o7";

const UPI_ID = "8788855688-2@ybl"; 
const BUSINESS_NAME = "Powder Root Boutique";
const PHONE_NUMBER = "919096999662"; 

// --- INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_PUB_KEY);

const products = [
    { id: 1, name: "ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "GARLIC POWDER", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];

let cart = [];

// --- AUTH LOGIC ---
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    if (user && userProfile) {
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        document.getElementById('user-img').src = user.photoURL;
    } else if (loginBtn) {
        loginBtn.style.display = 'block';
        userProfile.style.display = 'none';
    }
});

window.handleLogout = () => signOut(auth).then(() => location.reload());
if(document.getElementById('login-btn')) {
    document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);
}

// --- CART LOGIC (THE FIX) ---
// Using window.functionName makes these accessible to HTML onclick events
window.toggleCart = () => {
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('active');
    document.body.classList.toggle('cart-open'); 
};

window.addToCart = (id) => {
    const product = products.find(x => x.id === id);
    if (product) {
        cart.push(product);
        renderCart();
        // Automatically open the drawer when an item is added
        document.getElementById('cart-drawer').classList.add('active');
        document.body.classList.add('cart-open');
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
    const qrSection = document.getElementById('qr-payment-section');
    
    list.innerHTML = cart.length === 0 ? '<p style="text-align:center; color:#666; padding:40px;">Your bag is empty.</p>' : '';
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #222; padding-bottom:10px;">
                <div>
                    <p style="margin:0; font-size:0.85rem; font-weight:600;">${item.name}</p>
                    <p style="margin:0; font-size:0.75rem; color:#D4AF37;">₹${item.price}</p>
                </div>
                <i class="fa-solid fa-trash" style="color:#444; cursor:pointer; font-size:0.8rem;" onclick="removeItem(${idx})"></i>
            </div>`;
    });

    if (totalDisp) totalDisp.innerText = `₹${total}`;
    if (countDisp) countDisp.innerText = cart.length;

    // Handle Payment Section & Dynamic QR
    if (qrSection) {
        if (cart.length > 0) {
            qrSection.style.display = 'block';
            const upi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${total}&cu=INR`;
            const upiLink = document.getElementById('upi-pay-link');
            const qrContainer = document.getElementById('qr-container');
            
            if(upiLink) upiLink.href = upi;
            if(qrContainer) {
                qrContainer.innerHTML = `<img src="https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encodeURIComponent(upi)}&choe=UTF-8" style="border:5px solid white;">`;
            }
        } else {
            qrSection.style.display = 'none';
        }
    }
}

// --- CHECKOUT LOGIC ---
window.checkoutViaWhatsApp = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please Login with Google to place an order.");
    if (cart.length === 0) return alert("Your bag is empty.");
    
    const addr = document.getElementById('cust-address')?.value;
    const city = document.getElementById('cust-city')?.value;

    if (!addr || !city) return alert("Please enter shipping details.");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const itemNames = cart.map(i => i.name).join(", ");
    const fullAddr = `${addr}, ${city}`;

    // Email Backup
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { 
        to_name: "Admin", from_name: user.displayName, user_email: user.email, 
        order_details: itemNames, total_price: `₹${total}`, shipping_address: fullAddr 
    });

    // WhatsApp Message Formatting
    let text = `✨ *POWDER ROOT ORDER* ✨\n👤 *CLIENT:* ${user.displayName}\n🛍️ *ITEMS:* ${itemNames}\n💰 *TOTAL:* ₹${total}\n📍 *DELIVERY:* ${fullAddr}`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
};

// --- RENDER PRODUCTS ON PAGE LOAD ---
const container = document.getElementById('product-container');
if(container) {
    products.forEach(p => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${p.img}" alt="${p.name}">
                <h3 style="font-family:'Cinzel';">${p.name}</h3>
                <p style="color:#D4AF37; font-weight:bold;">₹${p.price}</p>
                <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
            </div>`;
    });
}
