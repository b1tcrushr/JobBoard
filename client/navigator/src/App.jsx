import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import JobPostins from "./pages/jobpostings/Jobs";
import JobDetails from "./pages/jobdetails/JobDetails";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/app.css"

function App() {
  return (
    <div className="app-container">
      <Header />
      {/* define routes here */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobPostins />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default App;