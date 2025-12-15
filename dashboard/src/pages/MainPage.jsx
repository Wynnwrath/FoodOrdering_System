import { Outlet } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";

export default function MainPage() {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-900">
      <NavBar />

      {/* flex-1 makes this div take up all remaining vertical space */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
