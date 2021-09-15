# Pacotes -----------------------------------------------------------------

library(torch)
library(torchvision)

# Banco de dados ----------------------------------------------------------

train_ds <- mnist_dataset(
  ".",
  download = TRUE,
  train = TRUE,
  transform = transform_to_tensor
)

test_ds <- mnist_dataset(
  ".",
  download = TRUE,
  train = FALSE,
  transform = transform_to_tensor
)

train_dl <- dataloader(train_ds, batch_size = 32, shuffle = TRUE)
test_dl <- dataloader(test_ds, batch_size = 32)


train_iter <- train_dl$.iter()
x <- train_iter$.next()$x
plot(as.raster(as.matrix(x[1,1,,])))

# Model ------------------------------------------------------

net <- nn_module(

  "MNIST-CNN",

  initialize = function() {
    # in_channels, out_channels, kernel_size, stride = 1, padding = 0
    self$conv1 <- nn_conv2d(1, 32, 3)
    self$conv2 <- nn_conv2d(32, 64, 3)
    self$fc1 <- nn_linear(9216, 128)
    self$fc2 <- nn_linear(128, 10)
  },

  forward = function(x) {
    x %>%
      self$conv1() %>%
      nnf_relu() %>%
      self$conv2() %>%
      nnf_relu() %>%
      nnf_max_pool2d(2) %>%
      torch_flatten(start_dim = 2) %>%
      self$fc1() %>%
      nnf_relu() %>%
      self$fc2()
  }
)

fitted <- net %>%
  luz::setup(
    loss = nn_cross_entropy_loss(),
    optimizer = optim_adam,
    metrics = list(
      luz::luz_metric_accuracy()
    )
  ) %>%
  luz::fit(
    train_dl,
    epochs = 10,
    valid_data = test_dl
  )

preds <- predict(fitted, test_dl)
preds$shape
