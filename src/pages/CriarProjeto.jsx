import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

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

  const [listaEstados, setListaEstados] = useState([]);
  const [listaCidades, setListaCidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");


  const wrapperRefPart = useRef(null);

  const formFieldBorder =
    "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all";
  const formFieldName = "block mb-1 text-sm font-medium text-slate-700";

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    area: "",
    dataInicio: "",
    dataFim: "",
    cargaHoraria: "",
    instNome: "",
    instCidade: "",
    instEstado: "",
    instDescricao: "",
    planejamento: "",
    formato: "",
    tipoDocumento: "",
  });

  useEffect(() => {
    async function carregarEstados() {
      try {
        const response = await api.get("/api/localidades/estados");
        const estadosOrdenados = response.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setListaEstados(estadosOrdenados);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
      }
    }
    carregarEstados();
  }, []);

  useEffect(() => {
    async function carregarCidades() {
      if (!estadoSelecionado) {
        setListaCidades([]);
        return;
      }
      try {
        const response = await api.get(`/api/localidades/estados/${estadoSelecionado}/cidades`);
        setListaCidades(response.data);
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
      }
    }
    carregarCidades();
  }, [estadoSelecionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "instEstado") {
      setEstadoSelecionado(value);
      setFormData({ ...formData, [name]: value, instCidade: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRefInst.current &&
        !wrapperRefInst.current.contains(event.target)
      ) {
        setSugestoesInstituicao([]);
      }
      if (
        wrapperRefPart.current &&
        !wrapperRefPart.current.contains(event.target)
      ) {
        setSugestoesPart([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBuscaInstituicao = (e) => {
    const valor = e.target.value;
    setBuscaInst(valor);
    setFormData((prev) => ({ ...prev, instNome: valor }));

    if (valor.length > 0) {
      const filtradas = instituicoesExistentes.filter((inst) =>
        inst.nome.toLowerCase().includes(valor.toLowerCase()),
      );
      setSugestoesInstituicao(filtradas);
      setMostrarCamposNovaInst(true);
    } else {
      setSugestoesInstituicao([]);
      setMostrarCamposNovaInst(false);
    }
  };

  const selecionarInstituicao = (inst) => {
    setBuscaInst(inst.nome);
    setFormData((prev) => ({
      ...prev,
      instNome: inst.nome,
      instCidade: inst.cidade || "",
      instDescricao: inst.descricao || "",
    }));
    setSugestoesInstituicao([]);
    setMostrarCamposNovaInst(false);
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
        console.error("Erro busca participante", error);
      }
    } else {
      setSugestoesPart([]);
    }
  };

  const adicionarParticipante = (participante) => {
    setParticipantesSelecionados([...participantesSelecionados, participante]);
    setBuscaPart("");
    setSugestoesPart([]);
  };

  const removerParticipante = (id) => {
    setParticipantesSelecionados(
      participantesSelecionados.filter((p) => p.id !== id),
    );
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setErros([]);
    const novosErros = [];

    if (!formData.instNome) novosErros.push("Informe a instituição.");
    if (!arquivo) novosErros.push("Documento obrigatório.");

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        area: formData.area,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        cargaHoraria: parseFloat(formData.cargaHoraria),
        formato: formData.formato ? formData.formato.toUpperCase() : null,

        instituicaoEnsino: {
          nome: formData.instNome,
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
      if (arquivo) submitData.append("arquivo", arquivo);

      await api.post("/api/projetos", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSucesso("Projeto criado com sucesso!");
      setTimeout(() => navigate("/perfil"), 2000);
    } catch (error) {
      console.error(error);
      setErros(["Erro ao criar projeto."]);
    } finally {
      setLoading(false);
    }
  };

  const handleAlteracao = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAlterarArquivo = (e) => setArquivo(e.target.files[0]);

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
        >
          {erros.length > 0 && <Alert type="error">{erros[0]}</Alert>}
          <Alert type="success">{sucesso}</Alert>

          <label className={formFieldName}>Nome do Projeto</label>
          <input
            required
            name="nome"
            value={formData.nome}
            onChange={handleAlteracao}
            className={formFieldBorder}
            placeholder="Digite o nome do projeto"
          />

          <div className="relative" ref={wrapperRefInst}>
            <label className={formFieldName}>Instituição de Ensino</label>
            <input
              name="instNome"
              value={buscaInst}
              onChange={handleBuscaInstituicao}
              className={formFieldBorder}
              placeholder="Digite a sigla (Ex: IFPR)"
              autoComplete="off"
              required
            />
            {sugestoesInstituicao.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 overflow-auto bg-white border rounded shadow max-h-48">
                {sugestoesInstituicao.map((inst) => (
                  <li
                    key={inst.id}
                    onClick={() => selecionarInstituicao(inst)}
                    className="px-4 py-2 cursor-pointer hover:bg-emerald-50"
                  >
                    {inst.nome} - {inst.cidade}
                  </li>
                ))}
              </ul>
            )}
            {mostrarCamposNovaInst && (
              <div className="p-4 mt-3 rounded-md bg-emerald-50 border border-emerald-100 animate-fade-in">
                <p className="text-sm text-emerald-700 mb-2 font-semibold">Nova Instituição detectada. Por favor, preencha a localização:</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-emerald-800">Estado</label>
                    <select
                      name="instEstado"
                      value={formData.instEstado}
                      onChange={handleChange}
                      className="w-full p-2 mt-1 border rounded bg-white text-sm"
                      required
                    >
                      <option value="">Selecione...</option>
                      {listaEstados.map((uf) => (
                        <option key={uf.id} value={uf.sigla}>
                          {uf.sigla} - {uf.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-emerald-800">Cidade</label>
                    <select
                      name="instCidade"
                      value={formData.instCidade}
                      onChange={handleChange}
                      className="w-full p-2 mt-1 border rounded bg-white text-sm disabled:bg-gray-100"
                      disabled={!formData.instEstado}
                      required
                    >
                      <option value="">Selecione...</option>
                      {listaCidades.map((cidade) => (
                        <option key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}


          </div>

          <div className="space-y-2">
            <label className={formFieldName}>
              Adicionar Participantes (Alunos)
            </label>

            <div className="relative" ref={wrapperRefPart}>
              <input
                type="text"
                value={buscaPart}
                onChange={handleBuscaParticipante}
                placeholder="Digite o nome do aluno"
                className={formFieldBorder}
                autoComplete="off"
              />

              {sugestoesPart.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-48">
                  {sugestoesPart.map((part) => (
                    <li
                      key={part.id}
                      onClick={() => adicionarParticipante(part)}
                      className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-emerald-50 text-slate-700"
                    >
                      <span>{part.nome}</span>
                      <span className="text-xs text-gray-400">Adicionar +</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {participantesSelecionados.map((part) => (
                <div
                  key={part.id}
                  className="flex items-center gap-2 px-3 py-1 text-sm border rounded-full bg-emerald-100 text-emerald-800 border-emerald-200"
                >
                  <span>{part.nome}</span>
                  <button
                    type="button"
                    onClick={() => removerParticipante(part.id)}
                    className="flex items-center justify-center w-5 h-5 font-bold rounded-full hover:bg-emerald-200 text-emerald-900"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {participantesSelecionados.length === 0 && (
                <p className="text-xs italic text-slate-400">
                  Nenhum participante adicionado.
                </p>
              )}
            </div>
          </div>

          <label className={formFieldName}>Descrição</label>
          <textarea
            required
            name="descricao"
            value={formData.descricao}
            onChange={handleAlteracao}
            className={formFieldBorder}
          />

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
                name="dataFim"
                value={formData.dataFim}
                onChange={handleAlteracao}
                className={formFieldBorder}
              />
            </div>
          </div>

          <label className={formFieldName}>Carga Horária</label>
          <input
            type="number"
            required
            name="cargaHoraria"
            value={formData.cargaHoraria}
            onChange={handleAlteracao}
            className={formFieldBorder}
          />

          <label className={formFieldName}>Formato</label>
          <select
            required
            name="formato"
            value={formData.formato}
            onChange={handleAlteracao}
            className={formFieldBorder}
          >
            <option value="">Selecione</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
          </select>

          <label className={formFieldName}>Arquivo comprobatório (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={handleAlterarArquivo}
            className={
              formFieldBorder +
              " file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-emerald-50 file:text-emerald-700 file:border-0 hover:file:bg-emerald-100"
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-100"
          >
            {loading ? "Criando..." : "Criar Projeto"}
          </button>
        </form>
      </div>
    </section>
  );
}