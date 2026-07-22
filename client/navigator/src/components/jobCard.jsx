import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Components.css";

function JobCard({title, company, job_id}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';

  return (
    <div className="job-card-container">
        <div className="job-card-contents">
            <h1>{title}</h1>
            <p>{company}</p>
        </div>
        <div>
            <button className="job-card-apply" onClick={() => navigate(`/jobs/${job_id}`)}>
              {isEmployer ? "View" : "Apply"}
            </button>
        </div>
         
    </div>
  );
}

export default JobCard;