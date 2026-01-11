import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpenText, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  // Verifica se existe token 
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navBg = isScrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent";
  const textColor = isScrolled ? "text-emerald-700" : isHome ? "text-white" : "text-slate-700";
  const logoColor = isScrolled ? "text-emerald-900" : isHome ? "text-white" : "text-emerald-900";

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg} ${isScrolled ? "py-3" : "py-5"}`}>
      <div className="px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-600">
              <BookOpenText className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col text-[15px]">
              <span className={`font-bold ${logoColor}`}>SDPE</span>
              <span className={`${logoColor} font-semibold uppercase tracking-wider`}>
                Divulgação de Projetos de Extensão
              </span>
            </div>
          </div>

          {/* Links */}
          <div className={`hidden md:flex gap-20 font-medium text-[16px] ${textColor}`}>
            <Link to="/">Início</Link>
            <Link to="/">Sobre</Link>
            <Link to="/">Projetos</Link>
            {isAuthenticated && <Link to="/perfil">Perfil</Link>}
          </div>

          {/* Botão Entrar / Sair */}
          <div className="flex justify-end gap-10">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 text-[15px] text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Sair <LogOut size={20} />
              </button>
            ) : (
              <Link
                to="/entrar"
                className="flex items-center gap-2 px-4 py-3 text-[15px] text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
              >
                Entrar <LogIn size={20} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
