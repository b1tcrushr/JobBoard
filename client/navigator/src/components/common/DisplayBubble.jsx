import "../../styles/components.css"


function DisplayBubble(props) {
  return (
    <div className="displayBubble" style={{ borderColor: props.borderColour, backgroundColor: props.bgColour, color: props.textColour, width: props.width, height: props.height }}>      
        <h2>{props.title}</h2>
        <p>{props.content}</p>
    </div>
  );
}

export default DisplayBubble;