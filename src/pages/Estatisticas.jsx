import { useEffect, useState } from "react";
import api from "../services/api";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

function useCountUp(endValue, duration = 2000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            if (progress < duration) {
                // Calcula o valor proporcional ao tempo decorrido
                const nextCount = Math.min(endValue, Math.floor((progress / duration) * endValue));
                setCount(nextCount);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        if (endValue > 0) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            setCount(0);
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [endValue, duration]);

    return count;
}

export default function Estatisticas() {
    const [abaAtiva, setAbaAtiva] = useState("geral");
    const [loading, setLoading] = useState(false);

    const [totalProjetos, setTotalProjetos] = useState(0);
    const [cadastrosData, setCadastrosData] = useState(null);
    const [areasData, setAreasData] = useState(null);

    const [projetosList, setProjetosList] = useState([]);
    const [projetoSelecionado, setProjetoSelecionado] = useState("");
    const [visData, setVisData] = useState(null);

    const [isCoordenador, setIsCoordenador] = useState(false);

    const animatedTotal = useCountUp(totalProjetos);

    useEffect(() => {
        const verificarPermissoes = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const response = await api.get("/auth/perfil");
                    const { perfil } = response.data;

                    if (perfil === "COORDENADOR" || perfil === "ADMIN") {
                        setIsCoordenador(true);
                    } else {
                        setIsCoordenador(false);
                    }
                } catch (error) {
                    console.error("Erro ao validar permissões:", error);
                    setIsCoordenador(false);
                }
            } else {
                setIsCoordenador(false);
            }
        };

        verificarPermissoes();
    }, []);

    // 2. Carregar dados da aba GERAL
    useEffect(() => {
        if (abaAtiva === "geral") {
            async function fetchGeral() {
                setLoading(true);
                try {
                    const [resTotal, resCad, resArea] = await Promise.all([
                        api.get("/api/estatisticas/geral/total-projetos"),
                        api.get("/api/estatisticas/geral/cadastros"),
                        api.get("/api/estatisticas/geral/areas")
                    ]);

                    setTotalProjetos(resTotal.data);

                    setCadastrosData({
                        labels: resCad.data.map(d => d.label),
                        datasets: [{
                            label: "Novos Usuários",
                            data: resCad.data.map(d => d.valor),
                            borderColor: "#10b981",
                            backgroundColor: "rgba(16, 185, 129, 0.2)",
                            tension: 0.3,
                            fill: true
                        }]
                    });

                    setAreasData({
                        labels: resArea.data.map(d => d.label),
                        datasets: [{
                            data: resArea.data.map(d => d.valor),
                            backgroundColor: ["#3b82f6", "#ef4444", "#eab308", "#10b981", "#a855f7", "#f97316"],
                        }]
                    });
                } catch (err) {
                    console.error("Erro ao carregar estatísticas gerais", err);
                } finally {
                    setLoading(false);
                }
            }
            fetchGeral();
        }
    }, [abaAtiva]);

    // 3. Carregar lista de projetos do COORDENADOR (Apenas se tiver permissão e estiver na aba)
    useEffect(() => {
        if (abaAtiva === "coordenador" && isCoordenador) {
            async function fetchProjetos() {
                try {
                    const res = await api.get("/api/projetos/meus-criados");
                    setProjetosList(res.data);

                    if (res.data.length > 0) {
                        setProjetoSelecionado(res.data[0].id);
                    }
                } catch (err) {
                    console.error("Erro ao buscar projetos do coordenador", err);
                }
            }
            fetchProjetos();
        }
    }, [abaAtiva, isCoordenador]);

    // 4. Carregar visualizações quando muda o projeto selecionado
    useEffect(() => {
        if (abaAtiva === "coordenador" && projetoSelecionado) {
            async function fetchVis() {
                setLoading(true);
                try {
                    const res = await api.get("/api/estatisticas/visualizacoes", {
                        params: { projetoId: projetoSelecionado }
                    });

                    setVisData({
                        labels: res.data.map(d => d.label),
                        datasets: [{
                            label: "Visualizações",
                            data: res.data.map(d => d.valor),
                            backgroundColor: "#3b82f6",
                            borderRadius: 4
                        }]
                    });
                } catch (err) {
                    console.error("Erro ao buscar visualizações", err);
                } finally {
                    setLoading(false);
                }
            }
            fetchVis();
        }
    }, [projetoSelecionado, abaAtiva]);

    // Configuração para forçar números inteiros no gráfico de linha
    const optionsLine = {
        maintainAspectRatio: false,
        scales: {
            y: {
                ticks: {
                    stepSize: 1, // Passos de 1 em 1
                    precision: 0 // Sem casas decimais
                },
                beginAtZero: true
            }
        },
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        }
    };

    return (
        <div className="min-h-screen px-4 pt-40 pb-12 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-center text-emerald-900">Painel de Estatísticas</h1>

                {/* Abas de Navegação */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setAbaAtiva("geral")}
                        className={`px-6 py-2 rounded-full font-medium transition ${abaAtiva === 'geral' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Visão Geral
                    </button>

                    {/* Botão visível APENAS para Coordenadores */}
                    {isCoordenador && (
                        <button 
                            onClick={() => setAbaAtiva("coordenador")}
                            className={`px-6 py-2 rounded-full font-medium transition ${abaAtiva === 'coordenador' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Área do Coordenador
                        </button>
                    )}
                </div>

                {loading && <p className="py-8 text-center text-gray-500">Carregando dados...</p>}

                {/* --- CONTEÚDO: VISÃO GERAL --- */}
                {!loading && abaAtiva === "geral" && (
                    <div className="space-y-6">
                        {/* Card Total com Animação */}
                        <div className="p-6 transition bg-white border-l-4 shadow-sm rounded-xl border-emerald-500 hover:shadow-md">
                            <h3 className="text-sm font-bold text-gray-400 uppercase">Total de Projetos</h3>
                            <p className="mt-2 text-5xl font-extrabold text-emerald-600">
                                {animatedTotal}
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Gráfico de Cadastros (Inteiros) */}
                            <div className="p-6 bg-white shadow-sm rounded-xl">
                                <h3 className="mb-4 font-bold text-gray-700">Cadastros Mensais</h3>
                                <div className="h-64">
                                    {cadastrosData ? (
                                        <Line options={optionsLine} data={cadastrosData} />
                                    ) : (
                                        <p>Sem dados.</p>
                                    )}
                                </div>
                            </div>

                            {/* Gráfico de Áreas */}
                            <div className="p-6 bg-white shadow-sm rounded-xl">
                                <h3 className="mb-4 font-bold text-gray-700">Projetos por Área</h3>
                                <div className="h-64">
                                    {areasData ? (
                                        <Pie options={{ maintainAspectRatio: false }} data={areasData} />
                                    ) : (
                                        <p>Sem dados.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONTEÚDO: ÁREA DO COORDENADOR --- */}
                {!loading && abaAtiva === "coordenador" && isCoordenador && (
                    <div className="p-6 bg-white shadow-lg rounded-xl animate-fade-in">
                        <div className="flex flex-col items-center justify-between mb-6 md:flex-row">
                            <h3 className="text-xl font-bold text-gray-800">Desempenho do Projeto</h3>
                            <select
                                className="p-2 mt-2 border rounded-md outline-none md:mt-0 focus:ring-2 focus:ring-blue-500"
                                value={projetoSelecionado}
                                onChange={(e) => setProjetoSelecionado(e.target.value)}
                            >
                                {projetosList.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                                {projetosList.length === 0 && <option>Nenhum projeto encontrado</option>}
                            </select>
                        </div>

                        <div className="w-full h-80">
                            {visData ? (
                                <Bar
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { title: { display: true, text: 'Visualizações por Mês' } },
                                        scales: {
                                            y: { ticks: { stepSize: 1, precision: 0 }, beginAtZero: true }
                                        }
                                    }}
                                    data={visData}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Selecione um projeto para ver as estatísticas.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}