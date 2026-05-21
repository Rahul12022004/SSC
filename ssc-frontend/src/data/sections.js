export const sectionsData = [
  {
    id: "math",
    title: "Mathematics",
    time: 900,
    negative: 0.25,
    questions: [
      {
        question: "5 + 7 = ?",
        options: ["10", "11", "12", "13"],
        correct: 2, // 12 is correct
      },
      {
        question: "15 x 2 = ?",
        options: ["20", "25", "30", "35"],
        correct: 2, // 30 is correct
      },
    ],
  },
  {
    id: "english",
    title: "English",
    time: 900,
    negative: 0.25,
    questions: [
      {
        question: "Synonym of Happy?",
        options: ["Sad", "Joyful", "Angry", "Tired"],
        correct: 1, // Joyful is correct
      },
    ],
  },
  {
    id: "general-awareness",
    title: "General Awareness",
    time: 900,
    negative: 0.25,
    questions: [
      {
        question: "Capital of India?",
        options: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
        correct: 0, // Delhi is correct
      },
    ],
  },
  {
    id: "reasoning",
    title: "Reasoning",
    time: 900,
    negative: 0.25,
    questions: [
      {
        question: "Find the next number: 2, 4, 8, 16, ?",
        options: ["20", "24", "32", "36"],
        correct: 2, // 32 is correct
      },
    ],
  },
  {
    id: "computer",
    title: "Computer",
    time: 900,
    negative: 0.25,
    questions: [
      {
        question: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Program Utility",
          "Control Processing User",
        ],
        correct: 0, // Central Processing Unit is correct
      },
      {
        question: "Which device is used to point and click on a computer?",
        options: ["Keyboard", "Mouse", "Printer", "Scanner"],
        correct: 1, // Mouse is correct
      },
    ],
  },
];
