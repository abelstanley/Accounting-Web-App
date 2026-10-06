import { useEffect, useState } from "react";
import { apiRequest } from "../api/apiClient";

function Ledger() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
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
        const response = await apiRequest(`/reports/general-ledger/${selectedAccount}`);
        setEntries(response.data.entries);
        setAccountInfo(response.data.account);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLedger();
  }, [selectedAccount]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Ledger</h1>

      <div>
        <label>Select Account</label><br />
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          <option value="">-- Choose an account --</option>
          {accounts.map((acc) => (
            <option key={acc._id} value={acc._id}>
              {acc.accountCode} — {acc.accountName}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading ledger entries...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {accountInfo && (
        <>
          <h3>{accountInfo.accountCode} — {accountInfo.accountName} ({accountInfo.accountType})</h3>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{new Date(entry.transactionDate).toLocaleDateString()}</td>
                  <td>{entry.description}</td>
                  <td>{entry.debit > 0 ? entry.debit : ""}</td>
                  <td>{entry.credit > 0 ? entry.credit : ""}</td>
                  <td>{entry.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {entries.length === 0 && <p>No transactions found for this account.</p>}
        </>
      )}
    </div>
  );
}

export default Ledger;