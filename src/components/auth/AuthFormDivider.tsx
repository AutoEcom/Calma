export function AuthFormDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-[var(--border)]" />
      </div>
      <p className="relative mx-auto w-fit bg-[var(--surface)] px-3 text-xs tracking-wide text-[var(--text-muted)]">
        or continue with
      </p>
    </div>
  )
}
