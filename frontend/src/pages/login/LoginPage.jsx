import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import useAuth from "../../hooks/useAuth";
import { loginSchema } from "../../utils/validators";
import ROUTES from "../../constants/routes";
import { isFakeAuthEnabled, FAKE_USER } from "../../services/fakeAuth";
import storage from "../../utils/storage";

/** POST /api/auth/login — backend routes/authRoutes.js */
const LoginPage = () => {
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const isTestMode = isFakeAuthEnabled();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    // In test mode the fields are prefilled so you can sign straight in.
    defaultValues: isTestMode
      ? { email: FAKE_USER.email, password: "test-password" }
      : { email: "", password: "" },
    mode: "onTouched",
  });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    reset: resetForgotForm,
    formState: { errors: forgotErrors },
  } = useForm({
    defaultValues: { identifier: "" },
    mode: "onSubmit",
  });

  // PrivateRoute stores where the user was headed before being bounced here.
  const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await login(values);
      if (storage.getToken()) {
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      // The axios interceptor already showed the message.
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Test mode only: straight to the dashboard, no form, no validation. */
  const skipSignIn = async () => {
    setIsSubmitting(true);
    try {
      await login({ email: FAKE_USER.email, password: "skipped" });
      if (storage.getToken()) {
        navigate(redirectTo, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async ({ identifier }) => {
    setForgotSubmitting(true);
    try {
      const result = await forgotPassword(identifier);
      setForgotMessage(
        result?.message ||
          "If the account exists, a reset verification has been sent to the registered contact method."
      );
      resetForgotForm();
      setShowForgotPassword(false);
      if (identifier) {
        navigate(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(identifier)}`);
      }
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth__title">Sign in</h1>
      <p className="auth__sub">
        {isTestMode
          ? "Test mode is on. Any email and password will get you in."
          : "Use the email and password tied to your staff account."}
      </p>

      {isTestMode && (
        <div className="notice u-mb-4">
          <strong>Test mode.</strong> Sign-in is faked — no request reaches the API and you
          arrive as an admin. Your data pages will still call the real backend, so they will
          show error states while it is offline. Set <code>VITE_USE_FAKE_AUTH=false</code> in
          .env to use real sign-in.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" variant="primary" size="lg" block isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      {isTestMode && (
        <div className="u-mt-4">
          <Button
            variant="secondary"
            size="lg"
            block
            onClick={skipSignIn}
            disabled={isSubmitting}
          >
            Skip sign-in and open the dashboard
          </Button>
        </div>
      )}

      <p className="auth__foot">
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setForgotMessage("");
            setShowForgotPassword((prev) => !prev);
          }}
          style={{ background: "none", border: 0, padding: 0, color: "#2563eb", cursor: "pointer" }}
        >
          Forgot password?
        </button>
      </p>

      {showForgotPassword && (
        <form onSubmit={handleForgotSubmit(handleForgotPassword)} className="u-mt-4">
          <Input
            label="Email or phone"
            name="identifier"
            type="text"
            required
            autoComplete="off"
            placeholder="you@company.com or +2519..."
            hint="We will send the reset verification to your registered email or phone number."
            error={forgotErrors.identifier?.message}
            {...registerForgot("identifier")}
          />
          <Button type="submit" variant="secondary" size="lg" block isLoading={forgotSubmitting}>
            Send reset verification
          </Button>
        </form>
      )}

      {forgotMessage && <p className="auth__sub u-mt-3">{forgotMessage}</p>}

      <p className="auth__foot">
        No account yet? <Link to={ROUTES.REGISTER}>Create one</Link>
      </p>
      <p className="auth__foot">
        <Link to={ROUTES.LANDING}>Back to the home page</Link>
      </p>
    </>
  );
};

export default LoginPage;
