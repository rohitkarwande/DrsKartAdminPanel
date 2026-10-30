import { Routes, Route, Navigate } from "react-router-dom";
import { AdminProtectedRoute } from "../components/auth/AdminProtectedRoute";
import { AdminSecretPortal } from "../pages/admin/AdminSecretPortal";
import { AdminLayout } from "../pages/admin/AdminLayout";
import { AdminOverview } from "../pages/admin/AdminOverview";
import { KycApplications } from "../pages/admin/KycApplications";
import { DealFunnel } from "../pages/admin/DealFunnel";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminSecurity } from "../pages/admin/AdminSecurity";
import { HeroBanners } from "../pages/admin/HeroBanners";
import { AdminPromotions } from "../pages/admin/AdminPromotions";
import { AdminTickets } from "../pages/admin/AdminTickets";
import { AdminReports } from "../pages/admin/AdminReports";
import { AdminServices } from "../pages/admin/AdminServices";

export function AppRoutes() {
  return (
    <Routes>
      {/* ── 2FA ADMIN GATEWAY & LOGIN ── */}
      <Route path="/secret-admin-portal" element={<AdminSecretPortal />} />
      <Route path="/login" element={<AdminSecretPortal />} />

      {/* ── PROTECTED ADMIN ROUTES ── */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="banners" element={<HeroBanners />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="kyc" element={<KycApplications />} />
          <Route path="deals" element={<DealFunnel />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="services" element={<AdminServices />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
