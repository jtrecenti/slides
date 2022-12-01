# R basico ----------------------------------------------------------------

# o hashtag (#) serve para escrever comentários
# os comentários não são executados pelo R

# selecione um bloco de código e clique
# ctrl + shift + c para comentar tudo o que está selecionado

# ATALHO para rodar o código: CTRL + ENTER
# Mesmo atalho no Mac: Command + ENTER

# adição
1 + 1
# subtração
4 - 2
# multiplicação
2 * 3
# divisão
5 / 3
# com ponto
1.5 + 1
# potência
4 ^ 2

# criar objetos/variáveis
# coloca o valor 1 no objeto "obj". Podemos usar esses valores depois
obj <- 1
obj

# Também dizemos 'guardando as saídas'
soma <- 2 + 2
soma

# ATALHO para <- : ALT + - (alt menos)
# Mesmo atalho no Mac: Option + - (Option menos)

# salvar saída versus apenas executar
33 / 11
resultado <- 33 / 11

# atualizar um objeto
resultado <- resultado * 5
resultado

# O R difencia minúscula de maiúscula!
a <- 5
A <- 42
a
A

# textos
a <- "ola, sou um texto"

# Vetores são conjuntos de valores

vetor1 <- c(1, 4, 3, 10)
vetor2 <- c("a", "b", "z")

vetor1
vetor2

# Podemos acessar elementos do vetor pela sua posição. Começa pelo 1!
vetor <- c("a", "b", "c", "d")

vetor[1]
vetor[3]

vetor[c(2, 3)]
vetor[c(1, 2, 4)]

# Também podemos acessar por exclusão

vetor[-1]
vetor[-c(2, 3)]

# Se tentarmos misturar dois tipos, o R vai converter

vetor <- c(1, 2, "a")
vetor

# Podemos fazer operações matemáticas com vetores

vetor <- c(0, 5, 20,-3)

vetor + 1
vetor - 1
vetor / 2
vetor * 10

# Funções são nomes que guardam um código de R.

# Por exemplo, usamos a função `c()` para criar vetores

c(1, 3, 5)

vetor_exemplos <- c(1, 5, 3.4, 7.23, 2.1, 3.8)

# Exemplos
length(vetor_exemplos)   # comprimento
sum(vetor_exemplos)      # soma
mean(vetor_exemplos)     # média
sd(vetor_exemplos)       # desvio padrão
paste("a", "b")          # cola os elementos, separando com um espaço
paste0("a", "b")         # cola os elementos sem separar!

# HELP
?paste
help(paste)

# pacotes -----------------------------------------------------------------

# A forma de disponibilizar funções para que outras pessoas possam
# utilizar é através de pacotes. 

# Um pacote no R é um conjunto de funções, bases de dados, textos que 
# explicam o que as funções fazem, tutoriais, etc.

# o pacote que vamos instalar se chama "tidyverse"
# mais sobre aqui: https://tidyverse.org

# para instalar um pacote você usa install.packages("nomeDopacote")
# e aplica ela num texto, entre aspas. As aspas são importantes!

install.packages("tidyverse")

# a função library deixa todas as funções que fazem parte do pacote tidyverse
# disponíveis pra você utilizar.

library(tidyverse)

# install.packages("tidyverse") -> apenas uma vez
# library(tidyverse) -> toda vez que você abrir o R

# importacao --------------------------------------------------------------

ancine <- read_csv("20221019-quarto/ancine.csv")

glimpse(ancine)

view(ancine)

# arrumacao (avançado) ----------------------------------------------------

# aqui temos o script original de leitura e arrumação dos dados que 
# vieram diretamente da internet, para fins de consulta. Não é necessário
# rodar os códigos abaixo.

# dados <- "https://www.gov.br/ancine/pt-br/oca/cinema/arquivos.csv/listagem-de-filmes-brasileiros-e-estrangeiros-exibidos-informacoes-por-semana-2009-a-2021.csv" |> 
#   readr::read_csv2(skip = 1, col_select = 1:13, show_col_types = FALSE) |> 
#   janitor::clean_names() |> 
#   dplyr::filter(!is.na(ano_de_exibicao)) |> 
#   dplyr::transmute(
#     ano = ano_de_exibicao,
#     semana = semana_de_exibicao,
#     titulo = titulo_da_obra,
#     genero,
#     pais = pais_es_produtor_es_da_obra,
#     dt_lancamento = lubridate::dmy(data_de_lancamento),
#     publico = publico_na_semana_dos_dados,
#     renda = renda_r_na_semana_dos_dados
#   ) |> 
#   dplyr::group_by(titulo, dt_lancamento, genero, pais) |> 
#   dplyr::summarise(
#     n_semanas = dplyr::n(),
#     publico = sum(publico),
#     renda = sum(renda),
#     .groups = "drop"
#   ) |> 
#   dplyr::arrange(dt_lancamento) |> 
#   dplyr::filter(
#     !is.na(dt_lancamento), 
#     dt_lancamento >= "2009-01-01"
#   )

# readr::write_csv(ancine, "ancine.csv")

# transformacao -----------------------------------------------------------

# pipe
x <- seq(1, 10)
x

sum(sqrt(x))

x |> 
  sqrt() |> 
  sum()

# ordenar com arrange()

ancine |> 
  arrange(publico)

ancine |> 
  arrange(desc(publico))

ancine |> 
  arrange(genero, desc(publico))

# filtro com filter()

ancine |> 
  filter(renda > 1000000)

ancine |> 
  filter(
    publico > 10000000, 
    pais == "Brasil"
  )

# selecao com select()

ancine |> 
  select(titulo, dt_lancamento, genero)

ancine |> 
  select(where(is.character))

# criar colunas com mutate()

ancine |> 
  mutate(razao = renda / publico) |> 
  arrange(desc(razao)) |> 
  filter(publico > 10000)

# agrupar com group_by() e sumarizar com summarise()

ancine |> 
  group_by(genero) |> 
  summarise(
    maior_renda = titulo[which.max(renda)],
    total_publico = sum(renda)
  ) |> 
  arrange(desc(total_publico))

# visualizacao ------------------------------------------------------------

dados_grafico <- ancine |> 
  filter(publico > 10e6) |> 
  mutate(
    titulo = paste0(titulo, "(", lubridate::year(dt_lancamento), ")"),
    titulo = fct_reorder(titulo, renda)
  )

ggplot(dados_grafico) +
  aes(x = renda / 1e6, y = titulo) +
  geom_col(fill = "#C4161C") +
  theme_minimal(14) +
  labs(
    x = "Renda (R$ Milhões)", 
    y = "Filme",
    title = "Filmes com maior renda",
    subtitle = "Valores sem ajuste pela inflação",
    caption = "Fonte: Ancine"
  )

publico_tempo <- ancine |> 
  mutate(ano = lubridate::floor_date(dt_lancamento, "month")) |> 
  group_by(ano) |> 
  summarise(publico = sum(publico)) |> 
  filter(ano < "2022-01-01")

ggplot(publico_tempo) +
  aes(x = ano, y = publico / 1e6) +
  geom_line(size = 1, color = "#BCBEC0") +
  scale_x_date(date_breaks = "year", date_labels = "%b\n%Y") +
  theme_minimal(14) +
  geom_smooth(span = .1, color = "#C4161C", se = FALSE) +
  labs(
    x = "Mês", 
    y = "Público (milhões)",
    title = "Público nos cinemas ao longo dos meses",
    subtitle = "Valores sem ajuste pela inflação",
    caption = "Fonte: Ancine"
  )

