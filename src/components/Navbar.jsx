import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpenText, LogIn, LogOut, User } from "lucide-react";
import api from "../services/api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState(null);

  // 1. Efeito de Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Validação de Login
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api.get("/auth/perfil")
        .then((response) => {
          setUserData({
            email: response.data.email,
            perfil: response.data.perfil,
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUserData(null);
        });
    } else {
      setUserData(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Cores dinâmicas
  const navBg = isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent";
  const textColor = isScrolled ? "text-emerald-700" : isHome ? "text-white" : "text-slate-700";
  const logoColor = isScrolled ? "text-emerald-900" : isHome ? "text-white" : "text-emerald-900";
  // Cor para o texto de boas-vindas
  const welcomeColor = isScrolled ? "text-emerald-800" : isHome ? "text-emerald-100" : "text-emerald-800";

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg} ${isScrolled ? "py-3" : "py-5"}`}>
      <div className="relative px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
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

          {/* === LINKS (Centralizados) === */}
          <div className={`hidden md:flex absolute left-1/2 transform -translate-x-1/2 gap-10 font-medium text-[16px] ${textColor}`}>
            <Link to="/" className="transition-opacity hover:opacity-75">Início</Link>
            <Link to="/sobre" className="transition-opacity hover:opacity-75">Sobre</Link>
            <Link to="/lista-projetos" className="transition-opacity hover:opacity-75">Projetos</Link>
            <Link to="/estatisticas" className="transition-opacity hover:opacity-75">Estatísticas</Link>
          </div>

          {/* === ÁREA DA DIREITA (Login / Sair) === */}
          <div className="flex items-center gap-6">

            {userData ? (
              // SE ESTIVER LOGADO
              <div className="flex items-center gap-6">

                {/* Texto "Olá" + Link Perfil */}
                <div className="flex items-center gap-3">
                  <div className={`hidden lg:flex flex-col items-end text-sm ${welcomeColor}`}>
                    <span className="font-semibold">Olá, {userData.email}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80 border border-current px-2 rounded-full">
                      {userData.perfil}
                    </span>

                  </div>

                  {/* Ícone de Perfil Clicável */}
                  <Link
                    to="/perfil"
                    className={`p-2 rounded-full transition-colors ${isScrolled ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-white/10 text-white hover:bg-white/20"}`}
                    title="Meu Perfil"
                  >
                    <User size={20} />
                  </Link>
                </div>

                {/* Botão Sair */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 text-[15px] text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                  Sair <LogOut size={20} />
                </button>
              </div>
            ) : (
              // SE NÃO ESTIVER LOGADO
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