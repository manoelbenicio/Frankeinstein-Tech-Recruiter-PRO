# Estágio 1: Build (instala dependências com Poetry)
FROM python:3.10-slim as builder
WORKDIR /app

# Poetry (fixando versão p/ evitar mudanças de CLI)
RUN pip install --no-cache-dir "poetry==1.8.3"

# Copia manifesto (usa lock se existir)
COPY pyproject.toml ./

# Instala somente deps de produção, sem venv
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main

# Estágio 2: Produção (leva as deps instaladas + código)
FROM python:3.10-slim as production
WORKDIR /app

# 👉 leva site-packages e binários do python do builder (onde Poetry instalou as libs)
COPY --from=builder /usr/local /usr/local

# Copia o código da aplicação
COPY . .

EXPOSE 8000
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
