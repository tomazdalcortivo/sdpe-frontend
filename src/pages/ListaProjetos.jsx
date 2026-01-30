import { Search, SlidersHorizontal, MapPin, Monitor, Building2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import api from "../services/api";

export default function ListaProjetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
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
      const matchCoordenador = p.coordenadores?.some(c => c.nome?.toLowerCase().includes(termo));
      if (!matchNome && !matchCoordenador) return false;
    }
    if (statusFiltro && statusCalculado !== statusFiltro) return false;
    if (areaFiltro && p.area !== areaFiltro) return false;
    if (modalidadeFiltro && p.formato !== modalidadeFiltro) return false;
    if (instituicaoFiltro && p.instituicaoEnsino?.nome !== instituicaoFiltro) return false;
    return true;
  });

  return (
    <section className="min-h-screen px-4 md:px-8 pt-32 pb-20 bg-gray-50/50">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Projetos de Extensão
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Explore {projetosFiltrados.length} projetos disponíveis na rede.
            </p>
          </div>

          {/* BARRA DE FERRAMENTAS */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 w-4 h-4 transition-colors" />
              <input
                type="text"
                placeholder="Buscar projeto ou professor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              />
            </div>

            <button
              onClick={() => setAbrirFiltro(!abrirFiltro)}
              className={`h-10 px-4 flex items-center gap-2 text-sm font-medium border rounded-lg transition-all ${abrirFiltro
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {/* PAINEL DE FILTROS */}
        {abrirFiltro && (
          <div className="mb-8 p-6 bg-white border border-gray-100 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
              <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="mt-1 w-full text-sm border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Todos</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="FINALIZADO">Finalizados</option>
                <option value="INATIVO">Inativos</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Área</label>
              <select value={areaFiltro} onChange={(e) => setAreaFiltro(e.target.value)} className="mt-1 w-full text-sm border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Todas</option>
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
              <label className="text-xs font-semibold text-gray-500 uppercase">Modalidade</label>
              <select value={modalidadeFiltro} onChange={(e) => setModalidadeFiltro(e.target.value)} className="mt-1 w-full text-sm border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Todas</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="ONLINE">Online</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Instituição</label>
              <select value={instituicaoFiltro} onChange={(e) => setInstituicaoFiltro(e.target.value)} className="mt-1 w-full text-sm border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Todas</option>
                {listaInstituicoes.map((inst, i) => <option key={i} value={inst}>{inst}</option>)}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button onClick={() => { setStatusFiltro(""); setAreaFiltro(""); setModalidadeFiltro(""); setInstituicaoFiltro(""); }} className="text-xs font-medium text-red-600 hover:text-red-800">
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* --- GRID DE CARDS --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full border-gray-200 border-t-emerald-600 animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projetosFiltrados.map((projeto) => {
              const statusLabel = getStatusProjeto(projeto);
              const imageUrl = `http://localhost:8080/api/projetos/${projeto.id}/imagem`;
              const nomeOriginal = projeto.coordenadores?.[0]?.nome || "";
              const partesNome = nomeOriginal.trim().split(" ");
              const nomeFormatado = partesNome.length > 1
                ? `${partesNome[0]} ${partesNome[partesNome.length - 1]}`
                : (partesNome[0] || "Coordenação");

              return (
                <Link
                  to={`/detalhes-projeto/${projeto.id}`}
                  key={projeto.id}
                  className="group relative flex flex-col bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 overflow-hidden"
                >
                  {/* IMAGEM SLIM (h-36) */}
                  <div className="relative h-36 overflow-hidden bg-gray-50">
                    <img
                      src={imageUrl}
                      alt={projeto.nome}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      // --- MUDANÇA AQUI: Fundo Neutro + Ícone Riscado ---
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none'; // 1. Esconde a tag img quebrada

                        const parent = e.target.parentNode;
                        // 2. Adiciona fundo cinza claro neutro e centraliza
                        parent.classList.remove('bg-gray-50'); // Remove o padrão se necessário
                        parent.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center');

                        // 3. Injeta o ícone de 'Imagem Riscada' (SVG) em cinza neutro
                        parent.innerHTML += `
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300">
                            <line x1="2" x2="22" y1="2" y2="22"/>
                            <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/>
                            <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                          </svg>
                        `;
                      }}
                    // ---------------------------------------------
                    />

                    {/* Badge de Status */}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-md ${statusLabel === "EM_ANDAMENTO" ? "bg-emerald-500/90 text-white" :
                          statusLabel === "FINALIZADO" ? "bg-blue-500/90 text-white" :
                            "bg-gray-500/90 text-white"
                        }`}>
                        {statusLabel === "EM_ANDAMENTO" ? "Ativo" : statusLabel === "FINALIZADO" ? "Fim" : "Inativo"}
                      </span>
                    </div>
                  </div>

                  {/* CONTEÚDO COMPACTO */}
                  <div className="flex flex-col flex-1 p-3.5">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 truncate max-w-[120px]">
                        {projeto.area}
                      </span>
                      {projeto.formato && (
                        <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                          {projeto.formato.toLowerCase()}
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
                      {projeto.nome}
                    </h3>

                    {/* Descrição */}
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                      {projeto.descricao}
                    </p>

                    {/* Rodapé */}
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5" title={`Professor(a): ${nomeOriginal}`}>
                        <User size={12} className="text-gray-300" />
                        <span className="font-medium text-gray-600 truncate max-w-[110px]">{nomeFormatado}</span>
                      </div>

                      {projeto.instituicaoEnsino?.nome && (
                        <div className="flex items-center gap-1.5" title={projeto.instituicaoEnsino.nome}>
                          <Building2 size={12} className="text-gray-300" />
                          <span className="truncate max-w-[90px]">{projeto.instituicaoEnsino.nome}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && projetosFiltrados.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 mt-8">
            <p className="text-gray-500 text-sm">Nenhum projeto encontrado.</p>
            <button onClick={() => { setBusca(""); setStatusFiltro(""); setAreaFiltro(""); }} className="mt-2 text-sm text-emerald-600 font-medium hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}