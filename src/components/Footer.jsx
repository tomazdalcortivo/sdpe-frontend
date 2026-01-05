import { BookOpenText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    
    <footer className="text-gray-300 bg-gradient-to-b from-slate-900 to-slate-950">
      {/*bg-gradient-to-b: gradiente de cima p/ baixo, com inicio de slate 900 e final 950*/}
      <div className="grid grid-cols-3 py-12">

        {/* Col 1 */}
        {/* justify-self-start: alinha do inicio do grid */}
        <div className="pl-8 text-left justify-self-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-emerald-600">
              <BookOpenText className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-sm font-medium">
              <span className="font-bold leading-none">SDPE</span>
              <span className="text-sm font-semibold uppercase">
                Divulgação de Projetos
              </span>
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="justify-self-center">
          <h4 className="mb-4 font-semibold text-white">Links Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/inicio" className="hover:text-emerald-400">Início</Link></li>
            <li><Link to="/sobre" className="hover:text-emerald-400">Sobre Nós</Link></li>
            <li><Link to="/projetos" className="hover:text-emerald-400">Nossos Projetos</Link></li>
            <li><Link to="/editais" className="hover:text-emerald-400">Editais Abertos</Link></li>
            <li><Link to="/ajuda" className="hover:text-emerald-400">Central de Ajuda</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="pr-8 justify-self-end">
          <h4 className="mb-2 font-semibold text-white">Faça Parte</h4>
          <p className="mb-8 text-sm text-gray-400">
            Junte-se à nossa comunidade e participe das ações prestadas.
          </p>

          <div className="flex justify-end gap-4">
            <Link to="/cadastro" className="px-6 py-2 font-medium text-white transition rounded-md bg-emerald-600 hover:bg-emerald-700">
              Inscreva-se
            </Link>
            <Link to="/entrar" className="px-6 py-2 font-medium text-white transition border rounded-md border-emerald-700 hover:bg-emerald-700">
              Entrar
            </Link>
          </div>
        </div>

      </div>

      {/* Deixar direitos reservados (?) */}
      <div className="border-t border-slate-800">
        <div className="px-6 py-6 mx-auto text-sm text-center text-gray-500 max-w-7xl">
          <span>
            © 2026 SDPE - Divulgação de Projetos. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
