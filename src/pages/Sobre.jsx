import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  FolderOpen,
  UserCheck,
  Lightbulb,
  Target,
  GraduationCap,
  Notebook,
  Users,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";

export default function Sobre() {

  const [totalProjetos, setTotalProjetos] = useState(0);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [totalVisualizacoes, setTotalVisualizacoes] = useState(0);

  useEffect(() => {
    async function fetchEstatisticas() {
      try {
        const resProjetos = await api.get("/api/estatisticas/geral/total-projetos");
        setTotalProjetos(resProjetos.data || 0);

        const resParticipantes = await api.get("/api/estatisticas/geral/total-participantes");
        setTotalParticipantes(resParticipantes.data || 0);

        const resViews = await api.get("/api/estatisticas/geral/total-visualizacoes");
        setTotalVisualizacoes(resViews.data || 0);

      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      }
    }
    fetchEstatisticas();
  }, []);

  const stats = [
    { icon: Eye, value: totalVisualizacoes, label: "Visualizações Totais", suffix: "+" },
    { icon: FolderOpen, value: totalProjetos, label: "Projetos Cadastrados", suffix: "" },
    { icon: UserCheck, value: totalParticipantes, label: "Participantes Ativos", suffix: "+" },
  ];

  const aboutItems = [
    {
      icon: Target,
      title: "Objetivo Principal",
      text:
        "Democratizar o acesso a projetos de extensão, criando uma ponte eficiente entre a universidade e a sociedade, facilitando a participação de todos os públicos interessados.",
    },
    {
      icon: Lightbulb,
      title: "Por que Criamos?",
      text:
        "Percebemos a necessidade de um espaço único e organizado onde projetos de extensão pudessem ser facilmente encontrados e divulgados, eliminando barreiras e aumentando o impacto social da universidade.",
    },
  ];

  const audiences = [
    {
      icon: GraduationCap,
      title: "Professores",
      text:
        "Cadastre e divulgue seus projetos de extensão para alcançar alunos e comunidade.",
    },
    {
      icon: Notebook,
      title: "Alunos",
      text:
        "Participe de projetos para obter horas de extensão e enriquecer sua formação acadêmica.",
    },
    {
      icon: Users,
      title: "Comunidade",
      text:
        "Descubra e participe de projetos que conectam universidade e sociedade.",
    },
  ];

  const actions = [
    {
      icon: TrendingUp,
      title: "Explore Projetos",
      text:
        "Navegue por projetos de extensão e encontre oportunidades alinhadas aos seus interesses e objetivos acadêmicos ou sociais.",
      button: "Ver projetos",
      to: "/lista-projetos",
      color: "emerald",
    },
    {
      icon: GraduationCap,
      title: "Cadastre seu Projeto",
      text:
        "Divulgue seu projeto de extensão na plataforma e facilite o acesso de alunos e da comunidade aos seus programas.",
      button: "Cadastrar projeto",
      to: "/cadastro",
      color: "amber",
    },
  ];

  const actionStyles = {
    emerald: {
      card: "from-emerald-50 to-white border-emerald-100",
      icon: "from-emerald-600 to-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700",
    },
    amber: {
      card: "from-amber-50 to-white border-amber-100",
      icon: "from-amber-600 to-amber-500",
      button: "bg-amber-600 hover:bg-amber-700",
    },
  };

  function AnimatedCounter({ end, duration = 2000 }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      if (end === 0) return;

      const increment = end / (duration / 50);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }
        setCount(Math.floor(start));
      }, 50);

      return () => clearInterval(counter);
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
  }

  return (
    <>
      <section className="px-8 pt-40 pb-20 bg-gradient-to-br from-emerald-600/10 to-emerald-400/5">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            Plataforma de Divulgação de <br />
            <span className="text-transparent bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-700 bg-clip-text">
              Projetos de Extensão
            </span>
          </h1>

          <div className="max-w-3xl pl-5 mx-auto border-l-4 border-amber-600">
            <p className="text-xl text-justify text-emerald-800">
              O SDPE é a plataforma que aproxima professores, alunos e a
              comunidade através de projetos de extensão universitária,
              promovendo conhecimento, desenvolvimento social e oportunidades
              de crescimento.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-16 md:grid-cols-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-8 bg-white border shadow-lg rounded-2xl border-emerald-100 transition-transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-4 w-14 h-14 bg-emerald-700 rounded-xl shadow-md">
                    <stat.icon className="text-white w-7 h-7" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    <AnimatedCounter end={stat.value} />
                    {stat.suffix}
                  </div>
                  <p className="font-medium text-gray-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <div className="h-px mx-auto my-8 bg-gray-300 w-lg"></div>
            <h3 className="mb-4 text-4xl font-bold text-emerald-900">
              O que é o SDPE?
            </h3>
            <p className="max-w-3xl mx-auto text-lg text-gray-600">
              Uma plataforma digital centralizada que facilita a divulgação,
              descoberta e participação em projetos de extensão universitária.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {aboutItems.map((item, index) => (
              <div key={index} className="pl-6 border-l-4 border-emerald-600">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-6 h-6 text-amber-600" />
                  <h4 className="text-2xl font-bold text-gray-900">
                    {item.title}
                  </h4>
                </div>
                <p className="leading-relaxed text-justify text-gray-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20">
            <div className="mb-16 text-center">
              <div className="h-px mx-auto my-8 bg-gray-300 w-lg"></div>
              <h3 className="mb-4 text-4xl font-bold text-emerald-900">
                Para quem é o SDPE?
              </h3>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Nossa plataforma atende três públicos essenciais da extensão
                universitária:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {audiences.map((item, index) => (
                <div key={index} className="pl-6 border-l-4 border-emerald-600">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className="w-6 h-6 text-amber-600" />
                    <h4 className="text-2xl font-bold text-gray-900">
                      {item.title}
                    </h4>
                  </div>
                  <p className="leading-relaxed text-justify text-gray-700">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 pt-20 pb-20 bg-gradient-to-br from-emerald-600/10 to-emerald-400/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-4xl font-bold text-gray-900">
              Comece <span className="text-emerald-700">Agora!</span>
            </h3>
            <p className="text-lg text-gray-600">
              Explore projetos ou compartilhe o seu na plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {actions.map((action, index) => {
              const style = actionStyles[action.color];
              return (
                <div
                  key={index}
                  className={`p-8 border rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                    bg-gradient-to-br ${style.card}`}
                >
                  <div
                    className={`flex items-center justify-center w-14 h-14 mb-6 rounded-xl
                      bg-gradient-to-br ${style.icon}`}
                  >
                    <action.icon className="text-white w-7 h-7" />
                  </div>

                  <h4 className="mb-3 text-2xl font-bold text-gray-900">
                    {action.title}
                  </h4>

                  <p className="mb-6 leading-relaxed text-gray-600">
                    {action.text}
                  </p>

                  <Link
                    to={action.to}
                    className={`inline-flex items-center justify-center w-full px-6 py-3 font-semibold text-white rounded-xl transition-all duration-300
                      ${style.button}`}
                  >
                    {action.button}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}