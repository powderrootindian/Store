import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
  authDomain: "powderroot26.firebaseapp.com",
  projectId: "powderroot26",
  storageBucket: "powderroot26.firebasestorage.app",
  messagingSenderId: "776300724322",
  appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
  measurementId: "G-3GTKBEFJ2V"
};
const EMAILJS_SERVICE = "service_cs926jb", EMAILJS_TEMPLATE = "template_ojt95o7", EMAILJS_KEY = "lxY_3luPFEJNp2_dO";
const UPI_ID = "8788855688-2@ybl", PHONE = "919096999662";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
emailjs.init(EMAILJS_KEY);

const products = [
    { id: 1, name: "PURE ONION POWDER", price: 299, img: "assets/images/onion.jpg" },
    { id: 2, name: "ARTISANAL GARLIC POWDER", price: 179, img: "assets/images/garlic.jpg" },
    { id: 3, name: "RAW GINGER POWDER", price: 179, img: "assets/images/ginger.jpg" }
];
let cart = [];

onAuthStateChanged(auth, (user) => {
    document.getElementById('login-btn').classList.toggle('hidden', !!user);
    document.getElementById('user-profile').classList.toggle('hidden', !user);
    if(user) document.getElementById('user-img').src = user.photoURL;
    validateCheckout(); 
});

window.handleLogin = () => signInWithPopup(auth, provider);
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const item = products.find(p => p.id === id);
    if(item) { cart.push(item); renderCart(); document.getElementById('cart-drawer').classList.add('active'); }
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    let total = 0; list.innerHTML = '';
    cart.forEach(item => {
        total += item.price;
        list.innerHTML += `<div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #222; font-size:0.8rem;"><span>${item.name}</span><span style="color:var(--gold)">₹${item.price}</span></div>`;
    });
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;
    validateCheckout();
}

window.validateCheckout = () => {
    const user = auth.currentUser, addr = document.getElementById('cust-address').value.trim();
    const payZone = document.getElementById('secure-payment-zone'), lockMsg = document.getElementById('checkout-lock-msg');

    if (user && addr.length > 5 && cart.length > 0) {
        payZone.classList.remove('hidden'); lockMsg.classList.add('hidden');
        const total = cart.reduce((a, b) => a + b.price, 0);
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=PowderRoot&am=${total}&cu=INR`;
        document.getElementById('qr-container').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(upiUrl)}">`;
        document.getElementById('upi-intent-link').href = upiUrl;
    } else {
        payZone.classList.add('hidden'); lockMsg.classList.remove('hidden');
    }
};

window.syncOrderToWhatsApp = () => {
    const user = auth.currentUser, addr = document.getElementById('cust-address').value;
    const total = cart.reduce((a, b) => a + b.price, 0), items = cart.map(i => i.name).join(", ");

    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { customer_name: user.displayName, order_details: items, total_price: `₹${total}`, shipping_address: addr });

    const msg = `✨ *POWDER ROOT DIRECT ORDER* ✨\n👤 *Client:* ${user.displayName}\n💰 *Paid:* ₹${total}\n📍 *Destination:* ${addr}\n📦 *Items:* ${items}\n🔗 instagram.com/powderroot`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
};

products.forEach(p => {
    document.getElementById('product-container').innerHTML += `
        <div class="product-card">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/400'">
            <h3 style="font-family:'Cinzel'; font-size:0.9rem;">${p.name}</h3>
            <p style="color:var(--gold); margin:15px 0; font-weight:700;">₹${p.price}</p>
            <button class="premium-pay-btn" style="background:none; border:1px solid var(--gold); color:var(--gold);" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
