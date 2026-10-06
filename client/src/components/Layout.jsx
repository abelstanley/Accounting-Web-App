import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, backgroundColor: "#FAFAF7", minHeight: "100vh" }}>
        <Header />
        {children}
      </div>
    </div>
  );
}

export default Layout;