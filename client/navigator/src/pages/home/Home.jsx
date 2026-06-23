import DisplayBubble from "../../components/common/DisplayBubble";
import "../../styles/home.css"


function Home() {
    const bubbleMinHeight= 140;

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
        </div>
    )
}

export default Home;