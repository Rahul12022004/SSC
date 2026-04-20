import { Link } from "react-router-dom";
import "../styles/notfound.css";

function NotFound() {
  return (
    <div className="notFoundPage">
      <div className="notFoundContainer">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>

        <Link to="/" className="homeBtn">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;