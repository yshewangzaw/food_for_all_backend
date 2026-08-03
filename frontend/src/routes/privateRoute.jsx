import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ROUTES from "../constants/routes";

/**
 * Gate for every page under /app. Anyone without a token is sent to Login,
 * and we remember where they were headed so they land there after signing in.
 *
 * Optional role gate:  <PrivateRoute roles={["ADMIN"]}>...</PrivateRoute>
 */
const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (roles && roles.length && !roles.includes(user?.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default PrivateRoute;
