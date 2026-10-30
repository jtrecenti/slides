/*
 * Slides interativos da palestra no SIAJUS, com GSAP. Mesmo esquema das aulas:
 * cada passo é um fragmento vazio `<span class="fragment passo" data-passo>`, e
 * o avanço do clicker toca a linha do tempo correspondente. Nada depende de
 * mouse: os controles deslizantes são só um extra.
 *
 * Dados: recursos/dados.js (window.SIAJUS), gerado de
 * lab-dados/jev-anotacao-sentencas.
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const $ = (s, r) => (r || document).querySelector(s);
  function el(tag, attrs, pai) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(n);
    return n;
  }
  function texto(pai, x, y, t, attrs) {
    const n = el("text", Object.assign({ x, y }, attrs || {}), pai);
    n.textContent = t;
    return n;
  }
  const num = (v, c = 0) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c, maximumFractionDigits: c });

  /* Passos: nome -> função que recebe (mostrado) */
  const PASSOS = {};
  const passo = (nome, f) => { PASSOS[nome] = f; };
  function aplicar(frag) {
    const f = PASSOS[frag.dataset.passo];
    if (f) f(frag.classList.contains("visible"));
  }

  /* ---------- sentença vira linha da tabela ------------------------------ */

  const COR_MARCA = "color-mix(in srgb, var(--turquesa) 32%, transparent)";
  ["1", "2", "3", "4"].forEach((i) => {
    passo("s" + i, (on) => {
      const s = $("#s" + i), v = $("#v" + i);
      gsap.to(s, { backgroundColor: on ? COR_MARCA : "rgba(0,0,0,0)", duration: 0.35, overwrite: true });
      if (on) gsap.fromTo(v, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.45, delay: 0.15, overwrite: true });
      else gsap.set(v, { autoAlpha: 0 });
    });
  });

  /* ---------- benchmark: qualidade, tempo e custo ------------------------ */

  const MODELOS = [
    { nome: "Gemini 3.8 Flash", acc: 98.8, lat: 2.81, usd: 6.56 },
    { nome: "GPT-5.6 Luna", acc: 96.8, lat: 3.49, usd: 1.64 },
    { nome: "Jev", acc: 96.6, lat: 0.32, usd: 0.25, jev: true },
  ];
  const METRICAS = {
    acc: { titulo: "Acurácia por resposta", max: 100, min: 90, fmt: (v) => `${num(v, 1)}%` },
    lat: { titulo: "Latência mediana por sentença", max: 3.6, min: 0, fmt: (v) => `${num(v, 2)} s` },
    usd: { titulo: "Custo por mil sentenças", max: 6.8, min: 0, fmt: (v) => `US$ ${num(v, 2)}` },
  };
  let mostraBench = () => {};
  function desenharBench() {
    const caixa = $("#g-bench");
    if (!caixa) return;
    const W = 1140, H = 400, x0 = 270, xMax = 960, alt = 74, y0 = 74, gap = 34;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-svg" }, caixa);
    const tit = texto(svg, 0, 36, "", { class: "bar-titulo" });
    const barras = MODELOS.map((m, i) => {
      const y = y0 + i * (alt + gap);
      texto(svg, x0 - 18, y + alt / 2 + 9, m.nome, { class: "bar-nome", "text-anchor": "end" });
      const r = el("rect", { x: x0, y, width: 0, height: alt, rx: 5, class: "bar" + (m.jev ? " jev" : "") }, svg);
      const t = texto(svg, x0 + 14, y + alt / 2 + 10, "", { class: "bar-val" });
      return { m, r, t };
    });
    mostraBench = (k) => {
      const M = METRICAS[k];
      tit.textContent = M.titulo;
      for (const b of barras) {
        const larg = ((b.m[k] - M.min) / (M.max - M.min)) * (xMax - x0);
        const prox = { v: 0 };
        gsap.to(b.r, { attr: { width: larg }, duration: 0.7, ease: "power2.out", overwrite: true });
        gsap.to(b.t, { attr: { x: x0 + larg + 14 }, duration: 0.7, ease: "power2.out", overwrite: true });
        gsap.fromTo(prox, { v: b.m[k] * 0.6 }, { v: b.m[k], duration: 0.7, overwrite: true, onUpdate: () => { b.t.textContent = M.fmt(prox.v); } });
      }
    };
    mostraBench("acc");
    passo("b-lat", (on) => { if (on) mostraBench("lat"); else mostraBench("acc"); });
    passo("b-custo", (on) => { if (on) mostraBench("usd"); else if ($('[data-passo="b-lat"]').classList.contains("visible")) mostraBench("lat"); });
  }

  /* ---------- confiança: cobertura contra acurácia ----------------------- */

  function desenharConf() {
    const caixa = $("#g-conf");
    if (!caixa || !window.SIAJUS) return;
    const C = window.SIAJUS.curva;
    const m = { W: 700, H: 430, l: 74, r: 24, t: 20, b: 66 };
    const sx = (c) => m.l + ((c - 0.4) / 0.6) * (m.W - m.l - m.r);
    const sy = (a) => m.H - m.b - ((a - 0.95) / 0.05) * (m.H - m.t - m.b);
    const svg = el("svg", { viewBox: `0 0 ${m.W} ${m.H}`, class: "grafico-svg" }, caixa);
    for (const a of [0.95, 0.96, 0.97, 0.98, 0.99, 1]) {
      el("line", { x1: m.l, x2: m.W - m.r, y1: sy(a), y2: sy(a), class: "grade-linha" }, svg);
      texto(svg, m.l - 10, sy(a) + 6, `${num(a * 100)}%`, { "text-anchor": "end", class: "rotulo-eixo" });
    }
    for (const c of [0.4, 0.6, 0.8, 1]) {
      texto(svg, sx(c), m.H - m.b + 26, `${num(c * 100)}%`, { "text-anchor": "middle", class: "rotulo-eixo" });
    }
    texto(svg, (m.l + m.W - m.r) / 2, m.H - 12, "respostas que o Jev decide sozinho", { "text-anchor": "middle", class: "titulo-eixo" });
    const yg = sy(0.988);
    el("line", { x1: m.l, x2: m.W - m.r, y1: yg, y2: yg, class: "ref" }, svg);
    texto(svg, m.l + 8, yg - 8, "Gemini respondendo tudo: 98,8%", { class: "rotulo-eixo" });
    const pts = C.filter((p) => p[1] >= 0.4 && p[2] >= 0.95);
    el("path", { d: "M" + pts.map((p) => `${sx(p[1]).toFixed(1)},${sy(p[2]).toFixed(1)}`).join("L"), class: "curva" }, svg);
    const ponto = el("circle", { r: 10, cx: sx(C[0][1]), cy: sy(C[0][2]), class: "ponto" }, svg);
    const ctl = $("#conf"), rot = $("#conf-v"), numeros = $("#conf-num");
    const estado = { t: 0 };
    function desenha(t) {
      const p = C[Math.round(t * 100)] || C[C.length - 1];
      rot.textContent = num(t, 2);
      numeros.innerHTML = `<div><b>${num(p[1] * 100, 0)}%</b>decide sozinho</div><div><b>${num(p[2] * 100, 1)}%</b>de acurácia</div>`;
      ponto.setAttribute("cx", sx(Math.max(0.4, p[1])));
      ponto.setAttribute("cy", sy(Math.max(0.95, p[2])));
      ctl.value = t;
    }
    const vai = (t) => gsap.to(estado, { t, duration: 0.9, ease: "power2.inOut", overwrite: true, onUpdate: () => desenha(estado.t) });
    ctl.addEventListener("input", () => { estado.t = +ctl.value; desenha(estado.t); });
    ctl.addEventListener("keydown", (e) => e.stopPropagation());
    desenha(0);
    passo("c80", (on) => vai(on ? 0.8 : 0));
    passo("c95", (on) => vai(on ? 0.95 : 0.8));
  }

  /* ---------- quanto custa o TJSP ---------------------------------------- */

  const ACORDAOS = 16159987;
  function contador(id, usdMil) {
    const n = $(id), alvo = (ACORDAOS / 1000) * usdMil, e = { v: 0 };
    return (on) => gsap.to(e, { v: on ? alvo : 0, duration: 1.1, ease: "power2.out", overwrite: true,
      onUpdate: () => { n.textContent = `US$ ${num(Math.round(e.v / 100) * 100)}`; } });
  }
  passo("cg", contador("#c-gem", 6.56));
  passo("cl", contador("#c-luna", 1.64));
  passo("cj", contador("#c-jev", 0.25));

  /* ---------- fluxo ------------------------------------------------------ */

  passo("fx", (on) => {
    gsap.fromTo("#fluxo .f-caixa", { opacity: on ? 0.25 : 1, y: on ? 12 : 0 },
      { opacity: 1, y: 0, duration: 0.4, stagger: on ? 0.16 : 0, overwrite: true });
  });

  /* ---------- início ----------------------------------------------------- */

  function iniciar() {
    const capa = $(".quarto-title-block"), logo = $("#logo-capa");
    if (capa && logo) capa.prepend(logo);
    if (capa) {
      const ev = document.createElement("p");
      ev.id = "evento-capa";
      ev.textContent = "8º SIAJUS · Insper · 30 de outubro de 2026";
      capa.append(ev);
    }
    desenharBench();
    desenharConf();
    gsap.set("#fluxo .f-caixa", { opacity: 0.25 });
    Reveal.on("fragmentshown", (e) => e.fragments.forEach((f) => f.dataset.passo && aplicar(f)));
    Reveal.on("fragmenthidden", (e) => e.fragments.forEach((f) => f.dataset.passo && aplicar(f)));
  }
  if (window.Reveal && Reveal.isReady && Reveal.isReady()) iniciar();
  else if (window.Reveal) Reveal.on("ready", iniciar);
})();
