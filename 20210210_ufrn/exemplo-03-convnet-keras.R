# Pacotes -----------------------------------------------------------------

library(keras)
library(abind)
library(zeallot)
pdev <- tensorflow::tf$config$list_physical_devices("GPU")
tensorflow::tf$config$experimental$set_memory_growth(pdev[[1]], TRUE)

# Banco de dados ----------------------------------------------------------
c(c(x_train, y_train), c(x_test, y_test)) %<-% dataset_mnist()
dim(x_train)

x_train <- x_train[]/255
y_train <- y_train[]

x_test <- x_test[]/255
y_test <- y_test[]

y_train <- to_categorical(y_train)
dim(y_train)

y_test <- to_categorical(y_test)

x_train <- abind(x_train, along = 4)
x_test <- abind(x_test, along = 4)

plot(as.raster(x_train[1,,,]))

# Model ------------------------------------------------------

input <- layer_input(shape = c(28, 28, 1))

output <- input %>% 
  layer_conv_2d(filters = 32, kernel_size = c(3,3), activation = "relu") %>% 
  layer_max_pooling_2d(pool_size = c(2,2)) %>% 
  layer_conv_2d(filters = 64, kernel_size = c(3,3), activation = "relu") %>% 
  layer_max_pooling_2d(pool_size = c(2,2)) %>%
  layer_conv_2d(filters = 128, kernel_size = c(3,3), activation = "relu") %>% 
  layer_max_pooling_2d(pool_size = c(2,2)) %>% 
  layer_flatten() %>% 
  layer_dropout(0.1) %>% 
  layer_dense(units = 10, activation = "softmax")

modelo <- keras_model(input, output)
summary(modelo)

modelo %>% 
  compile(
    loss = "categorical_crossentropy",
    optimizer = "sgd",
    metrics = "acc"
  )

modelo %>% 
  fit(x_train, y_train, validation_split = 0.2)

evaluate(modelo, x_test, y_test)



