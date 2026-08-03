import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../button/Button";
import ConfirmationModal from "../confirmationModal/ConfirmationModal";
import useAuth from "../../hooks/useAuth";
import ROUTES from "../../constants/routes";
import { initialsOf } from "../../utils/helpers";

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    setIsConfirmOpen(false);
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="topbar">
      <div className="u-flex u-items-center u-gap-3">
        <button
          type="button"
          className="topbar__burger"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <span className="u-small u-muted">Signed in as {user?.role || "user"}</span>
      </div>

      <div className="u-flex u-items-center u-gap-3">
        <Link to={ROUTES.NOTIFICATIONS} className="icon-btn" title="Notifications">
          ◔
        </Link>

        <Link to={ROUTES.PROFILE} className="topbar__user" title="Your profile">
          <span className="avatar" aria-hidden="true">
            {initialsOf(user?.fullName)}
          </span>
          <span className="u-small u-bold">{user?.fullName || "Account"}</span>
        </Link>

        <Button variant="secondary" size="sm" onClick={() => setIsConfirmOpen(true)}>
          Sign out
        </Button>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        tone="info"
        title="Sign out?"
        message="You'll need to enter your email and password again to get back in."
        confirmLabel="Sign out"
        onConfirm={handleSignOut}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </header>
  );
};

export default Topbar;
