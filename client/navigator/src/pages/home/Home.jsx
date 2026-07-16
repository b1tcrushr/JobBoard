import DisplayBubble from "../../components/common/DisplayBubble";
import JobCard from "../../components/jobCard";
import JobTable from "../../components/jobTable";
import "../../styles/home.css"
import { useEffect, useState } from "react";
import { api } from "../../api/apiClient";
import { getSavedJobs } from "../../hooks/savedJobs";
import { useAuth } from "../../context/AuthContext";

function Home() {
    const bubbleMinHeight= 140;
    const { user } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [candidateStats, setCandidateStats] = useState([]);

    const [savedJobs] = useState(getSavedJobs());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        api.get("/api/jobs")
            .then(setJobs)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));

        if (user) {
            api.get(`/api/candidates/user/${user.id}`)
                .then(setCandidateStats)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [user]);

    return (
        !loading && (
        <div className="container">
            <h1>Quick Stats</h1>
            {/* error check */}
            {error && <p className="error-text">{error}</p>}
            
            <div className="bubbles-container">
                <DisplayBubble
                    borderColour="#cfe2ff"
                    bgColour="#eef5ff"
                    textColour="#2563eb"
                    icon="✈️"
                    stat={candidateStats.applications_sent}
                    title="Applications Sent"
                    height={bubbleMinHeight}/>

                <DisplayBubble
                    borderColour="#ccefd8"
                    bgColour="#edf9f1"
                    textColour="#16a34a"
                    icon="📅"
                    stat={candidateStats.interviews_scheduled}
                    title="Interviews Scheduled"
                    height={bubbleMinHeight}/>

                <DisplayBubble
                    borderColour="#f4d1d1"
                    bgColour="#fff1f1"
                    textColour="#ef4444"
                    icon="✖"
                    stat={candidateStats.not_selected}
                    title="Not Selected"
                    height={bubbleMinHeight}/>
            </div>
            
            <div className="bottom-row">
                {/* left job listings */}
                <div className="job-listings">
                    <h1>Job Listings</h1>
                    <JobTable jobs={jobs} condense={true}/>
                </div>
                {/* right saved job listings */}
                <div className="saved-listings">
                    <h1>Saved Listings</h1>
                    {savedJobs.map(job => (
                        <JobCard key={job.job_id} title={job.job_title} company={job.company_name} job_id={job.job_id}/>
                    ))}
                </div>
            </div>
            
        </div>
        )
    )
}

export default Home;