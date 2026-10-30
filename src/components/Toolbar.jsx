import { useState, useRef } from "react";
import Modal from "./Modal";
import InputField from "./InputField";
import { normalizeUrl } from "../utils/documentUtils";

export default function Toolbar({ editorRef, onContentChange }) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [urlError, setUrlError] = useState("");

  const savedRangeRef = useRef(null);
  const existingAnchorRef = useRef(null);

  function applyFormat(command, value = null) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    onContentChange();
  }

  function handleOpenLinkModal() {
    setUrlError("");
    const sel = window.getSelection();
    let initialText = "";
    let initialUrl = "";
    let foundAnchor = null;
    let rangeToSave = null;

    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        rangeToSave = range.cloneRange();
        initialText = range.toString();

        // Check if current selection or cursor is inside an existing <a>
        let node = range.commonAncestorContainer;
        while (node && node !== editorRef.current) {
          if (node.nodeName === "A") {
            foundAnchor = node;
            break;
          }
          node = node.parentNode;
        }
      }
    }

    if (foundAnchor) {
      existingAnchorRef.current = foundAnchor;
      initialUrl = foundAnchor.getAttribute("href") || "";
      initialText = foundAnchor.textContent || "";
      setIsEditingExisting(true);
    } else {
      existingAnchorRef.current = null;
      setIsEditingExisting(false);
    }

    savedRangeRef.current = rangeToSave;
    setLinkUrl(initialUrl);
    setLinkText(initialText);
    setIsLinkModalOpen(true);
  }

  function handleSaveLink(e) {
    e.preventDefault();
    setUrlError("");

    const normalized = normalizeUrl(linkUrl);
    if (!normalized) {
      setUrlError(
        "Please enter a valid web URL (e.g., https://example.com) or email address (mailto:user@example.com). Executable protocols like javascript: are forbidden."
      );
      return;
    }

    if (existingAnchorRef.current) {
      // Edit existing anchor
      existingAnchorRef.current.setAttribute("href", normalized);
      existingAnchorRef.current.setAttribute("target", "_blank");
      existingAnchorRef.current.setAttribute("rel", "noopener noreferrer");
      existingAnchorRef.current.className = "editor-link";
      existingAnchorRef.current.title = `${normalized} (Opens in new tab)`;
      if (linkText.trim()) {
        existingAnchorRef.current.textContent = linkText.trim();
      }
    } else {
      // Create new anchor
      if (!editorRef.current) return;
      editorRef.current.focus();

      const a = document.createElement("a");
      a.href = normalized;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "editor-link";
      a.title = `${normalized} (Opens in new tab)`;
      a.textContent = linkText.trim() || normalized;

      const sel = window.getSelection();
      if (savedRangeRef.current && editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
        savedRangeRef.current.deleteContents();
        savedRangeRef.current.insertNode(a);

        // Place caret immediately after the link
        const afterRange = document.createRange();
        afterRange.setStartAfter(a);
        afterRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(afterRange);
      } else {
        editorRef.current.appendChild(a);
      }
    }

    setIsLinkModalOpen(false);
    onContentChange();
  }

  function handleRemoveLink() {
    if (existingAnchorRef.current) {
      const textNode = document.createTextNode(existingAnchorRef.current.textContent || "");
      existingAnchorRef.current.parentNode.replaceChild(textNode, existingAnchorRef.current);
      existingAnchorRef.current = null;
      setIsLinkModalOpen(false);
      onContentChange();
    }
  }

  function handleHeadingChange(e) {
    if (e.target.value) {
      applyFormat("formatBlock", e.target.value);
    }
  }

  return (
    <>
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
            type="button"
            className="tb-btn"
            aria-label="Bold"
            title="Bold"
            onClick={() => applyFormat("bold")}
          >
            <b>B</b>
          </button>

          <button
            type="button"
            className="tb-btn"
            aria-label="Italic"
            title="Italic"
            onClick={() => applyFormat("italic")}
          >
            <i>I</i>
          </button>

          <button
            type="button"
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
            type="button"
            className="tb-btn"
            aria-label="Bulleted list"
            title="Bulleted list"
            onClick={() => applyFormat("insertUnorderedList")}
          >
            ☷
          </button>

          <button
            type="button"
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
            type="button"
            className="tb-btn"
            aria-label="Insert link"
            title="Insert link"
            onClick={handleOpenLinkModal}
          >
            🔗
          </button>
        </div>

        {/* Undo redo */}
        <div className="tb-group">
          <button
            type="button"
            className="tb-btn"
            aria-label="Undo"
            title="Undo"
            onClick={() => applyFormat("undo")}
          >
            ↶
          </button>

          <button
            type="button"
            className="tb-btn"
            aria-label="Redo"
            title="Redo"
            onClick={() => applyFormat("redo")}
          >
            ↷
          </button>
        </div>
      </div>

      {/* Link Input Modal Dialog */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={isEditingExisting ? "Edit Link" : "Insert Link"}
        maxWidth="460px"
        footer={
          <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", width: "100%" }}>
            <div>
              {isEditingExisting && (
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ color: "#dc2626" }}
                  onClick={handleRemoveLink}
                >
                  Remove Link
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsLinkModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-clay"
                onClick={handleSaveLink}
              >
                {isEditingExisting ? "Apply Changes" : "Insert"}
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveLink}>
          <InputField
            id="link-url-input"
            label="Link URL"
            value={linkUrl}
            onChange={(e) => {
              setLinkUrl(e.target.value);
              if (urlError) setUrlError("");
            }}
            placeholder="e.g. https://google.com"
            error={urlError}
            required
            autoFocus
          />

          <div style={{ marginTop: "14px" }}>
            <InputField
              id="link-text-input"
              label="Display Text (optional)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="e.g. Google Search (leave blank to display URL)"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
