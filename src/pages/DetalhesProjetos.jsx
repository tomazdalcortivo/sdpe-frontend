import { useLocation, useNavigate } from "react-router-dom";

export default function DetalhesProjetos() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <p className="pt-24 text-center text-slate-500">
        Projeto não encontrado.
      </p>
    );
  }

  const projeto = state;

  return (
    <section className="min-h-screen px-8 pt-24 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-emerald-600 hover:underline"
        >
          ← Voltar
        </button>

        {/* Banner */}
        <div className="relative overflow-hidden h-72 rounded-xl">
          <img
            src={projeto.imagem}
            alt={projeto.nome}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex items-end p-6 bg-black/40">
            <h1 className="text-3xl font-bold text-white">
              {projeto.nome}
            </h1>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-8 space-y-6">
          <p className="text-slate-700">
            {projeto.descricao}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <strong>Área:</strong> {projeto.area}
            </div>
            <div>
              <strong>Formato:</strong> {projeto.formato}
            </div>
            <div>
              <strong>Período:</strong> {projeto.periodo}
            </div>
            <div>
              <strong>Carga horária:</strong> {projeto.cargaHoraria}h
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">
              Planejamento do Projeto
            </h2>
            <p className="text-slate-700">
              {projeto.planejamento}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
