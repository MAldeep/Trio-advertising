"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.token) {
      localStorage.setItem("trio_admin_token", data.token);
      router.push("/admin/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  }

  return (
    <div className="admin-login animated-fade-in">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} className="animated-bounce-in">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        {error && <div className="error animated-shake">{error}</div>}
      </form>
      <style jsx>{`
        .admin-login {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #10131a 0%, #23272f 100%);
          color: #f8f8ff;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #181b22;
          padding: 2rem 2.5rem;
          /* No border-radius for sharp look */
          border: 2px solid #23263a;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.25);
        }
        input {
          padding: 0.75rem 1rem;
          border: 2px solid #23263a;
          background: #10131a;
          color: #f8f8ff;
          font-size: 1rem;
          outline: none;
          /* No border-radius for sharp look */
        }
        input:focus {
          border-color: #00eaff;
        }
        button {
          padding: 0.75rem 1rem;
          border: none;
          background: #00eaff;
          color: #181b22;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          letter-spacing: 1px;
          transition: background 0.2s, color 0.2s;
        }
        button:disabled {
          background: #23263a;
          color: #aaa;
        }
        button:hover:not(:disabled) {
          background: #00b3c6;
          color: #fff;
        }
        .error {
          color: #ff0080;
          margin-top: 0.5rem;
          font-weight: bold;
        }
        /* Animations */
        .animated-fade-in {
          animation: fadeIn 1s ease;
        }
        .animated-bounce-in {
          animation: bounceIn 0.8s;
        }
        .animated-shake {
          animation: shake 0.4s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
} 