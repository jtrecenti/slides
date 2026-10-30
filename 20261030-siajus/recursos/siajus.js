/*
 * Slides interativos da palestra no SIAJUS, com GSAP. Mesmo esquema das aulas:
 * cada passo é um fragmento vazio `<span class="fragment passo" data-passo>`, e
 * o avanço do clicker toca a animação correspondente.
 *
 * A galeria de aplicações é a exceção: abre no clique ou nas teclas 1 a 8. As
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

  /* Passos que acendem em sequência. */
  function cenaFluxo(c, cfg) {
    const n = cfg.passos.length, larg = 118, gap = (686 - n * larg) / (n + 1);
    const caixas = cfg.passos.map((t, i) => {
      const e = div("c-passo", { left: gap + i * (larg + gap) + "px" }, t, c);
      gsap.set(e, { opacity: 0.25 });
      return e;
    });
    const tl = gsap.timeline();
    caixas.forEach((e, i) => {
      const ruim = (cfg.ruim || []).includes(i);
      tl.to(e, { opacity: 1, y: -6, borderColor: ruim ? "#e50505" : "#12996f", duration: 0.35 })
        .to(e, { y: 0, duration: 0.2 });
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
    { nome: "Classificador de assuntos", onde: "PGE-SP e Insper",
      resumo: "Lê a petição inicial, propõe o assunto e mostra a probabilidade. Abaixo do limiar, a peça é sinalizada para revisão. Roda 100% local, sem enviar dados para fora.",
      cena: cenaClassifica, cfg: { bins: ["Saúde", "Tributário", "Servidor", "Revisão humana"],
        docs: [{ t: "petição 1", bin: 0, p: "0,93" }, { t: "petição 2", bin: 1, p: "0,88" }, { t: "petição 3", bin: 3, p: "0,41" }] } },
    { nome: "Metadados de representações", onde: "TCU",
      resumo: "Extrai de instruções técnicas sobre compras públicas se o caso foi conhecido, se houve cautelar e qual foi o mérito. Comparamos vários modelos na mesma tarefa.",
      cena: cenaExtrai, cfg: { pares: [["Conhecer a representação...", "admissibilidade", "sim"], ["...indeferir a medida cautelar...", "cautelar", "não concedida"], ["...considerá-la procedente...", "mérito", "procedente"]] } },
    { nome: "Petições iniciais", onde: "Iniciação científica do Pedro",
      resumo: "Transforma petições em tabela com valores de dano moral e material, tipo de autor e réu, CNPJ, causa de pedir e fundamentos legais, com esquema Pydantic e Gemini.",
      cena: cenaExtrai, cfg: { pares: [["...danos morais de R$ 10.000...", "vl_dano_moral", "10.000"], ["...em face do BANCO...", "reu_pj", "sim"], ["...cobrança indevida...", "causa_pedir", "cobrança"], ["...arts. 186 e 927 do CC...", "fundamento_legal", "CC 186, 927"]] } },
    { nome: "Raspador de preços que se conserta", onde: "TCC de Luiz Otávio, Insper",
      resumo: "Coleta preços de supermercados para um índice complementar ao IPCA. Quando o site muda, um LLM propõe nova estratégia, que só entra após validação independente.",
      cena: cenaFluxo, cfg: { passos: ["Coleta diária", "Site muda e a coleta falha", "LLM propõe nova estratégia", "Validação independente", "Coleta volta"], ruim: [1] } },
    { nome: "Efeito dos Temas 6 e 1234", onde: "CCD Saúde, FGV",
      resumo: "Mede se os precedentes do STF mudaram o volume de ações, as decisões e a fundamentação. Combina DataJud, documentos do Jus.br e estruturação validada contra codificação humana.",
      cena: cenaAntesDepois, cfg: { marco: "precedentes do STF", valores: [0.82, 0.86, 0.84, 0.66, 0.6, 0.57] } },
    { nome: "Divergências entre NatJus", onde: "LabDados, FGV",
      resumo: "Compara os núcleos técnicos que apoiam juízes em saúde. A pergunta: a conclusão depende do estado que analisou o caso?",
      cena: cenaDiverge, cfg: { entrada: "Mesma tecnologia em saúde", saidas: [["NatJus do estado A: favorável", false], ["NatJus do estado B: desfavorável", true]] } },
    { nome: "Pembrolizumabe na América Latina", onde: "LabDados, FGV",
      resumo: "Avaliadores leem decisões da Costa Rica, Guatemala e Uruguai num anotador próprio, que registra a pontuação clínica e o tempo gasto em cada caso.",
      cena: cenaFluxo, cfg: { passos: ["Coleta nos três países", "Amostra de decisões", "Leitura no anotador", "Pontuação clínica", "Base do estudo"] } },
    { nome: "IA generativa e eleições", onde: "InternetLab e LabDados",
      resumo: "Automatiza perguntas sobre temas eleitorais às ferramentas de IA generativa e guarda as respostas para análise. Aqui, a saída dos próprios modelos vira o dado.",
      cena: cenaFluxo, cfg: { passos: ["Pergunta sobre eleições", "Ferramentas de IA", "Coleta automática", "Base de respostas", "Análise"] } },
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
    gsap.set("#fluxo .f-caixa", { opacity: 0.25 });
    gsap.set(["#a1", "#a2", "#a3"], { autoAlpha: 0 });
    Reveal.on("fragmentshown", (e) => e.fragments.forEach((f) => f.dataset.passo && aplicar(f)));
    Reveal.on("fragmenthidden", (e) => e.fragments.forEach((f) => f.dataset.passo && aplicar(f)));
  }
  if (window.Reveal && Reveal.isReady && Reveal.isReady()) iniciar();
  else if (window.Reveal) Reveal.on("ready", iniciar);
})();
