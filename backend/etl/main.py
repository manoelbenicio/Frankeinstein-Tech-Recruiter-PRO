import pandas as pd
import numpy as np
import datetime
import re
import hashlib
import json
from typing import Dict, List, Any

# --- MOCK DO CLIENTE FIRESTORE ---
class MockFirestoreClient:
    def collection(self, name):
        print(f"\n[FIRESTORE MOCK] Acessando coleção: '{name}'")
        return self
    
    def document(self, doc_id=None):
        doc_id_str = doc_id if doc_id else "auto-id"
        print(f" -> Preparando documento: '{doc_id_str}'")
        return self

    def set(self, data):
        data_str = json.dumps(data, indent=2, default=str, ensure_ascii=False)
        if len(data_str) > 250:
            data_str = data_str[:250] + "\n  ...\n}"
        print(f"   -> Salvando dados: {data_str}")

db = MockFirestoreClient()

# --- CAMADA DE NORMALIZAÇÃO ---
def normalize_currency_brl(value: Any) -> float | None:
    if pd.isna(value) or value is None:
        return None
    try:
        value_str = str(value).replace("R$", "").strip()
        value_str = value_str.replace(".", "").replace(",", ".")
        return float(value_str)
    except (ValueError, TypeError):
        return None

def normalize_date(value: Any) -> str | None:
    if pd.isna(value) or value is None:
        return None
    try:
        if isinstance(value, datetime.datetime):
            return value.strftime('%Y-%m-%d')
        return pd.to_datetime(str(value), dayfirst=True).strftime('%Y-%m-%d')
    except (ValueError, TypeError):
        return None

def normalize_seniority(value: str) -> str:
    val_lower = str(value).lower()
    if "esp" in val_lower: return "especialista"
    if "senior" in val_lower: return "senior"
    if "pleno" in val_lower: return "pleno"
    if "junior" in val_lower: return "junior"
    return "nao_informado"

# --- CAMADA DE PARSERS ---
class BaseParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.column_aliases: Dict[str, List[str]] = {}
        self.required_fields: List[str] = []
        self.sheet_name: str = ""

    def _map_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        rename_map = {}
        for standard_name, aliases in self.column_aliases.items():
            for alias in aliases:
                if alias in df.columns:
                    rename_map[alias] = standard_name
                    break
        return df.rename(columns=rename_map)

    def parse(self) -> (List[Dict], List[Dict]):
        try:
            df = pd.read_excel(self.file_path, sheet_name=self.sheet_name)
            df = self._map_columns(df)
        except Exception as e:
            print(f"[ERRO] Falha ao ler a aba '{self.sheet_name}'. Erro: {e}")
            return [], []

        valid_rows, invalid_rows = [], []
        
        for index, row in df.iterrows():
            if row.isnull().all():
                continue

            missing_fields = [field for field in self.required_fields if field not in row or pd.isna(row[field])]
            if missing_fields:
                invalid_rows.append({"linha": index + 2, "motivo": f"Campos obrigatórios ausentes: {missing_fields}", "dados": row.to_dict()})
                continue

            normalized_row = self._normalize(row)
            valid_rows.append(normalized_row)
            
        return valid_rows, invalid_rows

    def _normalize(self, row: pd.Series) -> Dict:
        raise NotImplementedError

class HcParser(BaseParser):
    def __init__(self, file_path: str):
        super().__init__(file_path)
        self.sheet_name = "HC_2025"
        self.column_aliases = {
            "resource_name": ["Recurso", "Nome", "Pessoa"],
            "resource_role": ["Role", "Função"],
            "seniority": ["Nível", "Senioridade"],
            "cost_rate_brl": ["Custo/h", "Rate"],
            "billing_rate_brl": ["Tarifa", "Valor Faturado"],
            "is_active": ["Status", "Ativo"],
            "project": ["Projeto", "Alocação"],
            "start_date": ["Início", "Data Início"],
        }
        self.required_fields = ["resource_name", "resource_role", "seniority", "cost_rate_brl", "billing_rate_brl", "project", "start_date"]

    def _normalize(self, row: pd.Series) -> Dict:
        return {
            "resource_name": str(row.get("resource_name")).strip(),
            "resource_role": str(row.get("resource_role")).lower().strip(),
            "seniority": normalize_seniority(row.get("seniority")),
            "cost_rate_brl": normalize_currency_brl(row.get("cost_rate_brl")),
            "billing_rate_brl": normalize_currency_brl(row.get("billing_rate_brl")),
            "is_active": "ativo" in str(row.get("is_active", "")).lower(),
            "project": str(row.get("project")).lower().strip(),
            "start_date": normalize_date(row.get("start_date")),
        }

# --- CAMADA DE CARGA (LOADER) ---
def load_data(collection_name: str, data: List[Dict], id_key: str = None):
    if not data:
        print(f"[LOADER] Nenhum dado para carregar na coleção '{collection_name}'.")
        return
        
    print(f"[LOADER] Carregando {len(data)} registros para '{collection_name}'...")
    collection_ref = db.collection(collection_name)
    for item in data:
        if id_key and id_key in item and item[id_key]:
            doc_ref = collection_ref.document(str(item[id_key]))
        else:
            doc_ref = collection_ref.document()
        
        doc_ref.set(item)
    print(f"[LOADER] Carga para '{collection_name}' finalizada.")


# --- ORQUESTRADOR DO ETL ---
def process_pr_file(file_path: str, upload_id: str):
    print(f"--- Iniciando processamento do arquivo de PR: {file_path} ---")
    hc_parser = HcParser(file_path)
    valid_hc, invalid_hc = hc_parser.parse()
    
    for row in valid_hc:
        row['upload_id'] = upload_id
        
    load_data("pr_hc", valid_hc)

    if invalid_hc:
        print("\n[RELATÓRIO DE ERROS - HC]")
        for error in invalid_hc:
            print(f"  - Linha {error['linha']}: {error['motivo']}")
    print(f"--- Finalizado processamento do arquivo: {file_path} ---")

def generate_file_hash(file_path: str) -> str:
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

if __name__ == "__main__":
    # Simulação da execução. Crie um arquivo .xlsm de teste para rodar.
    # pr_file_path = "202508_PR_22FP23_Santander_Agil_V01.xlsm" 
    # try:
    #     file_hash = generate_file_hash(pr_file_path)
    #     upload_record = {
    #         "file_name": pr_file_path,
    #         "original_hash": file_hash,
    #         "status": "processing",
    #         "uploaded_at": datetime.datetime.now(),
    #         "uploaded_by": "uid_mock_user"
    #     }
    #     upload_id = "mock_upload_id_12345"
    #     db.collection("pr_uploads").document(upload_id).set(upload_record)
    #     process_pr_file(pr_file_path, upload_id)
    #     db.collection("pr_uploads").document(upload_id).set({"status": "completed"})
    # except FileNotFoundError:
    #     print(f"Arquivo de teste '{pr_file_path}' não encontrado. Pule a execução do ETL.")
    print("Módulo ETL pronto para ser usado pela API.")

