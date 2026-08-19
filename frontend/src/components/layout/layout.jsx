import "./layout.css";
import Sidebar from "../sidebar/sidebar";
import Navbar from "../navbar/navbar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Navbar />

        <div className="content">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default Layout;