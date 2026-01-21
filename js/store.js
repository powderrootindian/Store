const products = {
  onion:{name:"Onion Powder",price:349,img:"images/onion.jpg"},
  garlic:{name:"Garlic Powder",price:299,img:"images/garlic.jpg"},
  ginger:{name:"Ginger Powder",price:299,img:"images/ginger.jpg"}
};

function addToCart(id){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(products[id]);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.href="cart.html";
}

function loadCart(){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  let box = document.getElementById("cart");
  cart.forEach(i=>{
    total+=i.price;
    box.innerHTML+=`<p>${i.name} – ₹${i.price}</p>`;
  });
  document.getElementById("total").innerText="₹"+total;
}

function placeOrder(){
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){ location.href="login.html"; return; }

  const cart = JSON.parse(localStorage.getItem("cart"));
  const msg = `Order from ${user.displayName}%0A` +
    cart.map(i=>`${i.name} ₹${i.price}`).join("%0A");

  window.open(`https://wa.me/919096999662?text=${msg}`);
  location.href="success.html";
}
