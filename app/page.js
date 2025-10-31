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
  ArrowRight 
} from 'lucide-react';
import "./globals.css";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="brand">
            <BookOpen size={24} />
            <h1>MiniSamantha</h1>
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
              Your Personal Note-Taking Companion
            </h2>
            <p className="hero-description">
              Organize your thoughts, save drafts, and manage your notes with ease. 
              MiniSamantha helps you stay productive and never lose an idea.
            </p>
            
            <div className="hero-features">
              <div className="feature">
                <FileText size={20} className="feature-icon" />
                <span>Create & Edit Notes</span>
              </div>
              <div className="feature">
                <FileEdit size={20} className="feature-icon" />
                <span>Save as Drafts</span>
              </div>
              <div className="feature">
                <Tag size={20} className="feature-icon" />
                <span>Organize with Labels</span>
              </div>
              <div className="feature">
                <Palette size={20} className="feature-icon" />
                <span>Dark & Light Themes</span>
              </div>
            </div>

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
          </div>
        </div>

        <div className="info-section">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <Zap size={24} />
              </div>
              <h3>Quick & Easy</h3>
              <p>Start writing immediately with our clean, distraction-free interface.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Save size={24} />
              </div>
              <h3>Never Lose Work</h3>
              <p>Save drafts automatically and publish when you're ready.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <Palette size={24} />
              </div>
              <h3>Beautiful Design</h3>
              <p>Enjoy a modern interface that adapts to your preferred theme.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 MiniSamantha. All rights reserved.</p>
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
          max-width: 1200px;
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
          margin-bottom: 3rem;
          line-height: 1.6;
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
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .info-section {
          padding: 4rem 2rem;
          background: var(--bg-secondary);
        }

        .info-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .info-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
        }

        .info-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .info-icon {
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .info-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .info-card p {
          color: var(--text-secondary);
          line-height: 1.6;
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

          .info-section {
            padding: 2rem 1rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .info-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
