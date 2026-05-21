import { useState, useRef, useEffect } from "react";

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function QuizSettingsDropdown({ 
  quiz, 
  onEdit, 
  onMove, 
  onDelete, 
  onResults,
  onToggleFeedback,
  deleteLoading 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const actions = [
    { icon: "✏️", label: "Edit", onClick: onEdit, color: "#3b82f6" },
    { icon: "📦", label: "Move", onClick: onMove, color: "#8b5cf6" },
    { icon: "📊", label: "Results", onClick: onResults, color: "#10b981" },
    { 
      icon: quiz.feedbackEnabled !== false ? "💬" : "🔇", 
      label: "Feedback", 
      onClick: () => onToggleFeedback(!quiz.feedbackEnabled), 
      color: "#f59e0b" 
    },
    { icon: "🗑️", label: "Delete", onClick: onDelete, color: "#ef4444", disabled: deleteLoading }
  ];

  return (
    <div className="floating-menu-container" ref={dropdownRef}>
      <button
        className={`menu-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quiz Settings"
      >
        <IconSettings />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {actions.map((action, index) => (
            <button
              key={index}
              className="dropdown-item"
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              disabled={action.disabled}
              style={{ '--accent-color': action.color }}
            >
              <span className="dropdown-icon">{action.icon}</span>
              <span className="dropdown-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .floating-menu-container {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 50;
        }

        .menu-trigger {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(100, 116, 139, 0.07);
          border: 1.5px solid rgba(100, 116, 139, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 200ms ease;
          position: relative;
          z-index: 52;
        }

        .menu-trigger:hover {
          background: rgba(247, 127, 0, 0.1);
          border-color: rgba(247, 127, 0, 0.45);
          color: #f77f00;
        }

        .menu-trigger.active {
          background: #f77f00;
          border-color: #f77f00;
          color: white;
          box-shadow: 0 4px 12px rgba(247, 127, 0, 0.3);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          min-width: 148px;
          animation: dropIn 180ms cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          transition: background 150ms ease, color 150ms ease;
          text-align: left;
          font-family: 'Outfit', system-ui, sans-serif;
        }

        .dropdown-item:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.04);
          color: var(--accent-color);
        }

        .dropdown-item:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .dropdown-icon {
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
        }

        .dropdown-label {
          flex: 1;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
