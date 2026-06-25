import DisplayBubble from "../../components/common/DisplayBubble";
import JobCard from "../../components/jobCard";
import JobTable from "../../components/jobTable";
import "../../styles/home.css"


function Home() {
    const bubbleMinHeight= 140;
    const jobs = [
        {
        id: 1,
        title: "Frontend Developer",
        company: "Google",
        location: "Toronto, ON",
        type: "FullTime",
        salary: "$60,000"
        },
        {
        id: 2,
        title: "Backend Developer",
        company: "Fake Company",
        location: "Mississauga, ON",
        type: "Internship",
        salary: "$60,000"
        },
        {
        id: 3,
        title: "UI/UX Designer",
        company: "Evil Company",
        location: "Remote",
        type: "PartTime",
        salary: "$60,000"
        }
    ];
    return (
        <div className="container">
            <h1>Quick Stats</h1>
            <div className="bubbles-container">
                <DisplayBubble
                    borderColour="#cfe2ff"
                    bgColour="#eef5ff"
                    textColour="#2563eb"
                    icon="✈️"
                    stat="26"
                    title="Applications Sent"
                    height={bubbleMinHeight}/>

                    <DisplayBubble
                    borderColour="#ccefd8"
                    bgColour="#edf9f1"
                    textColour="#16a34a"
                    icon="📅"
                    stat="2"
                    title="Interviews Scheduled"
                    height={bubbleMinHeight}/>

                    <DisplayBubble
                    borderColour="#f4d1d1"
                    bgColour="#fff1f1"
                    textColour="#ef4444"
                    icon="✖"
                    stat="6"
                    title="Not Selected"
                    height={bubbleMinHeight}/>
            </div>
            <div className="bottom-row">
                <div className="job-listings">
                    <h1>Job Listings</h1>
                    <JobTable jobs={jobs} condense={true}/>
                </div>
                <div className="saved-listings">
                    <h1>Saved Listings</h1>
                    <JobCard title={"Software Developer"} company={"Palantir"}/>
                    <JobCard title={"Software Developer"} company={"Lockheed Martin"}/>
                </div>
            </div>
            
        </div>
    )
}

export default Home;