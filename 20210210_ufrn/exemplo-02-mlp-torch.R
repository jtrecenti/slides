# Pacotes -----------------------------------------------------------------

library(torch)
library(magrittr)
library(ggplot2)

# Gerando dados -----------------------------------------------------------

set.seed(1)
n_row <- 10000
n_col <- 1

X <- rnorm(n_row*n_col) %>% matrix(ncol = n_col)
y <- X^2 + 0.5*X^3 + rnorm(n_row, sd = sqrt(abs(X)))

# Algumas visualizações ---------------------------------------------------

qplot(X, y) + geom_smooth(method = "lm")

# Ajustando os modelos ----------------------------------------------------

X <- torch_tensor(X)
y <- torch_tensor(matrix(y))

d_hidden <- 100

model <- nn_sequential(
  nn_linear(1, d_hidden),
  nn_relu(),
  nn_linear(d_hidden, 1)
)

# Adicionando não linearidades --------------------------------------------

optimizer <- optim_sgd(model$parameters, lr = 0.1)

# Fitting models ----------------------------------------------------

for (t in 1:200) {
  y_pred <- model(X)
  loss <- nnf_mse_loss(y_pred, y, reduction = "mean")
  if (t %% 10 == 0) cat("Epoch: ", t, "   Loss: ", loss$item(), "\n")
  optimizer$zero_grad()
  loss$backward()
  optimizer$step()
}

# evaluate --------------------------------------------------------------------

y_hat <- model(X)

ggplot(data.frame(X = as.numeric(X), y = as.numeric(y)), aes(X, y)) + 
  geom_point() + 
  geom_point(data = data.frame(X = as.numeric(X), y = as.numeric(y_hat)), colour = "blue")


