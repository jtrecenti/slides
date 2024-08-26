## Aplicação 1: Extração de dados ----

txt_pdf <- pdftools::pdf_text("input/peticao_inicial.pdf") |>
  # apenas algumas paginas
  magrittr::extract(c(1:5, 24:27)) |>
  paste(collapse = "\n") |>
  stringr::str_squish() |>
  abjutils::rm_accent()

client <- openai::OpenAI()

dados_do_pdf <- client$chat$completions$create(
  model = "gpt-4o",
  messages = list(
    list(
      role = "system",
      content = readr::read_file("prompts/ex1-extracao.md")
    ),
    list(
      role = "user",
      content = glue::glue(
        'Entrada:\n"""{txt_pdf}"""\n\nSaída:\n'
      )
    )
  ),
  response_format = list(type = "json_object"),
  temperature = 0
)

resultados <- dados_do_pdf$choices[[1]]$message$content |>
  jsonlite::fromJSON() |>
  tibble::as_tibble()

resultados |>
  dplyr::glimpse()

# Aplicação 2: Análise de jurisprudência ----

## Exemplo: qual é o entendimento sobre a aplicação do
## CDC em contratos de plano de saúde?

tema <- "Aplicação do CDC em contratos de plano de saúde"

tjsp::tjsp_baixar_cjsg(
  "contrato de plano de saúde E aplicação do CDC",
  n = 2,
  diretorio = "input/cjsg"
)

set.seed(42)
dados_cjsg <- fs::dir_ls("input/cjsg") |>
  purrr::map(tjsp::tjsp_ler_cjsg) |>
  purrr::list_rbind() |>
  dplyr::filter(stringr::str_length(ementa) < 3000) |>
  dplyr::slice_sample(n = 30)

dplyr::glimpse(dados_cjsg)

View(dados_cjsg)

analisar_caso <- function(txt, tema) {
  analise_caso <- client$chat$completions$create(
    model = "gpt-4o-mini",
    messages = list(
      list(
        role = "system",
        content = glue::glue(
          readr::read_file("prompts/ex2-jurisprudencia.md")
        )
      ),
      list(
        role = "user",
        content = glue::glue(
          'Entrada:\n"""{txt}"""\n\nSaída:\n'
        )
      )
    ),
    response_format = list(type = "json_object"),
    temperature = 0.3
  )
  analise_caso$choices[[1]]$message$content |>
    jsonlite::fromJSON() |>
    tibble::as_tibble()
}

# analisar um caso
cat(dados_cjsg$ementa[4])

resultado <- analisar_caso(dados_cjsg$ementa[4], tema)
resultado$resumo

# demora para rodar
analises <- purrr::map(
  dados_cjsg$ementa,
  analisar_caso,
  tema,
  .progress = TRUE
)
# readr::write_rds(analises, "output/analises_gpt.rds")
analises <- readr::read_rds("output/analises_gpt.rds")

da_analises <- analises |>
  purrr::list_rbind()

da_analises |>
  dplyr::count(tema_presente)

todas_analises <- da_analises |>
  dplyr::filter(tema_presente == "Sim") |>
  dplyr::pull(resumo) |>
  stringr::str_c(collapse = "\n\n---\n\n")

cat(todas_analises)

analise_geral <- client$chat$completions$create(
  model = "gpt-4o",
  messages = list(
    list(
      role = "system",
      content = glue::glue(
        readr::read_file("prompts/ex2-analise.md")
      )
    ),
    list(
      role = "user",
      content = glue::glue(
        'Entrada:\n"""{todas_analises}"""\n\nSaída:\n'
      )
    )
  ),
  temperature = 0
)

analise_geral$choices[[1]]$message$content |>
  readr::write_file("output/analise_jurisprudencia_gpt.md")

## Aplicação 3: Geração de textos ----

set.seed(42)
dados_caso <- dados_cjsg |>
  dplyr::slice_sample(n = 1) |>
  dplyr::glimpse() |>
  jsonlite::toJSON()

acordao <- client$chat$completions$create(
  model = "gpt-4o",
  messages = list(
    list(
      role = "system",
      content = glue::glue(
        readr::read_file("prompts/ex3-geracao.md")
      )
    ),
    list(
      role = "user",
      content = glue::glue(
        'Entrada:\n"""{dados_caso}"""\n\nSaída:\n'
      )
    )
  ),
  temperature = 0
)

acordao$choices[[1]]$message$content |>
  readr::write_file("output/acordao.md")
