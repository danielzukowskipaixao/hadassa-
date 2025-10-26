import dynamic from "next/dynamic";

const PasswordGate = dynamic(() => import("@/components/PasswordGate"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen p-6 flex items-center justify-center">
      <PasswordGate />
    </main>
  );
}
