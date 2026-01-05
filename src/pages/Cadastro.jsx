import { useState } from "react";

export default function Cadastro() {
  const [vinculo, setVinculo] = useState("");

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

      <div className="h-px mx-auto my-10 bg-gray-300 w-lg"></div>

      {/* Formulário */}
      <div className="flex justify-center">
        <form className="w-full max-w-xl p-8 space-y-4 bg-white rounded-lg shadow">
          
          {/* Nome */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Nome completo
            </label>
            <input
              type="text"
              placeholder="Seu nome completo"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              type="email"
              placeholder="nome@email.com"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Se for do ambiente acadêmico, utilize seu e-mail institucional.
            </p>
          </div>

          {/* Idade */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Idade
            </label>
            <input
              type="number"
              placeholder="Ex: 20"
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
            />
          </div>

          {/* Sexo */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Sexo
            </label>
            <select className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500">
              <option value="">Selecione</option>
              <option>Feminino</option>
              <option>Masculino</option>
              <option>Outro</option>
              <option>Prefiro não informar</option>
            </select>
          </div>

          {/* Vínculo */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Vínculo
            </label>
            <select
              className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
              value={vinculo}
              onChange={(e) => setVinculo(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="aluno">Aluno</option>
              <option value="colaborador">Colaborador</option>
            </select>
          </div>

          {/* CAMPOS CONDICIONAIS */}

          {/* Aluno */}
          {vinculo === "aluno" && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Instituição
                </label>
                <select className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500">
                  <option>
                    Instituto Federal do Paraná – Campus Irati
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Curso
                </label>
                <select className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500">
                  <option>Técnico em Informática</option>
                  <option>Técnico em Agroecologia</option>
                  <option>Licenciatura em Química</option>
                  <option>Análise e Desenvolvimento de Sistemas</option>
                  <option>Engenharia de Software</option>
                  <option>Agronomia</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Ano que está cursando
                </label>
                <select className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Número da matrícula
                </label>
                <input
                  type="text"
                  placeholder="Matrícula"
                  className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {/* Colaborador/Professor (?) */}
          {vinculo === "colaborador" && (
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">
                Função
              </label>
              <select className="w-full px-4 py-2 rounded-md outline-none border-3 border-slate-300 focus:border-emerald-500">
                <option>Professor</option>
                <option>Outro</option>
              </select>
            </div>
          )}

          {/* Botão */}
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
