# Packages -----------------------------------------------------------------

library(torch)
library(ggplot2)

# Generating data -----------------------------------------------------------

n_row <- 1000
n_col <- 10

X <- rnorm(n_row*n_col) %>% matrix(nrow = n_row)
y <- apply(X, 1, sum) + rnorm(n_row)

# Some visualizations ---------------------------------------------------

qplot(X[,1], y) + geom_smooth(method = "lm")

# Defining the model ------------------------------------------------------


model <- nn_sequential(
  nn_linear(n_col, 1, bias = FALSE)
)

model

# Generating predictions --------------------------------------------------
X <- torch_tensor(X)
y <- torch_tensor(matrix(y))

y_hat <- model(X)
dim(y_hat)

# Calculating the error ----------------------------------------------------

Metrics::rmse(as.numeric(y), as.numeric(y_hat))
sqrt(nnf_mse_loss(y, y_hat, reduction = "mean"))

# Optimizer -----------------------------------------------------

optimizer <- optim_sgd(model$parameters, lr = 0.1)

# Fitting models ----------------------------------------------------

for (t in 1:30) {
  
  ### -------- Forward pass -------- 
  y_pred <- model(X)
  
  ### -------- compute loss -------- 
  loss <- nnf_mse_loss(y_pred, y, reduction = "mean")
  cat("Epoch: ", t, "   Loss: ", loss$item(), "\n")
  
  ### -------- Backpropagation -------- 
  
  # Still need to zero out the gradients before the backward pass, only this time,
  # on the optimizer object
  optimizer$zero_grad()
  
  # gradients are still computed on the loss tensor (no change here)
  loss$backward()
  
  ### -------- Update weights -------- 
  
  # use the optimizer to update model parameters
  optimizer$step()
}

# Recalculating error ---------------------------------------------

model$parameters

y_hat <- model(X)
Metrics::rmse(as.numeric(y), as.numeric(y_hat))
sqrt(nnf_mse_loss(y, y_hat, reduction = "mean"))





