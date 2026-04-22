import Image from "next/image";

interface FaceitLevelProps {
  level: number;
}

export default function FaceitLevel({ level }: FaceitLevelProps) {
  const clampedLevel = Math.max(1, Math.min(10, level));

  return (
    <Image src={`/faceitfinder/faceit_levels/${clampedLevel}.svg`} width={64} height={64} alt={`Level ${clampedLevel}`} />
  );
}
