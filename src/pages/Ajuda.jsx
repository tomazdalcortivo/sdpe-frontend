import { useState } from "react";
import api from "../services/api";
import Alert from "../components/Alert"; // 1. Importar o componente

export default function Ajuda() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });

  const [status, setStatus] = useState({ loading: false, error: "", success: false });

  const handleAlteracao = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoAssunto = (assunto) => {
    if (assunto === "Sugestão") return "FEEDBACK";
    return "CHAMADO";
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });

    if (formData.assunto === "Selecione" || !formData.mensagem || !formData.email || !formData.nome) {
      setStatus({
        loading: false,
        error: "Por favor, preencha todos os campos.",
        success: false
      });
      return;
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      mensagem: formData.mensagem,
      tipoContato: formData.assunto,
    };

    try {
      await api.post("/api/contatos", payload);

      setStatus({ loading: false, error: "", success: true });
      setFormData({ nome: "", email: "", assunto: "Selecione", mensagem: "" });

      // Opcional: Remove a mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (error) {
      console.error("Erro na requisição:", error);
      const errorMessage = error.response?.data?.message || "Erro de conexão com o servidor.";
      setStatus({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-linear-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Central de Ajuda
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Tire suas dúvidas e encontre suporte aqui.
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      <div className="flex justify-center">
        <form onSubmit={handleEnviar} className="w-full max-w-xl p-8 space-y-4 transition-all bg-white rounded-lg shadow-lg">

          {/* 4. Componentes Alert baseados no objeto 'status' */}
          <Alert type="error">{status.error}</Alert>

          {status.success && (
            <Alert type="success">Mensagem enviada com sucesso! Entraremos em contato em breve.</Alert>
          )}

          {/* Nome */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleAlteracao}
              placeholder="Seu nome completo"
              className="w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleAlteracao}
              placeholder="nome@email.com"
              className="w-full px-4 py-2 transition-all rounded-md outline-none border-slate-300 focus:border-emerald-500 border-3 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {/* Assunto */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Assunto</label>
            <select
              name="assunto"
              value={formData.assunto}
              onChange={handleAlteracao}
              className="w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="" disabled>Selecione</option>
              <option value="DUVIDA">Dúvida</option>
              <option value="CHAMADO">Problema técnico</option>
              <option value="SUGESTAO">Sugestão</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          {/* Mensagem */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Mensagem</label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleAlteracao}
              rows="4"
              placeholder="Descreva sua mensagem"
              className="w-full px-4 py-2 transition-all rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-md disabled:bg-emerald-400 disabled:cursor-not-allowed"
          >
            {status.loading && <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>}
            {status.loading ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}