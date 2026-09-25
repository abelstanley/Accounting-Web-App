import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, backgroundColor: "#FAFAF7", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;