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

/* ---------- PARTE 2 · Fondo + animación propia ---------- */
function initBackground() {
  // TODO: animar .bg__blob--l y .bg__blob--r (deriva suave, escala, opacidad) con onFrame(dt, t).
  // Usar transform; el color ya cambia solo vía --accent. Respetar `reducedMotion`.
}
function initScrollProduct() {
  // TODO (animación propia, 15 % de la nota): con state.scrollY mover/rotar el
  // producto del hero: setVar("--py", ...) y setVar("--rot", ...) sobre #product.
  // Ejemplo de referencia: y = 0.3 * scrollY.  Diseñar su propia fórmula.
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
