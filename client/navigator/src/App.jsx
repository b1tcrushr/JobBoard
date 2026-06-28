import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import JobPostins from "./pages/jobpostings/Jobs";
import JobDetails from "./pages/jobdetails/JobDetails";
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
          <Route path="/jobs" element={<JobPostins />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;