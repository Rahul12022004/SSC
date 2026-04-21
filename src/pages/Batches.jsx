import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiChevronDown, FiEdit, FiTrash2 } from "react-icons/fi";
import "../styles/batches.css";

const data = [
  {
    subject: "English",
    totalBatches: 3,
    totalStudents: 30,
    batches: [
      { name: "Morning Batch", students: 10 },
      { name: "Afternoon Batch", students: 12 },
      { name: "Evening Batch", students: 8 },
    ],
  },
  {
    subject: "Math",
    totalBatches: 3,
    totalStudents: 25,
    batches: [
      { name: "Morning Batch", students: 9 },
      { name: "Afternoon Batch", students: 10 },
      { name: "Evening Batch", students: 6 },
    ],
  },
];

function Batches() {
  const { user } = useAuth();
  const [openIndexes, setOpenIndexes] = useState([]);

  return (
    <div className="batchesPage">
      {/* WRAPPER (like coursesPage) */}
      <div className="batchesContainer">
        <div className="header">
          <h1>Batches</h1>
        </div>

        {data.map((item, index) => (
          <div key={index} className="subjectWrapper">
            {/* SUBJECT CARD */}
            <div
              className="subjectTop"
              onClick={() => {
                if (openIndexes.includes(index)) {
                  setOpenIndexes(openIndexes.filter((i) => i !== index)); // close
                } else {
                  setOpenIndexes([...openIndexes, index]); // open
                }
              }}
            >
              <div>
                <h2>{item.subject}</h2>

                <div className="badges">
                  <span className="blue">{item.totalBatches} batches</span>
                  <span className="green">{item.totalStudents} students</span>
                </div>

                <p>Click to open and view all batches.</p>
              </div>

              <div className="rightInfo">
                <div className="infoBox">
                  <span>BATCHES</span>
                  <strong>All</strong>
                </div>

                <div className="infoBox">
                  <span>ACTIVE</span>
                  <strong>None</strong>
                </div>

                <FiChevronDown
                  className={openIndexes.includes(index) ? "rotate" : ""}
                />
              </div>
            </div>

            {/* BATCH LIST */}
            {openIndexes.includes(index) && (
              <div className="batchList">
                {item.batches.map((b, i) => (
                  <div className="batchItem">
                    <div className="batchHeader">
                      <div>
                        <h3>{b.name}</h3>
                        <p>Click to view teacher, students, and actions</p>
                      </div>

                      {user?.roleLevel === 4 && (
                        <div className="actions">
                          <FiEdit />
                          <FiTrash2 />
                          <FiChevronDown />
                        </div>
                      )}
                    </div>

                    <div className="batchDetails">
                      <div className="detailBox">
                        <span>TEACHER</span>
                        <strong>Not assigned</strong>
                      </div>

                      <div className="detailBox">
                        <span>STUDENTS</span>
                        <strong>{b.students}</strong>
                      </div>

                      <div className="detailBox">
                        <span>BATCH</span>
                        <strong>{b.name}</strong>
                      </div>

                      <div className="detailBox">
                        <span>STREAM</span>
                        <strong>-</strong>
                      </div>
                    </div>

                    {/* ✅ NEW FOOTER */}
                    <div className="batchFooter">
                      <button className="enrollBtn" disabled>
                        Enroll ( Coming Soon...)
                      </button>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Batches;
