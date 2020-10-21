library(decryptr)

arq <- download_captcha("rfb")

arq %>%
  read_captcha() %>% 
  dplyr::first() %>% 
  plot()
    
model <- load_model("rfb")

decrypt(arq, model)
