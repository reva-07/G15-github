import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Editor from "./Editor";
import { useDocuments } from "./useDocuments";

function App() {
  const documentsState = useDocuments();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard {...documentsState} />} />
        <Route path="/document/:id" element={<Editor {...documentsState} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;