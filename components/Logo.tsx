import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({
  width = 68,
  height = 68,
  className = "",
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="Headstring Web"
        width={width}
        height={height}
        className="flex-shrink-0 object-contain"
        style={{ background: "transparent" }}
        priority
        unoptimized
      />
      {showText && (
        <span className="hidden sm:block text-xl font-bold text-primary">
          Headstring Web
        </span>
      )}
    </div>
  );
}
