library(magrittr)
library(torch)

set.seed(12)
df <- tibble::tibble(
  m2 = rgamma(n = 100, scale = 5, shape = 20) / 100,
  preco = 1 + 6 * m2 + rnorm(n = 100, sd = 1)
)
# usando lm ---------------------------------------------------------------

modelo <- lm(preco ~ m2, data = df)
coef(modelo)

# Ajustando na mão --------------------------------------------------------

## Definição do modelo

## onde meus dados vão ficar? GPU ou CPU
dev <- "cpu" # "cuda"

# arquitetura
# usamos nn_sequential+nn_linear para definir o modelo linear
model <- nn_sequential(
  nn_linear(in_features = 1, out_features = 1, bias = TRUE)
)

## se precisar mudar o device do modelo
model$to(device = dev)

## usamos nnf_mse_loss como função de perda, então não precisamos
## definir nada aqui
# loss <- function(y, y_hat) {
#   mean((y - y_hat)^2)
# }


# Estimando via SGD --------------------------------------------


yt <- torch_tensor(matrix(df$preco), device = dev)
xt <- torch_tensor(matrix(df$m2), device = dev)

yt
xt

# note que o modelo já é capaz de fazer predições
model(xt)

# model$parameters

## derivadas (não precisa!)
# dl_dyhat <- function(y_hat) {
#   2 * (y - y_hat) * (-1)
# }
#
# dyhat_dw <- function(w) {
#   x
# }
#
# dyhat_db <- function(b) {
#   torch_tensor(1, device = dev)
# }

## inicializando os pesos (não precisa!)
# w <- torch_rand(1, device = dev)
# b <- torch_tensor(0, device = dev)

model$parameters

# Vamos separar os dados em bloquinhos de 20
splits <- split(sample(seq_len(nrow(yt))), seq_len(nrow(yt)) %% 5)

## hiperparametro: learning rate
# trocamos o hiperparametro puro por um otimizador
# esse objeto é capaz atualizar os parâmetros automaticamente
optimizer <- optim_sgd(model$parameters, lr = 0.1)

# numero de iteracoes
for (epoch in 1:200) {

  for (minibatch in splits) {
    # isso poderia ser uma leitura em disco, por exemplo
    y <- yt[minibatch,]
    x <- xt[minibatch,]
    # obtem predições do modelo
    y_hat <- model(x)
    my_loss <- nnf_mse_loss(y, y_hat)
    # zera o gradiente (necessário por questões técnicas do torch)
    optimizer$zero_grad()
    # calcula as derivadas
    my_loss$backward()
    # atualiza os parâmetros
    optimizer$step()

  }

  if (epoch %% 25 == 0) {
    print(my_loss)
  }
}

model$parameters
coef(modelo)

