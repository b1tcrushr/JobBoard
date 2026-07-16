
export function getSavedJobs() {
    const stored = localStorage.getItem("savedJobs");
    return stored ? JSON.parse(stored) : [];
}

export function isJobSaved(jobId) {
    return getSavedJobs().some(job => job.job_id === jobId);
}

export function saveJob(job) {
    const saved = getSavedJobs();
    if (!saved.some(j => j.job_id === job.job_id)) {
        saved.push(job);
        localStorage.setItem("savedJobs", JSON.stringify(saved));
    }
}

export function removeSavedJob(jobId) {
    const saved = getSavedJobs().filter(job => job.job_id !== jobId);
    localStorage.setItem("savedJobs", JSON.stringify(saved));
}
