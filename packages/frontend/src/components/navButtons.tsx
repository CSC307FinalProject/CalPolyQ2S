export function ContinueButton({ label, onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group relative overflow-hidden inline-flex items-center justify-center bg-black text-white border-none rounded-xl px-4 h-11 text-sm font-medium cursor-pointer not-focus-visible transition-transform active:scale-95">
      <span className="mr-8 transition-opacity duration-400 group-hover:opacity-0 whitespace-nowrap">
        {label}
      </span>

      <span className="absolute right-1 top-1 bottom-1 w-7 rounded-md bg-white/15 grid place-items-center transition-all duration-400 group-hover:w-[calc(100%-0.5rem)] z-10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </span>
    </button>
  );
}

export function BackButton({
  label = "Go Back",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden inline-flex items-center justify-center bg-black text-white border-none rounded-xl px-4 h-11 text-sm font-medium cursor-pointer transition-transform active:scale-95"
    >
      {/* icon pill on the LEFT */}
      <span className="absolute left-1 top-1 bottom-1 w-7 rounded-md bg-white/15 grid place-items-center transition-all duration-400 group-hover:w-[calc(100%-0.5rem)] z-10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </span>

      <span className="ml-8 transition-opacity duration-400 group-hover:opacity-0 whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
