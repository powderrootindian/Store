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

const UPI_ID = "8788855688-2@ybl"; // removed leading space
const BUSINESS_NAME = "Powder Root Boutique";
const PHONE_NUMBER = "919096999662"; // ensure correct international format

// --- INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// emailjs is expected to be available globally (include EmailJS script in HTML)
if (typeof emailjs !== "undefined" && emailjs.init) {
    emailjs.init(EMAILJS_PUB_KEY);
}

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
    if (!loginBtn || !userProfile) return;

    if (user) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.style.display = 'flex';
        document.getElementById('user-img').src = user.photoURL || '';
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
        userProfile.style.display = '';
    }
});

window.handleLogout = async () => {
    try {
        await signOut(auth);
        location.reload();
    } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed. Check console for details.");
    }
};

const loginBtnEl = document.getElementById('login-btn');
if (loginBtnEl) {
    loginBtnEl.addEventListener('click', () => {
        signInWithPopup(auth, provider).catch(err => {
            console.error("Sign-in error:", err);
            alert("Sign-in failed. Check console for details.");
        });
    });
}

// --- CART LOGIC ---
window.toggleCart = () => {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    drawer.classList.toggle('active');
    document.body.classList.toggle('cart-open'); // PC Overlay Effect
};

// Ensure this is at the global level in your app.js
window.addToCart = (id) => {
    // 1. Find the product
    const product = products.find(p => p.id === id);
    
    if (product) {
        // 2. Add to the cart array
        cart.push(product);
        
        // 3. Update the UI
        renderCart();
        
        // 4. Open the drawer and dim the background
        document.getElementById('cart-drawer').classList.add('active');
        document.body.classList.add('cart-open');
        
        console.log("Added to bag:", product.name);
    } else {
        console.error("Product not found for ID:", id);
    }
};

window.removeItem = (index) => {
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    renderCart();
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const qrSection = document.getElementById('qr-payment-section');
    const cartCountEl = document.getElementById('cart-count');

    if (!list || !totalDisp) return;

    // Clear list
    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#666; font-size:0.9rem; margin-top:40px;">Your boutique bag is empty.</p>';
    } else {
        list.innerHTML = '';
    }

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
                <i class="fa-solid fa-trash" style="color:#666; cursor:pointer; font-size:0.9rem; transition:0.3s;"
                   onmouseover="this.style.color='#ff4d4d'" onmouseout="this.style.color='#666'"
                   onclick="removeItem(${idx})"></i>
            </div>`;
    });

    totalDisp.innerText = `₹${total}`;
    if (cartCountEl) cartCountEl.innerText = cart.length;

    // Handle Payment Section & QR
    if (qrSection) {
        if (cart.length > 0) {
            qrSection.style.display = 'block';
            const upi = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${total}&cu=INR`;
            const upiPayLink = document.getElementById('upi-pay-link');
            const qrContainer = document.getElementById('qr-container');
            if (upiPayLink) upiPayLink.href = upi;
            if (qrContainer) {
                qrContainer.innerHTML = `<img src="https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encodeURIComponent(upi)}&choe=UTF-8" alt="Scan to Pay">`;
            }
        } else {
            qrSection.style.display = 'none';
        }
    }
}

// --- CHECKOUT LOGIC ---
window.checkoutViaWhatsApp = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please Login with Google first.");
    if (cart.length === 0) return alert("Your bag is empty.");

    const addrEl = document.getElementById('cust-address');
    const cityEl = document.getElementById('cust-city');
    const zipEl = document.getElementById('cust-zip');

    const addr = addrEl ? addrEl.value.trim() : '';
    const city = cityEl ? cityEl.value.trim() : '';
    const zip = zipEl ? zipEl.value.trim() : '';

    if (!addr || !city) return alert("Please enter shipping details for delivery.");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const itemNames = cart.map(i => i.name).join(", ");
    const fullAddr = `${addr}, ${city}${zip ? ' - ' + zip : ''}`;

    // 1. Send Backup Email (if emailjs present)
    if (typeof emailjs !== "undefined" && emailjs.send) {
        try {
            await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
                to_name: "Admin",
                from_name: user.displayName || user.email || "Customer",
                user_email: user.email || "",
                order_details: itemNames,
                total_price: `₹${total}`,
                shipping_address: fullAddr
            });
        } catch (err) {
            console.error("EmailJS send failed:", err);
            // proceed even if email backup fails
        }
    }

    // 2. Open WhatsApp
    let text = `✨ *POWDER ROOT BOUTIQUE ORDER* ✨\n\n`;
    text += `👤 *CLIENT:* ${user.displayName || user.email}\n`;
    text += `🛍️ *SELECTION:* ${itemNames}\n`;
    text += `💰 *TOTAL:* ₹${total}\n`;
    text += `📍 *SHIPPING:* ${fullAddr}\n\n`;
    text += `💳 _Payment Verified via QR_`;

    const waUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
};

// --- RENDER PRODUCTS ---
const container = document.getElementById('product-container');
if (container) {
    products.forEach(p => {
        container.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <h3 style="font-family:'Cinzel'; margin-bottom:5px;">${p.name}</h3>
            <p style="color:var(--gold); font-weight:bold; margin-bottom:15px;">₹${p.price}</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
    });
}

// Initial render
renderCart();

