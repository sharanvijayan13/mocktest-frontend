"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
    } else {
      setMessage(data.message);
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    }
  };

  return (
    <div className={styles.container}>

      <form className={styles.form} onSubmit={handleSubmit}>
              <h1 className={styles.title}>Sign Up</h1>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Full Name</label>
          <input
            className={styles.input}
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            className={styles.input}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            className={styles.input}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.primary} type="submit">Sign Up</button>
        </div>
      </form>

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}
