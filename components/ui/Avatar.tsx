import Image from "next/image";

interface AvatarProps {
  image?: string | null;
  username: string;
  size?: number;
}

export default function Avatar({
  image,
  username,
  size = 96,
}: AvatarProps) {
  if (image) {
    return (
      <Image
        src={image}
        alt={username}
        width={size}
        height={size}
        className="rounded-full object-cover border border-zinc-700"
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-4xl"
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}