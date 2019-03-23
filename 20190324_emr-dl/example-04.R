# Pacotes -----------------------------------------------------------------

library(keras)
library(abind)
library(zeallot)

# Banco de dados ----------------------------------------------------------
c(c(x_train, y_train), c(x_test, y_test)) %<-% dataset_mnist()
dim(x_train)

# Filtrando apenas os 1 e 7 -----------------------------------------------


x_train <- x_train[y_train %in% c(2,9),,]/255
y_train <- y_train[y_train %in% c(2,9)]

x_test <- x_test[y_test %in% c(2,9),,]/255
y_test <- y_test[y_test %in% c(2,9)]

y_train <- as.numeric(y_train == 2)
y_test <- as.numeric(y_test == 2)

x_train <- abind(x_train, along = 4)
x_test <- abind(x_test, along = 4)

dim(x_train)


plot(as.raster(x_train[1,,,]))
table(y_train)

# Mini Exemplo

input <- layer_input(shape = c(4,4,1))

input %>% 
  layer_conv_2d(filters = 8, kernel_size = 2, padding = "valid") %>% 
  print()

input %>% 
  layer_conv_2d(filters = 8, kernel_size = 2, padding = "same") %>% 
  print()

input %>% 
  layer_max_pooling_2d(pool_size = c(2,2)) %>% 
  print()

# Definindo o modelo ------------------------------------------------------

input <- layer_input(shape = c(28, 28, 1))

output <- input %>% 
  layer_conv_2d(filters = 32, kernel_size = c(3,3), activation = "relu") %>% 
  layer_max_pooling_2d(pool_size = c(2,2)) %>% 
  layer_conv_2d(filters = 64, kernel_size = c(3,3), activation = "relu") %>% 
  layer_max_pooling_2d(pool_size = c(2,2)) %>%
  layer_conv_2d(filters = 128, kernel_size = c(3,3), activation = "relu") %>% 
  layer_max_pooling_2d(pool_size = c(2,2)) %>% 
  layer_flatten() %>% 
  layer_dense(units = 1, activation = "sigmoid")

modelo <- keras_model(input, output)
summary(modelo)

modelo %>% 
  compile(
    loss = "binary_crossentropy",
    optimizer = "sgd",
    metrics = "acc"
  )

modelo %>% 
  fit(x_train, y_train, validation_split = 0.2)

evaluate(modelo, x_test, y_test)



