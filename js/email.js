emailjs.init("lxY_3luPFEJNp2_dO");

function sendInvoice(){
  const user = JSON.parse(localStorage.getItem("user"));
  const cart = JSON.parse(localStorage.getItem("cart"));
  let total = cart.reduce((a,b)=>a+b.price,0);

  emailjs.send("service_cs926jb","template_ojt95o7",{
    name:user.displayName,
    email:user.email,
    items:cart.map(i=>i.name).join(", "),
    total:total
  });
}
