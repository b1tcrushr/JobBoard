import { useNavigate } from "react-router-dom";
import "../styles/Components.css";

function JobCard({title, company, job_id}) {
  const navigate = useNavigate();
  return (
    <div className="job-card-container">
        <div className="job-card-contents">
            <h1>{title}</h1>
            <p>{company}</p>
        </div>
        <div>
            <button className="job-card-apply" onClick={() => navigate(`/jobs/${job_id}`)}>Apply</button>
        </div>
         
    </div>
  );
}

export default JobCard;