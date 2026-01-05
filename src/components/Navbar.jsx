import { Link, useLocation } from "react-router-dom";
import { BookOpenText, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //Estilos do NavBar:

  {/* Fundo */}
  //const navBg = isScrolled ? "bg-white shadow-md" : isHome ? "bg-transparent" : "bg-gradient-to-br from-emerald-50 via-white to-orange-50";

  const navBg = isScrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent";

  {/* Textos */}
  const textColor = isScrolled ? "text-emerald-700" : isHome ? "text-white" : "text-slate-700";

  {/* Logo */}
  const logoColor = isScrolled ? "text-emerald-900" : isHome ? "text-white": "text-emerald-900";

  {/* Botao Entrar */}
  const signinStyle = isScrolled ? "text-emerald-700 border border-emerald-700 rounded-lg" : isHome ? "text-white bg-emerald-600 rounded-lg hover:bg-emerald-700" : "text-white bg-emerald-600 rounded-lg hover:bg-emerald-700";

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg} ${isScrolled ? "py-3" : "py-5"}`}>
      <div className="px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/*  */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-600">
              <BookOpenText className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col text-[15px]">
              <span className={`font-bold ${logoColor}`}>SDPE</span>
              <span
                className={`${logoColor} font-semibold uppercase tracking-wider`}>
                Divulgação de Projetos
              </span>
            </div>
          </div>

          {/* Links para subpages */}
          <div
            className={`hidden md:flex gap-20 font-medium text-[16px] ${textColor}`}
          >
            <Link to="/" className="transition hover:text-emerald-700">
              Início
            </Link>
            <Link to="/" className="transition hover:text-emerald-700">
              Sobre
            </Link>
            <Link to="/" className="transition hover:text-emerald-700">
              Projetos
            </Link>
            <Link to="/" className="transition hover:text-emerald-700">
              Editais {/*Manter (?)*/}
            </Link>
          </div>

          {/* Botão de login/cadastro */}
          <div className="flex justify-end gap-10">
            <Link
              to="/entrar"
              className={`px-4 py-3 text-[15px] transition-all duration-300 flex items-center gap-1 ${signinStyle}`}>
              Entrar <LogIn size={20} />
            </Link>
          </div>
        </div>
      </div>
      
    </nav>
  );
}
