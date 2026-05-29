import { useEffect, useRef, useState } from "react";
import Navbar from "../components/heroNavbar";
import { Link } from "react-router-dom";
import { getStoredUser } from "../components/authStorage";

function Homepage() {
  const user = getStoredUser();
  const learnMoreRef = useRef<HTMLDivElement>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const [isLearnMoreHighlighted, setIsLearnMoreHighlighted] = useState(false);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }

      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    if (fadeTimeoutRef.current !== null) {
      window.clearTimeout(fadeTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setIsLearnMoreHighlighted(true);

      fadeTimeoutRef.current = window.setTimeout(() => {
        setIsLearnMoreHighlighted(false);
      }, 500);
    }, 350);
  };

  return (
    <div
      id="root"
      className="relative w-full min-h-screen overflow-x-hidden bg-black"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 w-full h-screen object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 z-0 bg-black/30" />
      <div className="relative z-10 px-6 sm:px-10 pb-8 md:pb-10">
        <div className="pt-5">
          <Navbar onLearnMore={scrollToLearnMore} />
        </div>
        <div className="text-left bg-[#D7F5FF] text-[#047494] text-xs font-bold flex justify-baseline p-1.5 mt-16 mb-2 rounded-xl w-fit">
          CAL POLY SLO — QUARTER TO SEMESTER
        </div>
        <div className="text-left leading-tight flex justify-baseline text-white font-bold text-3xl sm:text-5xl md:text-6xl w-full md:w-[65vw] lg:w-[50vw]">
          Confused on the Quarter to Semester Change?
        </div>
        <div className="text-left text-white text-base sm:text-xl px-3 py-8 bg-black/5 backdrop-blur-sm rounded-xl w-full md:w-[70vw] lg:w-[55vw] mt-5">
          Starting 2026, Cal Poly SLO is switching from the quarter system to
          the semester system. Compare timelines, reduce your course load, and
          see how classes connect—all in one place to choose the catalog that is
          best.
        </div>
        <Link to={user ? "/class-selector" : "/register"}>
          <button className="text-left text-black bg-white px-6 py-4 rounded-2xl text-lg font-semibold leading-tight flex items-center justify-start mt-5 transition-all duration-150 ease-out hover:scale-105 hover:bg-gray-50 active:scale-95 active:bg-gray-100 cursor-pointer select-none">
            Get Started
          </button>
        </Link>
        <div
          ref={learnMoreRef}
          className={`text-left text-white text-base sm:text-xl px-3 py-8 bg-black/5 backdrop-blur-sm rounded-xl w-full md:w-[70vw] lg:w-[55vw] mt-5 border transition-all duration-500 ${
            isLearnMoreHighlighted
              ? "border-[#D7F5FF] shadow-[0_0_28px_rgba(215,245,255,0.55)]"
              : "border-white/10 shadow-none"
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold mb-3 text-[#D7F5FF]">
            This Is What We Do
          </div>
          <p>
            We are a group of Cal Poly SLO Computer Science students who want to
            make the quarter to semester transition switch as easy as possible
            for our fellow students. This is the final project for CSC 307. This
            application is originally designed for Computer Science, but is
            designed in such a way that allows for scalability among all majors
            at Cal Poly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
