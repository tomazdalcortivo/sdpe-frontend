import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AjudaButton from "./components/HelpButton.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Inicio.jsx";
import Help from "./pages/Ajuda.jsx";
import Entrar from "./pages/Login.jsx";
import RecuperarSenha from "./pages/RecuperarSenha.jsx";
import Cadastro from "./pages/Cadastro.jsx";

function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Ajuda" element={<Help />} />
        <Route path="/Entrar" element={<Entrar />} />
        <Route path="/RecuperarSenha" element={<RecuperarSenha />} />
        <Route path="/Cadastro" element={<Cadastro />} />
      </Routes>

      <Footer />
      <AjudaButton />
      
    </>
  );
}

export default App;
