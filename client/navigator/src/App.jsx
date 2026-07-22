import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import JobPostins from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ManageAccount from "./pages/ManageAccount";
import ApplyJob from "./pages/ApplyJob";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobPostingForm from "./pages/JobPostingForm";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import "./styles/app.css";

function DashboardRouter() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "admin") {
    return <AdminDashboard />;
  }
  if (user.role === "employer") {
    return <EmployerDashboard />;
  }
  return <CandidateDashboard />;
}

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
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/edashboard" element={<DashboardRouter />} />
          <Route path="/admin" element={<DashboardRouter />} />
          <Route path="/post" element={<JobPostingForm />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </AuthProvider>
  );
}

export default App;