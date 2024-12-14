# MVP 

App estatico sem utilizacão de dependencias feito para projeto de MVP do curso de pós graduacão PUC-RIO

# Como rodar?

O projeto nao precisa de nenhuma tarefa para ser executado, basta abrir a pagina `login.html` em seu navegador. 
O projeto esta configurado pra bater na [API](https://github.com/ommeirelles/crmi) atraves da url 127.0.0.1:5000. 
> Caso precise mudar o endpoint alterar a classe [Config](./src/services/config.js) dentro da pasta `src/services`

# Descricao: 

Trata-se de um MVP para um CRM de gerenciamento de entradas de configuracao para internacionalizacão. Ao internacionalizar um aplicativo ha duas formas de gerenciar o texto, a primeira utilizando um arquivo local junto ao App internacionalizado no formato JSON e a outra e ter um CRM que sirva o JSON através de uma API. 

Caso voce abra a pagina `main.html` automaticamente sera redirecionado para pagina de login onde devera criar uma senha com email + senha de 6 digitos.