import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

const DESC_MAX = 500;
const NOME_MAX = 100;

export default function CriarProjeto() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState([]);
  const [sucesso, setSucesso] = useState("");
  const [arquivo, setArquivo] = useState(null);

  const [instituicoesExistentes, setInstituicoesExistentes] = useState([]);
  const [sugestoesInstituicao, setSugestoesInstituicao] = useState([]);
  const [mostrarCamposNovaInst, setMostrarCamposNovaInst] = useState(false);
  const [buscaInst, setBuscaInst] = useState("");
  const wrapperRefInst = useRef(null);

  const [buscaPart, setBuscaPart] = useState("");
  const [sugestoesPart, setSugestoesPart] = useState([]);
  const [participantesSelecionados, setParticipantesSelecionados] = useState(
    [],
  );

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  const formFieldBorder =
    "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all";
  const formFieldName = "block mb-1 text-sm font-medium text-slate-700";

  const [formData, setFormData] = useState({
    nome: "",
    area: "",
    dataInicio: "",
    dataFim: "",
    cargaHoraria: "",
    instNome: "",
    instCidade: "",
    instEstado: "",
    formato: "",
    descricao: "",
  });

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [resInst, resEstados] = await Promise.all([
          api.get("/api/instituicao-ensino"),
          api.get("/api/localidades/estados"),
        ]);
        const instData = resInst.data;

        if (Array.isArray(instData)) {
          setInstituicoesExistentes(instData);
        } else if (Array.isArray(instData.content)) {
          setInstituicoesExistentes(instData.content);
        } else {
          setInstituicoesExistentes([]);
        }
        setEstados(resEstados.data);
      } catch (e) {
        console.error("Erro ao carregar dados iniciais", e);
      }
    }
    carregarDadosIniciais();
  }, []);

  const handleEstadoChange = async (e) => {
    const estadoSelecionado = e.target.value;
    setFormData((prev) => ({
      ...prev,
      instEstado: estadoSelecionado,
      instCidade: "",
    }));
    if (!estadoSelecionado) {
      setCidades([]);
      return;
    }
    try {
      const res = await api.get(
        `/api/localidades/estados/${estadoSelecionado}/cidades`,
      );
      setCidades(res.data);
    } catch {
      setErros(["Erro ao carregar cidades."]);
    }
  };

  const handleCidadeChange = (e) =>
    setFormData((prev) => ({ ...prev, instCidade: e.target.value }));

  const selecionarInstituicao = (inst) => {
    setBuscaInst(inst.nome);
    setFormData((prev) => ({
      ...prev,
      instId: inst.id,
      instNome: inst.nome,
      instCidade: inst.cidade || "",
      instEstado: inst.estado || "",
    }));
    setSugestoesInstituicao([]);
    setMostrarCamposNovaInst(false);
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setErros([]);
    setSucesso("");

    const novosErros = [];

    // Validações de campos obrigatórios e limites
    if (!formData.nome.trim())
      novosErros.push("O nome do projeto é obrigatório.");
    if (formData.nome.length > NOME_MAX)
      novosErros.push(`O nome deve ter no máximo ${NOME_MAX} caracteres.`);
    if (!formData.area) novosErros.push("Selecione uma área para o projeto.");
    if (!formData.descricao.trim())
      novosErros.push("A descrição é obrigatória.");
    if (formData.descricao.length > DESC_MAX)
      novosErros.push("A descrição ultrapassou o limite de 500 caracteres.");
    if (!formData.instNome || !formData.instCidade || !formData.instEstado)
      novosErros.push("Dados da instituição incompletos.");
    if (!arquivo) novosErros.push("O arquivo PDF comprobatório é obrigatório.");
    if (!formData.cargaHoraria || parseFloat(formData.cargaHoraria) <= 0) {
      novosErros.push("A carga horária deve ser um valor maior que zero.");
    }
    if (arquivo && arquivo.size > 10 * 1024 * 1024)
      novosErros.push("O arquivo PDF deve ter no máximo 10MB.");

    if (formData.dataFim < formData.dataInicio) {
      novosErros.push(
        "A data de término não pode ser anterior à data de início.",
      );
    }

    if (!formData.dataInicio || !formData.dataFim) {
      novosErros.push("As datas de início e término são obrigatórias.");
    }

    if (novosErros.length > 0) {
      setErros(novosErros);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: formData.nome.toUpperCase(),
        area: formData.area,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        cargaHoraria: parseFloat(formData.cargaHoraria),
        formato: formData.formato,
        descricao: formData.descricao,
        instituicaoEnsino: {
          id: formData.instId || null,
          nome: formData.instNome.toUpperCase(),
          cidade: formData.instCidade,
          estado: formData.instEstado,
        },
        participantes: participantesSelecionados.map((p) => ({ id: p.id })),
      };

      const submitData = new FormData();
      submitData.append(
        "projeto",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
      submitData.append("arquivo", arquivo);

      await api.post("/api/projetos", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSucesso("Projeto criado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/perfil"), 2000);
    } catch (error) {
      setErros([
        "Erro ao criar projeto. Verifique os campos e tente novamente.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAlteracao = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAlterarArquivo = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setErros(["Apenas arquivos PDF são permitidos."]);
      setArquivo(null);
    } else {
      setArquivo(file);
    }
  };

  const handleBuscaInstituicao = (e) => {
    const valor = e.target.value;
    setBuscaInst(valor);
    setFormData((prev) => ({ ...prev, instNome: valor, instId: null }));

    if (!Array.isArray(instituicoesExistentes)) {
      setSugestoesInstituicao([]);
      setMostrarCamposNovaInst(false);
      return;
    }

    if (valor.length > 0) {
      const filtradas = instituicoesExistentes.filter((inst) =>
        inst.nome?.toLowerCase().includes(valor.toLowerCase()),
      );
      setSugestoesInstituicao(filtradas);
      setMostrarCamposNovaInst(true);
    } else {
      setSugestoesInstituicao([]);
      setMostrarCamposNovaInst(false);
    }
  };

  const handleBuscaParticipante = async (e) => {
    const valor = e.target.value;
    setBuscaPart(valor);
    if (valor.length > 2) {
      try {
        const response = await api.get(
          `/api/participantes/buscar?nome=${valor}`,
        );
        const naoSelecionados = response.data.filter(
          (p) => !participantesSelecionados.some((sel) => sel.id === p.id),
        );
        setSugestoesPart(naoSelecionados);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSugestoesPart([]);
    }
  };

  const adicionarParticipante = (p) => {
    setParticipantesSelecionados([...participantesSelecionados, p]);
    setBuscaPart("");
    setSugestoesPart([]);
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Novo Projeto
        </h1>
      </div>

      <div className="flex justify-center">
        <form
          onSubmit={handleEnviar}
          className="w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow-lg"
          noValidate
        >
          {erros.length > 0 && (
            <Alert type="error">
              <ul className="pl-5 list-disc">
                {erros.map((errorMessage, i) => (
                  <li key={i} className="text-sm">
                    {errorMessage}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
          {sucesso && <Alert type="success">{sucesso}</Alert>}

          <div>
            <label className={formFieldName}>Nome do Projeto</label>
            <input
              required
              name="nome"
              maxLength={NOME_MAX}
              value={formData.nome}
              onChange={handleAlteracao}
              className={formFieldBorder + " uppercase"}
              placeholder="NOME DO PROJETO"
            />
            <p className="mt-1 text-xs text-right text-slate-400">
              {formData.nome.length} / {NOME_MAX}
            </p>
          </div>

          <div className="relative" ref={wrapperRefInst}>
            <label className={formFieldName}>Instituição de Ensino</label>
            <input
              name="instNome"
              value={buscaInst}
              onChange={handleBuscaInstituicao}
              className={formFieldBorder + " uppercase"}
              placeholder="Digite a sigla (Ex: IFPR)"
              autoComplete="off"
              required
            />
            {sugestoesInstituicao.length > 0 && (
              <ul className="absolute z-20 w-full mt-1 overflow-auto bg-white border rounded shadow max-h-48">
                {sugestoesInstituicao.map((inst) => (
                  <li
                    key={inst.id}
                    onClick={() => selecionarInstituicao(inst)}
                    className="px-4 py-2 cursor-pointer hover:bg-emerald-50"
                  >
                    {inst.nome} - {inst.cidade} / {inst.estado}
                  </li>
                ))}
              </ul>
            )}

            {mostrarCamposNovaInst && (
              <div className="p-3 mt-2 space-y-2 border rounded bg-emerald-50 border-emerald-200">
                <p className="mb-2 text-xs font-semibold text-emerald-700">
                  Complete os dados da instituição:
                </p>
                <select
                  name="instEstado"
                  value={formData.instEstado}
                  onChange={handleEstadoChange}
                  className="w-full p-2 bg-white border rounded"
                  required
                >
                  <option value="">Selecione o Estado</option>
                  {estados.map((e) => (
                    <option key={e.sigla} value={e.sigla}>
                      {e.nome} ({e.sigla})
                    </option>
                  ))}
                </select>
                <select
                  name="instCidade"
                  value={formData.instCidade}
                  onChange={handleCidadeChange}
                  className="w-full p-2 bg-white border rounded"
                  disabled={!formData.instEstado}
                  required
                >
                  <option value="">Selecione a Cidade</option>
                  {cidades.map((c) => (
                    <option key={c.nome} value={c.nome}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={formFieldName}>Participantes (Opcional)</label>
            <div className="relative">
              <input
                type="text"
                value={buscaPart}
                onChange={handleBuscaParticipante}
                placeholder="Buscar aluno..."
                className={formFieldBorder}
              />
              {sugestoesPart.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded shadow max-h-48">
                  {sugestoesPart.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => adicionarParticipante(p)}
                      className="flex justify-between px-4 py-2 cursor-pointer hover:bg-emerald-50"
                    >
                      {p.nome}{" "}
                      <span className="text-xs text-emerald-500">Add +</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {participantesSelecionados.map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800"
                >
                  {p.nome}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setParticipantesSelecionados(
                        participantesSelecionados.filter((x) => x.id !== p.id),
                      )
                    }
                    className="font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className={formFieldName}>Descrição do Projeto</label>
            <div className="flex flex-col">
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleAlteracao}
                maxLength={DESC_MAX}
                className={formFieldBorder + " h-32 resize-none"}
                placeholder="Descreva os objetivos..."
              />
              <span className="mt-1 text-xs text-right text-slate-500">
                {formData.descricao.length} / {DESC_MAX}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={formFieldName}>Área</label>
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
              <p className="mt-1 text-xs text-slate-500">
                Está em dúvida? <br />
                <a
                  href="https://lattes.cnpq.br/web/dgp/arvore-do-conhecimento"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-emerald-600"
                >
                  Áreas do Conhecimento - CNPq
                </a>
              </p>
            </div>
            <div>
              <label className={formFieldName}>Formato</label>
              <select
                required
                name="formato"
                value={formData.formato}
                onChange={handleAlteracao}
                className={formFieldBorder}
              >
                <option value="">Selecione</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="REMOTO">Remoto</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={formFieldName}>Início</label>
              <input
                type="date"
                required
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleAlteracao}
                className={formFieldBorder}
              />
            </div>
            <div>
              <label className={formFieldName}>Fim</label>
              <input
                type="date"
                required
                min={formData.dataInicio}
                name="dataFim"
                value={formData.dataFim}
                onChange={handleAlteracao}
                className={formFieldBorder}
              />
            </div>
          </div>

          <div>
            <label className={formFieldName}>Carga Horária Total (Horas)</label>
            <input
              type="number"
              required
              name="cargaHoraria"
              value={formData.cargaHoraria}
              min="1"
              placeholder="Digite a carga horária"
              onChange={handleAlteracao}
              className={formFieldBorder}
            />
            <p className="mt-1 text-xs text-slate-500">
              Para minutos, use valores decimais (ex: 3h 30min = <b>3.5</b> | 2h
              15min = <b>2.25</b>).
            </p>
          </div>

          <div>
            <label className={formFieldName}>Arquivo Comprobatório (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={handleAlterarArquivo}
              className={formFieldBorder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 font-medium text-white transition-colors rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-100"
          >
            {loading ? "Criando..." : "Criar Projeto"}
          </button>
        </form>
      </div>
    </section>
  );
}
