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
import Estatisticas from "./pages/Estatisticas.jsx";
import ListaProjetos from "./pages/ListaProjetos.jsx";
import DetalhesProjeto from "./pages/DetalhesProjeto.jsx";
import Sobre from "./pages/Sobre.jsx";



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
        <Route path="/sobre" element={<Sobre />} />

        <Route path="/estatisticas" element={<Estatisticas />} />
        <Route path="/criar-projeto" element={<CriarProjeto />} />
        <Route path="/lista-projetos" element={<ListaProjetos />} />
        <Route path="/detalhes-projeto/:id" element={<DetalhesProjeto />} />

      </Routes>

      <Footer />
      <AjudaButton />

    </>
  );
}

export default App;
