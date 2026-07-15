import "../styles/Components.css";

function JobCard({title, company}) {
  return (
    <div className="job-card-container">
        <div className="job-card-contents">
            <h1>{title}</h1>
            <p>{company}</p>
        </div>
        <div>
            <button className="job-card-apply">Apply</button>
        </div>
         
    </div>
  );
}

export default JobCard;