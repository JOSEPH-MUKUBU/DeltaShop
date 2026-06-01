import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="pt-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

