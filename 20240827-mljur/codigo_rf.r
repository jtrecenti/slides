library(tidyverse)

da_modelagem <- read_rds("input/da_modelagem.rds")
glimpse(da_modelagem)

da_modelagem |>
  dplyr::filter(vara == vara[1]) |>
  dplyr::arrange(tipo_vara) |>
  View()

# reprodutibilidade
set.seed(42)

#' Função que calcula as taxas de derrota por uma variavel
#'
#' @param bd banco de dados do tipo d_dados
#' @param var variavel que vc quer calcular a taxa de derrota
#' @param resposta variavel resposta dummy (1 derrota, 0 vitoria)
#' @export
variavel_taxa_desfecho <- function(bd, var, resposta) {

  tx_impro <- mean(as.numeric(bd$resposta), na.rm = TRUE)

  tx <- bd |>
    dplyr::group_by(.data[[var]], resposta) |>
    dplyr::summarise(n_ = dplyr::n(), .groups = "drop") |>
    dplyr::mutate(tx_ = ifelse(n_ >= 5, n_ / sum(n_), tx_impro)) |>
    dplyr::group_by(.data[[var]]) |>
    dplyr::top_n(1, resposta) |>
    dplyr::select(-n_, -resposta) |>
    purrr::set_names(function(nm) ifelse(nm == "tx_", paste0("tx_imp_", var), nm))

  dplyr::left_join(bd, tx, var)
}

# calculamos as taxas usando somente a base de treino
da_treino <- da_modelagem |>
  sample_frac(0.7) |>
  variavel_taxa_desfecho("juiz") |>
  variavel_taxa_desfecho("vara") |>
  variavel_taxa_desfecho("tipo_vara") |>
  variavel_taxa_desfecho("assunto") |>
  variavel_taxa_desfecho("foro")

# taxa geral usada para imputação (heurística)
m_geral <- mean(as.numeric(da_treino$resposta), na.rm = TRUE)


# todas as combinacoes de taxas, para colocar na base de teste
da_join <- da_treino |>
  select(juiz, assunto, foro, tx_imp_juiz, tx_imp_assunto, tx_imp_foro) |>
  distinct()

# cria base de teste
da_teste <- da_modelagem |>
  anti_join(da_treino, "rowid") |>
  left_join(da_join, c("assunto", "foro", "juiz")) |>
  mutate(across(
    c(tx_imp_juiz, tx_imp_assunto, tx_imp_foro),
    ~ifelse(is.na(.x), m_geral, .x)
  ))

# ajuste modelo usando pacote {ranger} ------------------------------------

fit_rf <- ranger::ranger(
  formula = resposta ~ ano + valor + tx_imp_juiz + tx_imp_assunto + tx_imp_foro + peticao + contestacao + tempo_vara,
  data = da_treino,
  num.trees = 100,
  importance = "impurity"
)

# valor de corte poderia ser diferente
val_teste_rf <- da_teste |>
  mutate(
    pred = predict(fit_rf, data = da_teste, type = "response")$prediction > 0.5
  )

acur <- table(val_teste_rf$resposta, val_teste_rf$pred)
sum(diag(acur)) / sum(acur)

# importância das variáveis
vip::vip(fit_rf)
