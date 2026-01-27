import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

const styles = {
  page: "min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100",
  title:
    "mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text",
  subtitle: "max-w-2xl mx-auto text-xl text-slate-600",
  divider: "h-px mx-auto my-10 bg-gray-300 w-lg",
  card: "w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow-lg",
  label: "block mb-1 text-sm font-medium text-slate-700",
  input:
    "w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
  fileInput:
    "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all",
  button:
    "flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed",
};

const campos = [
  {
    name: "nome",
    label: "Nome completo",
    type: "text",
    placeholder: "Seu nome completo",
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "usuario@email.com",
  },
  { name: "senha", 
    label: "Senha", 
    type: "password", 
    placeholder: "••••••••" },
];

export default function Cadastro() {
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/localidades/estados")
      .then((res) => setEstados(res.data))
      .catch(() => setErros(["Erro ao carregar estados."]));
  }, []);

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

  const handleAlteracao = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCpfMask = (e) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "");

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    // Aplica a máscara (000.000.000-00) passo a passo
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setFormData((prev) => ({
      ...prev,
      cpf: value,
    }));
  };

  const handleEstadoChange = async (e) => {
    const uf = e.target.value;

    setFormData((prev) => ({
      ...prev,
      estado: uf,
      cidade: "",
    }));

    if (!uf) {
      setCidades([]);
      return;
    }

    try {
      const res = await api.get(`/api/localidades/estados/${uf}/cidades`);
      setCidades(res.data);
    } catch {
      setErros(["Erro ao carregar cidades."]);
    }
  };

  const handleCidadeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      cidade: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const novosErros = [];

    if (arquivo.type !== "application/pdf") {
      novosErros.push("O documento deve estar no formato PDF.");
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      novosErros.push("O PDF deve ter no máximo 10MB.");
    }

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

    // Nome
    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+( [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;

    if (!formData.nome.trim()) {
      novosErros.push("O nome é obrigatório.");
    } else if (!nomeRegex.test(formData.nome)) {
      novosErros.push("Digite o nome completo (nome e sobrenome).");
    }

    // Email
    const validarEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      novosErros.push("O e-mail é obrigatório.");
    } else if (!validarEmail.test(formData.email)) {
      novosErros.push("Digite um endereço de e-mail válido.");
    }

    // Senha
    const validarSenha =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,20}$/;
    
    if (!validarSenha.test(formData.senha)) {
      novosErros.push("Senha inválida.");
    }

    // CPF
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

    if (!formData.cpf) {
      novosErros.push("O CPF é obrigatório.");
    } else if (!cpfRegex.test(formData.cpf)) {
      novosErros.push("O CPF deve estar completo (000.000.000-00).");
    }

    // Cidade
    if (!formData.cidade.trim()) {
      novosErros.push("A cidade é obrigatória.");
    }

    // Estado
    if (!formData.estado.trim()) {
      novosErros.push("O estado é obrigatório.");
    }

    // Data de Nascimento
    if (!formData.dataNascimento) {
      novosErros.push("A data de nascimento é obrigatória.");
    } else {
      const dataNasc = new Date(formData.dataNascimento);
      const hoje = new Date();

      if (dataNasc > hoje) {
        novosErros.push("A data de nascimento não pode ser futura.");
      }
    }

    // Vínculo
    if (!vinculo) {
      novosErros.push(
        "Selecione o seu tipo de vínculo (Participante ou Colaborador).",
      );
    }

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    // --- Envio ---
    setLoading(true);

    const perfilBackend = vinculo === "colaborador" ? "COORDENADOR" : "PARTICIPANTE";

    const payload = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      dataNascimento: formData.dataNascimento,
      cpf: formData.cpf,
      cidade: formData.cidade,
      estado: formData.estado,
      perfil: perfilBackend,
      vinculoInstitucional: true,
    };

    const submitData = new FormData();

    submitData.append(
      "dados",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      }),
    );

    if (arquivoPdf) {
      submitData.append("arquivo", arquivoPdf);
    }

    try {
      await api.post("/auth/registrar", submitData);

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/entrar");
      }, 2000);
    } catch (error) {
      console.error("Erro no cadastro:", error);

      if (error.response && error.response.data) {
        const mensagemServidor = error.response.data;

        if (typeof mensagemServidor === "string") {
          setErros([mensagemServidor]);
        } else if (typeof mensagemServidor === "object") {
          setErros(["Verifique os campos preenchidos e tente novamente."]);
        }
      } else {
        setErros(["Erro ao processar a solicitação. Tente novamente."]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLabelDocumento = () => {
    if (vinculo === "aluno") return "Declaração de Matrícula (PDF)";
    if (vinculo === "colaborador")
      return "Documento Comprobatório Professor (PDF)";
    return "Documento Comprobatório (PDF)";
  };

  return (
    <section className={styles.page}>
      <div className="mt-16 mb-10 text-center">
        <h1 className={styles.title}>Criar Conta</h1>
        <p className={styles.subtitle}>
          Cadastre-se para participar dos projetos extensionistas.
        </p>
      </div>

      <div className={styles.divider}></div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className={styles.card}>
          {erros.length > 0 && (
            <Alert type="error">
              <ul className="pl-5 space-y-1 list-disc">
                {erros.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Alert type="success">{success}</Alert>

          {campos.map((campo) => (
            <div key={campo.name}>
              <label className={styles.label}>{campo.label}</label>
              <input
                type={campo.type}
                name={campo.name}
                value={formData[campo.name]}
                onChange={handleAlteracao}
                placeholder={campo.placeholder}
                className={styles.input}
                required
              />
              {campo.name === "senha" && (
                <p className="mt-1 text-xs text-slate-500">
                  A senha deve ter entre 6 e 20 caracteres, conter pelo menos
                  uma letra, um número e um caractere especial.
                </p>
              )}
            </div>
          ))}

          {/* CPF */}
          <div>
            <label className={styles.label}>CPF</label>
            <input
              name="cpf"
              value={formData.cpf}
              onChange={handleCpfMask}
              placeholder="000.000.000-00"
              maxLength="14"
              className={styles.input}
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className={styles.label}>Data de Nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleAlteracao}
              className={styles.input}
              required
            />
          </div>

          {/* Estado */}
          <div>
            <label className={styles.label}>Estado</label>
            <select
              name="estado"
              value={formData.estado || ""}
              onChange={handleEstadoChange}
              className={styles.input}
              required
            >
              <option value="">Selecione o estado</option>
              {estados.map((estado) => (
                <option key={estado.sigla} value={estado.sigla}>
                  {estado.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className={styles.label}>Cidade</label>
            <select
              name="cidade"
              value={formData.cidade}
              onChange={handleCidadeChange}
              className={styles.input}
              disabled={!formData.estado}
              required
            >
              <option value="">Selecione a cidade</option>
              {cidades.map((cidade) => (
                <option key={cidade.nome} value={cidade.nome}>
                  {cidade.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Vínculo */}
          <div>
            <label className={styles.label}>Vínculo</label>
            <select
              className={styles.input}
              value={vinculo}
              onChange={(e) => setVinculo(e.target.value)}
            >
              <option value="">Selecione o vínculo</option>
              <option value="aluno">Participante</option>
              <option value="colaborador">Colaborador</option>
            </select>
          </div>

          {/* Upload */}
          <div>
            <label className={styles.label}>{getLabelDocumento()}</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={!vinculo}
            />
          </div>

          {!vinculo && (
            <p className="mt-1 text-xs text-red-600">
              Selecione um vínculo acima para liberar o envio do documento.
            </p>
          )}

          {vinculo && (
            <p className="mt-1 text-xs text-slate-500">
              Apenas formato PDF (máx. 10MB).
            </p>
          )}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading && (
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            )}
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </section>
  );
}
