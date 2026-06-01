import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderPage } from "./pages/OrderPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminSlidersPage } from "./pages/AdminSlidersPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { AdminTrendingProductsPage } from "./pages/AdminTrendingProductsPage";
import { AdminNewsletterPage } from "./pages/AdminNewsletterPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:idOrSlug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="sliders" element={<AdminSlidersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="trending" element={<AdminTrendingProductsPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
