import React, { useState, useEffect } from 'react';
import './styles/NotesApp.css';

interface NotesAppProps {
  onClose: () => void;
  theme: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const NotesApp: React.FC<NotesAppProps> = ({ onClose, theme }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('wintophone_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('wintophone_notes', JSON.stringify(updatedNotes));
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (selectedNote) {
      const updated = notes.map(n =>
        n.id === selectedNote.id
          ? { ...n, title: title || 'Без названия', content, date: new Date().toLocaleDateString('ru-RU') }
          : n
      );
      saveNotes(updated);
      setSelectedNote(null);
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title || 'Без названия',
        content,
        date: new Date().toLocaleDateString('ru-RU'),
      };
      saveNotes([newNote, ...notes]);
    }
    setTitle('');
    setContent('');
  };

  const handleDelete = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleNew = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
  };

  if (selectedNote || title || content) {
    return (
      <div className={`notes-app theme-${theme}`}>
        <div className="app-header">
          <button className="back-button" onClick={() => { setSelectedNote(null); setTitle(''); setContent(''); }}>←</button>
          <span className="app-title">{selectedNote ? 'Редактировать' : 'Новая заметка'}</span>
          <button className="header-button" onClick={handleSave}>✓</button>
        </div>
        <div className="note-editor">
          <input
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="note-title-input"
          />
          <textarea
            placeholder="Текст заметки..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="note-content-input"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`notes-app theme-${theme}`}>
      <div className="app-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="app-title">Заметки</span>
        <button className="header-button" onClick={handleNew}>+</button>
      </div>
      <div className="notes-content">
        {notes.length === 0 ? (
          <div className="empty-notes">
            <span className="empty-icon">📝</span>
            <span className="empty-text">Нет заметок</span>
            <span className="empty-subtext">Нажмите + чтобы создать</span>
          </div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-card" onClick={() => handleEdit(note)}>
                <div className="note-card-header">
                  <span className="note-card-title">{note.title}</span>
                  <button
                    className="note-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  >
                    🗑️
                  </button>
                </div>
                <span className="note-card-preview">{note.content.slice(0, 60)}...</span>
                <span className="note-card-date">{note.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
