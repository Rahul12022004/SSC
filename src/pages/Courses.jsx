import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/courses.css";

/* COURSE CARD */
function CourseCard({ title, desc }) {
  return (
    <div className="courseCard" data-aos="fade-up">
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
    },
    {
      title: "SSC CHSL",
      desc: "For LDC, DEO, and Postal Assistant posts (12th pass).",
    },
    {
      title: "SSC MTS",
      desc: "For non-technical staff like peon, watchman (10th pass).",
    },
    {
      title: "SSC GD",
      desc: "For BSF, CISF, and CRPF constable posts.",
    },
    {
      title: "SSC Stenographer",
      desc: "For Grade C & D stenography positions.",
    },
    {
      title: "SSC JE",
      desc: "For civil, electrical, or mechanical engineers.",
    },
    {
      title: "SSC CPO",
      desc: "For Sub-Inspectors in Delhi Police & CAPFs.",
    },
    {
      title: "SSC Selection Posts",
      desc: "Specialized technical and non-technical roles.",
    },
  ]);

  const [newCourse, setNewCourse] = useState({
    title: "",
    desc: "",
  });

  /* INIT AOS */
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: "ease-in-out",
    });
  }, []);

  /* ADD COURSE */
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
          // <CourseCard key={i} title={c.title} desc={c.desc} />
          <CourseCard key={i} title={c.title}/>
        ))}
      </div>
    </div>
  );
}

export default Courses;