library(keras)

x <- sample(c(letters, LETTERS, 0:9), size = 10000, replace = TRUE)
x_int <- as.integer(as.factor(x)) - 1L 
y <- rnorm(10000, mean = x_int, sd = 2)

tapply(y, x, mean)

x2 <- to_categorical(x_int)

# one-hot encoding ----------------------------------------------------

input <- layer_input(shape = c(62))
output <- input %>% 
  layer_dense(32, use_bias = FALSE) %>% 
  layer_dense(1)


model <- keras_model(input, output)
model %>% 
  compile(
    loss = "mse",
    optimizer = "sgd"
  )

model %>% 
  fit(x2, y, validation_split = 0.2)


# embedding -----------------------------------------------------------

input <- layer_input(shape = c(1))
output <- input %>% 
  layer_embedding(input_dim = 62, output_dim = 32) %>% 
  layer_flatten() %>% 
  layer_dense(1)

model_emb <- keras_model(input, output)

model_emb %>% 
  compile(
    loss = "mse",
    optimizer = "sgd"
  )

model_emb %>% 
  fit(matrix(x_int, ncol = 1), y, validation_split = 0.2)
