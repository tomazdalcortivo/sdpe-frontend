import { useState } from "react";
import api from "../services/api";

export default function Ajuda() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "Selecione",
    mensagem: "",
  });

  const [status, setStatus] = useState({ loading: false, error: "", success: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mapAssuntoToTipo = (assunto) => {
    if (assunto === "Sugestão") return "FEEDBACK";
    return "CHAMADO";
  };

  const handleSubmit = async (e) => {
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
      tipoContato: mapAssuntoToTipo(formData.assunto),
      projeto: null
    };

    try {
      await api.post("/api/contatos", payload);

      setStatus({ loading: false, error: "", success: true });
      setFormData({ nome: "", email: "", assunto: "Selecione", mensagem: "" });
      alert("Mensagem enviada com sucesso!");

    } catch (error) {
      console.error("Erro na requisição:", error);

      const errorMessage = error.response?.data?.message || "Erro de conexão com o servidor.";
      setStatus({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-gradient-to-br from-emerald-100 via-white to-amber-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Central de Ajuda
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Tire suas dúvidas e encontre suporte aqui.
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-xl p-8 space-y-2 bg-white rounded-lg shadow">

          {status.error && <div className="p-3 text-red-700 bg-red-100 rounded">{status.error}</div>}
          {status.success && <div className="p-3 text-green-700 bg-green-100 rounded">Mensagem enviada!</div>}

          {/* Nome */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nome@email.com"
              className="w-full px-4 py-2 rounded-md outline-none border-slate-300 focus:border-emerald-500 border-3"
            />
          </div>

          {/* Assunto */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Assunto</label>
            <select
              name="assunto"
              value={formData.assunto}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            >
              <option value="Selecione" disabled>Selecione</option>
              <option>Dúvida</option>
              <option>Problema técnico</option>
              <option>Sugestão</option>
              <option>Outro</option>
            </select>
          </div>

          {/* Mensagem */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Mensagem</label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              rows="4"
              placeholder="Descreva sua mensagem"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className={`w-full py-3 font-medium text-white transition rounded-md ${status.loading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            {status.loading ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}