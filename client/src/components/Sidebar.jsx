import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "0.6rem 1rem",
    borderRadius: "6px",
    textDecoration: "none",
    color: isActive ? "#1A1A1A" : "#555",
    backgroundColor: isActive ? "#EAF7A1" : "transparent", // light lemon tint when active
    fontWeight: isActive ? 600 : 400,
    marginBottom: "0.25rem",
  });

  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #EDEDED",
        padding: "1.5rem 1rem",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ margin: "0 0 1.5rem 0.5rem", color: "#1A1A1A" }}>Accounting</h3>

      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/accounts" style={linkStyle}>Chart of Accounts</NavLink>
      <NavLink to="/journal" style={linkStyle}>Journal Entry</NavLink>
      <NavLink to="/ledger" style={linkStyle}>Ledger</NavLink>
      <NavLink to="/reports" style={linkStyle}>Reports</NavLink>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "2rem",
          width: "100%",
          padding: "0.6rem",
          borderRadius: "6px",
          border: "1px solid #DADADA",
          backgroundColor: "transparent",
          color: "#B3261E",
          cursor: "pointer",
        }}
      >
        Log Out
      </button>
    </div>
  );
}

export default Sidebar;