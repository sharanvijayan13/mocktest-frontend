"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

const BACKEND = "http://localhost:5000"; 

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
    const local = localStorage.getItem("notes");
    if (local) {
      try {
        setNotes(JSON.parse(local));
      } catch (e) {
        console.warn("Failed to parse local notes", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchNotes();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/posts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const remote = await res.json();

      const local = loadLocalNotes();
      const unsynced = local.filter((n) => isLocalId(n.id));
      const merged = [...unsynced, ...remote];
      setNotes(merged);
      saveLocalNotes(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLocalId = (id) => typeof id === "string" && id.startsWith("local-");

  const loadLocalNotes = () => {
    const raw = localStorage.getItem("notes");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  };

  const saveLocalNotes = (arr) => {
    localStorage.setItem("notes", JSON.stringify(arr));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !body) return setError("Please provide title and body");

    try {
      if (editingId) {
        setNotes((prev) => {
          const updated = prev.map((n) => (n.id === editingId ? { ...n, title, body } : n));
          saveLocalNotes(updated);
          return updated;
        });

        if (isLocalId(editingId)) {
          setTitle("");
          setBody("");
          setEditingId(null);
          return;
        }

        const res = await fetch(`${BACKEND}/api/posts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, body }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Request failed");
        }

        const data = await res.json();
        setNotes((prev) => {
          const updated = prev.map((n) => (n.id === data.id ? data : n));
          saveLocalNotes(updated);
          return updated;
        });
        setTitle("");
        setBody("");
        setEditingId(null);
      } else {
        const tempId = `local-${Date.now()}`;
        const newNote = {
          id: tempId,
          title,
          body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          unsynced: true,
        };
        setNotes((prev) => {
          const updated = [newNote, ...prev];
          saveLocalNotes(updated);
          return updated;
        });

        try {
          const res = await fetch(`${BACKEND}/api/posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title, body }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Request failed");
          }

          const data = await res.json();
          setNotes((prev) => {
            const replaced = prev.map((n) => (n.id === tempId ? data : n));
            saveLocalNotes(replaced);
            return replaced;
          });
        } catch (e) {
          console.warn("Failed to sync new note, saved locally", e);
        }

        setTitle("");
        setBody("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title || "");
    setBody(note.body || "");
    setEditingId(note.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this note?")) return;
    if (isLocalId(id)) {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        saveLocalNotes(updated);
        return updated;
      });
      return;
    }

    const prevNotes = notes;
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveLocalNotes(updated);
      return updated;
    });

    try {
      const res = await fetch(`${BACKEND}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (err) {
      setNotes(prevNotes);
      saveLocalNotes(prevNotes);
      setError(err.message);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("notes");
    setToken(null);
    setProfile(null);
    setNotes([]);
    router.push("/login");
  }, [router]);

  if (!token) {
    return (
      <div className={styles.container}>
        <h2>Please login to view your notes</h2>
        <p>
          Go to <a href="/login">Login</a>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {profile && (
        <div className={styles.header}>
          <div className={styles.profileBox}>
            <strong>{profile.name}</strong>
            <div className={styles.email}>{profile.email}</div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      )}

      <h1>Your Notes</h1>

      <form className={styles.form} onSubmit={handleCreateOrUpdate}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write your note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
        <div className={styles.formRow}>
          <button type="submit">{editingId ? "Update" : "Create"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setBody("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </form>

      <hr />

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul className={styles.list}>
          {notes.map((note) => (
            <li key={note.id} className={styles.note}>
              <div className={styles.noteHeader}>
                <strong>{note.title}</strong>
                <div className={styles.noteActions}>
                  <button onClick={() => handleEdit(note)}>Edit</button>
                  <button onClick={() => handleDelete(note.id)}>Delete</button>
                </div>
              </div>
              <p className={styles.noteBody}>{note.body}</p>
              <div className={styles.meta}>{new Date(note.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
