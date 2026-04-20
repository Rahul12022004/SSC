import React, { useEffect } from "react";
import "../styles/loader.css";
import logo from "../assets/img/cut_transperent logo.png";

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
    <div className="loadingPage">
      <div className="loader">
        {/* Background Glow */}
        <div className="bg-overlay"></div>

        {/* Logo */}
        <div className="logo-wrapper">
          <div className="sun-glow"></div>
          <img src={logo} alt="SSC Pathirman" className="logo" />
        </div>

        {/* Title */}
        <h1 className="title">
          SSC INSTITUTE <span>Pathirman</span>
        </h1>

        {/* Tagline */}
        <p className="tagline">Building Your Pathway to Success</p>

        {/* Loader */}
        <div className="loader-line">
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
