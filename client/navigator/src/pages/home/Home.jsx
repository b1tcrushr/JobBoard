import DisplayBubble from "../../components/common/DisplayBubble";
import "../../styles/home.css"


function Home() {
    const bubbleMinWidth = 200;
    const bubbleMinHeight= 200;

    return (
        <div>
            <h1>Home page</h1>
            <div className="bubbles-container">
                <DisplayBubble borderColour='#33fc54' bgColour='#6af48f' textColour='white' title='Interviews scheduled' content='content' width={bubbleMinWidth} height={bubbleMinHeight}/>
                <DisplayBubble borderColour='#e24343' bgColour='#dc7d7d' textColour='white' title='Not Selected' content='content' width={bubbleMinWidth} height={bubbleMinHeight}/>

            </div>
        </div>
    )
}

export default Home;