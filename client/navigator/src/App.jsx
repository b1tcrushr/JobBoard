import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import JobPostins from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ManageAccount from "./pages/ManageAccount";
import ApplyJob from "./pages/ApplyJob";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/app.css";;

function App() {
  return (
    <AuthProvider>
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/apply" element={<ApplyJob />} />
          <Route path="/jobs" element={<JobPostins />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </AuthProvider>
  );
}

export default App;