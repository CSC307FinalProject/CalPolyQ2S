export default function Navbar() {
  return (
    <nav className="flex items-center justify-between w-full px-8 py-4 border-b border-gray-200">
      <span className="text-black text-sm font-semibold tracking-wide">
        Calpoly Q2S
      </span>

      <div className="flex items-center gap-3">
        <button className="text-xs font-semibold border border-gray-200 text-black px-3 py-3 rounded-md transition-all duration-200 hover:bg-white/90 hover:scale-105 active:scale-95">
          Username
        </button>
      </div>
    </nav>
  );
}
