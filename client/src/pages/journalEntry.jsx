import { useEffect, useState } from "react";
import { apiRequest } from "../api/apiClient";

function JournalEntry() {
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);

  const [transactionDate, setTransactionDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Operating");
  const [lines, setLines] = useState([
    { account: "", debit: "", credit: "" },
    { account: "", debit: "", credit: "" },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    const response = await apiRequest("/accounts");
    setAccounts(response.data);
  };

  const loadJournals = async () => {
    const response = await apiRequest("/accounting/journals");
    setJournals(response.data);
  };

  useEffect(() => {
    loadAccounts();
    loadJournals();
  }, []);

  const updateLine = (index, field, value) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setLines(updatedLines);
  };

  const addLine = () => {
    setLines([...lines, { account: "", debit: "", credit: "" }]);
  };

  const removeLine = (index) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isBalanced) {
      setError("Total debits must equal total credits before posting.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/accounting/journal/post", {
        method: "POST",
        body: JSON.stringify({
          transactionDate,
          description,
          category,
          lines: lines.map((line) => ({
            account: line.account,
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0),
          })),
        }),
      });

      setSuccess("Journal entry posted successfully.");
      await loadJournals();

      setTransactionDate("");
      setDescription("");
      setCategory("Operating");
      setLines([
        { account: "", debit: "", credit: "" },
        { account: "", debit: "", credit: "" },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    padding: "0.6rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #DADADA",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
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
    padding: "1.5rem",
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <h1 style={{ margin: "0 0 0.25rem 0", color: "#1A1A1A" }}>Journal Entry</h1>
      <p style={{ margin: "0 0 1.5rem 0", color: "#6B6B6B" }}>
        Record a new double-entry transaction.
      </p>

      {error && (
        <p
          style={{
            backgroundColor: "#FDEDED",
            color: "#B3261E",
            padding: "0.6rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          style={{
            backgroundColor: "#E6F7EC",
            color: "#1A7A3C",
            padding: "0.6rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={labelStyle}>Transaction Date</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 2, minWidth: "220px" }}>
            <label style={labelStyle}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 1, minWidth: "160px" }}>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="Operating">Operating</option>
              <option value="Investing">Investing</option>
              <option value="Financing">Financing</option>
            </select>
          </div>
        </div>

        <h3 style={{ margin: "0 0 0.75rem 0", color: "#1A1A1A", fontSize: "1rem" }}>Lines</h3>

        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #F0F0F0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAFAF7", textAlign: "left" }}>
                <th style={{ padding: "0.6rem 0.9rem", fontSize: "0.78rem", color: "#6B6B6B" }}>ACCOUNT</th>
                <th style={{ padding: "0.6rem 0.9rem", fontSize: "0.78rem", color: "#6B6B6B" }}>DEBIT</th>
                <th style={{ padding: "0.6rem 0.9rem", fontSize: "0.78rem", color: "#6B6B6B" }}>CREDIT</th>
                <th style={{ padding: "0.6rem 0.9rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} style={{ borderTop: "1px solid #F0F0F0" }}>
                  <td style={{ padding: "0.6rem 0.9rem" }}>
                    <select
                      value={line.account}
                      onChange={(e) => updateLine(index, "account", e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">-- Select account --</option>
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.accountCode} — {acc.accountName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "0.6rem 0.9rem" }}>
                    <input
                      type="number"
                      value={line.debit}
                      onChange={(e) => updateLine(index, "debit", e.target.value)}
                      min="0"
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: "0.6rem 0.9rem" }}>
                    <input
                      type="number"
                      value={line.credit}
                      onChange={(e) => updateLine(index, "credit", e.target.value)}
                      min="0"
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: "0.6rem 0.9rem" }}>
                    {lines.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#B3261E",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addLine}
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #DADADA",
            backgroundColor: "transparent",
            color: "#1A1A1A",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          + Add Line
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid #F0F0F0",
          }}
        >
          <div style={{ fontSize: "0.9rem" }}>
            <span style={{ color: "#6B6B6B" }}>Debit: </span>
            <span style={{ fontWeight: 600, color: "#1A1A1A" }}>{totalDebit.toLocaleString()}</span>
            <span style={{ color: "#6B6B6B", margin: "0 0.75rem" }}>|</span>
            <span style={{ color: "#6B6B6B" }}>Credit: </span>
            <span style={{ fontWeight: 600, color: "#1A1A1A" }}>{totalCredit.toLocaleString()}</span>
            <span style={{ margin: "0 0.75rem" }}>
              <span
                style={{
                  backgroundColor: isBalanced ? "#E6F7EC" : "#FDEDED",
                  color: isBalanced ? "#1A7A3C" : "#B3261E",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {isBalanced ? "Balanced ✓" : "Not Balanced"}
              </span>
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || !isBalanced}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: submitting || !isBalanced ? "#E5E5E5" : "#C6E21E",
              color: submitting || !isBalanced ? "#999" : "#1A1A1A",
              fontWeight: 600,
              cursor: submitting || !isBalanced ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Posting..." : "Post Journal Entry"}
          </button>
        </div>
      </form>

      <h3 style={{ margin: "0 0 0.75rem 0", color: "#1A1A1A" }}>Recent Journal Entries</h3>
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#FAFAF7", textAlign: "left" }}>
              <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>DATE</th>
              <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>DESCRIPTION</th>
              <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>CATEGORY</th>
              <th style={{ padding: "0.85rem 1.25rem", fontSize: "0.8rem", color: "#6B6B6B" }}>LINES</th>
            </tr>
          </thead>
          <tbody>
            {journals.slice(0, 7).map((journal) => (
              <tr key={journal._id} style={{ borderTop: "1px solid #F0F0F0" }}>
                <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A", whiteSpace: "nowrap" }}>
                  {new Date(journal.transactionDate).toLocaleDateString()}
                </td>
                <td style={{ padding: "0.85rem 1.25rem", color: "#1A1A1A" }}>
                  {journal.description}
                  {journal.isReversal && (
                    <span style={{ color: "#999", fontSize: "0.8rem" }}> (Reversal)</span>
                  )}
                </td>
                <td style={{ padding: "0.85rem 1.25rem" }}>
                  <span
                    style={{
                      backgroundColor: "#F0F0F0",
                      color: "#1A1A1A",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "12px",
                      fontSize: "0.78rem",
                    }}
                  >
                    {journal.category}
                  </span>
                </td>
                <td style={{ padding: "0.85rem 1.25rem" }}>
                  {journal.lines.map((line, i) => (
                    <div key={i} style={{ fontSize: "0.85rem", color: "#444" }}>
                      {line.account.accountCode} — {line.account.accountName}:{" "}
                      <span style={{ fontWeight: 600 }}>
                        {line.debit > 0 ? `Dr ${line.debit.toLocaleString()}` : `Cr ${line.credit.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default JournalEntry;