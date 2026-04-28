import Image from "next/image";

type Variant = "gradient" | "white" | "black";

const SRC: Record<Variant, string> = {
  gradient: "/logo-gradient.png",
  white: "/logo-white.png",
  black: "/logo-black.png",
};

export default function MerklyLogo({
  variant = "gradient",
  size = 32,
  className,
}: {
  variant?: Variant;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={SRC[variant]}
      alt="Merkly logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
