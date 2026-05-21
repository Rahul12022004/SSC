import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FiChevronDown, FiEdit, FiTrash2 } from "react-icons/fi";

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

  const toggle = (index) =>
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

  return (
    <div className="bg-slate-100 min-h-screen py-20 sm:py-[90px]">
      <div className="w-[92%] max-w-[1200px] mx-auto text-left">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b2545]">Batches</h1>
        </div>

        {data.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl mb-5 sm:mb-8 p-3 sm:p-4 border border-gray-200 shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
          >
            {/* SUBJECT CARD */}
            <div
              className="rounded-xl p-4 sm:p-5 flex flex-row justify-between items-center gap-3 cursor-pointer select-none"
              style={{ background: "linear-gradient(to right, #eef4ff, #e8f7ef)" }}
              onClick={() => toggle(index)}
            >
              {/* LEFT */}
              <div className="flex-1 min-w-0 text-left">
                <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#0b2545] mb-1">
                  {item.subject}
                </h2>
                <div className="flex flex-wrap gap-2 my-1.5 justify-start">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e0ecff] text-[#2563eb]">
                    {item.totalBatches} batches
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#d1fae5] text-[#059669]">
                    {item.totalStudents} students
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 text-left">Click to open and view all batches.</p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* info boxes: hidden on mobile, visible sm+ */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="bg-white px-3.5 py-2.5 rounded-xl text-center border border-gray-200 min-w-[80px]">
                    <span className="text-[11px] text-gray-500 block">BATCHES</span>
                    <strong className="block text-sm mt-0.5">All</strong>
                  </div>
                  <div className="bg-white px-3.5 py-2.5 rounded-xl text-center border border-gray-200 min-w-[80px]">
                    <span className="text-[11px] text-gray-500 block">ACTIVE</span>
                    <strong className="block text-sm mt-0.5">None</strong>
                  </div>
                </div>
                <FiChevronDown
                  size={20}
                  className={`shrink-0 text-slate-500 transition-transform duration-300 ${
                    openIndexes.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* BATCH LIST */}
            {openIndexes.includes(index) && (
              <div className="mt-4 px-1 sm:px-2.5">
                {item.batches.map((b, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-2xl p-4 sm:p-[18px] mb-4 sm:mb-5 border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                  >
                    {/* BATCH HEADER */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 text-left">
                        <h3 className="text-[#0b2545] text-base sm:text-lg font-semibold leading-snug">
                          {b.name}
                        </h3>
                        <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                          Click to view teacher, students, and actions
                        </p>
                      </div>

                      {user?.roleLevel === 4 && (
                        <div className="flex gap-1 sm:gap-1.5 text-slate-500 shrink-0">
                          <button
                            className="p-2 rounded-lg hover:bg-gray-200 hover:text-[#f77f00] transition-colors"
                            aria-label="Edit batch"
                          >
                            <FiEdit size={15} />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-gray-200 hover:text-[#f77f00] transition-colors"
                            aria-label="Delete batch"
                          >
                            <FiTrash2 size={15} />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-gray-200 hover:text-[#f77f00] transition-colors"
                            aria-label="Expand batch"
                          >
                            <FiChevronDown size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DETAIL GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200">
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                          Teacher
                        </span>
                        <strong className="block mt-1 text-[#0b2545] text-sm sm:text-[15px] truncate">
                          Not assigned
                        </strong>
                      </div>
                      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200">
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                          Students
                        </span>
                        <strong className="block mt-1 text-[#0b2545] text-sm sm:text-[15px]">
                          {b.students}
                        </strong>
                      </div>
                      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200">
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                          Batch
                        </span>
                        <strong className="block mt-1 text-[#0b2545] text-sm sm:text-[15px] truncate">
                          {b.name}
                        </strong>
                      </div>
                      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200">
                        <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                          Stream
                        </span>
                        <strong className="block mt-1 text-[#0b2545] text-sm sm:text-[15px]">-</strong>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end mt-4">
                      <button
                        className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium cursor-not-allowed bg-gray-200 text-gray-400 border-none"
                        disabled
                      >
                        Enroll (Coming Soon...)
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
