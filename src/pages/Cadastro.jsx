import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

export default function Cadastro() {
  const navigate = useNavigate();
  const [vinculo, setVinculo] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Estados para mensagens
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputBase = "w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");    // Limpa mensagens antigas
    setSuccess("");

    let perfilBackend = "PARTICIPANTE";
    if (vinculo === "colaborador") {
      perfilBackend = "COORDENADOR";
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      dataNascimento: formData.dataNascimento,
      cpf: formData.cpf,
      cidade: formData.cidade,
      perfil: perfilBackend,
      vinculoInstitucional: true
    };

    try {
      await api.post("/auth/registrar", payload);

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/entrar");
      }, 2000);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      if (error.response?.status === 400) {
        setError("Dados inválidos ou e-mail já cadastrado.");
      } else {
        setError("Ocorreu um erro ao criar a conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Criar Conta
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Cadastre-se para acompanhar e participar dos projetos extensionistas.
        </p>
      </div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-xl p-8 space-y-4 transition-all bg-white rounded-lg shadow-lg">

          {/* 4. Componentes visuais controlados pelo estado */}
          <Alert type="error">{error}</Alert>
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

          {/* CPF */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">CPF</label>
            <input
              required
              name="cpf"
              value={formData.cpf}
              onChange={handleAlteracao}
              type="text"
              placeholder="000.000.000-00"
              className={inputBase}
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
              <option value="">Selecione</option>
              <option value="aluno">Aluno (Participante)</option>
              <option value="colaborador">Colaborador (Coordenador)</option>
            </select>
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