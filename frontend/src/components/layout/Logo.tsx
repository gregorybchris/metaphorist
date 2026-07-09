export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="9" cy="16" r="6" fill="#b1512e" />
      <circle cx="23" cy="16" r="6" fill="#3b4a83" />
      <path d="M14.5 16H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M17 13.2 19.8 16 17 18.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
