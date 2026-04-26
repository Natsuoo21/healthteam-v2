# Guia de Implantação e Manutenção (Homelab)

Este guia prático ensina como colocar o HealthTeam v2 do seu ambiente local para rodar em produção no seu Homelab de maneira estável (via Docker), e como você pode melhorá-lo futuramente.

## 1. Primeira Instalação no Homelab

1. No seu ambiente Homelab, assegure-se de que o **Docker** e o **Docker Compose** estão instalados.
2. Copie toda esta pasta do projeto para o servidor (seja usando Git, SCP, ou via um painel como WinSCP/CasaOS).
3. Na pasta raiz do projeto, crie um arquivo chamado `.env` caso ele ainda não tenha ido na cópia (se usar Git, ele será ignorado) e preencha suas chaves:
   ```env
   OPENAI_API_KEY="sua_chave"
   GOOGLE_GENERATIVE_AI_API_KEY="sua_chave"
   DATABASE_URL="file:/app/prisma/dev.db"
   ```
4. Suba o sistema com o comando:
   ```bash
   docker-compose up -d --build
   ```
5. Pronto! O servidor Docker fará a instalação limpa, compilará a interface super leve (Standalone mode) e servirá o sistema no endereço na porta `3000`.

## 2. Como as conversas são salvas?
Dentro do projeto haverá a criação de uma pasta física `data/db/`. 
Essa pasta está amarrada ao Container Docker (bind mount) por fora através do docker-compose. Assim, sempre que alguém interagir com os especialistas da IA, os chats são gravados dentro do arquivo `dev.db` que fica aí nessa pasta. Se quiser fazer backup das consultas ou apagar tudo, basta mexer nesse arquivo.

## 3. Quero fazer uma melhoria: Como eu atualizo o app no Homelab?

Sempre que a gente voltar aqui (no seu ambiente local/Windowns) para programar uma função nova ou alterar os Agentes de IA, siga este fluxo de atualização para não quebrar o seu setup atual de conversas lá no servidor:

1. Modificamos o código localmente. Você testa e me diz que ficou bom.
2. Você sincroniza os arquivos modificados para a pasta do projeto no servidor Homelab (seja fazendo um `git pull` lá no servidor ou apenas copiando os arquivos por cima via SCP).
   - *Nota: NÃO substitua a pasta `/data/db/` do seu servidor que ele criou sozinho, para não apagar o seu histórico (ou se quiser zerar tudo de novo, fique à vontade).*
3. Acesse o terminal do seu Homelab, vá para a pasta raiz, rode o comando mágico novamente:
   ```bash
   docker-compose up -d --build
   ```
   * Magia: O docker vai recriar o contêiner em 1 segundo trazendo seu código novo pra vida, as variáveis continuarão ativas, e o banco de dados continua intacto.
