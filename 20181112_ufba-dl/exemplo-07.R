library(keras)
library(tidyverse)

# Data -------------------------------------------------------------------

imdb <- dataset_imdb(num_words = 20000)
imdb_words <- dataset_imdb_word_index()
words <- imdb_words %>% imap_dfr(~dplyr::data_frame(id = .x, palavra = .y))

imdb$train$x[[1]] %>% 
  data_frame(id = . - 3) %>% 
  left_join(words, by = "id") %>% 
  with(palavra) %>% 
  paste(collapse = " ")

x_train <- imdb$train$x %>%
  pad_sequences(maxlen = 400)
x_test <- imdb$test$x %>%
  pad_sequences(maxlen = 400)

# Model ------------------------------------------------------

input <- layer_input(shape = 400)

output <- input %>%
  layer_embedding(input_dim = 20000, output_dim = 128) %>% 
  # layer_lstm(units = 64) %>% 
  layer_cudnn_lstm(units = 64) %>%
  layer_dense(units = 1, activation = 'sigmoid')

modelo <- keras_model(input, output)
modelo %>% compile(
  loss = 'binary_crossentropy',
  optimizer = 'adam',
  metrics = c('accuracy')
)

# Adjust -----------------------------------------------------------------

modelo %>% fit(
  x_train, imdb$train$y,
  validation_data = list(x_test, imdb$test$y)
)


