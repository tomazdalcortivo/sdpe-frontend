import { Search, SlidersHorizontal, Building2, User, ChevronDown, Check, Calendar, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import api from "../services/api";

const formatarInstituicao = (inst) => {
  if (!inst) return "";
  let texto = inst.nome;
  if (inst.cidade) {
    texto += ` - ${inst.cidade}`;
    if (inst.estado) texto += `/${inst.estado}`;
  }
  return texto;
};

const getStatusProjeto = (projeto) => {
  if (projeto.ativo === false) return "INATIVO";
  if (!projeto.dataFim) return "EM_ANDAMENTO";

  const dataFim = new Date(projeto.dataFim);
  const hoje = new Date();
  dataFim.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  return dataFim < hoje ? "FINALIZADO" : "EM_ANDAMENTO";
};

const formatarData = (dataString) => {
  if (!dataString) return "--/--/----";
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

const ProjetoCard = ({ projeto }) => {
  const [imgError, setImgError] = useState(false);

  const statusLabel = getStatusProjeto(projeto);
  const baseURL = api.defaults.baseURL || "http://localhost:8080";
  const imageUrl = `${baseURL}/api/projetos/${projeto.id}/imagem`;

  const nomeCompleto = projeto.coordenadores?.[0]?.nome || "Coordenação";
  const instituicaoTexto = formatarInstituicao(projeto.instituicaoEnsino);

  return (
    <Link
      to={`/detalhes-projeto/${projeto.id}`}
      className="group relative flex flex-col bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 overflow-hidden"
    >
      <div className={`relative h-36 overflow-hidden ${imgError ? 'bg-emerald-50 flex items-center justify-center' : 'bg-gray-50'}`}>

        {!imgError ? (
          <img
            src={imageUrl}
            alt={projeto.nome}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-emerald-300">
            <ImageOff size={32} />
          </div>
        )}

        <div className="absolute top-2 right-2 z-10">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shadow-sm backdrop-blur-md ${statusLabel === "EM_ANDAMENTO" ? "bg-emerald-500/90 text-white" :
              statusLabel === "FINALIZADO" ? "bg-blue-500/90 text-white" :
                "bg-gray-500/90 text-white"
            }`}>
            {statusLabel === "EM_ANDAMENTO" ? "Ativo" : statusLabel === "FINALIZADO" ? "Finalizado" : "Inativo"}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3.5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 whitespace-normal leading-tight">
            {projeto.area}
          </span>
          {projeto.formato && (
            <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap">
              {projeto.formato.toLowerCase()}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
          {projeto.nome}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {projeto.descricao}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-2">

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5 w-full" title={`Professor(a): ${nomeCompleto}`}>
              <User size={12} className="text-gray-300 shrink-0" />
              <span className="font-medium text-gray-600 truncate flex-1">{nomeCompleto}</span>
            </div>
          </div>

          {projeto.instituicaoEnsino?.nome && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400" title={instituicaoTexto}>
              <Building2 size={12} className="text-gray-300 shrink-0" />
              <span className="truncate flex-1">
                {instituicaoTexto}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} className={`shrink-0 ${statusLabel === "FINALIZADO" ? "text-blue-400" : "text-gray-300"}`} />
            <span className="truncate flex-1">
              {statusLabel === "FINALIZADO"
                ? `Finalizado em: ${formatarData(projeto.dataFim)}`
                : `Início: ${formatarData(projeto.dataInicio)}`
              }
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
};

export default function ListaProjetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [areaFiltro, setAreaFiltro] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState("");
  const [instituicaoFiltro, setInstituicaoFiltro] = useState("");
  const [abrirFiltro, setAbrirFiltro] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const filtroContainerRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (filtroContainerRef.current && !filtroContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const listaInstituicoes = useMemo(() => {
    const instituicoes = projetos
      .filter(p => p.instituicaoEnsino?.nome)
      .map(p => formatarInstituicao(p.instituicaoEnsino));
    return [...new Set(instituicoes)].sort();
  }, [projetos]);

  const projetosFiltrados = projetos.filter((p) => {
    const statusCalculado = getStatusProjeto(p);
    const instituicaoFormatada = p.instituicaoEnsino ? formatarInstituicao(p.instituicaoEnsino) : "";

    if (busca) {
      const termo = busca.toLowerCase();
      const matchNome = p.nome?.toLowerCase().includes(termo);
      const matchCoordenador = p.coordenadores?.some(c => c.nome?.toLowerCase().includes(termo));
      const matchInst = instituicaoFormatada.toLowerCase().includes(termo);
      if (!matchNome && !matchCoordenador && !matchInst) return false;
    }

    if (statusFiltro && statusCalculado !== statusFiltro) return false;
    if (areaFiltro && p.area !== areaFiltro) return false;
    if (modalidadeFiltro && p.formato !== modalidadeFiltro) return false;
    if (instituicaoFiltro && instituicaoFormatada !== instituicaoFiltro) return false;

    return true;
  });

  const filterFields = [
    {
      label: "Status",
      value: statusFiltro,
      onChange: setStatusFiltro,
      options: [
        { val: "", text: "Todos" },
        { val: "EM_ANDAMENTO", text: "Em andamento" },
        { val: "FINALIZADO", text: "Finalizados" },
        { val: "INATIVO", text: "Inativos" }
      ]
    },
    {
      label: "Área",
      value: areaFiltro,
      onChange: setAreaFiltro,
      options: [
        { val: "", text: "Todas" },
        { val: "Ciências Agrárias", text: "Ciências Agrárias" },
        { val: "Ciências Biológicas", text: "Ciências Biológicas" },
        { val: "Ciências Exatas e da Terra", text: "Ciências Exatas e da Terra" },
        { val: "Ciências Humanas", text: "Ciências Humanas" },
        { val: "Ciências da Saúde", text: "Ciências da Saúde" },
        { val: "Ciências Sociais Aplicadas", text: "Ciências Sociais Aplicadas" },
        { val: "Engenharias", text: "Engenharias" },
        { val: "Linguística, Letras e Artes", text: "Linguística, Letras e Artes" }
      ]
    },
    {
      label: "Modalidade",
      value: modalidadeFiltro,
      onChange: setModalidadeFiltro,
      options: [
        { val: "", text: "Todas" },
        { val: "PRESENCIAL", text: "Presencial" },
        { val: "REMOTO", text: "Remoto" },
        { val: "HIBRIDO", text: "Híbrido" }
      ]
    },
    {
      label: "Instituição",
      value: instituicaoFiltro,
      onChange: setInstituicaoFiltro,
      options: [
        { val: "", text: "Todas" },
        ...listaInstituicoes.map(inst => ({ val: inst, text: inst }))
      ]
    }
  ];

  return (
    <section className="min-h-screen px-4 md:px-8 pt-40 pb-40 bg-gray-50/50">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-700">
              Projetos de Extensão
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Explore {projetosFiltrados.length} projetos disponíveis na rede.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 w-4 h-4 transition-colors" />
              <input
                type="text"
                placeholder="Buscar projeto, professor ou cidade"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <button
              onClick={() => setAbrirFiltro(!abrirFiltro)}
              className={`h-10 px-4 flex items-center gap-2 text-sm font-medium border rounded-lg transition-all shadow-sm ${abrirFiltro
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {abrirFiltro && (
          <div
            ref={filtroContainerRef}
            className="mb-8 p-6 bg-white border border-gray-100 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 relative z-20"
          >
            {filterFields.map((field, idx) => {
              const isOpen = activeDropdown === idx;
              const selectedOption = field.options.find(opt => opt.val === field.value);

              return (
                <div key={idx} className="relative">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1 mb-1 block">
                    {field.label}
                  </label>

                  <button
                    onClick={() => setActiveDropdown(isOpen ? null : idx)}
                    className={`w-full h-10 pl-3 pr-8 text-sm text-left bg-white border rounded-lg shadow-sm flex items-center justify-between transition-all outline-none
                      ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-emerald-300'}
                    `}
                  >
                    <span className={`truncate ${!field.value ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {selectedOption ? selectedOption.text : "Selecione"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`absolute right-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {field.options.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              field.onChange(opt.val);
                              setActiveDropdown(null);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between group transition-colors
                              ${field.value === opt.val ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                            `}
                          >
                            <span className="truncate">{opt.text}</span>
                            {field.value === opt.val && <Check size={14} className="text-emerald-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="md:col-span-4 flex justify-end mt-2 border-t border-gray-50 pt-4">
              <button
                onClick={() => {
                  setStatusFiltro("");
                  setAreaFiltro("");
                  setModalidadeFiltro("");
                  setInstituicaoFiltro("");
                  setActiveDropdown(null);
                }}
                className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors hover:underline"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full border-gray-200 border-t-emerald-600 animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-0">
            {projetosFiltrados.map((projeto) => (
              <ProjetoCard key={projeto.id} projeto={projeto} />
            ))}
          </div>
        )}

        {!loading && projetosFiltrados.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 mt-8">
            <p className="text-gray-500 text-sm">Nenhum projeto encontrado.</p>
            <button onClick={() => { setBusca(""); setStatusFiltro(""); setAreaFiltro(""); setInstituicaoFiltro(""); }} className="mt-2 text-sm text-emerald-600 font-medium hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}