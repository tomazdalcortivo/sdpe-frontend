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
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Estatisticas() {
    const [visData, setVisData] = useState(null);
    const [areaData, setAreaData] = useState(null);

    // Novos estados para o filtro
    const [projetos, setProjetos] = useState([]);
    const [projetoSelecionado, setProjetoSelecionado] = useState("");

    const [loading, setLoading] = useState(true);

    // 1. Carregar a lista de projetos para o filtro
    useEffect(() => {
        async function carregarProjetos() {
            try {
                // Tenta buscar "Meus Projetos" se for coordenador, ou todos se tiver permissão
                // Ajuste a rota conforme a sua regra. Pode ser /api/projetos/meus-criados
                const response = await api.get("/api/projetos/meus-criados");
                setProjetos(response.data);
            } catch (error) {
                console.error("Erro ao carregar lista de projetos", error);
            }
        }
        carregarProjetos();
    }, []);

    // 2. Carregar gráficos (reage quando muda o projetoSelecionado)
    useEffect(() => {
        async function carregarDados() {
            setLoading(true);
            try {
                const [resVis, resArea] = await Promise.all([
                    // Passa o ID como parâmetro se estiver selecionado
                    api.get("/api/estatisticas/visualizacoes", {
                        params: { projetoId: projetoSelecionado || null }
                    }),
                    api.get("/api/estatisticas/areas"),
                ]);

                const labelsVis = resVis.data.map((d) => d.label);
                const valoresVis = resVis.data.map((d) => d.valor);

                setVisData({
                    labels: labelsVis,
                    datasets: [
                        {
                            label: "Visualizações",
                            data: valoresVis,
                            backgroundColor: "rgba(16, 185, 129, 0.8)",
                            borderColor: "#047857",
                            borderWidth: 1,
                        },
                    ],
                });

                const labelsArea = resArea.data.map((d) => d.label);
                const valoresArea = resArea.data.map((d) => d.valor);

                setAreaData({
                    labels: labelsArea,
                    datasets: [
                        {
                            label: "Qtd. Projetos",
                            data: valoresArea,
                            backgroundColor: [
                                "#3b82f6", "#ef4444", "#eab308", "#10b981", "#a855f7", "#f97316",
                            ],
                            borderColor: "#ffffff",
                            borderWidth: 2,
                        },
                    ],
                });

            } catch (error) {
                console.error("Erro ao carregar estatísticas", error);
            } finally {
                setLoading(false);
            }
        }
        carregarDados();
    }, [projetoSelecionado]); // <--- Recarrega quando esse estado muda

    const optionsBar = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: false },
        },
        maintainAspectRatio: false,
    };

    const optionsPie = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" },
        },
        maintainAspectRatio: false,
    };

    return (
        <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
            <div className="max-w-6xl mx-auto">
                <h1 className="mb-8 text-4xl font-bold text-center text-emerald-900">
                    Estatísticas da Plataforma
                </h1>

                <div className="grid gap-8 md:grid-cols-2">

                    {/* GRÁFICO DE VISUALIZAÇÕES COM FILTRO */}
                    <div className="p-6 bg-white rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-700">Visualizações Mensais</h3>

                            {/* SELETOR DE PROJETO */}
                            <select
                                className="p-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={projetoSelecionado}
                                onChange={(e) => setProjetoSelecionado(e.target.value)}
                            >
                                <option value="">Geral (Todos)</option>
                                {projetos.map(proj => (
                                    <option key={proj.id} value={proj.id}>
                                        {proj.nome.length > 20 ? proj.nome.substring(0, 20) + "..." : proj.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="h-64">
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-slate-400">Carregando...</div>
                            ) : visData ? (
                                <Bar options={optionsBar} data={visData} />
                            ) : (
                                <p>Sem dados.</p>
                            )}
                        </div>
                    </div>

                    {/* GRÁFICO DE ÁREAS (PIZZA) - Mantido igual */}
                    <div className="p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="mb-4 text-xl font-bold text-slate-700">Projetos por Área</h3>
                        <div className="h-64">
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-slate-400">Carregando...</div>
                            ) : areaData ? (
                                <Pie options={optionsPie} data={areaData} />
                            ) : (
                                <p>Sem dados.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}