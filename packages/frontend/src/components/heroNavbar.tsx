import { Link } from "react-router-dom"
import { getStoredUser, logout } from "./authStorage";

export default function HomepageNavbar() {
  const user = getStoredUser();

  return (
    <nav className="flex items-center justify-between w-full px-8 py-3 bg-black/5 backdrop-blur-md rounded-xl">
      <span className="text-white text-sm font-semibold tracking-wide">
        Calpoly Q2S
      </span>

      <div className="flex items-center gap-8">
        <button className="relative  cursor-pointer text-xs text-gray-300 hover:text-white transition-colors duration-200 group">
          Learn More
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
        </button>
        <button className="relative cursor-pointer text-xs text-gray-300 hover:text-white transition-colors duration-200 group">
          Contact Us
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xs text-white font-medium">
              {user?.email?.split("@")[0]}{" "}
            </span>

            <button
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="text-xs cursor-pointer font-semibold bg-white text-black px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/90"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-xs cursor-pointer text-gray-300 font-medium px-3 py-2 rounded-md border border-white/0 hover:border-white/30 hover:text-white transition-all duration-200"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="text-xs cursor-pointer font-semibold bg-white text-black px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/90 hover:scale-105 active:scale-95"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}