import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getStoredUser, logout } from "./authStorage";

export default function Navbar() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const user = getStoredUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <nav className="flex items-center justify-between w-full px-8 py-4 border-b border-gray-200">
        <Link to="/">
          <span className="text-black text-sm font-semibold tracking-wide">
            Calpoly Q2S
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setShowLogoutPopup(true)}
              className="cursor-pointer text-xs font-semibold border border-gray-200 text-black px-3 py-3 rounded-md transition-all duration-200 hover:bg-gray-100"
            >
              {user?.email?.split("@")[0]}{" "}
            </button>
          )}
        </div>
      </nav>

      {showLogoutPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[320px]">
            <h2 className="text-lg font-semibold text-black mb-2">
              Logout?
            </h2>

            <p className="text-sm m-2 text-gray-500">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-center gap-3 m-2">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}