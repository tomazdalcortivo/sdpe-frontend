import { Search, SlidersHorizontal, MapPin, Monitor, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import api from "../services/api";

export default function ListaProjetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [areaFiltro, setAreaFiltro] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState(""); 
  const [instituicaoFiltro, setInstituicaoFiltro] = useState(""); 

  const [abrirFiltro, setAbrirFiltro] = useState(false);

  useEffect(() => {
    async function carregarProjetos() {
      try {
        setLoading(true);
        const response = await api.get("/api/projetos?tamPag=200");
        setProjetos(response.data.content || []);
      } catch (error) {
        console.error("Erro ao carregar projetos", error);
      } finally {
        setLoading(false);
      }
    }
    carregarProjetos();
  }, []);

  const listaInstituicoes = useMemo(() => {
    const instituicoes = projetos
      .map(p => p.instituicaoEnsino?.nome)
      .filter(nome => nome); 
    return [...new Set(instituicoes)].sort(); 
  }, [projetos]);

  const getStatusProjeto = (projeto) => {
    if (projeto.status === false) return "INATIVO";
    const dataFim = new Date(projeto.dataFim);
    const hoje = new Date();
    return dataFim < hoje ? "FINALIZADO" : "EM_ANDAMENTO";
  };

  const projetosFiltrados = projetos.filter((p) => {
    const statusCalculado = getStatusProjeto(p);

    if (busca) {
      const termo = busca.toLowerCase();
      const matchNome = p.nome?.toLowerCase().includes(termo);
      const matchCoordenador = p.coordenadores?.some(c =>
        c.nome?.toLowerCase().includes(termo)
      );

      if (!matchNome && !matchCoordenador) {
        return false;
      }
    }

    if (statusFiltro && statusCalculado !== statusFiltro) return false;
    if (areaFiltro && p.area !== areaFiltro) return false;

    if (modalidadeFiltro && p.formato !== modalidadeFiltro) return false;
    if (instituicaoFiltro && p.instituicaoEnsino?.nome !== instituicaoFiltro) return false;

    return true;
  });

  return (
    <section className="min-h-screen px-8 pt-40 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-center text-emerald-700">
          Projetos de Extensão
        </h1>

        <p className="mb-10 text-center text-slate-600">
          Explore os projetos cadastrados, filtre por área, professor ou modalidade.
        </p>

        <div className="relative flex flex-col gap-4 mb-12 md:flex-row z-10">
          <div className="relative flex-1">
            <Search className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por projeto ou nome do professor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full py-3 pl-12 pr-4 border rounded-full shadow-sm outline-none border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => setAbrirFiltro(!abrirFiltro)}
            className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-full transition-all shadow-sm ${abrirFiltro
              ? "bg-emerald-100 border-emerald-500 text-emerald-800"
              : "bg-white border-slate-300 hover:bg-slate-50"
              }`}
          >
            <SlidersHorizontal size={18} />
            Filtros
            {(statusFiltro || areaFiltro || modalidadeFiltro || instituicaoFiltro) && (
              <span className="flex items-center justify-center w-5 h-5 text-xs text-white rounded-full bg-emerald-600">
                {[statusFiltro, areaFiltro, modalidadeFiltro, instituicaoFiltro].filter(Boolean).length}
              </span>
            )}
          </button>

          {abrirFiltro && (
            <div className="absolute right-0 p-5 bg-white border shadow-xl w-full md:w-[600px] rounded-xl top-16 border-slate-100 animate-in fade-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                    className="w-full p-2.5 text-sm border rounded-lg outline-none border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                  >
                    <option value="">Todos os status</option>
                    <option value="EM_ANDAMENTO">Em andamento</option>
                    <option value="FINALIZADO">Finalizados</option>
                    <option value="INATIVO">Inativos</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                    Modalidade
                  </label>
                  <div className="relative">
                    <Monitor size={16} className="absolute text-slate-400 left-3 top-3" />
                    <select
                      value={modalidadeFiltro}
                      onChange={(e) => setModalidadeFiltro(e.target.value)}
                      className="w-full p-2.5 pl-9 text-sm border rounded-lg outline-none border-slate-200 focus:border-emerald-500 bg-slate-50"
                    >
                      <option value="">Todas</option>
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="ONLINE">Remoto</option>
                      <option value="HIBRIDO">Híbrido</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                    Área de Conhecimento
                  </label>
                  <select
                    value={areaFiltro}
                    onChange={(e) => setAreaFiltro(e.target.value)}
                    className="w-full p-2.5 text-sm border rounded-lg outline-none border-slate-200 focus:border-emerald-500 bg-slate-50"
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

                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                    Instituição
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute text-slate-400 left-3 top-3" />
                    <select
                      value={instituicaoFiltro}
                      onChange={(e) => setInstituicaoFiltro(e.target.value)}
                      className="w-full p-2.5 pl-9 text-sm border rounded-lg outline-none border-slate-200 focus:border-emerald-500 bg-slate-50"
                    >
                      <option value="">Todas as instituições</option>
                      {listaInstituicoes.map((inst, index) => (
                        <option key={index} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 pt-2 flex justify-end border-t border-slate-100 mt-2">
                <button
                  onClick={() => {
                    setStatusFiltro("");
                    setAreaFiltro("");
                    setModalidadeFiltro("");
                    setInstituicaoFiltro("");
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline px-2"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full border-emerald-200 border-t-emerald-600 animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {projetosFiltrados.map((projeto) => {
              const statusLabel = getStatusProjeto(projeto);
              const imageUrl = `http://localhost:8080/api/projetos/${projeto.id}/imagem`;

              const nomeCoordenador = projeto.coordenadores?.[0]?.nome || "Coordenação não informada";

              return (
                <div
                  key={projeto.id}
                  className="flex flex-col overflow-hidden transition-all bg-white border shadow-sm border-slate-100 rounded-xl hover:shadow-lg hover:-translate-y-1 group"
                >
                  <div className="relative h-48 overflow-hidden bg-emerald-50">
                    <img
                      src={imageUrl}
                      alt={projeto.nome}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.classList.add('bg-emerald-600');
                      }}
                    />
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-block px-2 py-1 text-[10px] font-semibold tracking-wide uppercase rounded bg-slate-100 text-slate-600">
                        {projeto.area}
                      </span>
                      {projeto.formato && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold tracking-wide uppercase rounded bg-blue-50 text-blue-600">
                          <Monitor size={10} /> {projeto.formato}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-slate-800 line-clamp-2" title={projeto.nome}>
                      {projeto.nome}
                    </h3>

                    <p className="flex-1 mb-4 text-sm text-slate-500 line-clamp-3">
                      {projeto.descricao}
                    </p>

                    <div className="pt-4 mt-auto border-t border-slate-50">
                      <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                        <span className="font-semibold text-emerald-700">Prof. Responsável:</span>
                        <span className="truncate">{nomeCoordenador}</span>
                      </div>

                      {projeto.instituicaoEnsino?.nome && (
                        <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                          <MapPin size={12} />
                          <span className="truncate">{projeto.instituicaoEnsino.nome}</span>
                        </div>
                      )}

                      <Link
                        to={`/detalhes-projeto/${projeto.id}`}
                        className="block w-full py-2.5 text-sm font-semibold text-center transition-colors rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && projetosFiltrados.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-slate-500">
              Nenhum projeto encontrado com os filtros selecionados.
            </p>
            {(busca || statusFiltro || areaFiltro || modalidadeFiltro) && (
              <button
                onClick={() => {
                  setBusca("");
                  setStatusFiltro("");
                  setAreaFiltro("");
                  setModalidadeFiltro("");
                  setInstituicaoFiltro("");
                }}
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