import { useState } from "react";
import Navbar from "./Components/Navbar";
import Login from "./Pages/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <h1>Welcome to Google Docs Lite</h1>

        <p>You are successfully logged in.</p>

        <button
          className="new-document-btn"
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userEmail");
            setIsLoggedIn(false);
          }}
        >
          Logout
        </button>
      </main>
    </div>
  );
}

export default App;