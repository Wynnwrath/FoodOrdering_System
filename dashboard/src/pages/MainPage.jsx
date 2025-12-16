import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; // Adjust path if Navbar is in a different location

export default function MainPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      
      <Navbar />
      
      <main className="w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}