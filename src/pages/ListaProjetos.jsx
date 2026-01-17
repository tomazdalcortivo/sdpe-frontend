import { Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ListaProjetos() {
  // 🔹 projetos mockados (simulando backend)
  const projetos = [
    {
      id: 1,
      titulo: "Projeto Sustentabilidade",
      descricao: "Ações de educação ambiental em comunidades.",
      area: "Ciências Agrárias",
      status: "APROVADO",
    },
    {
      id: 2,
      titulo: "Projeto Saúde Ativa",
      descricao: "Promoção da saúde para idosos.",
      area: "Ciências da Saúde",
      status: "EM_ANDAMENTO",
    },
    {
      id: 3,
      titulo: "Projeto Tecnologia Social",
      descricao: "Inclusão digital em escolas públicas.",
      area: "Engenharias",
      status: "FINALIZADO",
    },
    {
      id: 4,
      titulo: "Projeto Linguagem Viva",
      descricao: "Oficinas de leitura e escrita.",
      area: "Linguística, Letras e Artes",
      status: "APROVADO",
    },
  ];

  // estados de filtro
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [areaFiltro, setAreaFiltro] = useState("");
  const [abrirFiltro, setAbrirFiltro] = useState(false);

  // lógica de filtragem
  const projetosFiltrados = projetos
    .filter((p) => p.status === "APROVADO") // Regra a ser alterada
    .filter((p) => p.titulo.toLowerCase().includes(busca.toLowerCase()))
    .filter((p) => (statusFiltro ? p.status === statusFiltro : true))
    .filter((p) => (areaFiltro ? p.area === areaFiltro : true));

  return (
    <section className="min-h-screen px-8 pt-24 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-center">
          Projetos de Extensão
        </h1>

        <p className="mb-10 text-center text-slate-600">
          Explore os projetos cadastrados na plataforma
        </p>

        {/* Busca e filtro */}
        <div className="relative flex flex-col gap-4 mb-12 md:flex-row">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full py-3 pl-12 pr-4 border rounded-full outline-none border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botão filtro */}
          <button
            onClick={() => setAbrirFiltro(!abrirFiltro)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border rounded-full border-slate-300 hover:bg-slate-50"
          >
            <SlidersHorizontal size={18} />
            Filtrar
          </button>

          {/* Dropdown filtro */}
          {abrirFiltro && (
            <div className="absolute right-0 z-10 p-4 bg-white border shadow w-72 rounded-xl top-14">
              <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold">
                  Status
                </label>
                <select
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Todos</option>
                  <option value="FINALIZADO">Finalizados</option>
                  <option value="EM_ANDAMENTO">Em andamento</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold">Área</label>
                <select
                  value={areaFiltro}
                  onChange={(e) => setAreaFiltro(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione</option>
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

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {projetosFiltrados.map((projeto) => (
            <div
              key={projeto.id}
              className="overflow-hidden transition bg-white shadow rounded-xl hover:shadow-lg"
            >
              <div className="h-48 bg-emerald-600" />

              <div className="p-6">
                <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                  {projeto.area}
                </span>

                <h3 className="mb-2 text-xl font-bold text-slate-800">
                  {projeto.titulo}
                </h3>

                <p className="mb-6 text-sm text-slate-500">
                  {projeto.descricao}
                </p>

                <Link
                  to={`/detalhesprojetos/${projeto.id}`}
                  className="block py-2 text-center text-white rounded-full bg-emerald-600"
                >
                  Saiba mais
                </Link>
              </div>
            </div>
          ))}
        </div>

        {projetosFiltrados.length === 0 && (
          <p className="mt-12 text-center text-slate-500">
            Nenhum projeto encontrado com os filtros selecionados.
          </p>
        )}
      </div>
    </section>
  );
}
