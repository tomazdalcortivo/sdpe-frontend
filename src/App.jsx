import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AjudaButton from "./components/HelpButton.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Inicio from "./pages/Inicio.jsx";
import Ajuda from "./pages/Ajuda.jsx";
import Entrar from "./pages/Login.jsx";
import RecuperarSenha from "./pages/RecuperarSenha.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Perfil from "./pages/Perfil.jsx";
import CriarProjeto from "./pages/CriarProjeto.jsx";

function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/ajuda" element={<Ajuda />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/criar-projeto" element={<CriarProjeto />} />
      </Routes>

      <Footer />
      <AjudaButton />
      
    </>
  );
}

export default App;
