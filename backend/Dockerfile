# Estágio 1: Build
FROM python:3.10-slim as builder

WORKDIR /app

# Instala poetry
RUN pip install poetry

# Copia os arquivos de dependências e instala, aproveitando o cache de layers
COPY poetry.lock pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-interaction --no-ansi

# Estágio 2: Produção
FROM python:3.10-slim as production

WORKDIR /app

# Copia as dependências instaladas do estágio de build
COPY --from=builder /app /app

# Copia o código da aplicação
COPY . .

# Expõe a porta que a API irá rodar
EXPOSE 8000

# Comando para iniciar a aplicação com Uvicorn
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
