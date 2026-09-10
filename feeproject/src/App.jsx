import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Navbar from "./Components/Navbar";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <h1>Google Docs Lite</h1>
        <p>Your simple document editor.</p>

        <button className="new-document-btn">
          + New Document
        </button>
      </main>
    </div>
  );
}

export default App;