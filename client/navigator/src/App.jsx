import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ManageAccount from "./pages/ManageAccount";
import ApplyJob from "./pages/ApplyJob";
import "./styles/app.css";

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/apply" element={<ApplyJob />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;