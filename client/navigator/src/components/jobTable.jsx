import { useNavigate } from "react-router-dom";
import "../styles/jobTable.css";

function JobTable({
  jobs,
  condense = false
}) {
  const navigate = useNavigate();
  return (
    <div className="job-table-container">
      {!condense && <h2 className="job-table-title">Job Listings</h2>}

      <table className="job-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            {!condense && <th>Location</th>}
            {!condense && <th>Type</th>}
            {!condense && <th>Salary</th>}
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job.job_id} onClick={() => navigate(`/jobs/${job.job_id}`)} >
                <td>
                    {job.job_title}
                    {condense && <p className="job-location-text">({job.job_location})</p>}
                </td>
                <td>{job.company_name}</td>
                {!condense && <td>{job.job_location}</td>}
                {!condense && <td>{job.job_type}</td>}
                {!condense && <td>{job.pay_grade || 'N/A'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;