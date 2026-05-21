import React, { useEffect } from "react";
import "@/styles/loader.css";
import logo from "@/assets/img/cut_transperent logo.png";

const Loader = ({ onFinish }) => {
  //   useEffect(() => {
  //   const timer = setTimeout(() => {
  //     onFinish?.();
  //   }, 2500); // ✅ 4 minutes = 240000 ms

  //   return () => clearTimeout(timer);
  // }, [onFinish]);

 useEffect(() => {
  const fetchData = async () => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const loadImages = async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = logo;
      img.onload = resolve;
      img.onerror = resolve;
    });
  };

  const minDelay = new Promise((resolve) =>
    setTimeout(resolve, 2000)
  );

  Promise.all([fetchData(), loadImages(), minDelay]).then(() => {
    onFinish?.();
  });
}, [onFinish]);

  return (
    <div className="fixed top-0 left-0 w-full h-screen z-[9999] font-['Segoe_UI',sans-serif]">
      <div className="h-full w-full flex flex-col justify-center items-center text-white relative overflow-hidden text-center"
        style={{ background: "linear-gradient(180deg, #020617, #0a1f44 60%, #020617)" }}>

        {/* Background Glow */}
        <div
          className="bg-overlay absolute w-[600px] h-[600px]"
          style={{
            background: "radial-gradient(circle, rgba(255, 165, 0, 0.12), transparent 70%)",
            filter: "blur(140px)",
          }}
        />

        {/* Logo */}
        <div className="logo-wrapper relative mb-4 sm:mb-6 px-4">
          <div
            className="sun-glow absolute top-1/2 left-1/2 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,0,0.45) 0%, rgba(255,170,0,0.25) 30%, rgba(255,140,0,0.15) 55%, transparent 75%)",
              transform: "translate(-50%, -50%)",
              filter: "blur(40px)",
            }}
          />
          <img
            src={logo}
            alt="SSC Pathirman"
            className="logo relative z-[2] w-[240px] sm:w-[300px] md:w-[345px]"
          />
        </div>

        {/* Title */}
        <h1 className="title text-[18px] sm:text-[28px] md:text-[34px] tracking-[0.3px] sm:tracking-[1px] mt-2 sm:mt-3 opacity-0 px-6 text-center leading-tight whitespace-nowrap">
          SSC INSTITUTE <span className="text-[#f59e0b] font-semibold">Pathirman</span>
        </h1>

        {/* Tagline */}
        <p className="tagline mt-2 sm:mt-3 text-sm sm:text-base text-[#cbd5e1] opacity-0 px-4 text-center">
          Building Your Pathway to Success
        </p>

        {/* Loader */}
        <div
          className="loader-line mt-6 sm:mt-8 md:mt-10 w-[200px] sm:w-[260px] h-[2px] relative overflow-hidden"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        >
          <span
            className="absolute w-[35%] h-full"
            style={{
              background: "linear-gradient(90deg, transparent, #f59e0b, #ffd700, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
