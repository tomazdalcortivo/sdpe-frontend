import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

export default function Cadastro() {
  const navigate = useNavigate();

  const [erros, setErros] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [vinculo, setVinculo] = useState("");
  const [arquivoPdf, setArquivoPdf] = useState(null);

  const inputBase = "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all";
  const fileInputBase = "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all";

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    dataNascimento: "",
    cpf: "",
    cidade: "",
    instituicao: "",
    curso: "",
    matricula: ""
  });

  const handleAlteracao = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    setFormData((prev) => ({ ...prev, cpf: value }));
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      novosErros.push("O e-mail é obrigatório.");
    } else if (!emailRegex.test(formData.email)) {
      novosErros.push("Digite um endereço de e-mail válido.");
    }

    // Senha
    if (formData.senha.length < 6) {
      novosErros.push("A senha deve ter no mínimo 6 caracteres.");
    }

    // CPF (Verifica se está completo com a máscara)
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

    // Data de Nascimento
    if (!formData.dataNascimento) {
      novosErros.push("A data de nascimento é obrigatória.");
    } else {
      const dataNasc = new Date(formData.dataNascimento);
      const hoje = new Date();
      if (dataNasc > hoje) {
        novosErros.push("A data de nascimento não pode ser no futuro.");
      }
    }

    // Vínculo
    if (!vinculo) {
      novosErros.push("Selecione o seu tipo de vínculo (Aluno ou Colaborador).");
    }

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    // --- Envio ---
    setLoading(true);

    let perfilBackend = "PARTICIPANTE";
    if (vinculo === "colaborador") {
      perfilBackend = "COORDENADOR";
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      dataNascimento: formData.dataNascimento,
      cpf: formData.cpf, // Envia o CPF formatado
      cidade: formData.cidade,
      perfil: perfilBackend,
      vinculoInstitucional: true
    };

    const submitData = new FormData();
    submitData.append("dados", new Blob([JSON.stringify(payload)], { type: "application/json" }));

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
    if (vinculo === "colaborador") return "Documento Comprobatório Professor (PDF)";
    return "Documento Comprobatório (PDF)";
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Criar Conta
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Cadastre-se para participar dos projetos extensionistas.
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-xl p-8 space-y-4 transition-all bg-white rounded-lg shadow-lg">

          {erros.length > 0 && (
            <Alert type="error">
              <ul className="pl-5 space-y-1 list-disc">
                {erros.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Alert type="success">{success}</Alert>

          {/* Nome */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Nome completo</label>
            <input
              required
              name="nome"
              value={formData.nome}
              onChange={handleAlteracao}
              type="text"
              placeholder="Seu nome completo"
              className={inputBase}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">E-mail</label>
            <input
              required
              name="email"
              value={formData.email}
              onChange={handleAlteracao}
              type="email"
              placeholder="nome@email.com"
              className={inputBase}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Senha</label>
            <input
              required
              name="senha"
              value={formData.senha}
              onChange={handleAlteracao}
              type="password"
              placeholder="••••••••"
              className={inputBase}
            />
          </div>

          {/* CPF COM MÁSCARA */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">CPF</label>
            <input
              required
              name="cpf"
              value={formData.cpf}
              onChange={handleCpfMask} // Usa a nova função aqui
              type="text"
              placeholder="000.000.000-00"
              className={inputBase}
              maxLength="14"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Cidade</label>
            <input
              required
              name="cidade"
              value={formData.cidade}
              onChange={handleAlteracao}
              type="text"
              placeholder="Sua cidade"
              className={inputBase}
            />
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Data de Nascimento</label>
            <input
              required
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleAlteracao}
              type="date"
              className={inputBase}
            />
          </div>

          {/* Vínculo */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Vínculo</label>
            <select
              className={inputBase}
              value={vinculo}
              onChange={(e) => setVinculo(e.target.value)}
            >
              <option value="">Selecione seu vínculo</option>
              <option value="aluno">Participante (Aluno)</option>
              <option value="colaborador">Colaborador (Professor)</option>
            </select>
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              {getLabelDocumento()}
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className={fileInputBase}
              disabled={!vinculo}
            />
            {!vinculo && (
              <p className="mt-1 text-xs text-amber-600">Selecione o vínculo acima para liberar o envio.</p>
            )}
            {vinculo && (
              <p className="mt-1 text-xs text-slate-500">Opcional. Apenas formato PDF (Máx. 10MB).</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed"
          >
            {loading && <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>}
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </section>
  );
}