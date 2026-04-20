import "../styles/feedback.css";

function Feedback() {
  return (
    <div className="feedbackPage">
      <h1>Feedback</h1>

      <form>
        <textarea placeholder="Your feedback"></textarea>
        <button>Submit</button>
      </form>
    </div>
  );
}

export default Feedback;