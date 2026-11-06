/** Kiln & Co. mark: a kiln arch with a flame inside, and the wordmark. */
export function KilnMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="10" fill="#B4532A" />
      <path d="M10 31V19a10 10 0 0 1 20 0v12" fill="none" stroke="#FBF3EA" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 31h24" stroke="#FBF3EA" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 28c-3 0-4.5-2-4.5-4.2 0-2.6 2.3-3.8 3-6.3 1.6 1.2 2.2 2.6 2.1 3.8.9-.5 1.4-1.3 1.6-2.3 1.4 1.3 2.3 2.8 2.3 4.8 0 2.4-1.7 4.2-4.5 4.2Z" fill="#F4C27A" />
    </svg>
  );
}

export function KilnLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <KilnMark />
      <span className="font-display text-[22px] font-semibold tracking-tight text-ink">
        Kiln <span className="text-clay">&amp;</span> Co.
      </span>
    </span>
  );
}
