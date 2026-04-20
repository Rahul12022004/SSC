import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import { FaBookOpen, FaUserTie, FaTools } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/courses.css";

import img1 from "../assets/images/cgl.png";
import img2 from "../assets/images/HCL.png";
import img3 from "../assets/images/MTS.png";
import img4 from "../assets/images/GD.png";
import img5 from "../assets/images/Stenographer.png";
import img6 from "../assets/images/JE.png";
import img7 from "../assets/images/CPO.png";
import img8 from "../assets/images/Selction Post.png";

/* COURSE CARD */

const getCourseIcon = (title) => {
  if (title.includes("CGL") || title.includes("CHSL"))
    return <FaUserTie size={40} />;
  if (title.includes("JE")) return <FaTools size={40} />;
  return <FaBookOpen size={40} />;
};

function CourseCard({ title, desc, image }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="courseCard" data-aos="fade-up">
      <div className="courseImage">
        {/* SKELETON */}
        <div className={`skeleton ${loaded ? "hide" : ""}`}></div>

        {/* IMAGE */}
        {image ? (
          <>
            <div className={`skeleton ${loaded ? "hide" : ""}`}></div>
            <img
              src={image}
              alt={title}
              onLoad={() => setLoaded(true)}
              className={`img ${loaded ? "show" : ""}`}
            />
          </>
        ) : (
          <div className="fallbackIcon">{getCourseIcon(title)}</div>
        )}
      </div>

      <div className="courseContent">
        <h3>{title}</h3>
        <p>{desc}</p>
        <button>Start</button>
      </div>
    </div>
  );
}

function Courses() {
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);

  const [courses, setCourses] = useState([
    {
      title: "SSC CGL",
      desc: "For Inspector, Auditor, and Assistant posts (Graduation required).",
      image: img1,
    },
    {
      title: "SSC CHSL",
      desc: "For LDC, DEO, and Postal Assistant posts (12th pass).",
      image: img2,
    },
    {
      title: "SSC MTS",
      desc: "For non-technical staff like peon, watchman (10th pass).",
      image: img3,
    },
    {
      title: "SSC GD",
      desc: "For BSF, CISF, and CRPF constable posts.",
      image: img4,
    },
    {
      title: "SSC Stenographer",
      desc: "For Grade C & D stenography positions.",
      image: img5,
    },
    {
      title: "SSC JE",
      desc: "For civil, electrical, or mechanical engineers.",
      image: img6,
    },
    {
      title: "SSC CPO",
      desc: "For Sub-Inspectors in Delhi Police & CAPFs.",
      image: img7,
    },
    {
      title: "SSC Selection Posts",
      desc: "Specialized technical and non-technical roles.",
      image: img8,
    },
  ]);

  const [newCourse, setNewCourse] = useState({
    title: "",
    desc: "",
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: "ease-in-out",
    });
  }, []);

  const handleAdd = () => {
    if (!newCourse.title || !newCourse.desc) return;

    setCourses([...courses, newCourse]);
    setNewCourse({ title: "", desc: "" });
    setShowForm(false);
  };

  return (
    <div className="coursesPage">
      <div className="header">
        <h1>Our Courses</h1>

        {user?.roleLevel === 4 && (
          <button className="addBtn" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> Add Course
          </button>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="formBox">
          <input
            type="text"
            placeholder="Course Title"
            value={newCourse.title}
            onChange={(e) =>
              setNewCourse({ ...newCourse, title: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Course Description"
            value={newCourse.desc}
            onChange={(e) =>
              setNewCourse({ ...newCourse, desc: e.target.value })
            }
          />

          <button onClick={handleAdd}>Submit</button>
        </div>
      )}

      {/* GRID */}
      <div className="courseGrid">
        {courses.map((c, i) => (
          <CourseCard
            key={i}
            title={c.title}
            desc={c.desc}
            image={c.image} // ✅ THIS WAS MISSING
          />
        ))}
      </div>
    </div>
  );
}

export default Courses;
