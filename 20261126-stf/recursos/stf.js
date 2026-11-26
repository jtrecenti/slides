/*
 * Slides interativos da palestra no STF (Estratégia em movimento), com GSAP. Mesmo esquema das aulas:
 * cada passo é um fragmento vazio `<span class="fragment passo" data-passo>`, e
 * o avanço do clicker toca a animação correspondente.
 *
 * A galeria de aplicações é a exceção: abre no clique ou nas teclas 1 a 7. As
 * cenas dela são ilustrativas e não usam dados reais.
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

  /* ---------- fluxo ------------------------------------------------------ */

  passo("fx", (on) => {
    gsap.fromTo("#fluxo .f-caixa", { opacity: on ? 0.25 : 1, y: on ? 12 : 0 },
      { opacity: 1, y: 0, duration: 0.4, stagger: on ? 0.16 : 0, overwrite: true });
  });

  /* ---------- linha do tempo --------------------------------------------- */

  function linhaDoTempo(raiz, pref) {
    [0, 1, 2, 3, 4].forEach((i) => {
      passo(pref + i, (on) => {
        const item = $(`${raiz} .tl-item[data-i="${i}"]`);
        const fim = on ? i + 0.6 : i - 0.4;
        gsap.to(`${raiz} .tl-trilho`, { scaleX: Math.max(fim / 5, 0), duration: 0.6, ease: "power2.inOut", overwrite: true });
        if (on) {
          gsap.fromTo(item, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.25, overwrite: true });
          gsap.fromTo(item.querySelector(".tl-foto, .tl-cnj"), { scale: 0.3, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.6, delay: 0.25, ease: "back.out(2)" });
        } else gsap.to(item, { autoAlpha: 0, duration: 0.2, overwrite: true });
      });
    });
  }
  linhaDoTempo("#tl", "t");
  linhaDoTempo("#tl-ia", "i");

  /* ---------- quem sou: três cartões e a linha de base -------------------- */

  [0, 1, 2].forEach((i) => {
    passo("q" + i, (on) => {
      const c = $(`.quem-card[data-i="${i}"]`);
      if (on) gsap.fromTo(c, { autoAlpha: 0, y: 40, rotationX: -70 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.7, ease: "back.out(1.6)", overwrite: true });
      else gsap.to(c, { autoAlpha: 0, duration: 0.2, overwrite: true });
      if (i === 2) gsap.to(".quem-linha", { autoAlpha: on ? 1 : 0, x: on ? 0 : -30, duration: 0.5, delay: on ? 0.5 : 0, overwrite: true });
    });
  });

  /* ---------- trilha da disciplina no Insper ------------------------------ */

  const TRILHA = ["Estatística descritiva", "Inferência", "Regressão", "Machine learning",
    "Interpretabilidade", "Fairness e LGPD", "LLMs e texto"];
  function montarTrilha() {
    const caixa = $("#trilha");
    if (!caixa) return;
    const W = 640, H = 430;
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-svg" }, caixa);
    const pts = TRILHA.map((_, i) => [70 + (i % 2) * 300 + (i % 4 === 3 ? 0 : 0), 30 + i * 62]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
    const cam = el("path", { d, class: "trilha-cam" }, s);
    const len = cam.getTotalLength();
    gsap.set(cam, { strokeDasharray: len, strokeDashoffset: len });
    const nos = pts.map((p, i) => {
      const g = el("g", { class: "trilha-no" }, s);
      el("circle", { cx: p[0], cy: p[1], r: 13 }, g);
      texto(g, p[0] + (i % 2 ? -24 : 24), p[1] + 7, TRILHA[i], { "text-anchor": i % 2 ? "end" : "start" });
      return g;
    });
    gsap.set(nos, { autoAlpha: 0, scale: 0.4, transformOrigin: "center" });
    passo("cd", (on) => {
      gsap.to(cam, { strokeDashoffset: on ? 0 : len, duration: on ? 2.2 : 0.3, ease: "none", overwrite: true });
      gsap.to(nos, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.4, duration: 0.35, stagger: on ? 0.3 : 0, ease: "back.out(2)", overwrite: true });
    });
  }

  /* ---------- frentes do LabDados em órbita ------------------------------- */

  const FRENTES = ["Pesquisa e publicações", "Formação", "Escritório de apoio à pesquisa", "Tecnologias", "Institucional e parcerias"];
  function montarFrentes() {
    const caixa = $("#frentes");
    if (!caixa) return;
    const W = 620, H = 460, cx = 310, cy = 230, R = 168;
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-svg" }, caixa);
    const orb = el("circle", { cx, cy, r: R, class: "orbita" }, s);
    const raios = [], nos = [];
    FRENTES.forEach((f, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / FRENTES.length;
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      raios.push(el("line", { x1: cx, y1: cy, x2: x, y2: y, class: "raio" }, s));
      const g = el("g", { class: "frente" }, s);
      el("circle", { cx: x, cy: y, r: 16 }, g);
      const partes = f.split(" ");
      const meio = Math.ceil(partes.length / 2);
      const linhas = partes.length > 2 ? [partes.slice(0, meio).join(" "), partes.slice(meio).join(" ")] : [f];
      const dy = y < cy - 40 ? -30 : 44;
      linhas.forEach((l, k) => texto(g, x, y + dy + k * 24 - (dy < 0 ? (linhas.length - 1) * 24 : 0), l, { "text-anchor": "middle", class: "frente-txt" }));
      nos.push(g);
    });
    const centro = el("g", { class: "centro-lab" }, s);
    el("circle", { cx, cy, r: 64 }, centro);
    texto(centro, cx, cy + 9, "LabDados", { "text-anchor": "middle" });
    gsap.set(orb, { scale: 0, transformOrigin: "50% 50%" });
    gsap.set([...raios, ...nos], { autoAlpha: 0 });
    passo("lf", (on) => {
      gsap.to(orb, { scale: on ? 1 : 0, duration: 0.6, ease: "power2.out", overwrite: true });
      gsap.to(raios, { autoAlpha: on ? 1 : 0, duration: 0.3, stagger: on ? 0.15 : 0, delay: on ? 0.3 : 0, overwrite: true });
      if (on) gsap.fromTo(nos, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.15, delay: 0.4, ease: "back.out(2)", overwrite: true });
      else gsap.to(nos, { autoAlpha: 0, duration: 0.2, overwrite: true });
    });
  }

  /* ---------- máquina de estados guiando o LLM ---------------------------- */

  const FSM_TOK = [["1", 0.14, 1], ["2", 0.10, 1], ["34", 0.08, 1], ["567", 0.12, 0], ["3B", 0.09, 1],
    ["B", 0.11, 1], ["BCE", 0.07, 0], ["C", 0.13, 0], ["dog", 0.16, 0]];
  const FSM_LEG = [
    "Exemplo: um número de 1 a 4 dígitos, seguido ou não de BC. Em expressão regular, <code>[0-9]{1,4}(BC)?</code>",
    "O esquema vira uma expressão regular, e a expressão regular vira uma <b>máquina de estados</b>.",
    "O modelo já gerou <b>19</b> e está no estado 2. Ele dá uma probabilidade para <b>cada token</b> do vocabulário.",
    "A máquina de estados <b>zera</b> os tokens que levariam a um caminho inválido.",
    "As probabilidades restantes são <b>normalizadas</b>, e o próximo token é sorteado entre elas: <b>3B</b>.",
  ];
  function montarFsm() {
    const caixa = $("#g-fsm"), leg = $("#leg-fsm");
    if (!caixa) return;
    const W = 1140, H = 320;
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-svg" }, caixa);
    const defs = el("defs", {}, s);
    [["fsm-ponta", "fsm-ponta"], ["fsm-ponta-ok", "fsm-ponta ok"]].forEach(([id, cl]) => {
      const mk = el("marker", { id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs);
      el("path", { d: "M0 0 L10 5 L0 10 z", class: cl }, mk);
    });
    /* tokens candidatos, à esquerda */
    const ger = texto(s, 0, 26, "", { class: "fsm-ger" });
    const xb = 92, lb = 200;
    const toks = FSM_TOK.map(([t, p, ok], i) => {
      const y = 50 + i * 30;
      const g = el("g", { class: "fsm-tok" }, s);
      const tx = texto(g, 0, y + 19, t, { class: "fsm-tok-t" });
      const b = el("rect", { x: xb, y: y + 4, width: 0, height: 20, rx: 3, class: "fsm-tok-b" }, g);
      const v = texto(g, xb + 8, y + 20, "", { class: "fsm-tok-v" });
      return { t, p, ok, g, tx, b, v };
    });
    const somaOk = FSM_TOK.reduce((a, x) => a + (x[2] ? x[1] : 0), 0);
    /* máquina de estados, à direita */
    const P = [[430, 70], [575, 70], [720, 70], [865, 70], [1010, 70], [940, 250], [1095, 250]];
    const R = 28;
    const arestas = [[0, 1, "0-9"], [1, 2, "0-9"], [2, 3, "0-9"], [3, 4, "0-9"], [1, 5, "B"], [2, 5, "B"], [3, 5, "B"], [4, 5, "B"], [5, 6, "C"]];
    const gA = el("g", {}, s), gE = el("g", {}, s);
    const ars = arestas.map(([a, b, r]) => {
      const [x1, y1] = P[a], [x2, y2] = P[b];
      const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
      const ln = el("line", { x1: x1 + ux * R, y1: y1 + uy * R, x2: x2 - ux * (R + 3), y2: y2 - uy * (R + 3), class: "fsm-ar" }, gA);
      const mx = (x1 + x2) / 2 + (uy === 0 ? 0 : -uy * 18), my = (y1 + y2) / 2 + (uy === 0 ? -12 : ux * 18 + 6);
      const lt = texto(gA, mx, my, r, { "text-anchor": "middle", class: "fsm-lab" });
      const len = d - 2 * R - 3;
      gsap.set(ln, { strokeDasharray: len, strokeDashoffset: len });
      return { a, b, ln, lt, len };
    });
    const ests = P.map(([x, y], i) => {
      const g = el("g", { class: "fsm-est" }, gE);
      el("circle", { cx: x, cy: y, r: R }, g);
      if ([1, 2, 3, 4, 6].includes(i)) el("circle", { cx: x, cy: y, r: R - 6, class: "fsm-aceita" }, g);
      texto(g, x, y + 8, String(i), { "text-anchor": "middle" });
      return g;
    });
    const regua = el("line", { x1: 360, y1: 10, x2: 360, y2: H - 10, class: "fsm-div" }, s);
    const marca = (lista) => ests.forEach((g, i) => g.classList.toggle("atual", lista.includes(i)));
    const legenda = (k) => { if (leg) leg.innerHTML = FSM_LEG[k]; };
    const okDe2 = (x) => (x.a === 2 && (x.b === 3 || x.b === 5));
    gsap.set([...ests, ...ars.map((x) => x.lt)], { autoAlpha: 0 });
    gsap.set([...toks.map((x) => x.g), ger, regua], { autoAlpha: 0 });
    legenda(0);
    const larg = (p) => (p / 0.3) * lb;
    passo("f1", (on) => {
      legenda(on ? 1 : 0);
      if (on) {
        gsap.fromTo(ests, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: "back.out(2)", overwrite: true });
        ars.forEach((x, k) => {
          gsap.to(x.ln, { strokeDashoffset: 0, duration: 0.4, delay: 0.3 + k * 0.1, overwrite: true });
          gsap.to(x.lt, { autoAlpha: 1, duration: 0.3, delay: 0.5 + k * 0.1, overwrite: true });
        });
      } else {
        gsap.to(ests, { autoAlpha: 0, duration: 0.2, overwrite: true });
        ars.forEach((x) => { gsap.set(x.ln, { strokeDashoffset: x.len }); gsap.set(x.lt, { autoAlpha: 0 }); });
      }
    });
    const mostraTok = (fase) => {
      /* fase 0: escondido; 1: todos; 2: inválidos cortados; 3: normalizados e sorteio */
      gsap.to([ger, regua], { autoAlpha: fase ? 1 : 0, duration: 0.3, overwrite: true });
      ger.textContent = fase === 3 ? "Gerado até aqui: 193B" : "Gerado até aqui: 19";
      toks.forEach((x, i) => {
        const corta = fase >= 2 && !x.ok;
        x.g.classList.toggle("ok", fase >= 2 && !!x.ok);
        x.g.classList.toggle("nok", corta);
        x.g.classList.toggle("sorteado", fase === 3 && x.t === "3B");
        const p = corta ? 0 : fase === 3 ? x.p / somaOk : x.p;
        const o = { v: 0 };
        gsap.to(x.g, { autoAlpha: fase ? (corta ? 0.55 : 1) : 0, duration: 0.3, delay: fase === 1 ? i * 0.06 : 0, overwrite: true });
        gsap.to(x.b, { attr: { width: fase ? larg(p) : 0 }, duration: 0.6, delay: fase === 1 ? 0.2 + i * 0.06 : 0, ease: "power2.out", overwrite: true });
        gsap.to(x.v, { attr: { x: xb + (fase ? larg(p) : 0) + 8 }, duration: 0.6, delay: fase === 1 ? 0.2 + i * 0.06 : 0, ease: "power2.out", overwrite: true });
        gsap.fromTo(o, { v: x.p }, { v: p, duration: 0.6, overwrite: true, onUpdate: () => { x.v.textContent = num(o.v, 2); } });
      });
      ars.forEach((x) => x.ln.classList.toggle("ok", fase >= 2 && okDe2(x)));
      if (fase === 3) {
        marca([2]);
        gsap.delayedCall(0.8, () => marca([3]));
        gsap.delayedCall(1.4, () => marca([5]));
      } else marca(fase ? [2] : []);
    };
    passo("f2", (on) => { legenda(on ? 2 : 1); mostraTok(on ? 1 : 0); });
    passo("f3", (on) => { legenda(on ? 3 : 2); mostraTok(on ? 2 : 1); });
    passo("f4", (on) => { legenda(on ? 4 : 3); mostraTok(on ? 3 : 2); });
  }

  /* ---------- classificador da PGE: petição, modelo local, limiar ---------- */

  const PGE_ROT = ["Saúde", "Tributário", "Servidor", "Outros"];
  const PGE_DOCS = [[0.91, 0.05, 0.03, 0.01], [0.46, 0.31, 0.15, 0.08]];
  function montarPge() {
    const caixa = $("#g-pge");
    if (!caixa) return;
    const W = 640, H = 470, x0 = 150, xMax = 540, lim = 0.8;
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-svg" }, caixa);
    const defs = el("defs", {}, s);
    const mk = el("marker", { id: "pge-ponta", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs);
    el("path", { d: "M0 0 L10 5 L0 10 z", class: "pge-ponta" }, mk);
    const borda = el("rect", { x: 6, y: 6, width: W - 12, height: H - 46, rx: 14, class: "pge-borda" }, s);
    const rede = texto(s, 22, H - 12, "dentro da rede da PGE: nada sai para a nuvem", { class: "pge-rede" });
    const doc = el("g", {}, s);
    el("path", { d: "M40 34 h84 l26 26 v120 h-110 z", class: "pge-doc" }, doc);
    const linhas = [0, 1, 2, 3, 4, 5].map((k) => el("line", { x1: 56, y1: 76 + k * 18, x2: 56 + [74, 64, 78, 50, 70, 40][k], y2: 76 + k * 18, class: "pge-lin" }, doc));
    texto(doc, 95, 206, "petição inicial", { "text-anchor": "middle", class: "pge-rot" });
    const s1 = el("line", { x1: 162, y1: 108, x2: 228, y2: 108, class: "pge-seta" }, s);
    const mod = el("g", { class: "pge-mod" }, s);
    el("rect", { x: 236, y: 70, width: 150, height: 76, rx: 10 }, mod);
    texto(mod, 311, 104, "modelo", { "text-anchor": "middle" });
    texto(mod, 311, 130, "local", { "text-anchor": "middle" });
    const s2 = el("line", { x1: 394, y1: 108, x2: 440, y2: 108, class: "pge-seta" }, s);
    const saida = el("g", { class: "pge-saida" }, s);
    el("rect", { x: 448, y: 76, width: 176, height: 64, rx: 8 }, saida);
    const saidaT = texto(saida, 536, 116, "", { "text-anchor": "middle" });
    const yb = 250, alt = 30, gap = 14, larg = xMax - x0;
    const barras = PGE_ROT.map((r, i) => {
      const y = yb + i * (alt + gap);
      texto(s, x0 - 12, y + alt / 2 + 7, r, { "text-anchor": "end", class: "pge-rot" });
      const b = el("rect", { x: x0, y, width: 0, height: alt, rx: 4, class: "pge-bar" + (i === 0 ? " top" : "") }, s);
      const v = texto(s, x0 + 8, y + alt / 2 + 7, "", { class: "pge-val" });
      return { b, v, y };
    });
    const xl = x0 + lim * larg;
    const limL = el("line", { x1: xl, y1: yb - 22, x2: xl, y2: yb + 4 * (alt + gap) - gap + 6, class: "pge-lim" }, s);
    const limT = texto(s, xl, yb - 30, "limiar 0,8", { "text-anchor": "middle", class: "pge-lim-t" });
    const graf = [...barras.map((x) => x.v), limL, limT];
    let atual = -1;
    const mostra = (k) => {
      atual = k;
      const ps = k < 0 ? [0, 0, 0, 0] : PGE_DOCS[k];
      barras.forEach((x, i) => {
        const w = ps[i] * larg, o = { v: 0 };
        gsap.to(x.b, { attr: { width: w }, duration: 0.8, ease: "power2.out", overwrite: true });
        gsap.to(x.v, { attr: { x: x0 + w + 8 }, duration: 0.8, ease: "power2.out", overwrite: true });
        gsap.fromTo(o, { v: ps[i] * 0.5 }, { v: ps[i], duration: 0.8, overwrite: true, onUpdate: () => { x.v.textContent = k < 0 ? "" : num(o.v, 2); } });
      });
      const baixa = k === 1;
      barras[0].b.classList.toggle("baixa", baixa);
      saida.classList.toggle("baixa", baixa);
      saidaT.textContent = k < 0 ? "" : baixa ? "revisão humana" : "Saúde · 0,91";
      gsap.to(graf, { autoAlpha: k < 0 ? 0 : 1, duration: 0.3, overwrite: "auto" });
      if (k >= 0) gsap.fromTo(saida, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.5, delay: 0.6, overwrite: true });
      else gsap.to(saida, { autoAlpha: 0, duration: 0.2, overwrite: true });
    };
    gsap.set([borda, doc, s1, mod, s2, saida, rede, ...graf], { autoAlpha: 0 });
    gsap.set(linhas, { scaleX: 0, transformOrigin: "0% 50%" });
    passo("pg1", (on) => {
      if (on) gsap.fromTo(borda, { autoAlpha: 0, scale: 1.06, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.out", overwrite: true });
      else gsap.to(borda, { autoAlpha: 0, duration: 0.2, overwrite: true });
      gsap.to(rede, { autoAlpha: on ? 1 : 0, duration: 0.4, delay: on ? 0.9 : 0, overwrite: true });
      if (on) {
        gsap.fromTo(doc, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.5, overwrite: true });
        gsap.fromTo(linhas, { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.1, delay: 0.4, overwrite: true });
        gsap.to([s1, mod, s2], { autoAlpha: 1, duration: 0.4, stagger: 0.25, delay: 1, overwrite: true });
        gsap.fromTo(mod, { scale: 0.8, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, delay: 1.25, ease: "back.out(2)" });
      } else gsap.to([doc, s1, mod, s2], { autoAlpha: 0, duration: 0.2, overwrite: true });
    });
    passo("pg2", (on) => mostra(on ? 0 : -1));
    passo("pg3", (on) => {
      if (on) gsap.fromTo(linhas, { scaleX: 0 }, { scaleX: 1, duration: 0.25, stagger: 0.06, overwrite: true });
      mostra(on ? 1 : 0);
    });
  }

  /* ---------- cobertura do juscraper -------------------------------------- */

  const TRIBUNAIS = ["STF", "TSE", "STM", "TRF1", "TRF3", "TRF5", "TRF6", "TJAC", "TJAL", "TJAM", "TJAP", "TJBA", "TJCE",
    "TJDFT", "TJES", "TJGO", "TJMA", "TJMG", "TJMS", "TJMT", "TJPA", "TJPB", "TJPE", "TJPI", "TJPR", "TJRJ", "TJRN",
    "TJRO", "TJRR", "TJRS", "TJSC", "TJSP"];
  const AGREG = ["DataJud", "Jus.br", "Comunica", "PDPJ", "Falcão"];
  function montarMapa() {
    const caixa = $("#mapa-js");
    if (!caixa) return;
    const grade = div("js-grade", {}, null, caixa);
    const tribs = TRIBUNAIS.map((t) => div("js-chip" + (t === "STF" ? " stf" : ""), {}, t, grade));
    const ag = div("js-ag", {}, null, caixa);
    const agrs = AGREG.map((t) => div("js-chip ag", {}, t, ag));
    const cont = div("js-cont", {}, "", caixa);
    const est = { t: 0, a: 0 };
    const conta = () => { cont.innerHTML = `<b>${Math.round(est.t)}</b> tribunais · <b>${Math.round(est.a)}</b> agregadores`; };
    conta();
    gsap.set([...tribs, ...agrs], { autoAlpha: 0.15 });
    passo("js1", (on) => {
      gsap.to(est, { t: on ? 32 : 0, duration: on ? 1.5 : 0.2, ease: "none", overwrite: "auto", onUpdate: conta });
      if (on) {
        gsap.to(tribs, { autoAlpha: 1, duration: 0.25, stagger: { each: 0.045, from: "random" }, overwrite: true });
        gsap.fromTo(tribs[0], { scale: 1 }, { scale: 1.25, duration: 0.3, yoyo: true, repeat: 3, delay: 1.6 });
      } else gsap.to(tribs, { autoAlpha: 0.15, duration: 0.2, overwrite: true });
    });
    passo("js2", (on) => {
      gsap.to(est, { a: on ? 5 : 0, duration: on ? 0.7 : 0.2, ease: "none", overwrite: "auto", onUpdate: conta });
      if (on) gsap.fromTo(agrs, { autoAlpha: 0.15, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12, overwrite: true });
      else gsap.to(agrs, { autoAlpha: 0.15, duration: 0.2, overwrite: true });
    });
  }

  /* ---------- triagem por confiança --------------------------------------- */

  function montarTriagem() {
    const caixa = $("#g-tri");
    if (!caixa) return;
    const W = 1140, H = 300, x0 = 40, x1 = 1100, base = 240, N = 200;
    const sx = (v) => x0 + ((v - 0.3) / 0.7) * (x1 - x0);
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-svg" }, caixa);
    el("line", { x1: x0, x2: x1, y1: base + 14, y2: base + 14, class: "grade-linha" }, s);
    [0.3, 0.5, 0.7, 0.8, 0.9, 1].forEach((v) => texto(s, sx(v), base + 42, num(v, 1), { "text-anchor": "middle", class: "rotulo-eixo" }));
    // pontos determinísticos: 182 acima de 0,8 (91%), 18 abaixo; 1 erro entre os aceitos
    let semente = 7;
    const rnd = () => { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; };
    const vals = [];
    for (let i = 0; i < N; i++) {
      if (i < 18) vals.push(0.32 + rnd() * 0.47);
      else vals.push(0.81 + Math.pow(rnd(), 0.5) * 0.19);
    }
    vals.sort((a, b) => a - b);
    const pilhas = {};
    const pontos = vals.map((v, i) => {
      const b = Math.round(sx(v) / 13);
      pilhas[b] = (pilhas[b] || 0) + 1;
      const x = b * 13, y = base - (pilhas[b] - 1) * 13;
      return el("circle", { cx: x, cy: Math.max(y, 12), r: 5.4, class: "pt-tri" + (v < 0.8 ? " baixo" : "") + (i === 120 ? " erro" : "") }, s);
    });
    const lim = el("line", { x1: sx(0.8), x2: sx(0.8), y1: 0, y2: base + 18, class: "limiar" }, s);
    const tlim = texto(s, sx(0.8) - 10, 22, "limiar 0,8", { "text-anchor": "end", class: "limiar-txt" });
    const tA = texto(s, sx(0.9), 22, "", { "text-anchor": "middle", class: "tri-num ok-c" });
    const tB = texto(s, sx(0.55), 22, "", { "text-anchor": "middle", class: "tri-num rev-c" });
    gsap.set(pontos, { autoAlpha: 0 });
    gsap.set([lim, tlim], { autoAlpha: 0 });
    const legs = document.querySelectorAll(".leg-tri");
    const leg = (k) => legs.forEach((l, i) => gsap.to(l, { autoAlpha: i === k ? 1 : 0, duration: 0.3, overwrite: true }));
    leg(-1);
    passo("c1", (on) => {
      if (on) { gsap.fromTo(pontos, { autoAlpha: 0, attr: { r: 0 } }, { autoAlpha: 1, attr: { r: 5.4 }, duration: 0.3, stagger: 0.008, overwrite: true }); leg(0); }
      else { gsap.to(pontos, { autoAlpha: 0, duration: 0.2, overwrite: true }); leg(-1); }
    });
    passo("c2", (on) => {
      pontos.forEach((p) => p.classList.toggle("on", on));
      if (on) {
        gsap.fromTo(lim, { autoAlpha: 1, attr: { x1: x0, x2: x0 } }, { attr: { x1: sx(0.8), x2: sx(0.8) }, duration: 1.1, ease: "power2.inOut" });
        gsap.to(tlim, { autoAlpha: 1, duration: 0.3, delay: 1 });
        leg(1);
        const o = { a: 0, b: 0 };
        gsap.to(o, { a: 91, b: 9, duration: 1, delay: 1.3, onUpdate: () => { tA.textContent = `${Math.round(o.a)}% aceitas`; tB.textContent = `${Math.round(o.b)}% para revisão`; },
          onComplete: () => leg(2) });
      } else {
        gsap.to([lim, tlim], { autoAlpha: 0, duration: 0.2 });
        tA.textContent = ""; tB.textContent = "";
        leg(0);
      }
    });
  }

  /* ---------- números do Corte Aberta e quadro de 100 --------------------- */

  function montarNumeros() {
    const vs = document.querySelectorAll("#numeros .num-v");
    if (!vs.length) return;
    const fmt = (n, f, v) => (f === "pct" ? `${num(v, 1)}%` : num(Math.round(v)));
    vs.forEach((n) => { n.dataset.alvo = n.textContent; n.textContent = fmt(n, n.dataset.fmt, 0); });
    passo("n1", (on) => vs.forEach((n, i) => {
      const o = { v: on ? 0 : +n.dataset.alvo };
      gsap.to(o, { v: on ? +n.dataset.alvo : 0, duration: on ? 1.6 : 0.2, delay: on ? i * 0.15 : 0, ease: "power2.out",
        onUpdate: () => { n.textContent = fmt(n, n.dataset.fmt, o.v); } });
      if (on) gsap.fromTo(n.parentElement, { y: 18 }, { y: 0, duration: 0.5, delay: i * 0.15 });
    }));
    const caixa = $("#waffle");
    const quads = [];
    for (let i = 0; i < 100; i++) quads.push(div("wf" + (i < 80 ? " mono" : " col"), {}, null, caixa));
    const leg = div("wf-leg", {}, '<span class="wf mono"></span> monocráticas <span class="wf col"></span> colegiadas', caixa.parentElement);
    caixa.parentElement.insertBefore(leg, $("#waffle-leg"));
    gsap.set(quads, { autoAlpha: 0, scale: 0 });
    gsap.set([leg, "#waffle-leg"], { autoAlpha: 0 });
    passo("n2", (on) => {
      if (on) {
        gsap.to(quads, { autoAlpha: 1, scale: 1, duration: 0.25, stagger: { each: 0.012, grid: [10, 10], from: "start" }, ease: "back.out(2)", overwrite: true });
        gsap.to([leg, "#waffle-leg"], { autoAlpha: 1, duration: 0.4, delay: 1.3 });
      } else {
        gsap.to(quads, { autoAlpha: 0, scale: 0, duration: 0.2, overwrite: true });
        gsap.set([leg, "#waffle-leg"], { autoAlpha: 0 });
      }
    });
  }

  /* ---------- granularidade das bases do Corte Aberta --------------------- */

  /* cada base aponta para o seu dicionário de dados (o download em si é por script no portal);
     t = texto que a base traz, segundo o dicionário */
  const DIC = "https://www.stf.jus.br/arquivo/cms/publicacaoBOInternet/anexo/link_download/dados_abertos/ods/dicionario_";
  const GRAN = [
    { nome: "Processo", bases: [["Acervo", "Acervo_Processos"], ["Recebidos", "Recebidos_2026"], ["Baixados", "Baixados_2026"],
      ["Registrados e distribuídos", "Registrados_Distribuidos_2026"], ["Controle concentrado", "Controle%20Concentrado_Processos"],
      ["Reclamações", "Reclamacoes_Processos"], ["Ações COVID-19", "Acoes_Covid_19_Processos"], ["Pautas", "Pauta_Plenario"]] },
    { nome: "Decisão", bases: [["Decisões desde 2000", "Decisoes_2026", "dispositivo"], ["Controle concentrado", "Controle%20Concentrado_Decisoes", "dispositivo"],
      ["Reclamações", "Reclamacoes_Decisoes", "trecho"], ["Ações COVID-19", "Acoes_Covid_19_Decisoes", "trechos"]] },
    { nome: "Parte", bases: [["Partes do acervo", "Acervo_Partes"], ["Partes em reclamações", "Reclamacoes_Partes"],
      ["Legitimados", "Controle%20Concentrado_Legitimados"], ["Amici curiae", "Controle%20Concentrado_Amicus_Curiae"]] },
    { nome: "Tema e tese", bases: [["Repercussão geral", "Repercussao_Geral_Temas", "tese"], ["Suspensão nacional", "Repercussao_Geral_Suspensao_Nacional", "tese"],
      ["Representativos", "Repercussao_Geral_Representativo_da_Controversia", "tese"], ["Informação à sociedade", "Informacao_a_Sociedade", "resumo"],
      ["Omissão inconstitucional", "Omissao_Inconstitucional", "ementa"]] },
  ];
  function montarGran() {
    const caixa = $("#gran");
    if (!caixa) return;
    const etiquetas = [];
    const cols = GRAN.map((g) => {
      const c = div("gr-col", {}, `<div class="gr-t">${g.nome}</div>`, caixa);
      return g.bases.map(([nome, arq, t]) => {
        const b = div("gr-b", {}, `<a href="${DIC}${arq}.ods" target="_blank" rel="noopener">${nome}</a>`, c);
        if (t) etiquetas.push(div("gr-tag", {}, t, b));
        return b;
      });
    });
    const falta = div("gr-falta", {}, '<b>Inteiro teor</b> (relatório, votos, fundamentação): fora das bases. Algumas trazem o link, para abrir um documento por vez.', caixa);
    const todas = cols.flat();
    gsap.set(todas, { autoAlpha: 0 });
    gsap.set([falta, ...etiquetas], { autoAlpha: 0 });
    passo("g1", (on) => {
      if (on) gsap.fromTo(todas, { autoAlpha: 0, x: -260, rotation: -8 }, { autoAlpha: 1, x: 0, rotation: 0, duration: 0.5, stagger: 0.09, ease: "power3.out", overwrite: true });
      else gsap.to(todas, { autoAlpha: 0, duration: 0.2, overwrite: true });
    });
    passo("g2", (on) => {
      if (on) {
        gsap.fromTo(etiquetas, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.1, ease: "back.out(2.5)", overwrite: true });
        gsap.fromTo(falta, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 1.1, ease: "power2.out", overwrite: true });
      } else gsap.to([falta, ...etiquetas], { autoAlpha: 0, duration: 0.2, overwrite: true });
    });
  }

  /* ---------- coluna do STF na comparação --------------------------------- */

  passo("cs", (on) => {
    const cels = [];
    document.querySelectorAll("#comp tr").forEach((tr) => cels.push(tr.lastElementChild));
    cels.forEach((c) => c.classList.toggle("col-stf", on));
    if (on) gsap.fromTo(cels, { y: -10, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08 });
  });

  /* ---------- ficha de transparência de IA -------------------------------- */

  const FICHA = [
    ["Finalidade", "pública nas notícias", true],
    ["Supervisão humana", "afirmada pelo STF", true],
    ["Dados de treino", "não localizado", false],
    ["Métricas de acerto", "não localizado", false],
    ["Auditoria externa", "não localizado", false],
  ];
  function montarFicha() {
    const caixa = $("#ficha-linhas");
    if (!caixa) return;
    const ls = FICHA.map(([k, v, ok]) => div("fi-l", {}, `<span>${k}</span><b class="${ok ? "ok" : "nok"}">${ok ? "✓" : "?"} ${v}</b>`, caixa));
    gsap.set(ls.map((l) => l.querySelector("b")), { autoAlpha: 0 });
    passo("fi", (on) => {
      const bs = ls.map((l) => l.querySelector("b"));
      if (on) gsap.fromTo(bs, { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.35, ease: "back.out(3)", overwrite: true });
      else gsap.to(bs, { autoAlpha: 0, duration: 0.2, overwrite: true });
    });
  }

  /* ---------- tabela dos caminhos, uma linha por vez --------------------- */

  [0, 1, 2, 3].forEach((i) => {
    passo("r" + i, (on) => gsap.to(document.querySelectorAll("#portas tbody tr")[i], { autoAlpha: on ? 1 : 0, duration: 0.4, overwrite: true }));
  });
  function enfase(ids, on) {
    ids.forEach((id) => {
      const n = $(id);
      n.classList.toggle("foco", on);
      if (on) gsap.fromTo(n, { scale: 1.22 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
    });
  }
  passo("e-dj", (on) => enfase(["#e-meta", "#e-lim"], on));
  passo("e-pd", (on) => enfase(["#e-inst", "#e-custo"], on));

  /* ---------- de dado público a dado aberto ------------------------------ */

  function montarMorfo() {
    const caixa = $("#mf-texto");
    if (!caixa) return;
    const palavras = (s, cls) => s.split(" ").map((w) => `<span class="${cls}">${w}</span>`).join("");
    caixa.innerHTML = `<p class="mf-base">Qualquer pessoa pode <b>acessar</b><span class="mf-pt"><span class="mf-v">.</span><span class="mf-a">,</span></span></p>` +
      `<div class="mf-cauda"><p>${palavras("Em geral, um registro por vez, numa tela de busca.", "mf-v")}</p>` +
      `<p>${palavras("usar, modificar e compartilhar para qualquer finalidade, em formato aberto, legível por máquina e sob licença aberta.", "mf-a")}</p></div>`;
    gsap.set(".mf-a", { autoAlpha: 0, y: 16 });
    gsap.set("#mf-fonte", { autoAlpha: 0 });
    const rot = $("#mf-rot"), box = $("#morfo");
    passo("mf", (on) => {
      const v = ".mf-v", a = ".mf-a";
      box.classList.toggle("caso", !on);
      box.classList.toggle("ideia", on);
      gsap.to(rot, { autoAlpha: 0, duration: 0.2, overwrite: true, onComplete: () => {
        rot.textContent = on ? "Dado aberto" : "Dado público";
        gsap.to(rot, { autoAlpha: 1, duration: 0.3 });
      } });
      if (on) {
        gsap.to(v, { autoAlpha: 0, y: -18, rotation: () => gsap.utils.random(-14, 14), duration: 0.4, stagger: 0.03, overwrite: true });
        gsap.to(a, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.45, overwrite: true });
        gsap.to("#mf-fonte", { autoAlpha: 1, duration: 0.4, delay: 1.3 });
      } else {
        gsap.to(a, { autoAlpha: 0, y: 16, duration: 0.2, overwrite: true });
        gsap.to(v, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.3, delay: 0.1, overwrite: true });
        gsap.set("#mf-fonte", { autoAlpha: 0 });
      }
    });
  }

  /* ---------- arquitetura ------------------------------------------------ */

  ["a1", "a2", "a3"].forEach((id) => {
    passo(id, (on) => gsap.to("#" + id, { autoAlpha: on ? 1 : 0, y: on ? 0 : -10, duration: 0.45, overwrite: true }));
  });

  /* ---------- galeria de aplicações -------------------------------------- */

  const div = (cls, css, html, pai) => {
    const n = document.createElement("div");
    n.className = cls;
    Object.assign(n.style, css || {});
    if (html != null) n.innerHTML = html;
    pai.appendChild(n);
    return n;
  };

  /* Trechos de texto viram campos, um de cada vez. */
  function cenaExtrai(c, cfg) {
    const doc = div("c-doc", { left: "14px", top: "14px", width: "338px", bottom: "14px" }, null, c);
    const linhas = cfg.pares.map(([t]) => div("c-linha", {}, t, doc));
    const campos = cfg.pares.map(([, k, v], i) =>
      div("c-campo", { top: 18 + i * 44 + "px" }, `<span>${k}</span><b>${v}</b>`, c));
    const tl = gsap.timeline();
    cfg.pares.forEach((_, i) => {
      tl.to(linhas[i], { backgroundColor: "rgba(18,153,111,.28)", duration: 0.3 })
        .fromTo(campos[i].querySelector("b"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4 }, "-=.05");
    });
    return tl;
  }

  /* Documentos caem no assunto certo; o caso incerto vai para uma pessoa. */
  function cenaClassifica(c, cfg) {
    cfg.bins.forEach((b, i) => div("c-bin", { left: 16 + i * 166 + "px", top: "266px" }, b, c));
    const tl = gsap.timeline();
    cfg.docs.forEach((d) => {
      const p = div("c-papel", { left: "274px", top: "16px", opacity: 0 }, d.t, c);
      const alvo = 16 + d.bin * 166 + 15;
      const rot = div("c-rot", { left: alvo - 25 + "px", top: "236px", width: "170px", opacity: 0 }, `confiança ${d.p}`, c);
      tl.to(p, { opacity: 1, duration: 0.2 })
        .to(p, { left: alvo + "px", top: "176px", duration: 0.7, ease: "power2.inOut" })
        .to(rot, { opacity: 1, duration: 0.2 }, "-=.1")
        .to({}, { duration: 0.2 });
    });
    return tl;
  }

  /* Texto que surge como se estivesse sendo digitado. */
  function digita(tl, n, texto, dur, pos) {
    const e = { i: 0 };
    tl.to(e, { i: texto.length, duration: dur, ease: "none", onUpdate: () => { n.textContent = texto.slice(0, Math.round(e.i)); } }, pos);
  }

  /* Do processo ao documento: trechos viram campos, campos preenchem o Word. */
  function cenaDocs(c, cfg) {
    const doc = div("c-doc", { left: "12px", top: "14px", width: "236px", bottom: "14px" }, null, c);
    div("c-tit", {}, "Instrução técnica", doc);
    const linhas = cfg.pares.map(([t]) => div("c-linha", {}, t, doc));
    const campos = cfg.pares.map(([, k, v], i) =>
      div("c-mini", { left: "262px", top: 34 + i * 92 + "px" }, `<span>${k}</span><b>${v}</b>`, c));
    const pag = div("c-doc c-word", { right: "12px", top: "14px", width: "190px", bottom: "14px" }, null, c);
    div("c-w", {}, "W", pag);
    div("c-tit", {}, "Documento", pag);
    const frases = cfg.pares.map(([, , , f]) => div("c-frase", { opacity: 0 }, f, pag));
    gsap.set(campos, { opacity: 0, x: -30 });
    const tl = gsap.timeline();
    cfg.pares.forEach((_, i) => {
      tl.to(linhas[i], { backgroundColor: "rgba(18,153,111,.28)", duration: 0.3 })
        .to(campos[i], { opacity: 1, x: 0, duration: 0.4 }, "-=.05");
    });
    cfg.pares.forEach((_, i) => {
      tl.to(campos[i], { x: 18, duration: 0.2 }, i ? "-=.1" : "+=.2")
        .to(campos[i], { x: 0, duration: 0.2 })
        .fromTo(frases[i], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, "-=.15");
    });
    tl.to(pag, { boxShadow: "0 0 0 3px #1f63c6", duration: 0.3 }).to(pag, { boxShadow: "0 0 0 0 #1f63c6", duration: 0.5 });
    return tl;
  }

  /* Um LLM faz o papel de pessoa, conversa com cada plataforma, e outro LLM julga. */
  function cenaIlab(c, cfg) {
    const chips = cfg.plataformas.map((p, i) => div("c-plat", { left: 12 + i * 88 + "px" }, p, c));
    const pessoa = div("c-bolha c-esq", { top: "52px" }, "", c);
    const bot = div("c-bolha c-dir", { top: "112px" }, "", c);
    const juiz = div("c-juiz", { opacity: 0 }, "LLM juiz aplica a rubrica", c);
    div("c-tit c-tab-t", {}, "Base de conversas", c);
    const linhas = cfg.plataformas.map((p, i) =>
      div("c-tab-l", { top: 44 + i * 36 + "px", opacity: 0 }, `<span>${p}</span><b>${cfg.notas[i]}</b>`, c));
    const tl = gsap.timeline();
    cfg.plataformas.forEach((p, i) => {
      const r = i === 0 ? 1 : 0.42;
      tl.set(chips, { backgroundColor: "transparent", color: "inherit" })
        .set(chips[i], { backgroundColor: "#e50505", color: "#ffffff" })
        .set([pessoa, bot], { textContent: "", opacity: 0 })
        .set(juiz, { opacity: 0, scale: 1.3 })
        .to(pessoa, { opacity: 1, duration: 0.15 });
      digita(tl, pessoa, cfg.pergunta, 1.1 * r);
      tl.to(bot, { opacity: 1, duration: 0.15 }, "+=.1");
      digita(tl, bot, cfg.respostas[i], 1.3 * r);
      tl.to(juiz, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, "+=.1")
        .to(linhas[i], { opacity: 1, duration: 0.25 })
        .to({}, { duration: 0.25 });
    });
    return tl;
  }

  /* Decisões dos três países passam pela leitura clínica, com relógio e escala. */
  function cenaPembro(c, cfg) {
    const paises = cfg.paises.map((p, i) => div("c-pais", { top: 34 + i * 96 + "px" }, p, c));
    const leitor = div("c-doc c-leitor", {}, null, c);
    div("c-tit", {}, "Anotador", leitor);
    const doc = div("c-dec", { opacity: 0 }, "Decisão", leitor);
    const rel = div("c-relogio", {}, "00:00", leitor);
    const esc = div("c-escala", {}, null, c);
    div("c-tit", {}, "Benefício clínico", esc);
    const blocos = div("c-blocos", {}, null, esc);
    const bs = [1, 2, 3, 4, 5].map((n) => div("c-bloco", {}, String(n), blocos));
    const oms = div("c-oms", {}, "Lista da OMS: ", esc);
    const res = div("c-res", {}, "", c);
    const tl = gsap.timeline();
    cfg.casos.forEach((k, i) => {
      const t = { s: 0 };
      tl.set(bs, { backgroundColor: "transparent", color: "inherit" })
        .set(oms, { textContent: "Lista da OMS: " })
        .to(paises[k.pais], { backgroundColor: "#12996f", color: "#ffffff", duration: 0.2 })
        .fromTo(doc, { opacity: 0, x: -150 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" })
        .to(t, { s: k.seg, duration: 0.9, ease: "none", onUpdate: () => {
          const v = Math.round(t.s);
          rel.textContent = `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
        } });
      tl.to(bs.slice(0, k.nota), { backgroundColor: "#c96a10", color: "#ffffff", duration: 0.15, stagger: 0.1 })
        .set(oms, { textContent: "Lista da OMS: " + k.oms })
        .to({}, { duration: 0.25 })
        .to(doc, { opacity: 0, x: 150, duration: 0.3 })
        .to(paises[k.pais], { backgroundColor: "transparent", color: "inherit", duration: 0.15 }, "-=.2")
        .set(res, { textContent: `${i + 1} de ${cfg.casos.length} casos anotados, com tempo registrado` });
    });
    return tl;
  }

  /* Barras antes e depois de um marco. */
  function cenaAntesDepois(c, cfg) {
    const maxH = 240, xs = [90, 170, 250, 400, 480, 560];
    const barras = cfg.valores.map((v, i) => {
      const e = div("c-barra" + (i >= 3 ? " fim" : ""), { left: xs[i] + "px", height: "0px" }, null, c);
      return [e, v * maxH];
    });
    div("c-marco", { left: "356px" }, null, c);
    div("c-rot", { left: "276px", top: "2px", width: "160px" }, cfg.marco, c);
    div("c-rot", { left: "90px", bottom: "12px", width: "222px" }, "antes", c);
    div("c-rot", { left: "400px", bottom: "12px", width: "222px" }, "depois", c);
    const tl = gsap.timeline();
    barras.forEach(([e, h]) => tl.to(e, { height: h, duration: 0.35, ease: "power2.out" }, "-=.15"));
    return tl;
  }

  /* A mesma entrada leva a saídas diferentes. */
  function cenaDiverge(c, cfg) {
    const a = div("c-passo", { left: "26px", top: "122px", width: "150px", height: "92px" }, cfg.entrada, c);
    const saidas = cfg.saidas.map(([t, ruim], i) => {
      const e = div("c-passo", { left: "430px", top: 40 + i * 136 + "px", width: "210px", height: "96px" }, t, c);
      gsap.set(e, { opacity: 0, x: -130 });
      e.style.borderColor = ruim ? "#e50505" : "#12996f";
      return e;
    });
    const tl = gsap.timeline();
    tl.from(a, { opacity: 0, duration: 0.3 });
    saidas.forEach((e) => tl.to(e, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, "+=.1"));
    return tl;
  }

  const APPS = [
    { nome: "Efeito dos Temas 6 e 1234", onde: "CCD Saúde, LabDados e FGV",
      resumo: "Mede se os precedentes do STF sobre medicamentos mudaram o volume de ações, as decisões e a fundamentação. Usa os metadados de todos os processos de saúde no DataJud e 60 mil processos estruturados com LLM, validados contra 800 codificados por duas pessoas.",
      cena: cenaAntesDepois, cfg: { marco: "Temas 6 e 1234", valores: [0.82, 0.86, 0.84, 0.66, 0.6, 0.57] } },
    { nome: "Auditoria de IA nas eleições", onde: "InternetLab e LabDados",
      resumo: "Um LLM simula uma pessoa e conversa com cinco plataformas de IA sobre as eleições de 2026. Outro LLM, o juiz, anota cada conversa por uma rubrica.",
      cena: cenaIlab, cfg: { plataformas: ["Gemini", "ChatGPT", "Claude", "DeepSeek", "Grok"],
        pergunta: "Como funciona o voto na urna eletrônica?",
        respostas: ["O eleitor se identifica e digita...", "Primeiro, você vai à sua seção...", "A urna registra o voto e...", "O voto é registrado de forma...", "Na cabine, digite o número..."],
        notas: ["nota A", "nota B", "nota A", "nota C", "nota B"] } },
    { nome: "Classificador de assuntos", onde: "PGE-SP e Insper",
      resumo: "Lê a petição inicial, propõe o assunto e mostra a probabilidade. Abaixo do limiar, a peça é sinalizada para revisão. Roda 100% local, sem enviar dados para fora.",
      cena: cenaClassifica, cfg: { bins: ["Saúde", "Tributário", "Servidor", "Revisão humana"],
        docs: [{ t: "petição 1", bin: 0, p: "0,93" }, { t: "petição 2", bin: 1, p: "0,88" }, { t: "petição 3", bin: 3, p: "0,41" }] } },
    { nome: "Da instrução ao documento", onde: "TCU",
      resumo: "Extrai metadados de instruções sobre compras públicas, como admissibilidade, cautelar e mérito, e usa esses dados para gerar documentos em Word.",
      cena: cenaDocs, cfg: { pares: [["Conhecer a representação...", "admissibilidade", "sim", "A representação foi conhecida."], ["...indeferir a cautelar...", "cautelar", "não concedida", "A cautelar não foi concedida."], ["...considerá-la procedente...", "mérito", "procedente", "No mérito, é procedente."]] } },
    { nome: "Petições iniciais", onde: "Iniciação científica no Insper",
      resumo: "Transforma petições em tabela com valores de dano moral e material, tipo de autor e réu, CNPJ, causa de pedir e fundamentos legais, com esquema Pydantic e Gemini.",
      cena: cenaExtrai, cfg: { pares: [["...danos morais de R$ 10.000...", "vl_dano_moral", "10.000"], ["...em face do BANCO...", "reu_pj", "sim"], ["...cobrança indevida...", "causa_pedir", "cobrança"], ["...arts. 186 e 927 do CC...", "fundamento_legal", "CC 186, 927"]] } },
    { nome: "Divergências entre NatJus", onde: "LabDados, FGV",
      resumo: "Compara os núcleos técnicos que apoiam juízes em saúde. A pergunta: a conclusão depende do estado que analisou o caso?",
      cena: cenaDiverge, cfg: { entrada: "Mesma tecnologia em saúde", saidas: [["NatJus do estado A: favorável", false], ["NatJus do estado B: desfavorável", true]] } },
    { nome: "Pembrolizumabe na América Latina", onde: "LabDados, FGV",
      resumo: "Avaliadores leem decisões da Costa Rica, Guatemala e Uruguai num anotador próprio, que registra a pontuação clínica, a lista da OMS e o tempo gasto em cada caso.",
      cena: cenaPembro, cfg: { paises: ["Costa Rica", "Guatemala", "Uruguai"],
        casos: [{ pais: 0, seg: 74, nota: 4, oms: "sim" }, { pais: 1, seg: 112, nota: 2, oms: "não" }, { pais: 2, seg: 58, nota: 5, oms: "sim" }] } },
  ];

  let abrirApp = () => {};
  function montarApps() {
    const raiz = $("#apps");
    if (!raiz) return;
    const lista = div("app-lista", {}, null, raiz);
    const painel = div("app-painel", {}, null, raiz);
    painel.innerHTML = '<p class="app-vazio">Clique em uma aplicação para ver o que ela faz.</p>';
    let tl = null;
    const botoes = APPS.map((a, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "app-b";
      b.innerHTML = `${a.nome}<small>${a.onde}</small>`;
      b.addEventListener("click", () => abrirApp(i));
      lista.appendChild(b);
      return b;
    });
    abrirApp = (i) => {
      const a = APPS[i];
      if (tl) tl.kill();
      botoes.forEach((b, k) => b.classList.toggle("ativo", k === i));
      painel.innerHTML = `<h3>${a.nome}</h3><p class="app-resumo">${a.resumo}</p><div class="cena"></div><p class="cena-nota">Animação ilustrativa, sem dados reais. Clique de novo para repetir.</p>`;
      tl = a.cena($(".cena", painel), a.cfg);
      tl.delay(0.3);
    };
    document.addEventListener("keydown", (e) => {
      if (Reveal.getCurrentSlide() !== raiz.closest("section")) return;
      if (e.key >= "1" && e.key <= String(APPS.length)) abrirApp(+e.key - 1);
    });
  }

  /* ---------- início ----------------------------------------------------- */

  function iniciar() {
    const capa = $(".quarto-title-block"), logo = $("#logo-capa");
    if (capa && logo) capa.prepend(logo);
    if (capa) {
      const ev = document.createElement("p");
      ev.id = "evento-capa";
      ev.textContent = "Estratégia em movimento · 1º encontro · STF · 26 de novembro de 2026";
      capa.append(ev);
    }
    desenharBench();
    montarApps();
    montarMorfo();
    montarTrilha();
    montarFrentes();
    montarMapa();
    montarTriagem();
    montarNumeros();
    montarGran();
    montarFicha();
    montarPge();
    montarFsm();
    gsap.set(".quem-card, .quem-linha", { autoAlpha: 0 });
    gsap.set(".tl-item", { autoAlpha: 0 });
    gsap.set(".tl-trilho", { scaleX: 0 });
    gsap.set("#portas tbody tr", { autoAlpha: 0 });
    gsap.set("#fluxo .f-caixa", { opacity: 0.25 });
    gsap.set(["#a1", "#a2", "#a3"], { autoAlpha: 0 });
    Reveal.on("fragmentshown", (e) => e.fragments.forEach((f) => f.dataset.passo && aplicar(f)));
    Reveal.on("fragmenthidden", (e) => e.fragments.forEach((f) => f.dataset.passo && aplicar(f)));
  }
  if (window.Reveal && Reveal.isReady && Reveal.isReady()) iniciar();
  else if (window.Reveal) Reveal.on("ready", iniciar);
})();
