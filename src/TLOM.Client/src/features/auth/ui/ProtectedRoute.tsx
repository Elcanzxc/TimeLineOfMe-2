import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    // Редирект на логин, если не авторизован, с сохранением текущего URL для возврата
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force onboarding if profile is incomplete
  if (user && !user.isProfileCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent accessing onboarding if profile is already complete
  if (user && user.isProfileCompleted && location.pathname === "/onboarding") {
    return <Navigate to="/feed" replace />;
  }

  // Если авторизован, рендерим дочерние маршруты
  return <Outlet />;
}
