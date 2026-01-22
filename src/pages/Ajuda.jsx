import { useState, useEffect, useRef } from "react";
import "altcha";
import api from "../services/api";
import Alert from "../components/Alert";

export default function Ajuda() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });

  const [status, setStatus] = useState({ loading: false, error: "", success: false });
  const [altchaPayload, setAltchaPayload] = useState(null);

  const widgetRef = useRef(null);

  useEffect(() => {
    const handleVerified = (ev) => {
      setAltchaPayload(ev.detail.payload);
    };

    const widget = widgetRef.current;
    if (widget) {
      widget.addEventListener('verified', handleVerified);
    }

    return () => {
      if (widget) {
        widget.removeEventListener('verified', handleVerified);
      }
    };
  }, []);

  const handleAlteracao = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });

    if (!formData.assunto || !formData.mensagem || !formData.email || !formData.nome) {
      setStatus({ loading: false, error: "Por favor, preencha todos os campos.", success: false });
      return;
    }

    if (!altchaPayload) {
      setStatus({ loading: false, error: "Por favor, verifique o captcha.", success: false });
      return;
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      mensagem: formData.mensagem,
      tipoContato: formData.assunto,
      altcha: altchaPayload
    };

    try {
      await api.post("/api/contatos", payload);
      setStatus({ loading: false, error: "", success: true });
      setFormData({ nome: "", email: "", assunto: "", mensagem: "" });

      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (error) {
      console.error("Erro na requisição:", error);
      const errorMessage = error.response?.data?.error || "Erro ao enviar mensagem.";
      setStatus({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <section className="min-h-screen px-8 pt-24 pb-24 bg-gradient-to-br from-emerald-100 via-white to-amber-100">

      <style>{`
        altcha-widget {
          --altcha-color-base: #059669; /* Emerald 600 */
          --altcha-border-radius: 0.5rem; /* rounded-lg */
          --altcha-color-border-focus: #059669;
        }
      `}</style>

      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 bg-clip-text">
          Central de Ajuda
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Tire suas dúvidas e encontre suporte aqui.
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 max-w-lg"></div>

      <div className="flex justify-center">
        <form
          onSubmit={handleEnviar}
          className="w-full max-w-xl p-8 space-y-4 transition-all bg-white rounded-lg shadow-lg border border-gray-100"
        >
          {status.error && <Alert type="error">{status.error}</Alert>}
          {status.success && <Alert type="success">Mensagem enviada com sucesso!</Alert>}

          {/* Nome */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleAlteracao}
              placeholder="Seu nome completo"
              className="w-full px-4 py-2 transition-all rounded-lg outline-none border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
              className="w-full px-4 py-2 transition-all rounded-lg outline-none border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Assunto */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Assunto</label>
            <select
              name="assunto"
              value={formData.assunto}
              onChange={handleAlteracao}
              className="w-full px-4 py-2 transition-all rounded-lg outline-none border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
            >
              <option value="" disabled>Selecione o tipo de contato</option>
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
              className="w-full px-4 py-2 transition-all rounded-lg outline-none border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
            />
          </div>

          <div className="flex justify-center pt-2 pb-2">
            <altcha-widget
              ref={widgetRef}
              challengeurl="http://localhost:8080/api/contatos/challenge"
              hidelogo
            ></altcha-widget>
          </div>

          <button
            type="submit"
            disabled={status.loading || !altchaPayload}
            className="flex items-center justify-center w-full gap-2 py-3 mt-4 font-medium text-white transition-all rounded-lg bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {status.loading && (
              <div className="w-5 h-5 border-2 border-gray-500 rounded-full border-t-transparent animate-spin"></div>
            )}
            {status.loading ? "Enviando..." : "Enviar Mensagem"}
          </button>
        </form>
      </div>
    </section>
  );
}