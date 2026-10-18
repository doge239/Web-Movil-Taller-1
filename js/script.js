
/* ============================================================
   AirCapots One · script.js
   Cada parte del equipo trabaja SOLO dentro de su bloque.
   Las funciones se llaman desde init(); no cambiar sus nombres.
   ============================================================ */
"use strict";

/* ---------- UTILIDADES COMPARTIDAS (no editar sin avisar) ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const rand  = (min, max) => Math.random() * (max - min) + min;
const setVar = (name, value, el = document.documentElement) => el.style.setProperty(name, value);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(pointer: coarse)").matches;

/* Estado global del usuario: lo actualiza este bloque y lo leen todas las partes */
const state = { scrollY: 0, mouseX: innerWidth / 2, mouseY: innerHeight / 2, width: innerWidth, height: innerHeight };
addEventListener("scroll", () => { state.scrollY = scrollY; }, { passive: true });
addEventListener("pointermove", (e) => { state.mouseX = e.clientX; state.mouseY = e.clientY; }, { passive: true });
addEventListener("resize", () => { state.width = innerWidth; state.height = innerHeight; });

/* Bucle único de animación: registra tu función con onFrame((dt, t) => {...}) */
const frameCallbacks = [];
const onFrame = (fn) => frameCallbacks.push(fn);
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  frameCallbacks.forEach((fn) => fn(dt, now / 1000));
  requestAnimationFrame(loop);
}

/* ---------- PARTE 1 · Base (hecha) ---------- */
function initNav() {
  const toggle = $(".nav-toggle");
  const menu = $("#menu");
  toggle.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", String(menu.classList.toggle("is-open")));
  });
  $$("#menu a").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }));
}

/* Cambio de color funcional (sin animación). La Parte 3 le agrega la transición. */
function initColorPicker() {
  const img = $("#color-img");
  const label = $("#color-name");
  const swatches = $$(".swatch");
  let token = 0;
  swatches.forEach((s) => { new Image().src = s.dataset.src; }); // precarga
  swatches.forEach((s) => s.addEventListener("click", () => {
    swatches.forEach((o) => o.setAttribute("aria-pressed", String(o === s)));
    const swap = () => {
      img.src = s.dataset.src;
      img.alt = `AirCapots One en ${s.dataset.name.toLowerCase()}`;
      label.textContent = s.dataset.name;
    };
    setVar("--accent", getComputedStyle(s).getPropertyValue("--c")); // tiñe el fondo
    //if (s.getAttribute("aria-pressed") === "true") return;
    if (reducedMotion) { swap(); return; } //Desactiva la animación si el usuario pidió movimiento reducido
    const mine = ++token;

    //1) Fade-out
    img.classList.add("is-fading");
    label.classList.add("is-fading");

    //2) Al terminar el Fade-out, se cambia la imagen y se hace Fade-in
    setTimeout(() => {
      if (mine !== token) return;
      swap();
      const show = () => {
        if (mine !== token) return;
        img.classList.remove("is-fading");
        label.classList.remove("is-fading");
      };
      img.decode().then(show, show); //Espera a que la nueva imagen esté lista para evitar parpadeos
    }, 150);
  }));
}

/* ============================================================
   PARTE 2 · FONDO + ANIMACIÓN PROPIA
   ============================================================ */

/* ---------- ANIMACIÓN 1: FONDO ---------- */

function initBackground() {

  const blobL = $(".bg__blob--l");
  const blobR = $(".bg__blob--r");

  // Verificar elementos y respetar movimiento reducido.
  if (!blobL || !blobR || reducedMotion) return;

  onFrame((dt, t) => {

    // Movimiento suave del fondo izquierdo.
    const xL = Math.sin(t * 0.25) * 40;
    const yL = Math.cos(t * 0.20) * 30;

    const scaleL =
      1 + Math.sin(t * 0.18) * 0.08;

    const opacityL =
      0.20 + Math.sin(t * 0.22) * 0.06;

    blobL.style.transform =
      `translate3d(${xL}px, ${yL}px, 0) scale(${scaleL})`;

    blobL.style.opacity = opacityL.toFixed(3);


    // Movimiento independiente del fondo derecho.
    const xR = Math.cos(t * 0.22) * 40;
    const yR = Math.sin(t * 0.18) * 30;

    const scaleR =
      1 + Math.cos(t * 0.16) * 0.08;

    const opacityR =
      0.20 + Math.cos(t * 0.20) * 0.06;

    blobR.style.transform =
      `translate3d(${xR}px, ${yR}px, 0) scale(${scaleR})`;

    blobR.style.opacity = opacityR.toFixed(3);

  });
}


/* ---------- ANIMACIÓN 2: PRODUCTO CON SCROLL ---------- */

function initScrollProduct() {

  const product = $("#product");
  const hero = $(".hero");

  if (!product || !hero) return;

  // Desactivar animación si el usuario lo solicita.
  if (reducedMotion) {
    setVar("--py", "0px", product);
    setVar("--rot", "0deg", product);
    return;
  }

  // Valores interpolados del producto.
  let currentY = 0;
  let currentRot = 0;

  // Posición y recorrido disponible.
  let heroStart = 0;
  let scrollRange = 1;
  let maxY = 0;

  function calculateLimits() {

    const heroRect = hero.getBoundingClientRect();

    heroStart = heroRect.top + window.scrollY;

    // Usamos el 65 % de la altura del hero.
    // Así el movimiento termina antes.
    scrollRange = Math.max(
      1,
      hero.offsetHeight * 0.65
    );

    // Distancia máxima deseada: 25px.
    // Se reduce automáticamente si no hay espacio.
    const stage = product.closest(".stage");

    if (stage) {

      const heroBottom =
        hero.getBoundingClientRect().bottom + window.scrollY;

      const productBottom =
        product.getBoundingClientRect().bottom +
        window.scrollY -
        currentY;

      // Reservamos 24px de seguridad.
      const availableSpace = Math.max(
        0,
        heroBottom - productBottom - 24
      );

      // Nunca superar el espacio disponible.
      maxY = Math.min(25, availableSpace);

    } else {
      maxY = 0;
    }
  }

  calculateLimits();

  // Actualizar límites cuando cambie la pantalla.
  addEventListener("resize", calculateLimits);

  // Recalcular cuando carguen las imágenes.
  addEventListener("load", calculateLimits);

  onFrame((dt) => {

    // Progreso limitado entre 0 y 1.
    const p = clamp(
      (state.scrollY - heroStart) / scrollRange,
      0,
      1
    );

    // Fórmula de suavizado Smoothstep.
    const smooth =
      p * p * (3 - 2 * p);

    // Desplazamiento vertical limitado.
    const targetY =
      maxY * smooth;

    // Rotación máxima de 5 grados.
    const targetRot =
      5 * Math.sin((Math.PI * p) / 2);

    // Factor de interpolación independiente de FPS.
    const smoothing =
      1 - Math.exp(-8 * dt);

    currentY = lerp(
      currentY,
      targetY,
      smoothing
    );

    currentRot = lerp(
      currentRot,
      targetRot,
      smoothing
    );

    // Aplicar exclusivamente al producto del hero.
    setVar(
      "--py",
      `${currentY.toFixed(2)}px`,
      product
    );

    setVar(
      "--rot",
      `${currentRot.toFixed(2)}deg`,
      product
    );

  });
}


/* ---------- PARTE 3 · Eventos, scroll y entrada ---------- */

//Glow del cursor: circulo que sigue al mouse con retraso
function initCursorGlow() {
  const glow = $("#cursor-glow");
  if (!glow || isTouch || reducedMotion) return;

  // Posición actual del halo (parte donde está el mouse).
  let x = state.mouseX;
  let y = state.mouseY;

  // Aparece con el primer movimiento y se oculta al salir de la ventana.
  addEventListener("pointermove", () => glow.classList.add("is-active"), { passive: true });
  document.documentElement.addEventListener("mouseleave", () => glow.classList.remove("is-active"));

  onFrame((dt) => {
    // Factor de suavizado independiente. Mientras mayor el número, más rápido alcanza al mouse.
    const k = 1 - Math.exp(-6 * dt);

    // lerp: En cada cuadro, glow recorre k de la distancia que lo separa del mouse.
    x = lerp(x, state.mouseX, k);
    y = lerp(y, state.mouseY, k);

    glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });
}

//Product tilt: el audífono se inclina hacia el mouse (o el dedo)
function initProductTilt() {
  const product = $("#product");

  if (!product || reducedMotion) return;

  const MAX_TILT = 12;   // inclinación máxima en grados
  let tiltX = 0;         // valores actuales
  let tiltY = 0;

  // Solo se inclina si hay un puntero activo
  // Mouse: siempre que esté dentro de la ventana. Touch: solo mientras se arrastra sobre el producto.
  let tracking = false;

  addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") tracking = true;
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => { tracking = false; });

  product.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") tracking = true;
  });

  const release = (e) => { if (e.pointerType !== "mouse") tracking = false; };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);

  onFrame((dt) => {
    let targetX = 0;
    let targetY = 0;

    if (tracking) {
      // Posición del puntero respecto al centro del producto, normalizada entre -1 y 1.
      const r = product.getBoundingClientRect();
      const dx = (state.mouseX - (r.left + r.width / 2)) / (state.width / 2);
      const dy = (state.mouseY - (r.top + r.height / 2)) / (state.height / 2);

      // Puntero a la derecha: gira en Y. Puntero arriba: gira en X.
      targetY = clamp(dx, -1, 1) * MAX_TILT;
      targetX = -clamp(dy, -1, 1) * MAX_TILT;
    }
    // Si no hay puntero, los objetivos son 0 y el producto vuelve solo a su posición.

    const k = 1 - Math.exp(-8 * dt);
    tiltX = lerp(tiltX, targetX, k);
    tiltY = lerp(tiltY, targetY, k);

    // Se escribe solo sobre #product (no sobre :root), así no afecta a la imagen de Colores.
    setVar("--tilt-x", `${tiltX.toFixed(2)}deg`, product);
    setVar("--tilt-y", `${tiltY.toFixed(2)}deg`, product);
  });
}

/* Scroll reveal, los bloques aparecen al llegar a la pantalla */
function initScrollReveal() {
  const items = $$("[data-reveal]");

  // Con movimiento reducido o sin IntersectionObserver no se oculta nada
  if (!items.length || reducedMotion || !("IntersectionObserver" in window)) return;

  // Los elementos que comparten contenedor aparecen uno tras otro.
  const grupos = new Map();
  items.forEach((el) => {
    const lista = grupos.get(el.parentElement) || [];
    lista.push(el);
    grupos.set(el.parentElement, lista);
  });
  grupos.forEach((lista) => {
    lista.forEach((el, i) => el.style.setProperty("--reveal-delay", `${i * 120}ms`));
  });

  document.body.classList.add("reveal-ready");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;

      // Revela si entra en pantalla o si ya quedó por encima
      if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;

      el.classList.add("is-visible");
      observer.unobserve(el);   // solo se anima una vez

      // Al terminar la animación se quita el atributo
      el.addEventListener("transitionend", (e) => {
        if (e.propertyName === "transform") {
          el.removeAttribute("data-reveal");
          el.style.removeProperty("--reveal-delay");
        }
      });
    });
  }, {
    threshold: 0.15,                 // basta con ver un 15% del elemento
    rootMargin: "0px 0px -8% 0px",   // y que haya pasado un poco del borde inferior
  });

  items.forEach((el) => observer.observe(el));
}

function initIntro() {
  const items = $$("[data-intro]");
  if (!items.length || reducedMotion) return;
  items.forEach((el, i) => el.style.setProperty("--intro-delay", `${100 + i * 120}ms`));

  // Estado inicial y final
  document.body.classList.add("intro-ready");
  void document.body.offsetWidth;   // fuerza el reflow para que arranque la transición
  requestAnimationFrame(() => {
    items.forEach((el) => {
      el.classList.add("is-in");

      // Al terminar se limpia
      el.addEventListener("transitionend", (e) => {
        if (e.propertyName !== "translate") return;
        el.removeAttribute("data-intro");
        el.classList.remove("is-in");
        el.style.removeProperty("--intro-delay");
      });
    });
  });
}

function initCtaClick() {
  const btn = $("#cta-btn");
  if (!btn) return;

  let pulse = null;

  btn.addEventListener("click", () => {
    btn.textContent = "¡Reservado!";

    if (reducedMotion) return; // Reinicia el pulso si se clickea varias veces seguidas
    if (pulse) pulse.cancel(); // Se usa la propiedad scale para no chocar a product-img
    pulse = btn.animate(
      [
        { scale: 1,    boxShadow: "0 10px 24px rgba(26, 26, 29, 0.18), 0 0 0 0 rgba(26, 26, 29, 0.35)" },
        { scale: 0.94, offset: 0.2 },
        { scale: 1.08, offset: 0.5, boxShadow: "0 16px 30px rgba(26, 26, 29, 0.25), 0 0 0 0 rgba(26, 26, 29, 0.25)" },
        { scale: 1,    boxShadow: "0 10px 24px rgba(26, 26, 29, 0.18), 0 0 0 18px rgba(26, 26, 29, 0)" },
      ],
      { duration: 600, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
    );
  });
}

/* ---------- ARRANQUE ---------- */
function init() {
  initNav();
  initColorPicker();
  initBackground();
  initScrollProduct();
  initCursorGlow();
  initProductTilt();
  initScrollReveal();
  initIntro();
  initCtaClick();
  requestAnimationFrame(loop);
}
document.addEventListener("DOMContentLoaded", init);
