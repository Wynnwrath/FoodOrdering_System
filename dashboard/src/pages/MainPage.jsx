import { Outlet } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";

export default function MainPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">   
      <NavBar />

      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

    </div>
  );
}
