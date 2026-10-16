
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
  swatches.forEach((s) => { new Image().src = s.dataset.src; }); // precarga
  swatches.forEach((s) => s.addEventListener("click", () => {
    swatches.forEach((o) => o.setAttribute("aria-pressed", String(o === s)));
    img.src = s.dataset.src;
    img.alt = `AirCapots One en ${s.dataset.name.toLowerCase()}`;
    label.textContent = s.dataset.name;
    setVar("--accent", getComputedStyle(s).getPropertyValue("--c")); // tiñe el fondo
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
    const xL = Math.sin(t * 0.25) * 12;
    const yL = Math.cos(t * 0.20) * 10;

    const scaleL =
      1 + Math.sin(t * 0.18) * 0.035;

    const opacityL =
      0.20 + Math.sin(t * 0.22) * 0.025;

    blobL.style.transform =
      `translate3d(${xL}px, ${yL}px, 0) scale(${scaleL})`;

    blobL.style.opacity = opacityL.toFixed(3);


    // Movimiento independiente del fondo derecho.
    const xR = Math.cos(t * 0.22) * 14;
    const yR = Math.sin(t * 0.18) * 12;

    const scaleR =
      1 + Math.cos(t * 0.16) * 0.04;

    const opacityR =
      0.20 + Math.cos(t * 0.20) * 0.025;

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

    // Rotación máxima de 2 grados.
    const targetRot =
      2 * Math.sin((Math.PI * p) / 2);

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
function initCursorGlow() {
  // TODO: #cursor-glow sigue a state.mouseX / state.mouseY con lerp (desactivar si isTouch).
}
function initProductTilt() {
  // TODO: inclinar #product con --tilt-x / --tilt-y según el mouse (o el touch).
}
function initScrollReveal() {
  // TODO: animar cada [data-reveal] al entrar en pantalla (IntersectionObserver).
}
function initIntro() {
  // TODO: entrada escalonada de los [data-intro] del hero al cargar.
}
function initCtaClick() {
  // TODO: animación al hacer clic en #cta-btn. Además: animar el cambio de color en initColorPicker.
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
