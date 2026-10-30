/*
 * Duas coisas pequenas que o revealjs nao faz sozinho.
 *
 * 1. Troca claro/escuro no meio da aula, na tecla "d".
 *
 *    A sala tem projetor, e o quanto o fundo claro estoura depende da luz do
 *    dia e de qual sala caiu no horario. Descobrir isso na hora de comecar e
 *    normal; ter que reabrir outro arquivo de slides para resolver, nao. A
 *    escolha fica no navegador, entao sobrevive a recarregar e a passar para a
 *    aula seguinte.
 *
 * 2. A etiqueta da parte, no alto de cada slide.
 *
 *    O deck e dividido em partes por slides de divisoria (`.secao`). Este
 *    script percorre os slides na ordem, numera as divisorias e propaga o nome
 *    da ultima para todos os slides seguintes, num atributo que o CSS imprime.
 *    Escrever isso a mao em cada slide funcionaria ate a primeira vez que uma
 *    parte mudasse de lugar.
 */
(function () {
  const CHAVE = "siajus-tema-slides";
  const raiz = document.documentElement;

  /* ---------- tema ------------------------------------------------------ */

  function aplicar(tema) {
    if (tema === "escuro") raiz.setAttribute("data-tema", "escuro");
    else raiz.removeAttribute("data-tema");
    const b = document.getElementById("botao-tema");
    if (b) b.textContent = tema === "escuro" ? "claro (d)" : "escuro (d)";
  }

  function atual() {
    try {
      return localStorage.getItem(CHAVE) === "escuro" ? "escuro" : "claro";
    } catch {
      return "claro";
    }
  }

  function alternar() {
    const novo = atual() === "escuro" ? "claro" : "escuro";
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      // navegador sem armazenamento: a troca vale so para esta sessao
    }
    aplicar(novo);
  }

  aplicar(atual());

  /* ---------- etiqueta da parte ----------------------------------------- */

  function marcarPartes() {
    const slides = document.querySelectorAll(".reveal .slides > section");
    let numero = 0;
    let parte = "";
    for (const s of slides) {
      if (s.classList.contains("secao")) {
        numero += 1;
        s.setAttribute("data-numero", String(numero));
        const h = s.querySelector("h2");
        parte = h ? h.textContent.trim() : "";
        continue;
      }
      // a capa nao leva etiqueta: ela ainda nao esta em parte nenhuma
      if (parte && !s.classList.contains("title-slide") && s.querySelector("h2")) {
        s.setAttribute("data-parte", parte);
      }
    }
  }

  /* ---------- inicio ----------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    aplicar(atual());
    marcarPartes();

    const b = document.createElement("button");
    b.id = "botao-tema";
    b.type = "button";
    b.addEventListener("click", alternar);
    document.body.appendChild(b);
    aplicar(atual());

    // A tecla nao pode roubar o "d" de quem esta escrevendo numa caixa de
    // texto, nem atropelar os atalhos do proprio revealjs (que usam modificador).
    document.addEventListener("keydown", function (e) {
      if (e.key !== "d" && e.key !== "D") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const alvo = e.target;
      if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) return;
      if (alvo && alvo.isContentEditable) return;
      e.preventDefault();
      alternar();
    });
  });
})();
