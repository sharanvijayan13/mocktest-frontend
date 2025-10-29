import Link from "next/link";
import "./globals.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Welcome to the samanthamini App</h1>
      <nav className={styles.nav}>
        <Link className={styles.link} href="/login">Login</Link>
        <Link className={`${styles.link} ${styles.linkSecondary}`} href="/signup">Sign Up</Link>
      </nav>
    </main>
  );
}
