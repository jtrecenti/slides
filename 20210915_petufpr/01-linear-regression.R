library(magrittr)

set.seed(12)
df <- tibble::tibble(
  m2 = rgamma(n = 100, scale = 5, shape = 20) / 100,
  preco = 1 + 6 * m2 + rnorm(n = 100, sd = 1)
)
# usando lm ---------------------------------------------------------------

plot(df)

modelo <- lm(preco ~ m2, data = df)
coef(modelo)

# Ajustando na mão --------------------------------------------------------

## Definição do modelo

# arquitetura
model <- function(w, b, x) {
  w * x + b
}

# função de perda
loss <- function(y, y_hat) {
  mean((y - y_hat)^2)
}

# Estimando via descida de gradiente ------------------------------------

y <- df$preco
x <- df$m2

## derivadas (não se preocupe com essa parte!)

## dl/dw = dl/dy * dy/dw
## dl/db = dl/dy * dy/db

# derivada da loss com relação à y
dl_dyhat <- function(y_hat) {
  2 * (y - y_hat) * (-1)
}

# derivada de y com relação a w
dyhat_dw <- function(w) {
  x
}

# derivada de y com relação a b
dyhat_db <- function(b) {
  1
}

# inicializando os pesos
w <- runif(1)
b <- 0

# hiperparametro: learning rate
lr <- 0.1

for (step in 1:1000) {

  y_hat <- model(w, b, x)

  w <- w - lr * mean(dl_dyhat(y_hat) * dyhat_dw(w))
  b <- b - lr * mean(dl_dyhat(y_hat) * dyhat_db(b))

  if (step %% 100 == 0) {
    print(loss(y, y_hat))
  }

}

c(b, w)
coef(modelo)


# Usando descida de gradiente *estocástica* -----------------------------

# inicializando os pesos
w <- runif(1)
b <- 0

# Vamos separar os dados em bloquinhos de 20
splits <- split(sample(seq_along(y)), seq_along(y) %% 5)

# numero de iteracoes
for (epoch in 1:200) {

  for (minibatch in splits) {

    # isso poderia ser uma leitura em disco, por exemplo
    y <- df$preco[minibatch]
    x <- df$m2[minibatch]

    y_hat <- model(w, b, x)
    w <- w - lr * mean(dl_dyhat(y_hat) * dyhat_dw(w))
    b <- b - lr * mean(dl_dyhat(y_hat) * dyhat_db(b))

  }

  if (epoch %% 10 == 0) print(loss(y, y_hat))
}

c(b, w)
coef(modelo)


library(reticulate)
py$a







