import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Welcome to the samanthamini App</h1>
      <nav>
        <Link href="/login" style={{ marginRight: "1rem" }}>
          Login
        </Link>
        <Link href="/signup">Sign Up</Link>
      </nav>
    </main>
  );
}
