
# Plataforma Analítica Unificada

## Executando o Projeto Localmente com Docker

Com o Docker e o Docker Compose instalados na sua máquina, você pode iniciar a aplicação completa (Frontend e Backend) com um único comando.

### Pré-requisitos

1.  **Docker:** [Instale o Docker Desktop](https://www.docker.com/products/docker-desktop/).
2.  **Credenciais do Firebase:**
    * Crie uma pasta chamada `secrets` na raiz do projeto.
    * Coloque seu arquivo de credenciais de conta de serviço do Firebase (JSON) dentro desta pasta com o nome `firebase-credentials.json`.
    * O caminho final deve ser: `./secrets/firebase-credentials.json`.
    * **Importante:** O arquivo `.gitignore` já está configurado para ignorar o diretório `secrets/`.

### Inicialização

1.  Abra um terminal na raiz do projeto (onde o arquivo `docker-compose.yml` está localizado).
2.  Execute o comando para construir as imagens e iniciar os containers:

    ```bash
    docker compose up --build
    ```

3.  Após a conclusão, a aplicação estará disponível nos seguintes endereços:
    * **Frontend (UI):** [http://localhost:3000](http://localhost:3000)
    * **Backend (API):** [http://localhost:8000](http://localhost:8000)
    * **Documentação da API (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Parando a Aplicação

Para parar todos os containers, pressione `Ctrl + C` no terminal onde o `docker compose` está rodando, ou abra um novo terminal e execute:

```bash
docker compose down