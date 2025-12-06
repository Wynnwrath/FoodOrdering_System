import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import CashierPage from "./pages/CashierPage";
import WaiterPage from "./pages/WaiterPage";
import KitchenPage from "./pages/KitchenPage";
import ManagerPage from "./pages/ManagerPage";
import LoginPage from "./pages/LoginPage";
import RolePage from "./pages/RolePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<MainPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* Main layout */}
        <Route path="/main" element={<MainPage />}>
          <Route path="cashier" element={<CashierPage />} />
          <Route path="waiter" element={<WaiterPage />} />
          <Route path="kitchen" element={<KitchenPage />} />
          <Route path="manager" element={<ManagerPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
