function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #EDEDED",
        padding: "1rem 2rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#C6E21E",
          }}
        />
        <span style={{ fontWeight: 600, color: "#1A1A1A", fontSize: "0.95rem" }}>
          {today}
        </span>
      </div>

      <div style={{ fontSize: "0.9rem", color: "#6B6B6B" }}>
        Signed in as <span style={{ color: "#1A1A1A", fontWeight: 600 }}>{user?.name}</span>
      </div>
    </div>
  );
}

export default Header;