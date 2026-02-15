export default function BarLoader({ size = "md" }: { size?: "sm" | "md" }) {
  const isSm = size === "sm";
  return (
    <div className={`flex items-end gap-1 ${isSm ? "h-12" : "h-24"}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400 origin-bottom animate-[bar-bounce_0.8s_ease-in-out_infinite] ${
            isSm ? "w-1.5" : "w-3"
          }`}
          style={{
            height: `${40 + i * 12}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
