import json
from typing import Dict, Any

def call_generative_ai_api(cv_text: str, job_description: str) -> Dict[str, Any]:
    print("\n[GenAI MOCK] Analisando CV contra a Vaga...")
    mock_response = {
      "final_score": 82.5,
      "score_details": {
        "experience": {"score": 9, "justification": "Candidato possui 5 anos de experiência com Java e Spring, alinhado com os requisitos da vaga."},
        "skills": {"score": 8, "justification": "Menciona explicitamente SQL, Docker e AWS. Falta menção a Kubernetes."},
        "education": {"score": 7, "justification": "Formação em Análise de Sistemas. Pós-graduação não é na área de tecnologia."},
        "languages": {"score": 10, "justification": "Inglês fluente comprovado por intercâmbio."},
        "strengths": {"score": 8, "justification": "Demonstra proatividade em projetos open-source e boa comunicação."},
        "weaknesses": {"score": -1, "justification": "Pouca experiência com metodologias ágeis formais como Scrum."}
      },
      "critical_analysis": "Candidato com forte aderência técnica à vaga. A experiência prática com as tecnologias chave é um grande diferencial."
    }
    print("[GenAI MOCK] Análise concluída.")
    return mock_response

class CvScorer:
    def __init__(self, cv_file_content: bytes, job_description: str):
        self.cv_text = cv_file_content.decode('utf-8')
        self.job_description = job_description

    def calculate_weighted_score(self, score_details: Dict) -> float:
        weights = {
            "experience": 0.30, "skills": 0.25, "education": 0.10,
            "languages": 0.10, "strengths": 0.15, "weaknesses": 0.10
        }
        total_score = 0
        for category, weight in weights.items():
            score = score_details.get(category, {}).get("score", 0)
            total_score += score * weight
        return round(max(0, total_score * 10), 2)

    def score(self) -> Dict[str, Any]:
        analysis_result = call_generative_ai_api(self.cv_text, self.job_description)
        final_score = self.calculate_weighted_score(analysis_result["score_details"])
        analysis_result["final_score"] = final_score
        analysis_result["scored_at"] = "2025-08-14T22:20:00Z"
        return analysis_result

if __name__ == "__main__":
    mock_cv_content = b"Sou um desenvolvedor Java com 5 anos de experiencia..."
    mock_jd = "Vaga para Desenvolvedor Java Senior com experiencia em AWS e Docker..."
    scorer = CvScorer(cv_file_content=mock_cv_content, job_description=mock_jd)
    result = scorer.score()
    print("\n--- RESULTADO FINAL DA PONTUACAO ---")
    print(json.dumps(result, indent=2, ensure_ascii=False))

