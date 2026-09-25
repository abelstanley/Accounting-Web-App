import { useEffect, useState } from "react";
import { apiRequest } from "../api/apiClient";

function SummaryCard({ label, value, accent }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEDED",
        borderRadius: "10px",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
        flex: 1,
        minWidth: "180px",
      }}
    >
      <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#6B6B6B" }}>
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "1.6rem",
          fontWeight: 700,
          color: accent ? "#5C7A00" : "#1A1A1A", // deep lemon-green for positive/net figures
        }}
      >
        ₦{value?.toLocaleString()}
      </p>
    </div>
  );
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [cashOnHand, setCashOnHand] = useState(null);
  const [income, setIncome] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const trialBalance = await apiRequest("/reports/trial-balance");
        const cashAccounts = trialBalance.data.filter(
          (a) => a.accountName === "Cash" || a.accountName === "Bank"
        );
        const totalCash = cashAccounts.reduce(
          (sum, a) => sum + a.debit - a.credit,
          0
        );
        setCashOnHand(totalCash);

        const year = new Date().getFullYear();
        const incomeStatement = await apiRequest(
          `/reports/income-statement?startDate=${year}-01-01&endDate=${year}-12-31`
        );
        setIncome(incomeStatement.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading)
    return <p style={{ padding: "2rem", color: "#6B6B6B" }}>Loading dashboard...</p>;
  if (error)
    return <p style={{ padding: "2rem", color: "#B3261E" }}>Error: {error}</p>;

    return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid #EDEDED",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 0.35rem 0", fontSize: "1.8rem", color: "#1A1A1A" }}>
            Dashboard
          </h1>
          <p style={{ margin: 0, color: "#6B6B6B", fontSize: "0.95rem" }}>
            Welcome back, <span style={{ color: "#1A1A1A", fontWeight: 600 }}>{user?.name}</span>
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#EAF7A1",
            color: "#5C7A00",
            padding: "0.4rem 0.9rem",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {user?.role}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <SummaryCard label="Cash on Hand" value={cashOnHand} />
        <SummaryCard label="Revenue (This Year)" value={income?.revenue?.total} />
        <SummaryCard label="Expenses (This Year)" value={income?.expenses?.total} />
        <SummaryCard label="Net Income (This Year)" value={income?.netIncome} accent />
      </div>
    </div>
  );
}

export default Dashboard;