import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function validate() {
    const newErrors = {};
    if (!email.includes("@")) newErrors.email = "Please enter a valid email.";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      localStorage.setItem("authUser", JSON.stringify({ email, name: "Bhumi" }));
      navigate("/dashboard");
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-form-side">
        <div className="login-form-box">
          <div className="brand">
            <div className="brand-mark">G</div>
            <span className="brand-name">Google Docs Lite</span>
          </div>
          <h1>Welcome back</h1>
          <p className="sub">Log in to keep writing where you left off.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                aria-invalid={!!errors.email}
              />
              {errors.email && <div className="err">{errors.email}</div>} 
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                aria-invalid={!!errors.password}
              />
              {errors.password && <div className="err">{errors.password}</div>}
            </div>
            <button className="btn-primary" type="submit">Log in</button>
          </form>
          <p className="login-hint">This is a frontend prototype — any email/password works.</p>
        </div>
      </div>
      <div className="login-brand-side">
        <h2>Write together, without getting in each other's way.</h2>
        <p>A lightweight document workspace — built as the foundation for a future real-time collaborative editor.</p>
      </div>
    </div>
  );
}







// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();

//   function validate() {
//     const newErrors = {};
//     if (!email.includes("@")) newErrors.email = "Please enter a valid email.";
//     if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
//     return newErrors;
//   }

//   function handleSubmit(e) {
//     e.preventDefault();
//     const validationErrors = validate();
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       // 🔽 CHANGE 1: Extract name from email before saving
//       const extractedName = email.split("@")[0]; // email ke "@" se pehle wala part

//       // 🔽 CHANGE 2: Save extractedName instead of hard-coded 
//       localStorage.setItem(
//         "authUser",
//         JSON.stringify({ email, name: extractedName })
//       );

//       navigate("/dashboard");
//     }
//   }

//   return (
//     <div className="login-wrap">
//       <div className="login-form-side">
//         <div className="login-form-box">
//           <div className="brand">
//             <div className="brand-mark">G</div>
//             <span className="brand-name">Google Docs Lite</span>
//           </div>
//           <h1>Welcome back</h1>
//           <p className="sub">Log in to keep writing where you left off.</p>

//           <form onSubmit={handleSubmit} noValidate>
//             <div className="field">
//               <label htmlFor="email">Email</label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 aria-label="Email address"
//                 aria-invalid={!!errors.email}
//               />
//               {errors.email && <div className="err">{errors.email}</div>}
//             </div>
//             <div className="field">
//               <label htmlFor="password">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 aria-label="Password"
//                 aria-invalid={!!errors.password}
//               />
//               {errors.password && <div className="err">{errors.password}</div>}
//             </div>
//             <button className="btn-primary" type="submit">Log in</button>
//           </form>
//           <p className="login-hint">This is a frontend prototype — any email/password works.</p>
//         </div>
//       </div>
//       <div className="login-brand-side">
//         <h2>Write together, without getting in each other's way.</h2>
//         <p>A lightweight document workspace — built as the foundation for a future real-time collaborative editor.</p>
//       </div>
//     </div>
//   );
// }
