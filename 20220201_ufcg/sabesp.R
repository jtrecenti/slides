# 1. colete os dados de mananciais da sabesp
u_sabesp <- "http://mananciais.sabesp.com.br/api/Mananciais/ResumoSistemas/2020-03-15"
r_sabesp <- httr::GET(u_sabesp, httr::config(ssl_verifypeer = FALSE))
results <- httr::content(r_sabesp, simplifyDataFrame = TRUE)
results$ReturnObj$sistemas




