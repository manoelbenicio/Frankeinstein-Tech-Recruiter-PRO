import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { UploadCloud, LayoutDashboard, FileText, LogOut, Loader, CheckCircle, AlertTriangle, Briefcase, DollarSign, Users, Star, ChevronsRight } from 'lucide-react';

// --- SERVIÇO DE API MOCK ---
const api = {
  getDashboardData: async (dashboardName) => {
    console.log(`[API MOCK] Buscando dados para: ${dashboardName}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (dashboardName === 'pnl') {
      return {
        project: 'Santander Consolidado',
        revenue: 5278450.75,
        costs: 3895120.25,
        profit: 1383330.50,
      };
    }
    if (dashboardName === 'hc') {
      return {
        active_resources: 42,
        by_seniority: [
          { name: 'Junior', count: 5 },
          { name: 'Pleno', count: 21 },
          { name: 'Senior', count: 12 },
          { name: 'Especialista', count: 4 },
        ],
      };
    }
    return null;
  },
  uploadFile: async (endpoint, file) => {
    console.log(`[API MOCK] Uploading ${file.name} para ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (file.name.includes("error")) {
        return { success: false, message: "Falha na validação da planilha." };
    }
    return { success: true, job_id: `job_${Date.now()}` };
  },
  analyzeCv: async (cvFiles, jobDescription) => {
    console.log(`[API MOCK] Analisando ${cvFiles.length} CVs.`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Array.from(cvFiles).map(file => ({
      fileName: file.name,
      final_score: parseFloat((70 + Math.random() * 25).toFixed(2)),
      critical_analysis: `Candidato com forte aderência para a vaga de ${jobDescription.substring(0,20)}...`,
      score_details: {
        experience: { score: Math.floor(7 + Math.random() * 3), justification: "Boa experiência com tecnologias chave." },
        skills: { score: Math.floor(6 + Math.random() * 4), justification: "Menciona as habilidades requeridas." },
        education: { score: Math.floor(5 + Math.random() * 5), justification: "Formação na área." },
        languages: { score: Math.floor(8 + Math.random() * 2), justification: "Inglês avançado." },
        strengths: { score: Math.floor(7 + Math.random() * 3), justification: "Proativo." },
        weaknesses: { score: -Math.floor(Math.random() * 3), justification: "Pouca experiência com gestão." }
      }
    }));
  }
};

// --- COMPONENTES DE UI ---
const KpiCard = ({ title, value, icon, currency = false }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">
        {currency ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value}
      </p>
    </div>
  </div>
);

const Sidebar = ({ user, onNavigate, onLogout, currentPage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'etl', label: 'Upload de Arquivos', icon: <UploadCloud size={20} /> },
    { id: 'cv', label: 'Análise de Currículos', icon: <FileText size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">Plataforma Analítica</div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <a key={item.id} href="#" onClick={() => onNavigate(item.id)}
            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${currentPage === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
            {item.icon}<span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="User Avatar" />
          <div>
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
          <button onClick={onLogout} className="ml-auto text-gray-400 hover:text-white"><LogOut size={20} /></button>
        </div>
      </div>
    </div>
  );
};

// --- TELAS (PÁGINAS) DA APLICAÇÃO ---
const DashboardPage = () => {
  const [pnlData, setPnlData] = useState(null);
  const [hcData, setHcData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [pnl, hc] = await Promise.all([api.getDashboardData('pnl'), api.getDashboardData('hc')]);
      setPnlData(pnl);
      setHcData(hc);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader className="animate-spin" size={48} /></div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard de Visão Geral</h1>
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Financeiro (P&L)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard title="Receita Total" value={pnlData.revenue} icon={<DollarSign />} currency />
          <KpiCard title="Custos Totais" value={pnlData.costs} icon={<DollarSign />} currency />
          <KpiCard title="Margem Bruta" value={pnlData.profit} icon={<DollarSign />} currency />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Headcount (HC)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KpiCard title="Recursos Ativos" value={hcData.active_resources} icon={<Users />} />
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-600 mb-4">Distribuição por Senioridade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hcData.by_seniority}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis />
                <Tooltip formatter={(value) => [value, 'Recursos']} /><Legend />
                <Bar dataKey="count" name="Quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadComponent = ({ title, endpoint }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => { setStatus('idle'); setFile(e.target.files[0]); };
    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        const response = await api.uploadFile(endpoint, file);
        setStatus(response.success ? 'success' : 'error');
        setMessage(response.success ? `Arquivo processado! Job ID: ${response.job_id}` : response.message);
    };

    const statusIcons = {
        uploading: <Loader className="animate-spin text-blue-500" />,
        success: <CheckCircle className="text-green-500" />,
        error: <AlertTriangle className="text-red-500" />,
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
            <div className="flex items-center space-x-4">
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                <button onClick={handleUpload} disabled={!file || status === 'uploading'} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 flex items-center">
                    {status === 'uploading' ? <Loader className="animate-spin mr-2" size={20} /> : <UploadCloud className="mr-2" size={20} />} Processar
                </button>
            </div>
            {status !== 'idle' && (
                <div className="mt-4 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    {statusIcons[status]}
                    <p className={`text-sm ${status === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message}</p>
                </div>
            )}
        </div>
    );
};

const EtlPage = () => (
  <div className="p-8 space-y-8">
    <h1 className="text-3xl font-bold text-gray-800">Upload de Arquivos para ETL</h1>
    <div className="space-y-6">
        <UploadComponent title="Planilha de Project Request (PR)" endpoint="/etl/pr" />
        <UploadComponent title="Inventário de Vagas e Candidatos" endpoint="/etl/vagas" />
    </div>
  </div>
);

const ScoreComparison = ({ candidate1, candidate2 }) => {
    const categories = ["experience", "skills", "education", "languages", "strengths"];
    const data = categories.map(cat => ({
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        c1: candidate1.score_details[cat].score,
        c2: candidate2.score_details[cat].score,
    }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparativo Lado a Lado</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar name={candidate1.fileName} dataKey="c1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name={candidate2.fileName} dataKey="c2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Legend /><Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const CvPage = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [cvFiles, setCvFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('idle');
    const [selected, setSelected] = useState([]);

    const handleAnalyze = async () => {
        if (!jobDescription || cvFiles.length === 0) return;
        setStatus('analyzing');
        const analysisResults = await api.analyzeCv(cvFiles, jobDescription);
        setResults(analysisResults.sort((a, b) => b.final_score - a.final_score));
        setStatus('done');
    };

    const handleSelect = (fileName) => {
        const newSelected = selected.includes(fileName) ? selected.filter(s => s !== fileName) : [...selected, fileName].slice(-2);
        setSelected(newSelected);
    };

    const selectedCandidates = results.filter(r => selected.includes(r.fileName));

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Módulo de Análise de Currículos</h1>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="job-desc" className="block text-sm font-medium text-gray-700">1. Descrição da Vaga</label>
                    <textarea id="job-desc" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Cole a descrição completa da vaga aqui..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="cv-upload" className="block text-sm font-medium text-gray-700">2. Upload dos Currículos (PDF, DOCX)</label>
                    <input type="file" multiple onChange={(e) => setCvFiles(e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button onClick={handleAnalyze} disabled={!jobDescription || cvFiles.length === 0 || status === 'analyzing'} className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-400 hover:bg-blue-700 flex items-center justify-center">
                    {status === 'analyzing' ? <Loader className="animate-spin mr-2" size={20} /> : <ChevronsRight className="mr-2" size={20} />} Analisar e Pontuar
                </button>
            </div>

            {status === 'done' && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Resultados da Análise</h2>
                    <p className="text-sm text-gray-600 mb-4">Selecione até 2 candidatos para comparar.</p>
                    <div className="space-y-3">
                        {results.map(res => (
                            <div key={res.fileName} onClick={() => handleSelect(res.fileName)} className={`p-4 rounded-lg shadow-sm cursor-pointer transition-all border-2 ${selected.includes(res.fileName) ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white hover:border-blue-300'}`}>
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-gray-800">{res.fileName}</p>
                                    <div className="flex items-center space-x-2 text-lg font-bold">
                                        <Star className={`h-5 w-5 ${res.final_score > 85 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                                        <span className={res.final_score > 85 ? 'text-green-600' : 'text-gray-700'}>{res.final_score}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{res.critical_analysis}</p>
                            </div>
                        ))}
                    </div>
                    {selectedCandidates.length === 2 && <ScoreComparison candidate1={selectedCandidates[0]} candidate2={selectedCandidates[1]} />}
                </div>
            )}
        </div>
    );
};

const LoginPage = ({ onLogin }) => (
  <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center bg-white p-12 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Plataforma Analítica</h1>
      <p className="text-gray-600 mb-8">Faça login para acessar os dashboards.</p>
      <button onClick={onLogin} className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
        Entrar com Google
      </button>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = () => {
    setUser({
      displayName: 'Usuário de Operações',
      email: 'ops@example.com',
      photoURL: `https://i.pravatar.cc/150?u=ops`,
      role: 'ops'
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => { setIsAuthenticated(false); setUser(null); };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'etl': return <EtlPage />;
      case 'cv': return <CvPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar user={user} onNavigate={setCurrentPage} onLogout={handleLogout} currentPage={currentPage} />
      <main className="flex-1 overflow-y-auto">{renderPage()}</main>
    </div>
  );
}
