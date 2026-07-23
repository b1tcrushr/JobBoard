import DisplayBubble from "../../components/common/DisplayBubble";
import JobCard from "../../components/jobCard";
import JobTable from "../../components/jobTable";
import "../../styles/home.css"
import { useEffect, useState } from "react";
import { api } from "../../api/apiClient";
import { getSavedJobs } from "../../hooks/savedJobs";
import { useAuth } from "../../context/AuthContext";

function Home() {
    const bubbleMinHeight = 140;
    const { user } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [candidateStats, setCandidateStats] = useState(null);
    const [employerStats, setEmployerStats] = useState(null);
    const [platformStats, setPlatformStats] = useState(null);
    const [employerApps, setEmployerApps] = useState([]);

    const [savedJobs] = useState(getSavedJobs());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isEmployer = user?.role === 'employer';
    
    useEffect(() => {
        setLoading(true);

        if (isEmployer && user?.id) {
            // Employer role: Fetch employer profile, employer's jobs, and employer's applications
            api.get(`/api/employers/user/${user.id}`)
                .then(empData => {
                    if (empData && empData.employer_id) {
                        return Promise.all([
                            api.get(`/api/jobs/employer/${empData.employer_id}`).catch(() => []),
                            api.get(`/api/applications/employer/${empData.employer_id}`).catch(() => [])
                        ]);
                    }
                    return [[], []];
                })
                .then(([empJobs, empApps]) => {
                    const jobList = Array.isArray(empJobs) ? empJobs : [];
                    const appList = Array.isArray(empApps) ? empApps : [];

                    setJobs(jobList);
                    setEmployerApps(appList);

                    setEmployerStats({
                        jobsOpen: jobList.filter(j => j.job_status?.toLowerCase() === 'open').length,
                        toReview: appList.filter(a => ['applied', 'pending', 'under review'].includes(a.status?.toLowerCase())).length,
                        reviewed: appList.filter(a => ['interview', 'accepted', 'rejected'].includes(a.status?.toLowerCase())).length
                    });
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        } else if (user?.id) {
            // Candidate role: Fetch all public jobs and candidate stats
            Promise.all([
                api.get("/api/jobs").then(setJobs).catch(err => setError(err.message)),
                api.get(`/api/candidates/user/${user.id}`).then(setCandidateStats).catch(() => setCandidateStats(null))
            ]).finally(() => setLoading(false));
        } else {
            // Guest (Signed Out) role: Fetch public jobs and overall platform stats
            Promise.all([
                api.get("/api/jobs").then(setJobs).catch(err => setError(err.message)),
                api.get("/api/jobs/stats").then(setPlatformStats).catch(() => setPlatformStats(null))
            ]).finally(() => setLoading(false));
        }
    }, [user, isEmployer]);

    if (loading) {
        return (
            <div className="container">
                <p style={{ color: '#a3a3a3' }}>Loading homepage...</p>
            </div>
        );
    }

    const openJobsCount = jobs.filter(j => j.job_status?.toLowerCase() === 'open').length;
    const companiesHiringCount = new Set(
        jobs.filter(j => j.job_status?.toLowerCase() === 'open').map(j => j.company_id || j.company_name)
    ).size;

    return (
        <div className="container">
            <h1>{isEmployer ? "Employer Overview" : user ? "Quick Stats" : "Platform Overview"}</h1>
            {error && <p className="error-text">{error}</p>}
            
            <div className="bubbles-container">
                {isEmployer ? (
                    <>
                        <DisplayBubble
                            borderColour="#ccefd8"
                            bgColour="#edf9f1"
                            textColour="#16a34a"
                            icon="💼"
                            stat={employerStats?.jobsOpen ?? 0}
                            title="Jobs Open"
                            height={bubbleMinHeight}/>

                        <DisplayBubble
                            borderColour="#fef3c7"
                            bgColour="#fffbeb"
                            textColour="#d97706"
                            icon="📋"
                            stat={employerStats?.toReview ?? 0}
                            title="Applications to Review"
                            height={bubbleMinHeight}/>

                        <DisplayBubble
                            borderColour="#cfe2ff"
                            bgColour="#eef5ff"
                            textColour="#2563eb"
                            icon="✅"
                            stat={employerStats?.reviewed ?? 0}
                            title="Applications Reviewed"
                            height={bubbleMinHeight}/>
                    </>
                ) : user ? (
                    <>
                        <DisplayBubble
                            borderColour="#cfe2ff"
                            bgColour="#eef5ff"
                            textColour="#2563eb"
                            icon="✈️"
                            stat={candidateStats?.applications_sent ?? 0}
                            title="Applications Sent"
                            height={bubbleMinHeight}/>

                        <DisplayBubble
                            borderColour="#ccefd8"
                            bgColour="#edf9f1"
                            textColour="#16a34a"
                            icon="📅"
                            stat={candidateStats?.interviews_scheduled ?? 0}
                            title="Interviews Scheduled"
                            height={bubbleMinHeight}/>

                        <DisplayBubble
                            borderColour="#f4d1d1"
                            bgColour="#fff1f1"
                            textColour="#ef4444"
                            icon="✖"
                            stat={candidateStats?.not_selected ?? 0}
                            title="Not Selected"
                            height={bubbleMinHeight}/>
                    </>
                ) : (
                    <>
                        <DisplayBubble
                            borderColour="#cfe2ff"
                            bgColour="#eef5ff"
                            textColour="#2563eb"
                            icon="💼"
                            stat={platformStats?.total_jobs ?? jobs.length}
                            title="Jobs Posted"
                            height={bubbleMinHeight}/>

                        <DisplayBubble
                            borderColour="#ccefd8"
                            bgColour="#edf9f1"
                            textColour="#16a34a"
                            icon="🟢"
                            stat={platformStats?.still_hiring ?? openJobsCount}
                            title="Still Hiring"
                            height={bubbleMinHeight}/>

                        <DisplayBubble
                            borderColour="#fef3c7"
                            bgColour="#fffbeb"
                            textColour="#d97706"
                            icon="🏢"
                            stat={platformStats?.companies_hiring ?? companiesHiringCount}
                            title="Companies Hiring"
                            height={bubbleMinHeight}/>
                    </>
                )}
            </div>
            
            <div className="bottom-row" style={!user ? { gridTemplateColumns: "1fr" } : {}}>
                {/* left job listings */}
                <div className="job-listings">
                    <h1>{isEmployer ? "My Job Postings" : "Job Listings"}</h1>
                    <JobTable jobs={jobs} condense={true}/>
                </div>

                {/* right column - only shown when signed in */}
                {user && (
                    <div className="saved-listings">
                        <h1>{isEmployer ? "Recent Applicants" : "Saved Listings"}</h1>
                        {isEmployer ? (
                            employerApps.length > 0 ? (
                                employerApps.slice(0, 5).map(app => (
                                    <div key={app.app_id} className="saved-card" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div className="saved-job-info">
                                            <h4 className="saved-job-title">{app.candidate_name}</h4>
                                            <p className="saved-company">{app.job_title}</p>
                                        </div>
                                        <span className={`status-badge ${(app.status || 'applied').toLowerCase().replace(' ', '-')}`} style={{ fontSize: '0.8rem' }}>
                                            {app.status || 'Applied'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No applicant submissions recorded yet.</p>
                            )
                        ) : (
                            savedJobs.map(job => (
                                <JobCard key={job.job_id} title={job.job_title} company={job.company_name} job_id={job.job_id}/>
                            ))
                        )}
                    </div>
                )}
            </div>
            
        </div>
    );
}

export default Home;