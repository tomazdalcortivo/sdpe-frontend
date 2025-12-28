import { BookOpenText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-3 gap-40">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              <BookOpenText className="w-6 h-6" />
            </div>
            <div className="flex flex-col font-medium text-sm">
              <span className={`font-bold leading-none`}>SDPE</span>
              <span
                className={`text-[12px] font-semibold uppercase tracking-wider`}>
                Divulgação de Projetos
              </span>
            </div>
          </div>
        </div>

        {/* Links rodapé */}
        <div>
          <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-emerald-400">
                Início
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-400">
                Sobre Nós
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-400">
                Nossos Projetos
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-400">
                Editais Abertos
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-400">
                Central de Ajuda
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold mb-2">Faça Parte</h4>

          <p className="text-sm text-gray-400 mb-8">
            Junte-se à nossa comunidade e participe das ações prestadas.
          </p>

          <a
            href="#"
            className="mr-6 bg-emerald-600 hover:bg-emerald-700 transition text-white py-2 px-6 rounded-md font-medium">
            Inscreva-se
          </a>

          <a
            href="#"
            className="border border-emerald-600 hover:bg-emerald-700 transition text-white py-2 px-6 rounded-md font-medium"
          >
            Entrar
          </a>
        </div>
      </div>

      {/* Direitos Reservados (??) */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-500 text-center">
          <span>
            © 2026 SDPE - Divulgação de Projetos. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
