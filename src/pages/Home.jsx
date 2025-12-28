import React from "react";
import testee from "../assets/testee.jpg";
import { Globe, HelpCircle } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="#"
          className="bg-emerald-900 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition flex items-center gap-2"
        >
          <HelpCircle />
        </a>
      </div>

      {/* Tamnaho mínimo em W e H: min-h-screen min-w-screen */}
      <section className="relative min-h-screen px-6 pb-8">
        {/* Background - imagem fundo */}
        <div className="absolute inset-0">
          <img
            src={testee}
            alt="Fundo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-900/80 mix-blend-multiply" />
        </div>

        {/* Conteúdo da imagem */}
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-6xl pt-40 font-bold text-white leading-tight mb-6">
            Conectando Saberes,
            <br />
            <span className="text-emerald-300">
              Formando Protagonistas
            </span>
          </h1>

          <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
            Plataforma de divulgação dos projetos de extensão universitária.
            Descubra como a academia e a comunidade trabalham juntas para
            construir um futuro melhor.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        {/* Linha */}
        <div className="w-lg h-px bg-gray-300 mx-auto my-8"></div>

        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-center mb-6">
            Nosso <span className="text-emerald-700">Objetivo</span>
          </h1>

          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Unir oportunidades de diversas áreas do saber, direcionadas tanto à
            comunidade quanto aos universitários.
          </p>

          <div className="grid grid-cols-3 gap-16 text-center">
            {/* Coluna 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-700 rounded-xl flex items-center justify-center mb-6">
                <Globe className="text-white w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold mb-3">
                Conectividade Acadêmica
              </h3>

              <p className="text-gray-600 text-sm max-w-xs">
                Universidade e Comunidade em parceria para o desenvolvimento
                social.
              </p>
            </div>

            {/* Coluna 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-700 rounded-xl flex items-center justify-center mb-6">
                <Globe className="text-white w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold mb-3">
                Conectividade Acadêmica
              </h3>

              <p className="text-gray-600 text-sm max-w-xs">
                Universidade e Comunidade em parceria para o desenvolvimento
                social.
              </p>
            </div>

            {/* Coluna 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-700 rounded-xl flex items-center justify-center mb-6">
                <Globe className="text-white w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold mb-3">
                Conectividade Acadêmica
              </h3>

              <p className="text-gray-600 text-sm max-w-xs">
                Universidade e Comunidade em parceria para o desenvolvimento
                social.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
