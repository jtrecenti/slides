
### Downloading data --------------------------------------------------

# Before everything, let's load the needed libraries in R.

library(keras)
library(decryptr)

# You can download the data from our Google Storage using the R code below. 
# It will contain around 13k classified captcha images that can be read 
# with decryptr. The captcha comes from Receita Federal Brasileira and 
# has the following format:

download.file(
  "https://storage.googleapis.com/decryptr/data-raw/rfb.zip",
  "rfb.zip"
)

unzip("rfb.zip", exdir = "rfb")

### Reading and preprocessing --------------------------------------------------

# decryptr has some usefull functions to read and transform the images to 
# the data structure needed to train the models.
# The simplest way to transform the data is by running the code below:

captchas <- list.files("rfb/", full.names = TRUE, pattern = ".*png") %>%
  read_captcha(ans_in_path = TRUE, vocab = c(letters, 0:9)) %>%
  join_captchas()

# We can then split our dataset into training and validation sets.

set.seed(902192)
i <- sample.int(captchas$n, 10000)

train <- list(y = captchas$y[i,,,drop = FALSE], x = captchas$x[i,,,,drop = FALSE])
test <- list(y = captchas$y[-i,,,drop = FALSE], x = captchas$x[-i,,,,drop = FALSE])

### Model specification in keras -----------------------------------------------

# Below we will specify a simple 3-layer CNN model using the keras sequential 
# API. We will then compile the model defining the loss function and optimizers.

model <- keras_model_sequential()
model %>%
  layer_conv_2d(
    input_shape = dim(train$x)[-1],
    filters = 16,
    kernel_size = c(5, 5),
    padding = "same",
    activation = "relu") %>%
  layer_max_pooling_2d() %>%
  layer_conv_2d(
    filters = 32,
    kernel_size = c(5, 5),
    padding = "same",
    activation = "relu") %>%
  layer_max_pooling_2d() %>%
  layer_conv_2d(
    filters = 64,
    kernel_size = c(5, 5),
    padding = "same",
    activation = "relu") %>%
  layer_max_pooling_2d() %>%
  layer_flatten() %>%
  layer_dense(units = 256) %>%
  layer_dropout(.1) %>%
  layer_dense(units = prod(dim(train$y)[-1])) %>%
  layer_reshape(target_shape = dim(train$y)[-1]) %>%
  layer_activation("softmax")

model %>%
  compile(
    optimizer = "adam",
    loss = "categorical_crossentropy",
    metrics = "accuracy"
  )

### Model fitting --------------------------------------------------------------

# We can the fit the model by calling the `fit` function with the specified 
# model and data (for training and validation).

model %>%
  fit(
    x = train$x,
    y = train$y,
    batch_size = 32,
    epochs = 20,
    validation_data = list(test$x, test$y)
  )

# After training the model we should persist it to disk in order to be able 
# to make predictions later. We can save it by calling:

save_model_hdf5(model, "rfb.hdf5")

# Making predictions -----------------------------------------------------------

# When making predictions for a new captcha using a custom model it's 
# important to note the `labs` argument of the function `load_model`. 
# It **must** be the same that you passed to the `read_captcha` when reading 
# the captchas for training.

model <- load_model("rfb.hdf5", labs = c(letters, 0:9))
captcha <- read_captcha("img/rfb.png")
plot(captcha[[1]])

decrypt(captcha, model)

