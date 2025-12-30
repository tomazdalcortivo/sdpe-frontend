import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Ajuda from "./pages/Ajuda.jsx";


function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ajuda" element={<Ajuda />} />
      </Routes>

      <Footer />
      
    </>
  );
}

export default App;
