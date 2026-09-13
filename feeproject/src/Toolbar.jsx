export default function Toolbar({ editorRef, onContentChange }) {
  function applyFormat(command, value = null) {
    editorRef.current.focus();
    document.execCommand(command, false, value);
    onContentChange();
  }

  function insertLink() {
    const url = window.prompt("Enter URL:");
    if (url) applyFormat("createLink", url);
  }

  function handleHeadingChange(e) {
    applyFormat("formatBlock", e.target.value);
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting toolbar">
      <div className="tb-group">
        <select className="tb-select" aria-label="Heading style" onChange={handleHeadingChange} defaultValue="">
          <option value="P">Normal text</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
        </select>
      </div>
      <div className="tb-group">
        <button className="tb-btn" aria-label="Bold" onClick={() => applyFormat("bold")}><b>B</b></button>
        <button className="tb-btn" aria-label="Italic" onClick={() => applyFormat("italic")}><i>I</i></button>
        <button className="tb-btn" aria-label="Underline" onClick={() => applyFormat("underline")}><u>U</u></button>
      </div>
      <div className="tb-group">
        <button className="tb-btn" aria-label="Bulleted list" onClick={() => applyFormat("insertUnorderedList")}>•≡</button>
        <button className="tb-btn" aria-label="Numbered list" onClick={() => applyFormat("insertOrderedList")}>1≡</button>
      </div>
      <div className="tb-group">
        <button className="tb-btn" aria-label="Insert link" onClick={insertLink}>🔗</button>
      </div>
      <div className="tb-group">
        <button className="tb-btn" aria-label="Undo" onClick={() => applyFormat("undo")}>↶</button>
        <button className="tb-btn" aria-label="Redo" onClick={() => applyFormat("redo")}>↷</button>
      </div>
    </div>
  );
}