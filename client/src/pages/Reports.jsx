import { useState } from "react";
import { apiRequest } from "../api/apiClient";

const inputStyle = {
    padding: "0.6rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #DADADA",
    fontSize: "0.9rem",
    outline: "none",
};

const labelStyle = {
    fontSize: "0.85rem",
    color: "#333",
    marginRight: "0.4rem",
};

const cardStyle = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #EDEDED",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
    padding: "1.5rem",
};

const runButtonStyle = (loading) => ({
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: loading ? "#D9E85A" : "#C6E21E",
    color: "#1A1A1A",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
});

function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <p
            style={{
                backgroundColor: "#FDEDED",
                color: "#B3261E",
                padding: "0.6rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                marginTop: "1rem",
            }}
        >
            {message}
        </p>
    );
}

function SectionTable({ title, rows, total }) {
    return (
        <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#1A1A1A" }}>{title}</h4>
            <div style={{ border: "1px solid #F0F0F0", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.accountId || i} style={{ borderTop: i > 0 ? "1px solid #F0F0F0" : "none" }}>
                                <td style={{ padding: "0.6rem 1rem", color: "#1A1A1A" }}>{row.accountName}</td>
                                <td style={{ padding: "0.6rem 1rem", color: "#1A1A1A", textAlign: "right", fontWeight: 600 }}>
                                    {row.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        <tr style={{ borderTop: "2px solid #E5E5E5", backgroundColor: "#FAFAF7" }}>
                            <td style={{ padding: "0.6rem 1rem", fontWeight: 700, color: "#1A1A1A" }}>Total</td>
                            <td style={{ padding: "0.6rem 1rem", fontWeight: 700, color: "#1A1A1A", textAlign: "right" }}>
                                {total.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TrialBalanceTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runReport = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await apiRequest("/reports/trial-balance");
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={runReport} disabled={loading} style={runButtonStyle(loading)}>
                {loading ? "Loading..." : "Run Trial Balance"}
            </button>

            <ErrorBanner message={error} />

            {data && (
                <div style={{ ...cardStyle, marginTop: "1.5rem", overflow: "hidden", padding: 0 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#FAFAF7", textAlign: "left" }}>
                                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>CODE</th>
                                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>NAME</th>
                                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>TYPE</th>
                                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>DEBIT</th>
                                <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>CREDIT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((acc) => (
                                <tr key={acc.accountId} style={{ borderTop: "1px solid #F0F0F0" }}>
                                    <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>{acc.accountCode}</td>
                                    <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>{acc.accountName}</td>
                                    <td style={{ padding: "0.85rem 1.25rem", color: "#6B6B6B" }}>{acc.accountType}</td>
                                    <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>
                                        {acc.debit > 0 ? acc.debit.toLocaleString() : ""}
                                    </td>
                                    <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>
                                        {acc.credit > 0 ? acc.credit.toLocaleString() : ""}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function IncomeStatementTab() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runReport = async () => {
        if (!startDate || !endDate) {
            setError("Please select both a start and end date.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await apiRequest(
                `/reports/income-statement?startDate=${startDate}&endDate=${endDate}`
            );
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ ...cardStyle, display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <label style={labelStyle}>Start Date</label><br />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...inputStyle, marginTop: "0.3rem" }} />
                </div>
                <div>
                    <label style={labelStyle}>End Date</label><br />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ ...inputStyle, marginTop: "0.3rem" }} />
                </div>
                <button onClick={runReport} disabled={loading} style={runButtonStyle(loading)}>
                    {loading ? "Loading..." : "Run Income Statement"}
                </button>
            </div>

            <ErrorBanner message={error} />

            {data && (
                <div style={{ marginTop: "1.5rem" }}>
                    <SectionTable title="Revenue" rows={data.revenue.accounts} total={data.revenue.total} />
                    <SectionTable title="Expenses" rows={data.expenses.accounts} total={data.expenses.total} />
                    <div style={{ ...cardStyle, textAlign: "right" }}>
                        <span style={{ color: "#6B6B6B" }}>Net Income: </span>
                        <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#5C7A00" }}>
                            {data.netIncome.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function BalanceSheetTab() {
    const [asOfDate, setAsOfDate] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runReport = async () => {
        setLoading(true);
        setError("");
        try {
            const query = asOfDate ? `?asOfDate=${asOfDate}` : "";
            const response = await apiRequest(`/reports/balance-sheet${query}`);
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ ...cardStyle, display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <label style={labelStyle}>As Of Date (optional)</label><br />
                    <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} style={{ ...inputStyle, marginTop: "0.3rem" }} />
                </div>
                <button onClick={runReport} disabled={loading} style={runButtonStyle(loading)}>
                    {loading ? "Loading..." : "Run Balance Sheet"}
                </button>
            </div>

            <ErrorBanner message={error} />

            {data && (
                <div style={{ marginTop: "1.5rem" }}>
                    <SectionTable title="Assets" rows={data.assets.accounts} total={data.assets.total} />
                    <SectionTable title="Liabilities" rows={data.liabilities.accounts} total={data.liabilities.total} />
                    <SectionTable title="Equity" rows={data.equity.accounts} total={data.equity.total} />
                    <div style={{ ...cardStyle, textAlign: "center" }}>
                        <span
                            style={{
                                backgroundColor: data.isBalanced ? "#E6F7EC" : "#FDEDED",
                                color: data.isBalanced ? "#1A7A3C" : "#B3261E",
                                padding: "0.35rem 0.9rem",
                                borderRadius: "14px",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                            }}
                        >
                            {data.isBalanced ? "Balanced ✓" : "Not Balanced"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function CashFlowTab() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runReport = async () => {
        if (!startDate || !endDate) {
            setError("Please select both a start and end date.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await apiRequest(
                `/reports/cash-flow-statement?startDate=${startDate}&endDate=${endDate}`
            );
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const rows = data
        ? [
            { label: "Operating Activities", value: data.operatingActivities },
            { label: "Investing Activities", value: data.investingActivities },
            { label: "Financing Activities", value: data.financingActivities },
        ]
        : [];

    return (
        <div>
            <div style={{ ...cardStyle, display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <label style={labelStyle}>Start Date</label><br />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...inputStyle, marginTop: "0.3rem" }} />
                </div>
                <div>
                    <label style={labelStyle}>End Date</label><br />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ ...inputStyle, marginTop: "0.3rem" }} />
                </div>
                <button onClick={runReport} disabled={loading} style={runButtonStyle(loading)}>
                    {loading ? "Loading..." : "Run Cash Flow"}
                </button>
            </div>

            <ErrorBanner message={error} />

            {data && (
                <div style={{ ...cardStyle, marginTop: "1.5rem" }}>
                    {rows.map((row) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #F0F0F0" }}>
                            <span style={{ color: "#6B6B6B" }}>{row.label}</span>
                            <span style={{ fontWeight: 600, color: "#1A1A1A" }}>{row.value.toLocaleString()}</span>
                        </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid #F0F0F0" }}>
                        <span style={{ color: "#1A1A1A", fontWeight: 700 }}>Net Change in Cash</span>
                        <span style={{ fontWeight: 700, color: "#1A1A1A" }}>{data.netChangeInCash.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                        <span style={{ color: "#6B6B6B" }}>Opening Cash</span>
                        <span style={{ color: "#1A1A1A" }}>{data.openingCash.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                        <span style={{ color: "#6B6B6B" }}>Closing Cash</span>
                        <span style={{ fontWeight: 700, color: "#5C7A00" }}>{data.closingCash.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProfitLossTab() {
    const [currentStart, setCurrentStart] = useState("");
    const [currentEnd, setCurrentEnd] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runReport = async () => {
        if (!currentStart || !currentEnd) {
            setError("Please select both a start and end date.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await apiRequest(
                `/reports/profit-loss?currentStart=${currentStart}&currentEnd=${currentEnd}`
            );
            setData(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const summaryRow = (label, summary) => (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid #F0F0F0" }}>
            <span style={{ color: "#1A1A1A", fontWeight: 600 }}>{label}</span>
            <span style={{ color: "#6B6B6B" }}>
                {summary.current.toLocaleString()} vs {summary.previous.toLocaleString()}{" "}
                <span
                    style={{
                        marginLeft: "0.5rem",
                        fontWeight: 600,
                        color: summary.change >= 0 ? "#1A7A3C" : "#B3261E",
                    }}
                >
                    {summary.change >= 0 ? "▲" : "▼"} {summary.percentChange ?? "—"}%
                </span>
            </span>
        </div>
    );

    return (
        <div>
            <div style={{ ...cardStyle, display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div>
                    <label style={labelStyle}>Period Start</label><br />
                    <input type="date" value={currentStart} onChange={(e) => setCurrentStart(e.target.value)} style={{ ...inputStyle, marginTop: "0.3rem" }} />
                </div>
                <div>
                    <label style={labelStyle}>Period End</label><br />
                    <input type="date" value={currentEnd} onChange={(e) => setCurrentEnd(e.target.value)} style={{ ...inputStyle, marginTop: "0.3rem" }} />
                </div>
                <button onClick={runReport} disabled={loading} style={runButtonStyle(loading)}>
                    {loading ? "Loading..." : "Run Profit & Loss"}
                </button>
            </div>

            <ErrorBanner message={error} />

            {data && (
                <div style={{ ...cardStyle, marginTop: "1.5rem" }}>
                    <p style={{ color: "#6B6B6B", fontSize: "0.85rem", marginTop: 0 }}>
                        {new Date(data.currentPeriod.startDate).toLocaleDateString()} – {new Date(data.currentPeriod.endDate).toLocaleDateString()}
                        {" vs "}
                        {new Date(data.previousPeriod.startDate).toLocaleDateString()} – {new Date(data.previousPeriod.endDate).toLocaleDateString()}
                    </p>
                    {summaryRow("Revenue", data.summary.revenue)}
                    {summaryRow("Expenses", data.summary.expenses)}
                    {summaryRow("Net Income", data.summary.netIncome)}
                </div>
            )}
        </div>
    );
}

function Reports() {
    const [activeTab, setActiveTab] = useState("trial-balance");

    const tabs = [
        { id: "trial-balance", label: "Trial Balance" },
        { id: "income-statement", label: "Income Statement" },
        { id: "balance-sheet", label: "Balance Sheet" },
        { id: "cash-flow", label: "Cash Flow" },
        { id: "profit-loss", label: "Profit & Loss" },
    ];

    return (
        <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
            <h1 style={{ margin: "0 0 0.25rem 0", color: "#1A1A1A" }}>Reports</h1>
            <p style={{ margin: "0 0 1.5rem 0", color: "#6B6B6B" }}>
                Generate financial reports for any period.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #EDEDED" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "0.7rem 1.1rem",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            color: activeTab === tab.id ? "#1A1A1A" : "#6B6B6B",
                            borderBottom: activeTab === tab.id ? "2px solid #C6E21E" : "2px solid transparent",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "trial-balance" && <TrialBalanceTab />}
            {activeTab === "income-statement" && <IncomeStatementTab />}
            {activeTab === "balance-sheet" && <BalanceSheetTab />}
            {activeTab === "cash-flow" && <CashFlowTab />}
            {activeTab === "profit-loss" && <ProfitLossTab />}
        </div>
    );
}

export default Reports;