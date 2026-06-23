import "../../styles/components.css"

function DisplayBubble({
  borderColour,
  bgColour,
  textColour,
  width = "100%",
  height,
  icon,
  stat,
  title,
  subtitle
}) {
  return (
    <div
      className="displayBubble"
      style={{
        borderColor: borderColour,
        backgroundColor: bgColour,
        color: textColour,
        width,
        height
      }}
    >
      <div className="bubbleIcon">{icon}</div>

      <div className="bubbleText">
        <h2>{stat}</h2>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

export default DisplayBubble;