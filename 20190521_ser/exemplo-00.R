library(decryptr)

arq <- download_captcha("rfb", path = "img")

arq %>%
  read_captcha() %>% 
  dplyr::first() %>% 
  plot()
    
model <- load_model("rfb")

decrypt(arq, model)
