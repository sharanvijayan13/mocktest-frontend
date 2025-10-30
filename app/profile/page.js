"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("notes"); // "notes" or "drafts"

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null); // "note" or "draft"
  const [showDraftButton, setShowDraftButton] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchNotes();
    fetchDrafts();
  }, [token]);

  // Show draft button when user starts typing
  useEffect(() => {
    setShowDraftButton(!!(title.trim() || body.trim()) && !editingId);
  }, [title, body, editingId]);

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
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      console.log('📥 Fetching drafts...');
      console.log('   URL:', `${BACKEND}/api/drafts/me`);
      console.log('   Token:', token ? 'Present' : 'Missing');
      
      const res = await fetch(`${BACKEND}/api/drafts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('   Response status:', res.status);
      console.log('   Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('   Error response:', errorText);
        throw new Error(`Failed to fetch drafts (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      console.log('✅ Drafts fetched:', data);
      console.log('   Number of drafts:', data.length);
      data.forEach((draft, index) => {
        console.log(`   Draft ${index + 1}: "${draft.title}" (is_draft: ${draft.is_draft})`);
      });
      setDrafts(data);
    } catch (err) {
      console.error('❌ Fetch drafts error:', err);
      setError(err.message);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !body) return setError("Please provide title and body");

    try {
      if (editingId) {
        const res = await fetch(`${BACKEND}/api/posts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            body,
            is_draft: editingType === "draft" ? false : undefined // Convert draft to note
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Request failed");
        }

        const data = await res.json();

        if (editingType === "draft") {
          // Remove from drafts and add to notes
          setDrafts(prev => prev.filter(d => d.id !== editingId));
          setNotes(prev => [data, ...prev]);
        } else {
          // Update in notes
          setNotes(prev => prev.map(n => n.id === editingId ? data : n));
        }

        clearForm();
      } else {
        const res = await fetch(`${BACKEND}/api/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, body, is_draft: false }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Request failed");
        }

        const data = await res.json();
        setNotes(prev => [data, ...prev]);
        clearForm();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveDraft = async () => {
    setError("");
    if (!title || !body) return setError("Please provide title and body");

    const requestData = { title, body, is_draft: true };
    console.log('📤 Sending draft data:', requestData);

    try {
      const res = await fetch(`${BACKEND}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('❌ Draft save failed:', err);
        throw new Error(err.message || "Request failed");
      }

      const data = await res.json();
      console.log('✅ Draft saved successfully:', data);
      console.log('   is_draft value in response:', data.is_draft);
      
      setDrafts(prev => [data, ...prev]);
      clearForm();
      setActiveTab("drafts"); // Switch to drafts tab
    } catch (err) {
      console.error('❌ Draft save error:', err);
      setError(err.message);
    }
  };

  const clearForm = () => {
    setTitle("");
    setBody("");
    setEditingId(null);
    setEditingType(null);
  };

  const handleEdit = (item, type = "note") => {
    setTitle(item.title || "");
    setBody(item.body || "");
    setEditingId(item.id);
    setEditingType(type);
    setActiveTab("notes"); // Always switch to notes tab when editing
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, type = "note") => {
    const itemType = type === "draft" ? "draft" : "note";
    if (!confirm(`Delete this ${itemType}?`)) return;

    try {
      const res = await fetch(`${BACKEND}/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      if (type === "draft") {
        setDrafts(prev => prev.filter(d => d.id !== id));
      } else {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublishDraft = async (draft) => {
    try {
      const res = await fetch(`${BACKEND}/api/posts/${draft.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: draft.title,
          body: draft.body,
          is_draft: false
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Request failed");
      }

      const data = await res.json();
      setDrafts(prev => prev.filter(d => d.id !== draft.id));
      setNotes(prev => [data, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setProfile(null);
    setNotes([]);
    setDrafts([]);
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

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "notes" ? styles.activeTab : ""}`}
          onClick={() => {
            setActiveTab("notes");
            if (!editingId) clearForm(); // Clear form only if not editing
          }}
        >
          Notes ({notes.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "drafts" ? styles.activeTab : ""}`}
          onClick={() => {
            setActiveTab("drafts");
            if (!editingId) clearForm(); // Clear form only if not editing
          }}
        >
          Drafts ({drafts.length})
        </button>
      </div>

      {activeTab === "notes" && (
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
            <button type="submit">
              {editingId ? (editingType === "draft" ? "Publish" : "Update") : "Create Note"}
            </button>

            {showDraftButton && !editingId && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className={styles.draftButton}
              >
                Save as Draft
              </button>
            )}

            {editingId && (
              <button
                type="button"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className={styles.content}>
        {activeTab === "notes" ? (
          loading ? (
            <p>Loading notes...</p>
          ) : notes.length === 0 ? (
            <p>No notes yet. Create your first note!</p>
          ) : (
            <ul className={styles.list}>
              {notes.map((note) => (
                <li key={note.id} className={styles.note}>
                  <div className={styles.noteHeader}>
                    <strong>{note.title}</strong>
                    <div className={styles.noteActions}>
                      <button onClick={() => handleEdit(note, "note")}>Edit</button>
                      <button onClick={() => handleDelete(note.id, "note")}>Delete</button>
                    </div>
                  </div>
                  <p className={styles.noteBody}>{note.body}</p>
                  <div className={styles.meta}>
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div>
            {drafts.length === 0 ? (
              <p className={styles.emptyState}>No drafts yet. Save a note as draft from the Notes tab to see it here!</p>
            ) : (
              <ul className={styles.list}>
                {drafts.map((draft) => (
                  <li key={draft.id} className={`${styles.note} ${styles.draftNote}`}>
                    <div className={styles.noteHeader}>
                      <strong>{draft.title}</strong>
                      <div className={styles.noteActions}>
                        <button
                          onClick={() => handlePublishDraft(draft)}
                          className={styles.publishButton}
                        >
                          Publish
                        </button>
                        <button onClick={() => handleEdit(draft, "draft")}>Edit</button>
                        <button onClick={() => handleDelete(draft.id, "draft")}>Delete</button>
                      </div>
                    </div>
                    <p className={styles.noteBody}>{draft.body}</p>
                    <div className={styles.meta}>
                      <span className={styles.draftLabel}>DRAFT</span>
                      {new Date(draft.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
