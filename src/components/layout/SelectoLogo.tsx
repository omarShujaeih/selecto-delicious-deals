export function SelectoLogo({ size = 96 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-[28%] bg-primary text-primary-foreground shadow-elevated"
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
