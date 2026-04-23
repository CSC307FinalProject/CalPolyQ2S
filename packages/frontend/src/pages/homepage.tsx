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

          <div className="text-left bg-[#D7F5FF] text-[#047494] text-xs font-bold flex justify-baseline p-1.5 mt-10 rounded-xl w-fit">
            CAL POLY SLO — QUARTER TO SEMESTER
          </div>

        <div className="text-left leading-tight flex justify-baseline text-white font-bold text-5xl w-[50vw]">
          Confused on the Quarter to Semester Change?
        </div>
        <button className="btn-primary" onClick={() => console.log("clicked")}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Homepage;
