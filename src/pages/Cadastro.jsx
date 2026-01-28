import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

const styles = {
  page: "min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100",
  title: "mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text",
  subtitle: "max-w-2xl mx-auto text-xl text-slate-600",
  divider: "h-px mx-auto my-10 bg-gray-300 w-lg",
  card: "w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow-lg",
  label: "block mb-1 text-sm font-medium text-slate-700",
  input: "w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
  fileInput: "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all",
  button: "flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed",
};

const campos = [
  { name: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome completo" },
  { name: "email", label: "E-mail", type: "email", placeholder: "usuario@email.com" },
  { name: "senha", label: "Senha", type: "password", placeholder: "••••••••" },
];

export default function Cadastro() {
  const navigate = useNavigate();
  const [erros, setErros] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [vinculo, setVinculo] = useState("");
  const [arquivoPdf, setArquivoPdf] = useState(null);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    dataNascimento: "",
    cpf: "",
    cidade: "",
    estado: "",
  });

  useEffect(() => {
    api.get("/api/localidades/estados")
      .then((res) => setEstados(res.data))
      .catch(() => setErros(["Erro ao carregar estados."]));
  }, []);

  const handleAlteracao = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCpfMask = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setFormData((prev) => ({ ...prev, cpf: value }));
  };

  const handleEstadoChange = async (e) => {
    const uf = e.target.value;
    setFormData((prev) => ({ ...prev, estado: uf, cidade: "" }));
    if (!uf) { setCidades([]); return; }
    try {
      const res = await api.get(`/api/localidades/estados/${uf}/cidades`);
      setCidades(res.data);
    } catch { setErros(["Erro ao carregar cidades."]); }
  };

  const handleCidadeChange = (e) => {
    setFormData((prev) => ({ ...prev, cidade: e.target.value }));
  };

  const handleFileChange = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const novosErros = [];
    if (arquivo.type !== "application/pdf") novosErros.push("O documento deve estar no formato PDF.");
    if (arquivo.size > 10 * 1024 * 1024) novosErros.push("O PDF deve ter no máximo 10MB.");
    if (novosErros.length > 0) {
      setErros(novosErros);
      e.target.value = "";
      setArquivoPdf(null);
      return;
    }
    setErros([]);
    setArquivoPdf(arquivo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErros([]);
    setSuccess("");

    const novosErros = [];
    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+( [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;
    const validarEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validarSenha = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,20}$/;
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

    if (!nomeRegex.test(formData.nome)) novosErros.push("Digite o nome completo.");
    if (!validarEmail.test(formData.email)) novosErros.push("E-mail inválido.");
    if (!validarSenha.test(formData.senha)) novosErros.push("Senha inválida (requer letra, número e caractere especial).");
    if (!cpfRegex.test(formData.cpf)) novosErros.push("CPF incompleto.");
    if (!formData.cidade) novosErros.push("Cidade é obrigatória.");
    if (!formData.estado) novosErros.push("Estado é obrigatório.");
    if (!formData.dataNascimento) novosErros.push("Data de nascimento obrigatória.");
    if (!vinculo) novosErros.push("Selecione o tipo de vínculo.");

    if (novosErros.length > 0) { setErros(novosErros); return; }

    setLoading(true);
    const perfilBackend = vinculo === "colaborador" ? "COORDENADOR" : "PARTICIPANTE";
    const payload = { ...formData, perfil: perfilBackend, vinculoInstitucional: true };
    const submitData = new FormData();
    submitData.append("dados", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (arquivoPdf) submitData.append("arquivo", arquivoPdf);

    try {
      await api.post("/auth/registrar", submitData);
      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/entrar"), 2000);
    } catch (error) {
      const msg = error.response?.data;
      setErros(typeof msg === "string" ? [msg] : ["Erro ao processar a solicitação."]);
    } finally { setLoading(false); }
  };

  const getLabelDocumento = () => {
    if (vinculo === "aluno") return "Declaração de Matrícula (PDF)";
    if (vinculo === "colaborador") return "Documento Comprobatório Professor (PDF)";
    return "Documento Comprobatório (PDF)";
  };

  return (
    <section className={styles.page}>
      <div className="mt-16 mb-10 text-center">
        <h1 className={styles.title}>Criar Conta</h1>
        <p className={styles.subtitle}>Cadastre-se para participar dos projetos extensionistas.</p>
      </div>
      <div className={styles.divider}></div>
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className={styles.card}>
          {erros.length > 0 && (
            <Alert type="error">
              <ul className="pl-5 space-y-1 list-disc">
                {erros.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </Alert>
          )}
          {success && <Alert type="success">{success}</Alert>}

          {campos.map((campo) => (
            <div key={campo.name}>
              <label className={styles.label}>{campo.label}</label>
              <input {...campo} value={formData[campo.name]} onChange={handleAlteracao} className={styles.input} required />
              {campo.name === "senha" && (
                <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres, 1 número e 1 especial.</p>
              )}
            </div>
          ))}

          <div>
            <label className={styles.label}>CPF</label>
            <input name="cpf" value={formData.cpf} onChange={handleCpfMask} placeholder="000.000.000-00" maxLength="14" className={styles.input} required />
          </div>

          <div>
            <label className={styles.label}>Data de Nascimento</label>
            <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleAlteracao} className={styles.input} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={styles.label}>Estado</label>
              <select name="estado" value={formData.estado} onChange={handleEstadoChange} className={styles.input} required>
                <option value="">UF</option>
                {estados.map((e) => <option key={e.sigla} value={e.sigla}>{e.sigla}</option>)}
              </select>
            </div>
            <div>
              <label className={styles.label}>Cidade</label>
              <select name="cidade" value={formData.cidade} onChange={handleCidadeChange} className={styles.input} disabled={!formData.estado} required>
                <option value="">Selecione</option>
                {cidades.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={styles.label}>Vínculo</label>
            <select className={styles.input} value={vinculo} onChange={(e) => setVinculo(e.target.value)} required>
              <option value="">Selecione seu vínculo</option>
              <option value="aluno">Participante (Aluno)</option>
              <option value="colaborador">Colaborador (Professor)</option>
            </select>
          </div>

          <div>
            <label className={styles.label}>{getLabelDocumento()}</label>
            <input type="file" accept="application/pdf" onChange={handleFileChange} className={styles.fileInput} disabled={!vinculo} />
            <p className={`mt-1 text-xs ${!vinculo ? "text-red-600" : "text-slate-500"}`}>
              {!vinculo ? "Selecione um vínculo para liberar o upload." : "Apenas PDF (máx. 10MB)."}
            </p>
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div> : "Criar conta"}
          </button>
        </form>
      </div>
    </section>
  );
}