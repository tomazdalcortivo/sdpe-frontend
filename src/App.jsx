import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AjudaButton from "./components/HelpButton.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import VLibras from "./components/VLibras.jsx";

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
import PainelAdministrativo from "./pages/PainelAdministrativo.jsx";
import RotaAdmin from "./pages/RotaAdmin.jsx";
import Sobre from "./pages/Sobre.jsx";

function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <VLibras />

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
        <Route path="/projetos" element={<ListaProjetos />} />
        <Route path="/detalhes-projeto/:id" element={<DetalhesProjeto />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route element={<RotaAdmin />}>
          <Route path="/painel-administrativo" element={<PainelAdministrativo />} />
        </Route>
      </Routes>

      <Footer />
      <AjudaButton />

    </>
  );
}

export default App;