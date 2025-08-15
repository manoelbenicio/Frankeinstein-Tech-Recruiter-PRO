# main.py - Ponto de Entrada da API Unificada
# Utiliza FastAPI para criar os endpoints REST.

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime
from fastapi.middleware.cors import CORSMiddleware

# --- Camada de Aplicação / Casos de Uso (Simulada) ---
def process_etl_file_use_case(file: UploadFile, processor_func):
    print(f"Recebido arquivo '{file.filename}' para processamento ETL.")
    # Em um sistema real, aqui você salvaria o arquivo e chamaria o ETL de forma assíncrona
    return {"job_id": "mock_job_123", "status": "processing_started", "file_name": file.filename}

def get_dashboard_data_use_case(dashboard_name: str):
    print(f"Buscando dados para o dashboard: {dashboard_name}")
    # Em um sistema real, aqui você consultaria o Firestore
    if dashboard_name == "pnl":
        return {"project": "Santander Agil", "revenue": 500000, "costs": 350000, "profit": 150000}
    if dashboard_name == "hc":
        return {"active_resources": 25, "by_seniority": {"senior": 10, "pleno": 12, "junior": 3}}
    return {}

# --- Modelos de Dados da API (DTOs) ---
class User(BaseModel):
    email: str
    role: str

class ETLJobResponse(BaseModel):
    job_id: str
    status: str
    file_name: str

class PnLDashboard(BaseModel):
    project: str
    revenue: float = Field(..., example=500000.0)
    costs: float = Field(..., example=350000.0)
    profit: float = Field(..., example=150000.0)
    
# --- Simulação de Autenticação e Autorização ---
# Em uma implementação real, isso validaria um token JWT do Firebase
def get_current_user(role: str = "viewer") -> User:
    if role not in ["viewer", "ops", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified for dependency")
    print(f"[AUTH] Simulando usuário com perfil: '{role}'")
    return User(email=f"test.{role}@example.com", role=role)

def require_ops_role(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["ops", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: Requer perfil de Operações ou Administrador."
        )
    return current_user

# --- Inicialização da Aplicação FastAPI ---
app = FastAPI(
    title="Plataforma Analítica Unificada",
    description="API para dashboards financeiros, de RH e análise de CVs.",
    version="1.0.0"
)

# --- Configuração de CORS ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Endereço do frontend em desenvolvimento
    # Adicionar a URL do frontend de produção aqui
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Roteadores (Endpoints) ---
@app.post("/etl/pr", tags=["ETL"], summary="Upload de planilha de Project Request (PR)", response_model=ETLJobResponse)
async def upload_pr_file(file: UploadFile = File(..., description="Arquivo .xlsm com os dados de HC, Ingressos e Custos."), current_user: User = Depends(require_ops_role)):
    return process_etl_file_use_case(file, processor_func=lambda: None)

@app.post("/etl/vagas", tags=["ETL"], summary="Upload de planilha de Vagas e Candidatos", response_model=ETLJobResponse)
async def upload_vagas_file(file: UploadFile = File(..., description="Arquivo .xlsx com o inventário de vagas e candidatos."), current_user: User = Depends(require_ops_role)):
    return process_etl_file_use_case(file, processor_func=lambda: None)

@app.get("/dashboards/pnl", tags=["Dashboards"], summary="Dados de P&L (Profit & Loss)", response_model=PnLDashboard)
async def get_pnl_dashboard(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    return get_dashboard_data_use_case("pnl")

@app.get("/dashboards/headcount", tags=["Dashboards"], summary="Dados de Headcount", response_model=Dict)
async def get_headcount_dashboard(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    return get_dashboard_data_use_case("hc")

@app.post("/cv/analysis", tags=["Currículos"], summary="Gera análise de um CV para uma vaga")
async def analyze_cv(current_user: User = Depends(require_ops_role)):
    raise HTTPException(status_code=501, detail="Funcionalidade a ser implementada na Fase 6.")

# --- Endpoint de Debug: Firestore ---
from fastapi.responses import JSONResponse
import os

@app.get("/debug/firestore", tags=["Debug"], summary="Verifica conexão com Firestore")
async def debug_firestore():
    try:
        from google.cloud import firestore
        client = firestore.Client()
        project = getattr(client, "project", None)
        _ = next(client.collections(), None)  # toca na API
        return {
            "ok": True,
            "message": "Credencial válida e Firestore acessível.",
            "project": project,
            "credential_path": os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "ok": False,
                "message": "Falha ao acessar Firestore.",
                "error": str(e),
                "credential_path": os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
            },
        )
