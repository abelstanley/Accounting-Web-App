import { useEffect, useState } from "react";
import { apiRequest } from "../api/apiClient";

function Ledger() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [entries, setEntries] = useState([]);
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAccounts = async () => {
            const response = await apiRequest("/accounts");
            setAccounts(response.data);
        };
        loadAccounts();
    }, []);

    useEffect(() => {
        if (!selectedAccount) {
            setEntries([]);
            setAccountInfo(null);
            return;
        }

        const loadLedger = async () => {
            setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams();
                if (startDate) params.append("startDate", startDate);
                if (endDate) params.append("endDate", endDate);
                const queryString = params.toString() ? `?${params.toString()}` : "";

                const response = await apiRequest(
                    `/reports/general-ledger/${selectedAccount}${queryString}`
                );
                setEntries(response.data.entries);
                setAccountInfo(response.data.account);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadLedger();
    }, [selectedAccount, startDate, endDate]);

    const inputStyle = {
        padding: "0.6rem 0.75rem",
        borderRadius: "6px",
        border: "1px solid #DADADA",
        fontSize: "0.9rem",
        outline: "none",
    };

    const labelStyle = {
        display: "block",
        marginBottom: "0.4rem",
        fontSize: "0.85rem",
        color: "#333",
    };

    const cardStyle = {
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEDED",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
            <h1 style={{ margin: "0 0 0.25rem 0", color: "#1A1A1A" }}>Ledger</h1>
            <p style={{ margin: "0 0 1.5rem 0", color: "#6B6B6B" }}>
                View an account's full transaction history.
            </p>

            <div style={{ ...cardStyle, padding: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 2, minWidth: "220px" }}>
                        <label style={labelStyle}>Account</label>
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                        >
                            <option value="">-- Choose an account --</option>
                            {accounts.map((acc) => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.accountCode} — {acc.accountName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, minWidth: "160px" }}>
                        <label style={labelStyle}>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: "160px" }}>
                        <label style={labelStyle}>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                </div>
            </div>

            {loading && <p style={{ color: "#6B6B6B" }}>Loading ledger entries...</p>}
            {error && (
                <p
                    style={{
                        backgroundColor: "#FDEDED",
                        color: "#B3261E",
                        padding: "0.6rem 0.8rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                    }}
                >
                    {error}
                </p>
            )}

            {accountInfo && (
                <>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            marginBottom: "0.75rem",
                        }}
                    >
                        <h3 style={{ margin: 0, color: "#1A1A1A" }}>
                            {accountInfo.accountCode} — {accountInfo.accountName}
                        </h3>
                        <span
                            style={{
                                backgroundColor: "#EAF7A1",
                                color: "#5C7A00",
                                padding: "0.2rem 0.6rem",
                                borderRadius: "12px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                            }}
                        >
                            {accountInfo.accountType}
                        </span>
                    </div>

                    <div style={{ ...cardStyle, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#FAFAF7", textAlign: "left" }}>
                                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>DATE</th>
                                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>DESCRIPTION</th>
                                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>DEBIT</th>
                                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>CREDIT</th>
                                    <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>BALANCE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => (
                                    <tr key={entry._id} style={{ borderTop: "1px solid #F0F0F0" }}>
                                        <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A", whiteSpace: "nowrap" }}>
                                            {new Date(entry.transactionDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>
                                            {entry.description}
                                        </td>
                                        <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>
                                            {entry.debit > 0 ? entry.debit.toLocaleString() : ""}
                                        </td>
                                        <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>
                                            {entry.credit > 0 ? entry.credit.toLocaleString() : ""}
                                        </td>
                                        <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A", fontWeight: 600 }}>
                                            {entry.balance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {entries.length === 0 && (
                            <p style={{ padding: "1.5rem", color: "#6B6B6B", margin: 0 }}>
                                No transactions found for this account{startDate || endDate ? " in this date range" : ""}.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Ledger;