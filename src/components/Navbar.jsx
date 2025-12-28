import { Link } from "react-router-dom";
import { BookOpenText, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  
  {/*Elementos Navbar Scroll*/}
  const [isScrolled, setIsScrolled] = useState(false);
  const SubPagesNav = isScrolled ? "text-emerald-700" : "text-white";
  const logoNav = isScrolled ? "text-emerald-900" : "text-white";
  const SigninNav = isScrolled ? "text-emerald-700 border-emerald-700" : "text-white bg-emerald-600 rounded-lg";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo (mudar?) */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              <BookOpenText className="w-6 h-6" />
            </div>

            <div className="flex flex-col font-medium text-sm">
              <span className={`font-bold ${logoNav} leading-none`}>
                SDPE
              </span>
              <span
                className={`text-[12px] ${logoNav} font-semibold uppercase tracking-wider`}>
                Divulgação de Projetos
              </span>
            </div>
          </div>

          <div className={`hidden md:flex gap-20 ${SubPagesNav} font-medium text-sm`}>
            <Link to="/" className="hover:text-emerald-700 transition">
              Início
            </Link>
            <Link to="/" className="hover:text-emerald-700 transition">
              Sobre
            </Link>
            <Link to="/" className="hover:text-emerald-700 transition">
              Projetos
            </Link>
            <Link to="/" className="hover:text-emerald-700 transition">
              Editais
            </Link>
          </div>

         
          {<div className="flex justify-end gap-10">
            <a href="#" className={`px-4 py-3 ${SigninNav} font-medium text-sm transition-all duration-300 flex items-center gap-1`}>
              Entrar<LogIn size={20} />
            </a>
          </div> }
        </div>
      </div>
    </nav>
  );
}
