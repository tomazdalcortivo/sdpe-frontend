import { BookOpenText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="text-gray-300 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-3">

        {/* Coluna 1 - Logo */}
        <div className="pl-8 text-left md:justify-self-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-emerald-600">
              <BookOpenText className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-sm font-medium">
              <span className="font-bold leading-none">SDPE</span>
              <span className="text-sm font-semibold uppercase">
                Divulgação de Projetos de Extensão
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 2 - Links Rápidos */}
        <div className="pl-8 text-left md:pl-0 md:justify-self-center">
          <h4 className="mb-4 font-semibold text-white">Links Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-emerald-400">
                Início
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-emerald-400">
                Sobre Nós
              </Link>
            </li>
            <li>
              <Link to="/projetos" className="hover:text-emerald-400">
                Nossos Projetos
              </Link>
            </li>
            <li>
              <Link to="/estatisticas" className="hover:text-emerald-400">
                Estatísticas
              </Link>
            </li>
            <li>
              <Link to="/ajuda" className="hover:text-emerald-400">
                Central de Ajuda
              </Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3 - Faça Parte */}
        <div className="pl-8 pr-8 text-left md:pl-0 md:pr-8 md:justify-self-end md:text-right">
          <h4 className="mb-2 font-semibold text-white md:justify-self-start">Faça Parte</h4>
          <p className="mb-8 text-sm text-gray-400">
            Junte-se à nossa comunidade e participe das ações prestadas.
          </p>

          <div className="flex flex-col items-start gap-4 md:items-end md:flex-row md:justify-end">
            <Link
              to="/cadastro"
              className="px-6 py-2 font-medium text-white transition rounded-md bg-emerald-600 hover:bg-emerald-700"
            >
              Inscreva-se
            </Link>

            <Link
              to="/entrar"
              className="px-6 py-2 font-medium text-white transition border rounded-md border-emerald-700 hover:bg-emerald-700"
            >
              Entrar
            </Link>
          </div>
        </div>

      </div>

      {/* Direitos autorais */}
      <div className="border-t border-slate-800">
        <div className="px-6 py-6 mx-auto text-sm text-center text-gray-500 max-w-7xl">
          <span>
            © 2026 SDPE - Divulgação de Projetos de Extensão. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
