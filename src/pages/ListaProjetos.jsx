import { Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function ListaProjetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [areaFiltro, setAreaFiltro] = useState("");
  const [abrirFiltro, setAbrirFiltro] = useState(false);

  useEffect(() => {
    async function carregarProjetos() {
      try {
        setLoading(true);
        const response = await api.get("/api/projetos?tamPag=100");
        setProjetos(response.data.content || []);
      } catch (error) {
        console.error("Erro ao carregar projetos", error);
      } finally {
        setLoading(false);
      }
    }
    carregarProjetos();
  }, []);

  const getStatusProjeto = (projeto) => {
    if (projeto.status === false) return "INATIVO";

    const dataFim = new Date(projeto.dataFim);
    const hoje = new Date();

    if (dataFim < hoje) {
      return "FINALIZADO";
    } else {
      return "EM_ANDAMENTO";
    }
  };

  const projetosFiltrados = projetos.filter((p) => {
    const statusCalculado = getStatusProjeto(p);

    if (statusFiltro && statusCalculado !== statusFiltro) {
      return false;
    }

    if (areaFiltro && p.area !== areaFiltro) {
      return false;
    }

    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <section className="min-h-screen px-8 pt-40 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-center text-emerald-700">
          Projetos de Extensão
        </h1>

        <p className="mb-10 text-center text-slate-600">
          Explore os projetos cadastrados na plataforma
        </p>

        {/* --- BARRA DE BUSCA E FILTROS --- */}
        <div className="relative flex flex-col gap-4 mb-12 md:flex-row">
          {/* Input de Busca */}
          <div className="relative flex-1">
            <Search className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome do projeto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full py-3 pl-12 pr-4 border rounded-full shadow-sm outline-none border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botão Filtro */}
          <button
            onClick={() => setAbrirFiltro(!abrirFiltro)}
            className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-full transition-all shadow-sm ${abrirFiltro
              ? "bg-emerald-100 border-emerald-500 text-emerald-800"
              : "bg-white border-slate-300 hover:bg-slate-50"
              }`}
          >
            <SlidersHorizontal size={18} />
            Filtrar
          </button>

          {/* Dropdown de Filtros */}
          {abrirFiltro && (
            <div className="absolute right-0 z-20 p-5 bg-white border shadow-xl w-72 rounded-xl top-16 border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md outline-none border-slate-200 focus:border-emerald-500"
                >
                  <option value="">Todos os status</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="FINALIZADO">Finalizados</option>
                  <option value="INATIVO">Inativos</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Área de Conhecimento
                </label>
                <select
                  value={areaFiltro}
                  onChange={(e) => setAreaFiltro(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md outline-none border-slate-200 focus:border-emerald-500"
                >
                  <option value="">Todas as áreas</option>
                  <option>Ciências Agrárias</option>
                  <option>Ciências Biológicas</option>
                  <option>Ciências Exatas e da Terra</option>
                  <option>Ciências Humanas</option>
                  <option>Ciências da Saúde</option>
                  <option>Ciências Sociais Aplicadas</option>
                  <option>Engenharias</option>
                  <option>Linguística, Letras e Artes</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* --- LISTAGEM (GRID) --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full border-emerald-200 border-t-emerald-600 animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {projetosFiltrados.map((projeto) => {
              const statusLabel = getStatusProjeto(projeto);

              // URL da imagem (apontando para o backend)
              const imageUrl = `http://localhost:8080/api/projetos/${projeto.id}/imagem`;

              return (
                <div
                  key={projeto.id}
                  className="flex flex-col overflow-hidden transition-all bg-white border shadow-sm border-slate-100 rounded-xl hover:shadow-lg hover:-translate-y-1 group"
                >
                  {/* Imagem do Projeto com Fallback */}
                  <div className="relative h-48 overflow-hidden bg-emerald-50">
                    <img
                      src={imageUrl}
                      alt={projeto.nome}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none'; // Esconde a img quebrada
                        e.target.parentNode.classList.add('bg-emerald-600'); // Mostra o fundo colorido
                      }}
                    />
                    {/* Badge de Status sobre a imagem */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md shadow-sm ${statusLabel === "EM_ANDAMENTO" ? "bg-emerald-500 text-white" :
                        statusLabel === "FINALIZADO" ? "bg-blue-500 text-white" :
                          "bg-gray-500 text-white"
                        }`}>
                        {statusLabel.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-6">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-600">
                        {projeto.area}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-slate-800 line-clamp-2" title={projeto.nome}>
                      {projeto.nome}
                    </h3>

                    <p className="flex-1 mb-6 text-sm text-slate-500 line-clamp-3">
                      {projeto.descricao}
                    </p>

                    <Link
                      to={`/detalhes-projeto/${projeto.id}`}
                      className="block w-full py-2 font-medium text-center transition-colors rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Estado Vazio */}
        {!loading && projetosFiltrados.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-slate-500">
              Nenhum projeto encontrado com os filtros selecionados.
            </p>
            {(busca || statusFiltro || areaFiltro) && (
              <button
                onClick={() => { setBusca(""); setStatusFiltro(""); setAreaFiltro("") }}
                className="mt-4 text-emerald-600 hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}