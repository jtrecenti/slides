# Pacotes -----------------------------------------------------------------

library(keras)
library(Metrics)

# Gerando dados -----------------------------------------------------------

n_row <- 10000
n_col <- 1

X <- rnorm(n_row*n_col) %>% matrix(ncol = n_col)
y <- X^2 + 0.5*X^3 + rnorm(n_row, sd = sqrt(abs(X)))


# Algumas visualizações ---------------------------------------------------

qplot(X, y) + geom_smooth(method = "lm")

# Definindo o modelo ------------------------------------------------------

input <- layer_input(n_col)
output <- layer_dense(input, units = 1)

modelo <- keras_model(input, output)
summary(modelo)


# Gerando previsões -------------------------------------------------------

y_hat <- predict(modelo, X)
dim(y_hat)


# Calculando o erro -------------------------------------------------------

rmse(y, y_hat)

# Compilando o modelo -----------------------------------------------------

# Mas e agora, precisamos treinar o modelo
# Mas antes precisamos definir a função de perda, e o otimizador

modelo %>% 
  compile(
    loss = "mse",
    optimizer = "sgd"
  )


# Ajustando os modelos ----------------------------------------------------

# Agora podemos ajustar
modelo %>% 
  fit(X , y, validation_split = 0.2)


# Calculando o erro novamente ---------------------------------------------

# Podemos prever de novo:

y_hat <- predict(modelo, X)
rmse(y, y_hat)

ggplot(data.frame(X = X, y = y), aes(x = X, y = y)) + 
  geom_point() + 
  geom_point(data = data.frame(X = X, y = y_hat), colour = "blue")


# Colocando mais camadas --------------------------------------------------

input <- layer_input(n_col)
output <- input %>% 
  layer_dense(units = 100) %>%
  layer_dense(units = 1)

modelo <- keras_model(input, output)
summary(modelo)

modelo %>% 
  compile(
    loss = "mse",
    optimizer = "sgd"
  )

modelo %>% 
  fit(X , y, validation_split = 0.2)

y_hat <- predict(modelo, X)
rmse(y, y_hat)

ggplot(data.frame(X = X, y = y), aes(x = X, y = y)) + 
  geom_point() + 
  geom_point(data = data.frame(X = X, y = y_hat), colour = "blue")


# Adicionando não linearidades --------------------------------------------

input <- layer_input(n_col)
output <- input %>% 
  layer_dense(units = 100, activation = "relu") %>%
  layer_dense(units = 1)

modelo <- keras_model(input, output)
summary(modelo)

modelo %>% 
  compile(
    loss = "mse",
    optimizer = "sgd"
  )

modelo %>% 
  fit(X , y, validation_split = 0.2, epochs = 100)

y_hat <- predict(modelo, X)
rmse(y, y_hat)

ggplot(data.frame(X = X, y = y), aes(x = X, y = y)) + 
  geom_point() + 
  geom_point(data = data.frame(X = X, y = y_hat), colour = "blue")


