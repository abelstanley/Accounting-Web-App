import { useEffect, useState } from "react";
import { apiRequest } from "../api/apiClient";

function ChartOfAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [accountCode, setAccountCode] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState("Asset");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadAccounts = async () => {
        try {
            const response = await apiRequest("/accounts");
            setAccounts(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");
        setSubmitting(true);

        try {
            await apiRequest("/accounts", {
                method: "POST",
                body: JSON.stringify({ accountCode, accountName, accountType }),
            });

            setAccountCode("");
            setAccountName("");
            setAccountType("Asset");

            await loadAccounts();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return <p style={{ padding: "2rem", color: "#6B6B6B" }}>Loading accounts...</p>;
    if (error)
        return <p style={{ padding: "2rem", color: "#B3261E" }}>Error: {error}</p>;

    const inputStyle = {
        padding: "0.6rem 0.75rem",
        borderRadius: "6px",
        border: "1px solid #DADADA",
        fontSize: "0.9rem",
        outline: "none",
    };

    const typeColors = {
        Asset: "#EAF7A1",
        Liability: "#FDEDED",
        Equity: "#E8F0FE",
        Revenue: "#E6F7EC",
        Expense: "#FFF3E0",
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
            <h1 style={{ margin: "0 0 0.25rem 0", color: "#1A1A1A" }}>Chart of Accounts</h1>
            <p style={{ margin: "0 0 1.5rem 0", color: "#6B6B6B" }}>
                Manage the accounts used across your ledger.
            </p>

            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EDEDED",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                }}
            >
                <h3 style={{ margin: "0 0 1rem 0", color: "#1A1A1A" }}>Add New Account</h3>

                {formError && (
                    <p
                        style={{
                            backgroundColor: "#FDEDED",
                            color: "#B3261E",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            marginBottom: "1rem",
                        }}
                    >
                        {formError}
                    </p>
                )}

                <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <input
                        type="text"
                        placeholder="Account Code"
                        value={accountCode}
                        onChange={(e) => setAccountCode(e.target.value)}
                        required
                        style={{ ...inputStyle, width: "140px" }}
                    />
                    <input
                        type="text"
                        placeholder="Account Name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        required
                        style={{ ...inputStyle, flex: 1, minWidth: "180px" }}
                    />
                    <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        style={{ ...inputStyle, width: "150px" }}
                    >
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: submitting ? "#D9E85A" : "#C6E21E",
                            color: "#1A1A1A",
                            fontWeight: 600,
                            cursor: submitting ? "not-allowed" : "pointer",
                        }}
                    >
                        {submitting ? "Adding..." : "Add Account"}
                    </button>
                </form>
            </div>

            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EDEDED",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                    overflow: "hidden",
                }}
            >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#FAFAF7", textAlign: "left" }}>
                            <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>CODE</th>
                            <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>NAME</th>
                            <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>TYPE</th>
                            <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account._id} style={{ borderTop: "1px solid #F0F0F0" }}>
                                <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>{account.accountCode}</td>
                                <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>{account.accountName}</td>
                                <td style={{ padding: "0.85rem 1.25rem" }}>
                                    <span
                                        style={{
                                            backgroundColor: typeColors[account.accountType] || "#F0F0F0",
                                            color: "#1A1A1A",
                                            padding: "0.25rem 0.6rem",
                                            borderRadius: "12px",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        {account.accountType}
                                    </span>
                                </td>
                                <td style={{ padding: "0.85rem 1.25rem" }}>
                                    <span style={{ color: account.isActive ? "#5C7A00" : "#999", fontSize: "0.9rem" }}>
                                        {account.isActive ? "● Active" : "○ Inactive"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ChartOfAccounts;