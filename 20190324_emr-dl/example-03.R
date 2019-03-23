# Pacotes -----------------------------------------------------------------

library(keras)
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


plot(as.raster(x_train[1,,]))
table(y_train)

# Definindo o modelo ------------------------------------------------------

input <- layer_input(shape = c(28, 28))

output <- input %>% 
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



