import clsx from "clsx";
import Image from "next/image";

interface FaceitLogoProps {
  height?: number;
  className?: string;
}

export default function FaceitLogo({ height = 64, className = '' }: FaceitLogoProps) {
  return (
    <div className={clsx("inline-flex items-center gap-2 leading-none select-none", className)}>
      <Image
        src="/faceit.png"
        alt="FACEIT"
        width={height}
        height={height}
      />
      <span className="font-black tracking-tight text-white">Finder</span>
    </div>
  );
}
