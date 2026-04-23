import { useState } from "react";
import { motion } from "framer-motion";
import { FaUserTie } from "react-icons/fa";
import "../styles/ourmentors.css";

import person1 from "../assets/images/images.png";
import person2 from "../assets/images/images.png";
import person3 from "../assets/images/images.png";
import person4 from "../assets/images/images.png";
import person5 from "../assets/images/images.png";
import person6 from "../assets/images/images.png";

/* TEAM DATA */
const teamData = {
  title: "Our Mentors",
  members: [
    {
      // img: person1,
      name: "Sauryansh Singh",
      description:
        "AIR -95 CGL 2025 | Inspector CBN | AIR -51 CHSL 2023 JSA",
      subject: "General Awareness + Math",
    },
    {
      // img: person2,
      name: "Ankur Prasad",
      description:
        "SSC CGL 2023 AIR 1460 | CGST Inspector | Quant Expert 197.5/200",
      subject: "Maths + GS",
    },
    {
      // img: person3,
      name: "Shiv Shankar Pal",
      description:
        "SSC CGL 2021 AIR 748 | ASO CSS | 2025 Income Tax Inspector",
      subject: "Maths + English",
    },
    {
      // img: person4,
      name: "Anant Jain",
      description:
        "SSC CGL 2022 PA | SSC CGL 2023 GST Inspector",
      subject: "Reasoning + Maths",
    },
    {
      // img: person5,
      name: "Vipin Sharma",
      description:
        "SSC CGL 2022 SAA in MES",
      subject: "Computer + GS",
    },
    {
      // img: person6,
      name: "Monimala Poul",
      description:
        "CHSL 2024 AIR 111 | CGL 2025 AIR 1732",
      subject: "English",
    },
  ],
};

/* CARD */
function TeamCard({ src, name, role, desc, delay }) {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = src && !imgError;

  return (
    <motion.div
      className="teamCard"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="imgWrapper">

        {/* ✅ SHOW IMAGE + SKELETON */}
        {showImage ? (
          <>
            <div className={`skeleton ${loaded ? "hide" : ""}`} />

            <img
              src={src}
              alt={name}
              onLoad={() => setLoaded(true)}
              onError={() => setImgError(true)}
              className={`img ${loaded ? "show" : ""}`}
            />
          </>
        ) : (
          /* ✅ FALLBACK ICON */
          <div className="fallbackIcon">
            <FaUserTie size={50} />
          </div>
        )}

      </div>

      <div className="cardContent">
        <h3>{name}</h3>
        <p className="role">{role}</p>
        <p className="desc">{desc}</p>
        <button>View Profile</button>
      </div>
    </motion.div>
  );
}

/* MAIN */
function OurMentors() {
  return (
    <div className="ourteamPage">
      {/* HEADER */}
      <section className="teamHeader">
        <h1>{teamData.title}</h1>
        <p>Meet the people behind your success</p>
      </section>

      {/* GRID */}
      <section className="teamSection">
        <div className="teamGrid">
          {teamData.members.map((m, i) => (
            <TeamCard
              key={i}
              src={m.img}
              name={m.name}
              role={m.subject}
              desc={m.description}
              delay={i * 0.1}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default OurMentors;
