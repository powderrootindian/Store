import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- SETTINGS ---
const firebaseConfig = { apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds", authDomain: "powderroot26.firebaseapp.com", projectId: "powderroot26" };
const EMAILJS_PUB_KEY = "lxY_3luPFEJNp2_dO";
const EMAILJS_SERVICE = "service_cs926jb";
const EMAILJS_TEMPLATE = "template_ojt95o7";
const UPI_ID = "8788855688-2@ybl"; 
const BUSINESS_NAME = "Powder Root Boutique";
const PHONE_NUMBER = "919096999662"; 

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

// Auth
onAuthStateChanged(auth, (user) => {
    document.getElementById('login-btn').style.display = user ? 'none' : 'block';
    document.getElementById('user-profile').style.display = user ? 'flex' : 'none';
    if(user) document.getElementById('user-img').src = user.photoURL;
});
window.handleLogout = () => signOut(auth).then(() => location.reload());
document.getElementById('login-btn').onclick = () => signInWithPopup(auth, provider);

// Cart
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');
window.addToCart = (id) => {
    cart.push(products.find(x => x.id === id));
    renderCart();
    document.getElementById('cart-drawer').classList.add('active');
};
window.removeItem = (index) => { cart.splice(index, 1); renderCart(); };

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('cart-total');
    const qrSection = document.getElementById('qr-payment-section');
    list.innerHTML = "";
    let total = 0;

    cart.forEach((item, idx) => {
        total += item.price;
        list.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #1a1a1a; padding-bottom:5px;">
            <span style="font-size:0.8rem;">${item.name}</span>
            <i class="fa-solid fa-trash" style="color:#ff4d4d; cursor:pointer;" onclick="removeItem(${idx})"></i>
        </div>`;
    });

    totalDisp.innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;

    if (cart.length > 0) {
        qrSection.style.display = 'block';
        const upi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${total}&cu=INR`;
        document.getElementById('upi-pay-link').href = upi;
        document.getElementById('qr-container').innerHTML = `<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(upi)}" style="border:5px solid white;">`;
    } else { qrSection.style.display = 'none'; }
}

window.checkoutViaWhatsApp = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please Login First");
    if (cart.length === 0) return alert("Bag is empty");
    const addr = document.getElementById('cust-address').value;
    if (!addr) return alert("Enter Shipping Details");

    const total = cart.reduce((a, b) => a + b.price, 0);
    const itemNames = cart.map(i => i.name).join(", ");

    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { to_name: "Admin", from_name: user.displayName, user_email: user.email, order_details: itemNames, total_price: `₹${total}`, shipping_address: addr });

    let text = `✨ *BOUTIQUE ORDER* ✨\n👤 *CLIENT:* ${user.displayName}\n🛍️ *ITEMS:* ${itemNames}\n💰 *TOTAL:* ₹${total}\n📍 *DELIVERY:* ${addr}`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
};

const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `<div class="product-card">
        <img src="${p.img}">
        <h3 style="font-family:'Cinzel';">${p.name}</h3>
        <p style="color:var(--gold);">₹${p.price}</p>
        <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
    </div>`;
});
