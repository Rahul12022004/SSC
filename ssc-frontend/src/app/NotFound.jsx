import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center px-5">
      <div className="text-center p-5">
        <h1 className="text-[44px] sm:text-[56px] md:text-[80px] font-bold text-[#F77F00] leading-none">
          404
        </h1>
        <h2 className="my-2.5 text-xl font-semibold text-[#0B2545]">
          Page Not Found
        </h2>
        <p className="mb-5 text-gray-500">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#F77F00] hover:bg-[#d96c00] text-white px-5 py-2.5 rounded-md font-medium transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
