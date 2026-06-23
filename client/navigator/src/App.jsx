import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/app.css"

function App() {
  return (
    <div className="app-container">
      <Header />
      {/* define routes here */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      <Footer/>
    </div>
  );
}

export default App;