import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import DocumentCard from "./DocumentCard";
import EmptyState from "./EmptyState";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

// Notice: no useDocuments() call here. All document data arrives as props
// from App.jsx — this is "lifting state up" + "prop drilling" in action.
export default function Dashboard({
  documents,
  allDocumentsCount,
  loading,
  searchTerm,
  setSearchTerm,
  createDocument,
  deleteDocument,
}) {
  const navigate = useNavigate();

  function handleCreate() {
    const newId = createDocument();
    navigate(`/document/${newId}`);
  }

  return (
    <div>
      <Navbar />
      <main className="dash-body">
        <div className="dash-toolbar">
          <h1>Your documents</h1>
          <div className="toolbar-actions">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <button className="btn-clay" onClick={handleCreate}>+ New document</button>
          </div>
        </div>

        {loading ? (
          <p role="status">Loading documents...</p>
        ) : allDocumentsCount === 0 ? (
          <EmptyState
            title="No documents yet"
            message="Create your first document to get started."
            actionLabel="+ Create your first document"
            onAction={handleCreate}
          />
        ) : documents.length === 0 ? (
          <EmptyState
            title="No matching documents"
            message={`Nothing found for "${searchTerm}".`}
          />
        ) : (
          <div className="doc-grid">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={deleteDocument} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}