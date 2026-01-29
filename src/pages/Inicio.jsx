import React from "react";
import testee from "../assets/testee.jpg";
import { Users, Lightbulb, ChartColumn } from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="relative flex items-center min-h-screen pb-8">
        <div className="absolute inset-0">
          <img
            src={testee}
            alt="Fundo"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-emerald-900/80 mix-blend-multiply" />
        </div>

        <div className="relative px-6">
          <h1 className="mb-8 text-6xl font-bold leading-tight text-white">
            Conectando Saberes,
            <br />
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
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-emerald-700 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold">
                Conectividade
              </h3>

              <p className="max-w-xs text-sm text-gray-600">
                Conectar estudantes, professores e comunidade em projetos que transformam realidades.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-emerald-700 rounded-xl">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold">
                Colaboração
              </h3>

              <p className="max-w-xs text-sm text-gray-600">
                Promover soluções que impactem positivamente a comunidade através da extensão universitária

              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-emerald-700 rounded-xl">
                <ChartColumn className="w-8 h-8 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold">
                Impacto
              </h3>

              <p className="max-w-xs text-sm text-gray-600">
                Gerar resultados concretos e mensuráveis que beneficiem a todos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}