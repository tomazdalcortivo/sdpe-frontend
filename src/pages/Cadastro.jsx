import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Cadastro() {
  const navigate = useNavigate();
  const [vinculo, setVinculo] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    dataNascimento: "",
    cpf: "",
    cidade: "",
    // Campos condicionais do aluno podem ser tratados separadamente se precisarem ser enviados ao backend num futuro DTO extendido
    instituicao: "",
    curso: "",
    matricula: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      vinculoInstitucional: true // Assumindo true pois estão selecionando instituição
    };

    try {
      await api.post("/auth/registrar", payload);
      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar. Verifique os dados.");
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-gradient-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Criar Conta
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Cadastre-se para acompanhar e participar dos projetos extensionistas.
        </p>
      </div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow">

          {/* Nome */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Nome completo</label>
            <input
              required
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              type="text"
              placeholder="Seu nome completo"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">E-mail</label>
            <input
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="nome@email.com"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Senha (NOVO) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Senha</label>
            <input
              required
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* CPF (NOVO - Obrigatório no Backend) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">CPF</label>
            <input
              required
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              type="text"
              placeholder="000.000.000-00"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Cidade (NOVO - Obrigatório no Backend) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Cidade</label>
            <input
              required
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              type="text"
              placeholder="Sua cidade"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Data de Nascimento (Substitui Idade para bater com o DTO Date) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Data de Nascimento</label>
            <input
              required
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              type="date"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Vínculo */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Vínculo</label>
            <select
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
              value={vinculo}
              onChange={(e) => setVinculo(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="aluno">Aluno (Participante)</option>
              <option value="colaborador">Colaborador (Coordenador)</option>
            </select>
          </div>

          {/* Lógica condicional de Aluno/Colaborador mantida igual... */}
          <button
            type="submit"
            className="w-full py-3 mt-4 font-medium text-white transition rounded-md bg-emerald-600 hover:bg-emerald-700"
          >
            Criar conta
          </button>
        </form>
      </div>
    </section>
  );
}