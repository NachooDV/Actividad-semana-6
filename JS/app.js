/* ================================================================
   app.js — SportyStyle Tienda Deportiva
   Organización:
   1. Datos de productos
   2. Gestión del carrito con sessionStorage
   3. Renderizado del catálogo
   4. Renderizado y actualización del panel carrito
   5. Control de navegación entre secciones
   6. Formulario de checkout y validaciones
   7. Pantalla de confirmación
   8. Inicialización de Auth0 y manejo de sesión
================================================================ */


/* ================================================================
   1. DATOS DE PRODUCTOS
   Cada producto tiene: id, categoría, nombre, descripción,
   precio (número) y una URL de imagen pública (Unsplash).
================================================================ */

const PRODUCTS = [
  {
    id: 1,
    category: "Camiseta deportiva",
    name: "AeroFit Pro",
    description: "Camiseta técnica de alto rendimiento con tejido transpirable DryTech. Ideal para entrenamientos intensos en el gimnasio o al aire libre.",
    price: 24990,
    image: "IMG/camisetadeportiva.jpg"
  },
  {
    id: 2,
    category: "Camiseta deportiva",
    name: "FlexCore Tank",
    description: "Musculosa sin costuras con corte ergonómico. Máxima libertad de movimiento para crossfit, yoga o running.",
    price: 19990,
    image: "IMG/camisetamusculosa.jpg"
  },
  {
    id: 3,
    category: "Pantalón deportivo",
    name: "TrackElite Jogger",
    description: "Pantalón jogger con cintura elástica ajustable y bolsillos con cierre. Tela suave y resistente para entrenar o descansar.",
    price: 34990,
    image: "IMG/jogger.jpg"
  },
  {
    id: 4,
    category: "Pantalón deportivo",
    name: "PowerStretch Short",
    description: "Short deportivo de compresión con tecnología anti-rozadura. Perfecto para running, ciclismo o entrenamiento funcional.",
    price: 22990,
    image: "IMG/short.jpg"
  },
  {
    id: 5,
    category: "Accesorio deportivo",
    name: "GripMax Guantes",
    description: "Guantes de entrenamiento con palma de cuero sintético y velcro ajustable. Protegen y mejoran el agarre en pesas y barras.",
    price: 14990,
    image: "IMG/guantes.jpg"
  },
  {
    id: 6,
    category: "Accesorio deportivo",
    name: "HydraRun Botella",
    description: "Botella deportiva 750ml con tapa antigoteo y asa integrada. Doble pared aislante para mantener tu bebida fría hasta 12 horas.",
    price: 12990,
    image: "IMG/botella.jpg"
  }
];

/* Clave usada para guardar y leer el carrito en sessionStorage */
const CART_KEY = "sportyStyle_cart";


/* ================================================================
   2. GESTIÓN DEL CARRITO CON SESSIONSTORAGE
   Todas las funciones que leen o escriben el carrito
   pasan por sessionStorage para que los datos persistan
   mientras la pestaña/sesión esté activa.
================================================================ */

/**
 * Lee el carrito desde sessionStorage.
 * Si no existe aún, retorna un array vacío.
 * @returns {Array} Array de objetos { id, name, price, quantity }
 */
function getCart() {
  const raw = sessionStorage.getItem(CART_KEY);
  // JSON.parse convierte el string guardado de vuelta a array
  return raw ? JSON.parse(raw) : [];
}

/**
 * Guarda el carrito en sessionStorage.
 * JSON.stringify convierte el array a string para poder guardarlo.
 * @param {Array} cart - El array del carrito a guardar
 */
function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Limpia completamente el carrito del sessionStorage.
 * Se llama al cerrar sesión o al finalizar la compra.
 */
function clearCart() {
  sessionStorage.removeItem(CART_KEY);
}

/**
 * Agrega un producto al carrito.
 * Si el producto ya existe, incrementa su cantidad en 1.
 * Si es nuevo, lo agrega con cantidad 1.
 * @param {number} productId - El id del producto a agregar
 */
function addToCart(productId) {
  // Busca el producto en el array de datos
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Lee el carrito actual
  const cart = getCart();

  // Verifica si el producto ya está en el carrito
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex >= 0) {
    // Ya existe: solo aumentamos la cantidad
    cart[existingIndex].quantity += 1;
  } else {
    // Es nuevo: lo agregamos con los datos necesarios
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      quantity: 1
    });
  }

  // Guarda el carrito actualizado en sessionStorage
  saveCart(cart);

  // Actualiza la vista del carrito y el badge
  renderCart();
  updateCartBadge();
}

/**
 * Cambia la cantidad de un producto en el carrito.
 * Si la cantidad llega a 0, elimina el producto.
 * @param {number} productId - Id del producto
 * @param {number} delta - Cuánto sumar (1) o restar (-1)
 */
function changeQuantity(productId, delta) {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === productId);
  if (index < 0) return;

  cart[index].quantity += delta;

  if (cart[index].quantity <= 0) {
    // Si llega a 0, eliminamos el item del array
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
  updateCartBadge();
}

/**
 * Calcula el total acumulado de todos los productos en el carrito.
 * @returns {number} Total en pesos
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Retorna el número total de unidades en el carrito
 * (suma de todas las cantidades).
 * @returns {number}
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Formatea un número como precio en pesos chilenos.
 * Ejemplo: 24990 → "$24.990"
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
  return "$" + amount.toLocaleString("es-CL");
}


/* ================================================================
   3. RENDERIZADO DEL CATÁLOGO DE PRODUCTOS
   Genera dinámicamente las tarjetas HTML de cada producto
   y las inserta en el grid del HTML.
================================================================ */

/**
 * Genera y renderiza todas las tarjetas de producto en el grid.
 * Se llama una sola vez al iniciar la aplicación.
 */
function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  // Limpia el contenedor antes de insertar
  grid.innerHTML = "";

  PRODUCTS.forEach(product => {
    // Crea el elemento <li> de la tarjeta
    const card = document.createElement("article");
    card.className = "product-card";

    // Construye el HTML interno de la tarjeta
    card.innerHTML = `
      <div class="product-img-wrap">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x300/181818/aaff00?text=SportyStyle'"
        />
      </div>
      <div class="product-body">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button
            class="btn-add"
            id="btn-add-${product.id}"
            onclick="handleAddToCart(${product.id})"
          >
            + Agregar
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/**
 * Maneja el clic en "Agregar al carrito":
 * agrega el producto y muestra feedback visual en el botón.
 * @param {number} productId
 */
function handleAddToCart(productId) {
  addToCart(productId);

  // Feedback visual: cambia el texto del botón brevemente
  const btn = document.getElementById(`btn-add-${productId}`);
  if (btn) {
    const original = btn.textContent;
    btn.textContent = "✓ Agregado";
    btn.classList.add("added");
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("added");
      btn.disabled = false;
    }, 1200);
  }
}


/* ================================================================
   4. RENDERIZADO DEL PANEL DEL CARRITO
   Genera la lista de items dentro del panel lateral
   y actualiza el total y el badge del header.
================================================================ */

/**
 * Renderiza todos los items del carrito en el panel lateral.
 * Se llama cada vez que el carrito cambia.
 */
function renderCart() {
  const cartList  = document.getElementById("cart-items");
  const totalEl   = document.getElementById("cart-total");
  const btnCheckout = document.getElementById("btn-checkout");
  if (!cartList) return;

  const cart = getCart();

  // Si el carrito está vacío, muestra un mensaje
  if (cart.length === 0) {
    cartList.innerHTML = `
      <li class="cart-empty-msg">
        Tu carrito está vacío 🛍️<br>
        <small>Agrega productos desde el catálogo</small>
      </li>
    `;
    if (btnCheckout) btnCheckout.disabled = true;
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }

  // Hay productos: los renderizamos
  if (btnCheckout) btnCheckout.disabled = false;

  cartList.innerHTML = "";

  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "cart-item";

    li.innerHTML = `
      <span class="cart-item-name">${item.name}</span>
      <div class="cart-item-row">
        <span>${formatPrice(item.price)} c/u</span>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
        <span class="cart-item-subtotal">${formatPrice(item.price * item.quantity)}</span>
      </div>
    `;

    cartList.appendChild(li);
  });

  // Actualiza el total al pie del carrito
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

/**
 * Actualiza el número (badge) que aparece sobre el botón del carrito.
 */
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = getCartCount();
}

/**
 * Muestra u oculta el panel lateral del carrito y el overlay.
 */
function toggleCart() {
  const panel   = document.getElementById("cart-panel");
  const overlay = document.getElementById("cart-overlay");
  if (!panel || !overlay) return;

  const isHidden = panel.classList.contains("hidden");

  if (isHidden) {
    // Abrimos el panel y renderizamos el carrito actualizado
    panel.classList.remove("hidden");
    overlay.classList.remove("hidden");
    renderCart();
  } else {
    // Cerramos el panel
    panel.classList.add("hidden");
    overlay.classList.add("hidden");
  }
}


/* ================================================================
   5. NAVEGACIÓN ENTRE SECCIONES
   La aplicación tiene 3 "vistas" principales:
   - Catálogo (por defecto)
   - Checkout (formulario)
   - Confirmación
   Solo una vista está visible a la vez.
================================================================ */

/** Muestra el catálogo y oculta las demás secciones */
function showCatalog() {
  document.getElementById("catalogo").classList.remove("hidden");
  document.querySelector(".hero").classList.remove("hidden");
  document.getElementById("checkout-section").classList.add("hidden");
  document.getElementById("confirmation-section").classList.add("hidden");
}

/** Muestra el formulario de checkout y oculta el catálogo */
function showCheckout() {
  document.getElementById("catalogo").classList.add("hidden");
  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("checkout-section").classList.remove("hidden");
  document.getElementById("confirmation-section").classList.add("hidden");

  // Cierra el carrito si estaba abierto
  document.getElementById("cart-panel").classList.add("hidden");
  document.getElementById("cart-overlay").classList.add("hidden");

  // Rellena el resumen del pedido en el formulario
  renderOrderSummary();

  // Hace scroll al inicio de la página
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Muestra la pantalla de confirmación */
function showConfirmation() {
  document.getElementById("checkout-section").classList.add("hidden");
  document.getElementById("confirmation-section").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Va a la sección de checkout.
 * Valida que el usuario esté autenticado antes de continuar.
 */
function goToCheckout() {
  // Verifica que haya productos en el carrito
  if (getCart().length === 0) {
    alert("Tu carrito está vacío. Agrega productos primero.");
    return;
  }

  // Verifica autenticación (la variable isAuth la maneja Auth0 en la Parte 4)
  if (!isAuthenticated) {
    alert("Debes iniciar sesión para continuar con la compra.");
    return;
  }

  showCheckout();
}

/** Vuelve al catálogo desde el checkout */
function backToCatalog() {
  showCatalog();
}

/**
 * Reinicia la aplicación: vuelve al catálogo y limpia el carrito.
 * Se llama desde el botón "Volver al inicio" de la confirmación.
 */
function resetApp() {
  clearCart();
  updateCartBadge();
  showCatalog();
  // Reinicia el formulario
  document.getElementById("checkout-form").reset();
}


/* ================================================================
   6. RESUMEN DEL PEDIDO EN EL CHECKOUT
================================================================ */

/**
 * Genera el HTML del resumen del pedido dentro del formulario.
 * Muestra cada producto, su cantidad y el total.
 */
function renderOrderSummary() {
  const container = document.getElementById("order-summary");
  if (!container) return;

  const cart = getCart();
  let itemsHTML = "";

  cart.forEach(item => {
    itemsHTML += `
      <div class="summary-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <h4>📋 Resumen del pedido</h4>
    ${itemsHTML}
    <div class="summary-total">
      <span>Total</span>
      <span class="total-amount">${formatPrice(getCartTotal())}</span>
    </div>
  `;
}


/* ================================================================
   7. FORMULARIO DE CHECKOUT — VALIDACIONES Y ENVÍO
================================================================ */

/**
 * Valida que un email tenga formato correcto:
 * debe contener "@" y un dominio (algo después del punto).
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  // Expresión regular básica: texto@texto.texto
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Valida que un teléfono contenga solo dígitos
 * y tenga entre 8 y 15 caracteres.
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const re = /^\d{8,15}$/;
  return re.test(phone.trim());
}

/**
 * Muestra un mensaje de error bajo un campo del formulario.
 * @param {string} fieldId - Id del input
 * @param {string} message - Mensaje de error a mostrar
 */
function showFieldError(fieldId, message) {
  const input    = document.getElementById(fieldId);
  const errorEl  = document.getElementById(`error-${fieldId}`);

  if (input)   input.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}

/**
 * Limpia el error visual de un campo.
 * @param {string} fieldId - Id del input
 */
function clearFieldError(fieldId) {
  const input   = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);

  if (input)   input.classList.remove("input-error");
  if (errorEl) errorEl.textContent = "";
}

/**
 * Valida todos los campos del formulario.
 * Retorna true si todo es válido, false si hay algún error.
 * @returns {boolean}
 */
function validateForm() {
  // Limpia errores previos
  ["full-name", "address", "email", "phone"].forEach(clearFieldError);

  let valid = true;

  const name    = document.getElementById("full-name").value;
  const address = document.getElementById("address").value;
  const email   = document.getElementById("email").value;
  const phone   = document.getElementById("phone").value;

  // Validación: nombre completo (obligatorio, mínimo 3 caracteres)
  if (name.trim().length < 3) {
    showFieldError("full-name", "Ingresa tu nombre completo (mínimo 3 caracteres).");
    valid = false;
  }

  // Validación: dirección (obligatoria)
  if (address.trim().length < 5) {
    showFieldError("address", "Ingresa una dirección válida.");
    valid = false;
  }

  // Validación: email con formato correcto
  if (!isValidEmail(email)) {
    showFieldError("email", "Ingresa un correo válido (ej: usuario@gmail.com).");
    valid = false;
  }

  // Validación: teléfono solo números, 8-15 dígitos
  if (!isValidPhone(phone)) {
    showFieldError("phone", "El teléfono debe contener solo números (8 a 15 dígitos).");
    valid = false;
  }

  return valid;
}

/**
 * Maneja el envío del formulario de checkout.
 * Si todo es válido, muestra la confirmación y limpia el carrito.
 */
function handleFormSubmit(event) {
  // Evita que el navegador recargue la página (comportamiento por defecto del form)
  event.preventDefault();

  // Si la validación falla, se detiene aquí
  if (!validateForm()) return;

  // Obtiene los datos del formulario para mostrarlos en la confirmación
  const clientName = document.getElementById("full-name").value.trim();
  const cart       = getCart();
  const total      = getCartTotal();

  // Muestra la pantalla de confirmación con los datos
  renderConfirmation(clientName, cart, total);
  showConfirmation();

  // Limpia el carrito de sessionStorage y actualiza el badge
  clearCart();
  updateCartBadge();
}

// Adjunta el listener al formulario cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");
  if (form) form.addEventListener("submit", handleFormSubmit);
});

// Limpia el error de un campo cuando el usuario empieza a escribir en él
["full-name", "address", "email", "phone"].forEach(fieldId => {
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener("input", () => clearFieldError(fieldId));
    }
  });
});

// El campo teléfono solo acepta números: filtra cualquier caracter no numérico
document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      // Reemplaza todo lo que no sea dígito
      phoneInput.value = phoneInput.value.replace(/\D/g, "");
    });
  }
});


/* ================================================================
   8. PANTALLA DE CONFIRMACIÓN
================================================================ */

/**
 * Genera el HTML del detalle del pedido en la pantalla de confirmación.
 * @param {string} clientName - Nombre del cliente
 * @param {Array}  cart       - Array de productos comprados
 * @param {number} total      - Total de la compra
 */
function renderConfirmation(clientName, cart, total) {
  const container = document.getElementById("confirmation-detail");
  if (!container) return;

  let itemsHTML = "";

  cart.forEach(item => {
    itemsHTML += `
      <div class="conf-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <p class="conf-client">Pedido de: <strong>${clientName}</strong></p>
    <h4>🛍️ Productos comprados</h4>
    ${itemsHTML}
    <div class="conf-total">
      <span>Total pagado</span>
      <span class="total-big">${formatPrice(total)}</span>
    </div>
  `;
}


/* ================================================================
   9. AUTENTICACIÓN CON AUTH0
   Variable de estado y funciones de login/logout.
   La inicialización del cliente Auth0 ocurre en initAuth0().

   IMPORTANTE: Debes reemplazar los valores de
   AUTH0_DOMAIN y AUTH0_CLIENT_ID con los de tu aplicación
   registrada en el dashboard de Auth0.
================================================================ */

/* Cliente Auth0 (se inicializa en initAuth0) */
let auth0Client = null;

/* Estado de autenticación (true si hay sesión activa) */
let isAuthenticated = false;

/* Configuración de tu aplicación en Auth0 */
const AUTH0_CONFIG = {
   // Ejemplo: "dev-abc123.us.auth0.com"
  domain: "dev-ycksqelgq6vbaqyp.us.auth0.com",

  // Ejemplo: "abc123XYZ..."
  clientId: "7VvZHBqk2pKWvBj9XarJuNpIqbT4Ey4u",

  // URL de retorno después del login (debe coincidir con la
  // "Allowed Callback URL" configurada en el dashboard de Auth0)
  authorizationParams: {
    redirect_uri: window.location.origin + window.location.pathname
  }
};

/**
 * Inicializa el cliente Auth0 y verifica si hay
 * una sesión activa o si el usuario acaba de regresar
 * de la página de login (callback).
 */
async function initAuth0() {
  try {
    // Crea el cliente usando la configuración definida arriba
    auth0Client = await auth0.createAuth0Client(AUTH0_CONFIG);

    // Verifica si la URL actual contiene el código de callback
    // que Auth0 envía después de un login exitoso
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      // Procesa el callback: intercambia el código por tokens
      await auth0Client.handleRedirectCallback();

      // Limpia los parámetros de la URL sin recargar la página
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Verifica si el usuario está autenticado en esta sesión
    isAuthenticated = await auth0Client.isAuthenticated();

    // Actualiza la interfaz según el estado de autenticación
    await updateAuthUI();

    // Renderiza los productos (siempre disponibles, autenticado o no)
    renderProducts();

    // Actualiza el badge del carrito con los datos de sessionStorage
    updateCartBadge();

  } catch (error) {
    console.error("Error al inicializar Auth0:", error);
    // Aunque falle Auth0, renderizamos el catálogo igual
    renderProducts();
    updateCartBadge();
  }
}

/**
 * Actualiza la interfaz de usuario según el estado de autenticación.
 * Muestra/oculta los botones de login/logout y el mensaje de bienvenida.
 */
async function updateAuthUI() {
  const btnLogin    = document.getElementById("btn-login");
  const btnLogout   = document.getElementById("btn-logout");
  const welcomeMsg  = document.getElementById("welcome-msg");
  const userNameEl  = document.getElementById("user-name");

  if (isAuthenticated && auth0Client) {
    // Obtiene el perfil del usuario desde Auth0
    const user = await auth0Client.getUser();

    // Muestra el mensaje de bienvenida con el nombre del usuario
    // Auth0 provee: user.name, user.email, user.picture, etc.
    if (userNameEl) userNameEl.textContent = user.name || user.email;
    if (welcomeMsg) welcomeMsg.classList.remove("hidden");

    // Oculta el botón de login, muestra el de logout
    if (btnLogin)  btnLogin.classList.add("hidden");
    if (btnLogout) btnLogout.classList.remove("hidden");

  } else {
    // Usuario NO autenticado
    if (welcomeMsg) welcomeMsg.classList.add("hidden");
    if (btnLogin)   btnLogin.classList.remove("hidden");
    if (btnLogout)  btnLogout.classList.add("hidden");
  }
}

/**
 * Redirige al usuario a la página de login de Auth0.
 * Auth0 maneja toda la autenticación y retorna al callback URL.
 */
async function handleLogin() {
  if (!auth0Client) {
    alert("Auth0 no está configurado. Revisa AUTH0_DOMAIN y AUTH0_CLIENT_ID en app.js");
    return;
  }
  await auth0Client.loginWithRedirect();
}

/**
 * Cierra la sesión del usuario:
 * 1. Limpia el carrito de sessionStorage
 * 2. Llama al logout de Auth0 (invalida la sesión en el servidor)
 * 3. Redirige al inicio de la aplicación
 */
async function handleLogout() {
  if (!auth0Client) return;

  // Limpia el carrito al cerrar sesión (req. del enunciado)
  clearCart();
  updateCartBadge();

  // Auth0 cierra la sesión y redirige al origin de la app
  await auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin + window.location.pathname
    }
  });
}


/* ================================================================
   INICIALIZACIÓN DE LA APLICACIÓN
   Se ejecuta cuando el DOM está completamente cargado.
================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Inicia Auth0 y luego renderiza la aplicación
  initAuth0();
});
