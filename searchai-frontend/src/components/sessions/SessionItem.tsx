import React, { useState } from 'react';
import type { Session } from '@/types/session';
import { formatDate, cn } from '@/lib/utils';
import {
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  X,
  Users,
} from 'lucide-react';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRename(session.id, editTitle.trim());
    } else {
      setEditTitle(session.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => {
        if (!isEditing) onSelect(session.id);
      }}
      className={cn(
        'group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer font-mono text-xs transition-all duration-150',
        isActive
          ? 'bg-terminal-accent-bg border border-terminal-accent-border text-terminal-accent shadow-sm'
          : 'text-terminal-text-secondary hover:text-terminal-text hover:bg-terminal-surface-elevated border border-transparent'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {session.best_toggle ? (
          <Users className="w-3.5 h-3.5 shrink-0 text-terminal-accent" />
        ) : (
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
        )}

        {isEditing ? (
          <div
            className="flex items-center gap-1 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-terminal-surface border border-terminal-accent rounded px-1.5 py-0.5 font-mono text-xs text-terminal-text focus:outline-none"
            />
            <button
              onClick={handleSaveRename}
              className="p-1 hover:text-terminal-success text-terminal-text-dim"
              title="Save title"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setEditTitle(session.title);
                setIsEditing(false);
              }}
              className="p-1 hover:text-terminal-error text-terminal-text-dim"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-terminal-text">
              {session.title || 'Untitled Session'}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-terminal-text-dim mt-0.5">
              <span>{formatDate(session.updated_at || session.created_at)}</span>
              {session.message_count > 0 && (
                <span>• {session.message_count} msgs</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons on hover */}
      {!isEditing && (
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-terminal-surface-elevated p-0.5 rounded border border-terminal-error">
              <button
                onClick={() => onDelete(session.id)}
                className="p-1 text-terminal-error hover:bg-terminal-error/20 rounded"
                title="Confirm delete"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1 text-terminal-text-dim hover:text-terminal-text rounded"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditTitle(session.title);
                  setIsEditing(true);
                }}
                className="p-1 text-terminal-text-dim hover:text-terminal-text hover:bg-terminal-surface rounded"
                title="Rename session"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1 text-terminal-text-dim hover:text-terminal-error hover:bg-terminal-error/10 rounded"
                title="Delete session"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
