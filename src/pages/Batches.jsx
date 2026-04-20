import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiPlus } from "react-icons/fi";
import "../styles/batches.css";

function Batches() {
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [batches, setBatches] = useState(["Morning Batch"]);
  const [newBatch, setNewBatch] = useState("");

  const handleAdd = () => {
    if (!newBatch) return;
    setBatches([...batches, newBatch]);
    setNewBatch("");
    setShowForm(false);
  };

  return (
    <div className="batchesPage">
      <div className="header">
        <h1>Batches</h1>

        {user?.roleLevel === 4 && (
          <button className="addBtn" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> Add Batch
          </button>
        )}
      </div>

      {showForm && (
        <div className="formBox">
          <input
            type="text"
            placeholder="Batch Name"
            value={newBatch}
            onChange={(e) => setNewBatch(e.target.value)}
          />
          <button onClick={handleAdd}>Submit</button>
        </div>
      )}

      <div className="batchList">
        {batches.map((b, i) => (
          <div key={i} className="batchCard">{b}</div>
        ))}
      </div>
    </div>
  );
}

export default Batches;