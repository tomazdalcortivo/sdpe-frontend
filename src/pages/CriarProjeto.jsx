import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";

export default function CriarProjeto() {
  const navigate = useNavigate(); // navegar entre páginas já programáticas

  //Hooks de estado: [loading, setLoading] = useState(false);
  const [erros, setErros] = useState([]); //mensagem de erro dos itens do formulário
  const [sucesso, setSucesso] = useState(""); //mensagem sucesso
  const [arquivo, setArquivo] = useState(null); // guarda o arquivo (.pdf)
  const [loading, setLoading] = useState(false); // estado de carregamento
  const formFieldBorder = "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all";
  const formFieldName = "block mb-1 text-sm font-medium text-slate-700";
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    area: "",
    dataInicio: "",
    dataFim: "",
    cargaHoraria: "",
    instituicao: "",
    planejamento: "",
    formato: "",
    tipoDocumento: "",
  });

  // atualizar campos do formulário
  const handleAlteracao = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // validar .pdf
  const handleAlterarArquivo = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const novosErros = [];

    if (arquivo.type !== "application/pdf") {
      novosErros.push("O documento deve estar no formato PDF.");
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      novosErros.push("O PDF deve ter no máximo 10MB."); // mudar depois? diminuir?
    }

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    setErros([]);
    setArquivo(arquivo);
  };

  // verifica
  const handleEnviar = async (e) => {
    e.preventDefault();
    setErros([]);
    setSucesso("");

    const novosErros = [];

    // Nome do projeto
    if (formData.nome.length < 5 || formData.nome.length > 50) {
      novosErros.push("O nome do projeto deve ter entre 5 e 50 caracteres.");
    }

    // Descrição
    if (formData.descricao.length < 50 || formData.descricao.length > 200) {
      novosErros.push("A descrição deve ter entre 50 e 200 caracteres.");
    }

    // Planejamento
    if (
      formData.planejamento.length < 50 ||
      formData.planejamento.length > 200
    ) {
      novosErros.push("O planejamento deve ter entre 50 e 200 caracteres.");
    }

    // Arquivo
    if (!arquivo) {
      novosErros.push("É obrigatório enviar o documento de aprovação do projeto.");
    }

    // Datas
    if (
      formData.dataInicio &&
      formData.dataFim &&
      new Date(formData.dataFim) < new Date(formData.dataInicio)
    ) {
      novosErros.push(
        "A data de término não pode ser anterior à data de início."
      );
    }

    // Carga horária
    if (Number(formData.cargaHoraria) <= 0) {
      novosErros.push("A carga horária deve ser maior que zero.");
    }

    // Se houver erros, exibe todos eles
    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    setLoading(true);

    try {
      setSucesso("Projeto enviado com sucesso! Aguarde a aprovação.");
      setTimeout(() => navigate("/perfil"), 2000);
    } catch {
      setErros(["Erro ao enviar o projeto."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Novo Projeto
        </h1>
        <p className="text-xl text-slate-600">
          Cadastre um novo projeto de extensão
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      <div className="flex justify-center">
        <form
          onSubmit={handleEnviar}
          className="w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow-lg"
        >
          {erros.length > 0 && (
            <Alert type="error">
              <ul className="pl-5 space-y-1 list-disc">
                {erros.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </Alert>
          )}
          <Alert type="success">{sucesso}</Alert>

          {/* Nome */}
          <label className={formFieldName}>Nome do Projeto</label>
          <input
            required
            name="nome"
            value={formData.nome}
            onChange={handleAlteracao}
            placeholder="Digite aqui"
            className={formFieldBorder}
          />

          {/* Descrição */}
          <label className={formFieldName}>Descrição do Projeto</label>
          <textarea
            required
            name="descricao"
            value={formData.descricao}
            onChange={handleAlteracao}
            rows="3"
            placeholder="Digite aqui"
            className={formFieldBorder}
          />

          {/* Área */}
          <label className={formFieldName}>Área de Aplicação</label>
          <select
            required
            name="area"
            value={formData.area}
            onChange={handleAlteracao}
            className={formFieldBorder}
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

          <p className="text-sm text-slate-500">
            Está em dúvida?{" "}
            <a
              href="https://lattes.cnpq.br/web/dgp/arvore-do-conhecimento"
              target="_blank"
              className="text-emerald-600 hover:underline"
            >
              Clique aqui
            </a>
          </p>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {/* Labels */}
            <label className={formFieldName}>Data de Início</label>
            <label className={formFieldName}>Data de Término</label>

            {/* Inputs */}
            <input
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleAlteracao}
              required
              className={formFieldBorder}
            />
            <input
              type="date"
              name="dataFim"
              value={formData.dataFim}
              onChange={handleAlteracao}
              required
              className={formFieldBorder}
            />
          </div>

          {/* Carga Horária */}
          <label className={formFieldName}>Carga Horária (em horas)</label>
          <input
            type="number"
            step="1.0"
            min="1.0"
            name="cargaHoraria"
            value={formData.cargaHoraria}
            onChange={handleAlteracao}
            placeholder="Ex: 20.5"
            required
            className={formFieldBorder}
          />

          {/* Instituição */}
          <label className={formFieldName}>Nome da Instituição</label>
          <input
            type="text"
            name="instituicao"
            value={formData.instituicao}
            onChange={handleAlteracao}
            placeholder="Ex: IFPR - Instituto Federal do Paraná"
            required
            className={formFieldBorder}
          />

          {/* Planejamento */}
          <label className={formFieldName}>Planejamento do Projeto</label>
          <textarea
            name="planejamento"
            value={formData.planejamento}
            onChange={handleAlteracao}
            rows="3"
            placeholder="Digite aqui"
            className={formFieldBorder}
          />

          {/* Formato */}
          <label className={formFieldName}>Formato</label>
          <select
            name="formato"
            value={formData.formato}
            onChange={handleAlteracao}
            required
            className={formFieldBorder}
          >
            <option value="">Selecione</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
          </select>

          {/* Documento */}
          <div className="space-y-2">
            <label className={formFieldName}>Comprovante de Aprovação</label>

            <select
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleAlteracao}
              required
              className={formFieldBorder}
            >
              <option value="">Selecione</option>
              <option>Resultado final / Homologação</option>
              <option>Portaria de aprovação</option>
              <option>Declaração institucional</option>
            </select>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleAlterarArquivo}
              required
              className="block w-full text-sm transition-colors text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:bg-slate-200 file:text-sm file:font-medium"
            />

            <p className="text-xs text-slate-500">
              Apenas .PDF, com tamanho máximo de 10MB.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
          >
            {loading ? "Enviando..." : "Enviar para aprovação"}
          </button>
        </form>
      </div>
    </section>
  );
}
