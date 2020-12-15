library(tidyverse)

# importacao --------------------------------------------------------------

path <- "20190806_aulajur/data"
da <- read_rds(str_glue("{path}/da.rds"))
glimpse(da)

# arrumacao ---------------------------------------------------------------

nm_area <- "Criminal"

dd <- da %>% 
  filter(area == nm_area) %>% 
  droplevels()

# visualizacao ------------------------------------------------------------


# tabela de contagens
dd %>% 
  count(camara, reformou) %>% 
  group_by(camara) %>% 
  mutate(proporcao = n / sum(n)) %>% 
  ungroup() %>% 
  # gráfico
  ggplot(aes(x = proporcao, y = camara, fill = reformou)) +
  geom_col() +
  scale_x_continuous(labels = scales::percent) +
  scale_fill_viridis_d(begin = 0.2, end = 0.8) +
  theme_minimal(12) +
  theme(legend.position = "bottom")



# modelagem ---------------------------------------------------------------


# Separando treino e teste
id_train <- sort(sample(1:nrow(dd), 0.8 * nrow(dd)))

d_train <- dd[id_train,]
d_test <- dd[-id_train,]

form <- reformou ~ 
  assunto +
  camara +
  tipo_partes +
  faculdade +
  origem +
  idade +
  tem_pos + 
  tempo_form +
  tempo_2inst +
  cidade

# árvore de decisão
m_tree <- rpart::rpart(form, data = d_train, minsplit = 20, cp = 0.005)
rpart.plot::rpart.plot(m_tree)

# Regressão logística
m_log <- glm(form, data = d_train, family = "binomial")
summary(m_log)

# Floresta aleatória
m_rf <- randomForest::randomForest(form, data = d_train)


# Comparando predições e resultados
d_test$pred_tree <- predict(m_tree, newdata = d_test, type = "class")

d_test$pred_log <- ifelse(
  predict(m_log, newdata = d_test, type = "response") > 0.5, 
  "reformou", 
  "não reformou"
)

d_test$pred_rf <- predict(m_rf, newdata = d_test)

(tab_tree <- with(d_test, table(reformou, pred_tree)))
(tab_log <- with(d_test, table(reformou, pred_log)))
(tab_rf <- with(d_test, table(reformou, pred_rf)))

(acc_tree <- sum(diag(tab_tree)) / sum(tab_tree))
(acc_log <- sum(diag(tab_log)) / sum(tab_log))
(acc_rf <- sum(diag(tab_rf)) / sum(tab_rf))

# modelo trivial
dd %>% 
  count(reformou) %>% 
  mutate(prop = scales::percent(n/sum(n)))

result <- list(m_rf, acc_rf)

d_graf_imp <- function(m_list, cor = "darkblue") {
  m <- m_list[[1]]
  acc <- m_list[[2]]
  d_graf <- m %>% 
    randomForest::importance() %>% 
    as.data.frame() %>% 
    rownames_to_column() %>% 
    as_tibble() %>% 
    mutate(
      rowname = fct_reorder(rowname, MeanDecreaseGini),
      acc = acc, 
      cor = cor
    )
  d_graf
}
graf_imp <- function(d_graf) {
  d_graf %>% 
    ggplot(aes(x = MeanDecreaseGini, y = rowname)) +
    geom_segment(
      aes(xend = 0, yend = rowname), 
      size = 1, 
      colour = d_graf$cor[[1]]
    ) +
    geom_point(size = 4, colour = d_graf$cor[[1]]) +
    theme_minimal(14) +
    labs(
      x = "Mean decrease Gini", 
      y = "Variável",
      title = "Modelo Random Forest",
      subtitle = paste("Acurácia", scales::percent(d_graf$acc[[1]]))
    )
}


# comunicacao -------------------------------------------------------------

result %>% 
  d_graf_imp() %>% 
  graf_imp()


