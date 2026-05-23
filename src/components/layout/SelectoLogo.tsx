export function SelectoLogo({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`grid place-items-center rounded-[28%] bg-primary text-primary-foreground shadow-elevated ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="font-display font-extrabold leading-none"
        style={{ fontSize: size * 0.55 }}
      >
        S
      </span>
    </div>
  );
}
