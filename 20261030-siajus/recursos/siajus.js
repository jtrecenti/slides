/*
 * Slides interativos da palestra no SIAJUS, com GSAP. Mesmo esquema das aulas:
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

  [0, 1, 2, 3, 4].forEach((i) => {
    passo("t" + i, (on) => {
      const item = $(`.tl-item[data-i="${i}"]`);
      gsap.to(".tl-trilho", { scaleX: (on ? i + 0.6 : i - 0.4) / 5 > 0 ? (on ? i + 0.6 : i - 0.4) / 5 : 0, duration: 0.6, ease: "power2.inOut", overwrite: true });
      if (on) {
        gsap.fromTo(item, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.25, overwrite: true });
        gsap.fromTo(item.querySelector(".tl-foto, .tl-cnj"), { scale: 0.3 }, { scale: 1, duration: 0.55, delay: 0.25, ease: "back.out(2)" });
      } else gsap.to(item, { autoAlpha: 0, duration: 0.2, overwrite: true });
    });
  });

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
    { nome: "Petições iniciais", onde: "Iniciação científica do Pedro",
      resumo: "Transforma petições em tabela com valores de dano moral e material, tipo de autor e réu, CNPJ, causa de pedir e fundamentos legais, com esquema Pydantic e Gemini.",
      cena: cenaExtrai, cfg: { pares: [["...danos morais de R$ 10.000...", "vl_dano_moral", "10.000"], ["...em face do BANCO...", "reu_pj", "sim"], ["...cobrança indevida...", "causa_pedir", "cobrança"], ["...arts. 186 e 927 do CC...", "fundamento_legal", "CC 186, 927"]] } },
    { nome: "Efeito dos Temas 6 e 1234", onde: "CCD Saúde, FGV",
      resumo: "Mede se os precedentes do STF mudaram o volume de ações, as decisões e a fundamentação. Combina DataJud, documentos do Jus.br e estruturação validada contra codificação humana.",
      cena: cenaAntesDepois, cfg: { marco: "precedentes do STF", valores: [0.82, 0.86, 0.84, 0.66, 0.6, 0.57] } },
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
      ev.textContent = "8º SIAJUS · Insper · 30 de outubro de 2026";
      capa.append(ev);
    }
    desenharBench();
    montarApps();
    montarMorfo();
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
