import "./homepage.css";
import Navbar from "../components/navbar";

function Homepage() {
  return (
    <div className="relative w-full h-screen">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 pl-10 pr-5">
        <div className="pt-5">
          <Navbar />
        </div>

        <div className="text-left bg-[#D7F5FF] text-[#047494] text-xs font-bold flex justify-baseline p-1.5 mt-16 mb-2 rounded-xl w-fit">
          CAL POLY SLO — QUARTER TO SEMESTER
        </div>

        <div className="text-left leading-tight flex justify-baseline text-white font-bold text-6xl w-[50vw]">
          Confused on the Quarter to Semester Change?
        </div>
        <div className="text-left text-white text-xl px-3 py-8 bg-black/5 backdrop-blur-md rounded-xl w-[55vw] mt-5">
          Starting 2026, Cal Poly SLO is switching from the quarter system to
          the semester system. Compare timelines, reduce your course load, and
          see how classes connect—all in one place to choose the catalog that is
          best.
        </div>
        <button
          className="
    text-left text-black bg-white
    px-6 py-4 rounded-2xl
    text-lg font-semibold leading-tight
    flex items-center justify-start mt-5
    transition-all duration-150 ease-out
    hover:scale-105 hover:bg-gray-50
    active:scale-95 active:bg-gray-100
    cursor-pointer select-none
  "
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Homepage;
