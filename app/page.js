"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import LogoutButton from "../components/LogoutButton";
import { 
  BookOpen, 
  Sun, 
  Moon, 
  FileText, 
  FileEdit, 
  Tag, 
  Zap, 
  Save, 
  Palette, 
  ArrowRight,
  Lock
} from 'lucide-react';
import "./globals.css";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Fetch public notes
    fetchPublicNotes();
  }, []);

  const fetchPublicNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        setPublicNotes(data.slice(0, 6)); // Show only first 6 notes
      }
    } catch (err) {
      console.error('Failed to fetch public notes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="brand">
            <BookOpen size={24} />
            <h1>SNotes</h1>
          </div>
          <div className="header-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            {isLoggedIn && (
              <LogoutButton variant="simple" />
            )}
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">
              SNotes: Where Ideas Come to Life
            </h2>
            <p className="hero-description">
              A modern note-taking platform that combines personal productivity with community sharing. 
              Create, organize, and share your thoughts with complete control over privacy and collaboration.
            </p>
             <div className="hero-actions">
              {isLoggedIn ? (
                <Link href="/profile" className="btn btn-primary btn-large">
                  Go to Notes
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="btn btn-primary btn-large">
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/login" className="btn btn-secondary btn-large">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">∞</span>
                <span className="stat-label">Notes & Ideas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Privacy Control</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Access Anywhere</span>
              </div>
            </div>
          </div>
        </div>

        {publicNotes.length > 0 && (
          <div className="public-notes-section">
            <div className="public-notes-content">
              <h2 className="section-title">Recent Public Notes</h2>
              <p className="section-description">
                Discover what others are sharing in the community
              </p>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading notes...</p>
                </div>
              ) : (
                <div className="public-notes-grid">
                  {publicNotes.map((note) => (
                    <article key={note.id} className="public-note-card">
                      <h3 className="public-note-title">{note.title}</h3>
                      <div className="public-note-body">
                        {note.body.length > 150 
                          ? `${note.body.substring(0, 150)}...` 
                          : note.body
                        }
                      </div>
                      
                      {note.labels && note.labels.length > 0 && (
                        <div className="public-note-labels">
                          {note.labels.slice(0, 3).map((label) => (
                            <span
                              key={label.id}
                              className="public-note-label"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="public-note-meta">
                        <span className="public-note-author">
                          By {note.users?.name || 'Anonymous'}
                        </span>
                        <span className="public-note-date">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              
              {isLoggedIn && (
                <div className="public-notes-cta">
                  <Link href="/profile" className="btn btn-primary">
                    Share Your Notes
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="features-section">
          <div className="features-content">
            <h2 className="section-title">Everything You Need for Modern Note-Taking</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Lock size={28} />
                </div>
                <h3>Privacy First</h3>
                <p>Choose between public notes for sharing and private notes for personal use. Complete control over your content visibility.</p>
                <ul className="feature-list">
                  <li>Private notes visible only to you</li>
                  <li>Public notes for community sharing</li>
                  <li>Easy privacy toggle per note</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FileEdit size={28} />
                </div>
                <h3>Smart Drafts</h3>
                <p>Never lose your work with our intelligent draft system. Write, save, and publish when you're ready.</p>
                <ul className="feature-list">
                  <li>Auto-save draft functionality</li>
                  <li>Convert drafts to published notes</li>
                  <li>Separate draft management area</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Tag size={28} />
                </div>
                <h3>Powerful Organization</h3>
                <p>Keep your notes organized with our flexible labeling system and smart categorization.</p>
                <ul className="feature-list">
                  <li>Color-coded custom labels</li>
                  <li>Filter notes by categories</li>
                  <li>All posts unified view</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Zap size={28} />
                </div>
                <h3>Lightning Fast</h3>
                <p>Built for speed and efficiency. Create, edit, and organize your notes without any lag or complexity.</p>
                <ul className="feature-list">
                  <li>Instant note creation</li>
                  <li>Real-time updates</li>
                  <li>Responsive design</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <BookOpen size={28} />
                </div>
                <h3>Community Sharing</h3>
                <p>Share your knowledge with the community through public notes while keeping personal thoughts private.</p>
                <ul className="feature-list">
                  <li>Public notes feed on homepage</li>
                  <li>Discover community content</li>
                  <li>Author attribution</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Palette size={28} />
                </div>
                <h3>Beautiful Experience</h3>
                <p>Enjoy a modern, clean interface with dark and light themes that adapt to your preferences.</p>
                <ul className="feature-list">
                  <li>Dark & light theme support</li>
                  <li>Mobile-responsive design</li>
                  <li>Intuitive navigation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h2>About SNotes</h2>
              <p>
                SNotes is a modern note-taking platform designed for the way you think and work. 
                Whether you're jotting down quick thoughts, drafting detailed articles, or sharing knowledge 
                with the community, SNotes provides the perfect balance of simplicity and power.
              </p>
              <p>
                Built with privacy in mind, you have complete control over what you share and what stays private. 
                Our intelligent organization system helps you find what you need, when you need it, while our 
                clean interface keeps you focused on what matters most - your ideas.
              </p>
              <div className="about-highlights">
                <div className="highlight">
                  <strong>For Personal Use:</strong> Keep private journals, to-do lists, and personal notes secure and organized.
                </div>
                <div className="highlight">
                  <strong>For Sharing:</strong> Publish articles, tutorials, and insights to inspire and help others.
                </div>
                <div className="highlight">
                  <strong>For Productivity:</strong> Use drafts to work on ideas over time and publish when ready.
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="visual-card">
                <div className="visual-header">
                  <div className="visual-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="visual-title">SNotes</span>
                </div>
                <div className="visual-content">
                  <div className="visual-note">
                    <div className="note-header">
                      <span className="note-title">My First Note</span>
                      <span className="private-badge-demo">PRIVATE</span>
                    </div>
                    <div className="note-content">Welcome to SNotes! This is your private space...</div>
                  </div>
                  <div className="visual-note public">
                    <div className="note-header">
                      <span className="note-title">Tips for Better Writing</span>
                    </div>
                    <div className="note-content">Here are some tips I'd like to share with everyone...</div>
                    <div className="note-labels-demo">
                      <span className="label-demo" style={{background: '#3b82f6'}}>Writing</span>
                      <span className="label-demo" style={{background: '#10b981'}}>Tips</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 SNotes. All rights reserved.</p>
      </footer>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }

        .home-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          padding: 1rem 0;
        }

        .header-content {
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .header-content h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .theme-toggle {
          padding: 0.5rem;
          border: none;
          background: var(--bg-tertiary);
          border-radius: 6px;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
        }

        .theme-toggle:hover {
          background: var(--bg-accent);
        }

        .home-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .hero-section {
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 4rem;
          line-height: 1.6;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-bottom: 3rem;
          padding: 2rem;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .hero-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .feature-icon {
          flex-shrink: 0;
          color: var(--accent-primary);
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 4rem;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .public-notes-section {
          padding: 4rem 2rem;
          background: var(--bg-primary);
        }

        .public-notes-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: 3rem;
        }

        .public-notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .public-note-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .public-note-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .public-note-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .public-note-body {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .public-note-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-bottom: 1rem;
        }

        .public-note-label {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .public-note-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .public-note-author {
          font-weight: 500;
        }

        .public-notes-cta {
          text-align: center;
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

        .features-section {
          padding: 4rem 2rem;
          background: var(--bg-secondary);
        }

        .features-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
          transform: translateY(-2px);
        }

        .feature-icon {
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          color: var(--text-secondary);
          font-size: 0.875rem;
          padding: 0.25rem 0;
          position: relative;
          padding-left: 1rem;
        }

        .feature-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--accent-primary);
          font-weight: bold;
        }

        .about-section {
          padding: 4rem 2rem;
          background: var(--bg-primary);
        }

        .about-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .about-text h2 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .about-text p {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .about-highlights {
          margin-top: 2rem;
        }

        .highlight {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .highlight strong {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .about-visual {
          display: flex;
          justify-content: center;
        }

        .visual-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 24px var(--shadow);
        }

        .visual-header {
          background: var(--bg-tertiary);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .visual-dots {
          display: flex;
          gap: 0.25rem;
        }

        .visual-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .visual-dots span:nth-child(1) { background: #ef4444; }
        .visual-dots span:nth-child(2) { background: #f59e0b; }
        .visual-dots span:nth-child(3) { background: #10b981; }

        .visual-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .visual-content {
          padding: 1.5rem;
        }

        .visual-note {
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .visual-note.public {
          border-left: 4px solid var(--accent-primary);
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .note-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .private-badge-demo {
          background: var(--accent-primary);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .note-content {
          color: var(--text-secondary);
          font-size: 0.75rem;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .note-labels-demo {
          display: flex;
          gap: 0.25rem;
        }

        .label-demo {
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .home-footer {
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border-primary);
          padding: 2rem;
          text-align: center;
        }

        .home-footer p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0 1rem;
          }

          .hero-section {
            padding: 2rem 1rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .hero-features {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn-large {
            width: 100%;
            max-width: 300px;
          }

          .public-notes-section {
            padding: 2rem 1rem;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .section-description {
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .public-notes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .public-note-card {
            padding: 1rem;
          }

          .public-note-title {
            font-size: 1rem;
          }

          .features-section {
            padding: 2rem 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 1.5rem;
          }

          .about-section {
            padding: 2rem 1rem;
          }

          .about-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .about-text h2 {
            font-size: 1.5rem;
          }

          .visual-card {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 1.5rem 1rem;
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .hero-stats {
            gap: 1rem;
            padding: 1rem;
          }

          .stat-number {
            font-size: 1.25rem;
          }

          .stat-label {
            font-size: 0.75rem;
          }

          .features-section {
            padding: 1.5rem 1rem;
          }

          .features-grid {
            gap: 1rem;
          }

          .feature-card {
            padding: 1rem;
          }

          .feature-card h3 {
            font-size: 1.125rem;
          }

          .about-section {
            padding: 1.5rem 1rem;
          }

          .about-text h2 {
            font-size: 1.25rem;
          }

          .about-text p {
            font-size: 0.875rem;
          }

          .highlight {
            padding: 0.75rem;
            font-size: 0.8125rem;
          }

          .visual-content {
            padding: 1rem;
          }

          .visual-note {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
