import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/apiClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAFAF7", // soft off-white, easier on the eyes than pure white
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "360px",
          backgroundColor: "#FFFFFF",
          padding: "2.5rem",
          borderRadius: "10px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          border: "1px solid #EDEDED",
        }}
      >
        <h2 style={{ margin: "0 0 0.25rem 0", color: "#1A1A1A" }}>Welcome back</h2>
        <p style={{ margin: "0 0 1.75rem 0", color: "#6B6B6B", fontSize: "0.9rem" }}>
          Log in to your accounting dashboard
        </p>

        {error && (
          <p
            style={{
              backgroundColor: "#FDEDED",
              color: "#B3261E",
              padding: "0.6rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ marginBottom: "1.1rem" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#333" }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #DADADA",
              fontSize: "0.95rem",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#333" }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #DADADA",
              fontSize: "0.95rem",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: loading ? "#D9E85A" : "#C6E21E", // lemon green, slightly dimmed while loading
            color: "#1A1A1A",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

export default Login;