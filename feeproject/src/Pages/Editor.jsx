import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import { countWordsAndChars } from "../utils/documentUtils";

export default function Editor({ getDocumentById, updateDocument }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentDoc = getDocumentById(id);
  const editorRef = useRef(null);
  const [title, setTitle] = useState(currentDoc?.title || "");
  const [content, setContent] = useState(currentDoc?.content || "");
  const [saveStatus, setSaveStatus] = useState("Saved");

  // Runs once on mount: loads the saved HTML into the editable div,
  // and focuses it so the user can start typing right away.
  // This is a deliberate, meaningful use of useRef for direct DOM access.
  useEffect(() => {
    if (editorRef.current && currentDoc) {
      editorRef.current.innerHTML = currentDoc.content;
      editorRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDocument = useCallback(() => {
    if (!currentDoc) return;
    updateDocument(id, { title, content });
    setSaveStatus("Saved");
  }, [id, title, content, currentDoc, updateDocument]);

  // Auto-save simulation: wait 1 second after the last change, then save.
  useEffect(() => {
    setSaveStatus("Saving...");
    const timer = setTimeout(saveDocument, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  function handleContentChange() {
    setContent(editorRef.current.innerHTML);
  }

  const { words, chars } = useMemo(() => countWordsAndChars(content), [content]);

  if (!currentDoc) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Document not found.</p>
        <button className="btn-primary" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="editor-navbar">
        <div className="editor-title-group">
          <button className="back-btn" aria-label="Back to dashboard" onClick={() => navigate("/dashboard")}>←</button>
          <input
            className="doc-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Document title"
          />
        </div>
        <div className="save-status">
          <span className="save-dot"></span> {saveStatus}
        </div>
      </div>

      <Toolbar editorRef={editorRef} onContentChange={handleContentChange} />

      <div className="editor-canvas-wrap">
        <div
          className="paper"
          contentEditable
          ref={editorRef}
          onInput={handleContentChange}
          aria-label="Document content"
        />
      </div>

      <div className="editor-footer">
        <span>{words} words · {chars} characters</span>
        <span>Auto-saves a second after you stop typing</span>
      </div>
    </div>
  );
}