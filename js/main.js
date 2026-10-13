
"use strict";

// FLORÉ SHOP
// Catálogo y precios de demostración.
// Reemplazar con productos reales antes de publicar.

const products = [
  {
    id: 1,
    name: "Mini selladora de bolsas",
    category: "Cocina",
    price: 15990,
    emoji: "🍿",
    badge: "¡Lo quiero!",
    description: "Para cerrar tus snacks y mantener todo organizado."
  },
  {
    id: 2,
    name: "Kit viajero FLORÉ",
    category: "Viajes",
    price: 34990,
    emoji: "✈️",
    badge: "Nuestro favorito",
    description: "Estuche con accesorios y envases vacíos para viajar."
  },
  {
    id: 3,
    name: "Aspiradora portátil",
    category: "Auto",
    price: 39990,
    emoji: "🚗",
    badge: "Práctico",
    description: "Un accesorio compacto para la limpieza del auto."
  },
  {
    id: 4,
    name: "Luz LED con sensor",
    category: "Lo quiero",
    price: 18990,
    emoji: "💡",
    badge: "Novedad",
    description: "Iluminación práctica para espacios pequeños."
  },
  {
    id: 5,
    name: "Organizador de cables",
    category: "Viajes",
    price: 16990,
    emoji: "🔌",
    badge: "Ideal para viajar",
    description: "Llevá cargadores y cables siempre ordenados."
  },
  {
    id: 6,
    name: "Mini impresora térmica",
    category: "Lo quiero",
    price: 32990,
    emoji: "🖨️",
    badge: "¡Qué genial!",
    description: "Para imprimir pequeñas notas y etiquetas."
  },
  {
    id: 7,
    name: "Organizador de cocina",
    category: "Cocina",
    price: 19990,
    emoji: "🍽️",
    badge: "Organización",
    description: "Un aliado para aprovechar mejor los espacios."
  },
  {
    id: 8,
    name: "Soporte para celular",
    category: "Auto",
    price: 14990,
    emoji: "📱",
    badge: "Muy útil",
    description: "Soporte práctico para utilizar con el vehículo detenido."
  }
];

const $ = selector => document.querySelector(selector);

const formatPrice = value =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);

let cart = [];

try {
  const saved = JSON.parse(localStorage.getItem("floreCart"));
  if (Array.isArray(saved)) {
    cart = saved
      .filter(item =>
        products.some(p => p.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      )
      .map(item => ({
        id: item.id,
        quantity: Math.min(item.quantity, 99)
      }));
  }
} catch {
  cart = [];
}

function saveCart() {
  localStorage.setItem("floreCart", JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

// MOSTRAR PRODUCTOS

function renderProducts() {
  const search = $("#searchInput").value.toLowerCase().trim();
  const category = $("#categoryFilter").value;

  const filtered = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);

    const matchesCategory =
      category === "Todos" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const grid = $("#productGrid");
  grid.replaceChildren();

  if (!filtered.length) {
    const message = document.createElement("p");
    message.textContent = "No encontramos productos con esa búsqueda 💜";
    grid.appendChild(message);
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("div");
    image.className = "product-image";

    const emoji = document.createElement("span");
    emoji.textContent = product.emoji;

    const badge = document.createElement("div");
    badge.className = "product-badge";
    badge.textContent = product.badge;

    image.append(emoji, badge);

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("small");
    category.textContent = product.category;

    const title = document.createElement("h3");
    title.textContent = product.name;

    const description = document.createElement("p");
    description.textContent = product.description;

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const button = document.createElement("button");
    button.className = "add-button";
    button.textContent = "Agregar al carrito +";
    button.addEventListener("click", () => addToCart(product.id));

    info.append(category, title, description, price, button);
    card.append(image, info);
    grid.appendChild(card);
  });
}

// CARRITO

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.quantity >= 99) {
      showToast("Cantidad máxima alcanzada");
      return;
    }
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  updateCart();
  showToast("¡Agregado al carrito! 💜");
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity = Math.min(99, item.quantity + change);

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

function updateCart() {
  saveCart();

  $("#cartCount").textContent = cartCount();
  $("#cartTotal").textContent = formatPrice(cartTotal());
  $("#checkoutTotal").textContent = formatPrice(cartTotal());

  const container = $("#cartItems");
  container.replaceChildren();

  if (!cart.length) {
    const empty = document.createElement("p");
    empty.textContent = "Tu carrito está vacío 🛍️";
    container.appendChild(empty);
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    const emoji = document.createElement("span");
    emoji.className = "cart-item-emoji";
    emoji.textContent = product.emoji;

    const details = document.createElement("div");
    details.className = "cart-item-details";

    const name = document.createElement("h4");
    name.textContent = product.name;

    const price = document.createElement("strong");
    price.textContent = formatPrice(product.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.textContent = "Eliminar";
    remove.addEventListener("click", () => removeFromCart(item.id));

    controls.append(minus, quantity, plus, remove);
    details.append(name, price, controls);
    row.append(emoji, details);

    container.appendChild(row);
  });
}

function openCart() {
  $("#cartPanel").classList.add("open");
  $("#overlay").classList.remove("hidden");
}

function closeCart() {
  $("#cartPanel").classList.remove("open");
  $("#overlay").classList.add("hidden");
}

$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

// BUSCADOR Y CATEGORÍAS

$("#searchInput").addEventListener("input", renderProducts);
$("#categoryFilter").addEventListener("change", renderProducts);

document.querySelectorAll(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    $("#categoryFilter").value = button.dataset.category;
    renderProducts();
    $("#productos").scrollIntoView({ behavior: "smooth" });
  });
});

// CHECKOUT

$("#checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Primero agregá un producto 💜");
    return;
  }

  closeCart();
  $("#checkoutTotal").textContent = formatPrice(cartTotal());
  $("#checkoutModal").classList.remove("hidden");
});

$("#closeCheckout").addEventListener("click", () => {
  $("#checkoutModal").classList.add("hidden");
});

function updateDeliveryFields() {
  const delivery = document.querySelector(
    'input[name="delivery"]:checked'
  ).value;

  const home = delivery === "domicilio";

  $("#addressFields").classList.toggle("hidden", !home);
  $("#branchFields").classList.toggle("hidden", home);

  $("#streetAddress").required = home;
  $("#city").required = home;
  $("#branchSelect").required = !home;

  if (!home) {
    buscarSucursales();
  }
}

async function buscarSucursales() {
  const cp = $("#postalCode").value.trim();
  const select = $("#branchSelect");
  const status = $("#branchStatus");

  select.replaceChildren();

  const option = document.createElement("option");
  option.value = "";
  option.textContent = "Seleccioná una sucursal";
  select.appendChild(option);

  if (!/^[0-9]{4}$/.test(cp)) {
    status.textContent = "Ingresá un código postal de 4 números.";
    return;
  }

  status.textContent = "Buscando sucursales disponibles...";

  try {
    // Esta ruta la implementaremos en nuestro servidor.
    const response = await fetch(
      `/api/sucursales?cp=${encodeURIComponent(cp)}`
    );

    if (!response.ok) throw new Error("Error de consulta");

    const sucursales = await response.json();

    if (!Array.isArray(sucursales) || !sucursales.length) {
      status.textContent = "No se encontraron sucursales disponibles.";
      return;
    }

    sucursales.forEach(sucursal => {
      const item = document.createElement("option");
      item.value = sucursal.id;
      item.textContent = `${sucursal.nombre} - ${sucursal.direccion}`;
      select.appendChild(item);
    });

    status.textContent = "Elegí dónde querés retirar tu compra.";
  } catch {
    status.textContent =
      "Todavía no está conectada la consulta a Correo Argentino.";
  }
}

$("#postalCode").addEventListener("change", () => {
  if (document.querySelector(
    'input[name="delivery"]:checked'
  ).value === "sucursal") {
    buscarSucursales();
  }
});
// MERCADO PAGO
// Para cobrar realmente necesitaremos un backend seguro.
// Este formulario NO envía datos ni procesa pagos.

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!cart.length) {
    showToast("El carrito está vacío");
    return;
  }

  const form = event.currentTarget;

  if (!form.reportValidity()) return;

  alert(
    "¡Estamos preparando FLORÉ! 💜\n\n" +
    "Subtotal: " + formatPrice(cartTotal()) + "\n\n" +
    "Esta es una demostración.\n" +
    "Todavía no se procesan pagos ni pedidos reales.\n\n" +
    "Próximamente conectaremos Mercado Pago y " +
    "Correo Argentino para completar la compra."
  );
});

// INICIALIZACIÓN

updateDeliveryFields();
renderProducts();
updateCart();
