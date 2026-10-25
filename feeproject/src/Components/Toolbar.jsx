export default function Toolbar({ editorRef, onContentChange }) {
  function applyFormat(command, value = null) {
    editorRef.current.focus();
    document.execCommand(command, false, value);
    onContentChange();
  }

  function insertLink() {
    const url = window.prompt("Enter URL:");

    if (url) {
      applyFormat("createLink", url);
    }
  }

  function handleHeadingChange(e) {
    if (e.target.value) {
      applyFormat("formatBlock", e.target.value);
    }
  }

  return (
    <div
      className="editor-toolbar"
      role="toolbar"
      aria-label="Formatting toolbar"
    >
      {/* Heading */}
      <div className="tb-group">
        <select
          className="tb-select"
          aria-label="Heading style"
          onChange={handleHeadingChange}
          defaultValue=""
        >
          <option value="">Normal text</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
        </select>
      </div>

      {/* Text formatting */}
      <div className="tb-group">
        <button
          className="tb-btn"
          aria-label="Bold"
          title="Bold"
          onClick={() => applyFormat("bold")}
        >
          <b>B</b>
        </button>

        <button
          className="tb-btn"
          aria-label="Italic"
          title="Italic"
          onClick={() => applyFormat("italic")}
        >
          <i>I</i>
        </button>

        <button
          className="tb-btn"
          aria-label="Underline"
          title="Underline"
          onClick={() => applyFormat("underline")}
        >
          <u>U</u>
        </button>
      </div>

      {/* Lists */}
      <div className="tb-group">
        <button
          className="tb-btn"
          aria-label="Bulleted list"
          title="Bulleted list"
          onClick={() => applyFormat("insertUnorderedList")}
        >
          ☷
        </button>

        <button
          className="tb-btn"
          aria-label="Numbered list"
          title="Numbered list"
          onClick={() => applyFormat("insertOrderedList")}
        >
          ≡
        </button>
      </div>

      {/* Link */}
      <div className="tb-group">
        <button
          className="tb-btn"
          aria-label="Insert link"
          title="Insert link"
          onClick={insertLink}
        >
          🔗
        </button>
      </div>

      {/* Undo redo */}
      <div className="tb-group">
        <button
          className="tb-btn"
          aria-label="Undo"
          title="Undo"
          onClick={() => applyFormat("undo")}
        >
          ↶
        </button>

        <button
          className="tb-btn"
          aria-label="Redo"
          title="Redo"
          onClick={() => applyFormat("redo")}
        >
          ↷
        </button>
      </div>
    </div>
  );
}