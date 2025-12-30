export default function Ajuda() {
  return (
    <section className="px-8 pt-24 pb-24 bg-slate-100">
      <div className="mt-16 mb-10 text-center">
        <h1 className="mb-5 text-6xl font-bold leading-normal text-transparent bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900 bg-clip-text">
          Central de Ajuda
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600">
          Tire suas dúvidas e encontre suporte aqui.
        </p>
      </div>

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      {/* Formulario */}
      <div className="flex justify-center">
        <form className="w-full max-w-xl p-8 space-y-2 bg-white rounded-lg shadow">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Seu nome completo"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              type="email"
              placeholder="nome@email.com"
              className="w-full px-4 py-2 rounded-md outline-none border-slate-300 focus:border-emerald-500 border-3"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Assunto
            </label>
            <select className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500">
              <option>Selecione</option>
              <option>Dúvida</option>
              <option>Problema técnico</option>
              <option>Sugestão</option>
              <option>Outro</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Mensagem
            </label>
            <textarea
              rows="4"
              placeholder="Descreva sua mensagem"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 font-medium text-white transition rounded-md bg-emerald-600 hover:bg-emerald-700"
          >
            Enviar mensagem
          </button>
        </form>
      </div>
    </section>
  );
}
