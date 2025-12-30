import React from "react";
import { Link } from "react-router-dom";
import testee from "../assets/testee.jpg";
import { Globe, HelpCircle } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="fixed z-50 bottom-6 right-6">
        <Link
          to="/Ajuda"
          className="flex items-center gap-2 p-4 text-white transition rounded-full shadow-lg bg-emerald-900 hover:bg-emerald-600"
        >
          <HelpCircle />
        </Link>
      </div>

      {/* Tamnaho mínimo em W e H: min-h-screen min-w-screen */}
      <section className="relative flex items-center min-h-screen pb-8">
        {/* Background - imagem fundo */}
        <div className="absolute inset-0">
          <img
            src={testee}
            alt="Fundo"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-emerald-900/80 mix-blend-multiply" />
        </div>

        {/* Conteúdo da imagem */}
        <div className="relative px-6">
          <h1 className="mb-8 text-6xl font-bold leading-tight text-white">
            Conectando Saberes,
            <br/>
            <span className="text-emerald-300">
              Formando Protagonistas
            </span>
          </h1>

          <p className="max-w-2xl text-xl text-emerald-100 ">
            Plataforma de divulgação dos projetos de extensão universitária.
            Descubra como a academia e a comunidade trabalham juntas para
            construir um futuro melhor.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        {/* Linha */}
        <div className="h-px mx-auto my-8 bg-gray-300 w-lg"></div>

        <div className="px-6 mx-auto max-w-7xl">
          <h1 className="mb-6 text-5xl font-bold text-center">
            Nosso <span className="text-emerald-700">Objetivo</span>
          </h1>

          <p className="max-w-2xl mx-auto mb-16 text-center text-gray-600">
            Unir oportunidades de diversas áreas do saber, direcionadas tanto à
            comunidade quanto aos universitários.
          </p>

          <div className="grid grid-cols-3 gap-16 text-center">
            {/* Coluna 1 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-emerald-700 rounded-xl">
                <Globe className="w-8 h-8 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold">
                Conectividade Acadêmica
              </h3>

              <p className="max-w-xs text-sm text-gray-600">
                Universidade e Comunidade em parceria para o desenvolvimento
                social.
              </p>
            </div>

            {/* Coluna 2 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-emerald-700 rounded-xl">
                <Globe className="w-8 h-8 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold">
                Conectividade Acadêmica
              </h3>

              <p className="max-w-xs text-sm text-gray-600">
                Universidade e Comunidade em parceria para o desenvolvimento
                social.
              </p>
            </div>

            {/* Coluna 3 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-emerald-700 rounded-xl">
                <Globe className="w-8 h-8 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold">
                Conectividade Acadêmica
              </h3>

              <p className="max-w-xs text-sm text-gray-600">
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
