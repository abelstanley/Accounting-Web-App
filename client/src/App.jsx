import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import JournalEntry from "./pages/journalEntry";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Ledger from "./pages/Ledger";
import Reports from "./pages/Reports";

function ComingSoon({ title }) {
  return <div style={{ padding: "2rem" }}><h1>{title}</h1><p>Coming soon.</p></div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Layout><ChartOfAccounts /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Layout><JournalEntry /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ledger"
          element={
            <ProtectedRoute>
              <Layout><Ledger /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;