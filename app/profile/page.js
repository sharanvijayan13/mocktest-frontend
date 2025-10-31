"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import MobileNavigation from "../../components/MobileNavigation";
import Labels from "../../components/Labels";
import LabelSelector from "../../components/LabelSelector";
import {
  Lock,
  LogIn,
  UserPlus,
  FileText,
  FileEdit,
  Edit3,
  Trash2,
  Send,
  Save,
  X
} from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("notes");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
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
      console.log('📥 Fetched notes raw data:', data);

      // Handle both old array format and new paginated format
      const notesData = Array.isArray(data) ? data : (data.data || []);
      console.log('📝 Processed notes data:', notesData);
      const filteredNotes = notesData.filter(post => !post.is_draft);
      console.log('📝 Filtered notes (published only):', filteredNotes);
      setNotes(filteredNotes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/posts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch drafts");

      const data = await res.json();
      const draftsData = Array.isArray(data) ? data : (data.data || []);
      setDrafts(draftsData.filter(post => post.is_draft));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !body) return setError("Please provide title and body");

    // Debug logging
    console.log('🔍 Creating/updating note with labels:', selectedLabels);

    try {
      if (editingId) {
        const requestData = {
          title,
          body,
          labels: selectedLabels,
          is_draft: editingType === "draft" ? false : undefined
        };
        console.log('📤 Update request data:', requestData);

        const res = await fetch(`${BACKEND}/api/posts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Request failed");
        }

        const data = await res.json();

        if (editingType === "draft") {
          setDrafts(prev => prev.filter(d => d.id !== editingId));
          setNotes(prev => [data, ...prev]);
        } else {
          setNotes(prev => prev.map(n => n.id === editingId ? data : n));
        }

        clearForm();
      } else {
        const postData = {
          title,
          body,
          is_draft: false,
          labels: selectedLabels
        };
        console.log('📤 Create request data:', postData);

        const res = await fetch(`${BACKEND}/api/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Request failed");
        }

        const data = await res.json();
        console.log('✅ Note created with response:', data);
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

    const requestData = {
      title,
      body,
      is_draft: true,
      labels: selectedLabels
    };
    console.log('📤 Draft request data:', requestData);

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
        throw new Error(err.message || "Request failed");
      }

      const data = await res.json();
      console.log('✅ Draft created with response:', data);
      setDrafts(prev => [data, ...prev]);
      clearForm();
      setActiveTab("drafts");
    } catch (err) {
      setError(err.message);
    }
  };

  const clearForm = () => {
    setTitle("");
    setBody("");
    setSelectedLabels([]);
    setEditingId(null);
    setEditingType(null);
  };

  const handleEdit = (item, type = "note") => {
    setTitle(item.title || "");
    setBody(item.body || "");
    setSelectedLabels(item.labels || []);
    setEditingId(item.id);
    setEditingType(type);
    setActiveTab("notes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, type = "note") => {
    const itemType = type === "draft" ? "draft" : "note";
    if (!confirm(`Delete this ${itemType}?`)) return;

    try {
      const res = await fetch(`${BACKEND}/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete ${itemType}`);
      }

      if (type === "draft") {
        setDrafts(prev => prev.filter(d => d.id !== id));
      } else {
        setNotes(prev => prev.filter(n => n.id !== id));
      }

    } catch (err) {
      setError(`Failed to delete ${itemType}: ${err.message}`);
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
          labels: draft.labels || [],
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
    router.push("/"); // Redirect to home page instead of login
  }, [router]);

  if (!token) {
    return (
      <div className="auth-required">
        <div className="auth-card">
          <div className="auth-icon">
            <Lock size={48} />
          </div>
          <h2>Authentication Required</h2>
          <p>Please login to access your notes and drafts.</p>
          <div className="auth-actions">
            <a href="/login" className="btn btn-primary">
              <LogIn size={16} />
              Login
            </a>
            <a href="/signup" className="btn btn-secondary">
              <UserPlus size={16} />
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (!editingId) clearForm();
        }}
        notesCount={notes.length}
        draftsCount={drafts.length}
        profile={profile}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === "labels" ? (
          <Labels />
        ) : (
          <div className="notes-container">
            {activeTab === "notes" && (
              <form className="note-form" onSubmit={handleCreateOrUpdate}>
                <div className="form-header">
                  <h2>{editingId ? (editingType === "draft" ? "Edit Draft" : "Edit Note") : "Create New Note"}</h2>
                </div>

                <div className="form-group">
                  <input
                    className="form-input"
                    placeholder="Enter note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Write your note content..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="form-group">
                  <LabelSelector
                    selectedLabels={selectedLabels}
                    onLabelsChange={setSelectedLabels}
                  />
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? (editingType === "draft" ? "Publish Draft" : "Update Note") : "Create Note"}
                  </button>

                  {showDraftButton && !editingId && (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="btn btn-secondary"
                    >
                      <Save size={16} />
                      Save as Draft
                    </button>
                  )}

                  {editingId && (
                    <button
                      type="button"
                      onClick={clearForm}
                      className="btn btn-secondary"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="content-section">
              {activeTab === "notes" ? (
                loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading notes...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} className="empty-icon" />
                    <h3>No notes yet</h3>
                    <p>Create your first note.</p>
                  </div>
                ) : (
                  <div className="notes-grid">
                    {notes.map((note) => (
                      <article key={note.id} className="note-card">
                        <div className="note-header">
                          <h3 className="note-title">{note.title}</h3>
                          <div className="note-actions">
                            <button
                              onClick={() => handleEdit(note, "note")}
                              className="action-btn edit-btn"
                              title="Edit note"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id, "note")}
                              className="action-btn delete-btn"
                              title="Delete note"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="note-body">
                          {note.body}
                        </div>

                        {/* Debug: Check note labels */}
                        {console.log('🔍 Note object:', note.title, 'Labels:', note.labels, 'Type:', typeof note.labels)}
                        {note.labels && note.labels.length > 0 && (
                          <div className="note-labels">
                            {note.labels.map((label) => (
                              <span
                                key={label.id}
                                className="note-label"
                                style={{ backgroundColor: label.color }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="note-meta">
                          <span className="note-date">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )
              ) : activeTab === "drafts" ? (
                drafts.length === 0 ? (
                  <div className="empty-state">
                    <FileEdit size={48} className="empty-icon" />
                    <h3>No drafts yet</h3>
                    <p>Save a note as draft from the Notes tab to see it here!</p>
                  </div>
                ) : (
                  <div className="notes-grid">
                    {drafts.map((draft) => (
                      <article key={draft.id} className="note-card draft-card">
                        <div className="note-header">
                          <h3 className="note-title">{draft.title}</h3>
                          <div className="note-actions">
                            <button
                              onClick={() => handlePublishDraft(draft)}
                              className="action-btn publish-btn"
                              title="Publish draft"
                            >
                              <Send size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(draft, "draft")}
                              className="action-btn edit-btn"
                              title="Edit draft"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(draft.id, "draft")}
                              className="action-btn delete-btn"
                              title="Delete draft"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="note-body">
                          {draft.body}
                        </div>

                        {draft.labels && draft.labels.length > 0 && (
                          <div className="note-labels">
                            {draft.labels.map((label) => (
                              <span
                                key={label.id}
                                className="note-label"
                                style={{ backgroundColor: label.color }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="note-meta">
                          <span className="draft-badge">DRAFT</span>
                          <span className="note-date">
                            {new Date(draft.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )
              ) : null}
            </div>
          </div>
        )}
      </main>

      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (!editingId) clearForm();
        }}
        notesCount={notes.length}
        draftsCount={drafts.length}
      />

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .auth-required {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg-primary);
        }

        .auth-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        .auth-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .auth-card h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .auth-card p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .auth-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .notes-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .note-form {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
        }

        .form-header h2 {
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .content-section {
          flex: 1;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid var(--border-primary);
          border-top: 2px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .note-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .note-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .draft-card {
          border-left: 4px solid var(--warning);
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .note-title {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0;
          flex: 1;
        }

        .note-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-btn {
          padding: 0.375rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .action-btn:hover {
          color: var(--text-primary);
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .publish-btn:hover {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .note-body {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .draft-badge {
          background: var(--warning);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.625rem;
          text-transform: uppercase;
        }

        .note-date {
          font-size: 0.75rem;
        }

        .note-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-bottom: 1rem;
        }

        .note-label {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
            padding-bottom: 6rem; /* Space for mobile navigation */
          }

          .note-form {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .notes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .note-card {
            padding: 1rem;
          }

          .note-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .note-actions {
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 0.75rem;
            padding-bottom: 6rem;
          }

          .note-form {
            padding: 1rem;
          }

          .form-header h2 {
            font-size: 1.125rem;
          }

          .notes-grid {
            gap: 0.75rem;
          }

          .note-card {
            padding: 0.75rem;
          }

          .note-title {
            font-size: 0.875rem;
          }

          .note-body {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
}