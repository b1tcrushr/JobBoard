import "../styles/JobTable.css";

function JobTable({
  jobs,
  condense = false
}) {
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
            <tr key={job.id}>
                <td>
                    {job.title}
                    {condense && <p>({job.location})</p>}
                </td>
                <td>{job.company}</td>
                {!condense && <td>{job.location}</td>}
                {!condense && <td>{job.type}</td>}
                {!condense && <td>{job.salary}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobTable;