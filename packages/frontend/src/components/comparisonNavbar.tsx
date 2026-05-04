export default function Navbar() {
  return (
    <nav className="flex items-center justify-between w-full px-8 py-3 bg-black/5 backdrop-black rounded-xl">
      <span className="text-black text-sm font-semibold tracking-wide">
        Calpoly Q2S
      </span>

      <div className="flex items-center gap-3">
        <button className="text-xs text-gray-600 font-medium px-3 py-2 rounded-md border border-white/0">
          Logged in as
        </button>
        <button className="text-xs font-semibold bg-white text-black px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/90 hover:scale-105 active:scale-95">
          Gold Digger
        </button>
      </div>
    </nav>
  );
}
