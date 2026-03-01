export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        role="img"
        aria-label="FilterCN Logo"
      >
        <title>FilterCN Logo</title>
        <path
          d="M10 20 L90 20 L60 55 L60 85 L40 75 L40 55 Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          className="text-zinc-900 dark:text-zinc-50"
        />
        <path
          d="M18 28 L82 28 L57 58 L57 80 L43 73 L43 58 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-indigo-500"
        />
        <circle cx="50" cy="50" r="4" className="fill-indigo-500" />
        <circle cx="40" cy="40" r="3" className="fill-indigo-400" />
        <circle cx="60" cy="40" r="3" className="fill-indigo-400" />
        <circle cx="50" cy="30" r="2" className="fill-indigo-300" />
      </svg>
      <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">FilterCN</span>
    </div>
  );
}
