import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import ROUTES from "../../constants/routes";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endpoints";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { email: searchParams.get("email") || "", token: searchParams.get("token") || "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        email: values.email,
        token: values.token,
        newPassword: values.newPassword,
      });
      setMessage(response.data?.message || "Password reset successfully.");
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 1200);
    } catch (error) {
      setMessage(error?.message || "Unable to reset password right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth__title">Reset password</h1>
      <p className="auth__sub">Enter the code you received and choose a new password.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />

        <Input
          label="Reset code"
          name="token"
          type="text"
          required
          placeholder="Paste the code you received"
          error={errors.token?.message}
          {...register("token", { required: "Reset code is required" })}
        />

        <Input
          label="New password"
          name="newPassword"
          type="password"
          required
          placeholder="Enter a new password"
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          })}
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === watch("newPassword") || "Passwords do not match",
          })}
        />

        <Button type="submit" variant="primary" size="lg" block isLoading={isSubmitting}>
          Save new password
        </Button>
      </form>

      {message && <p className="auth__sub u-mt-3">{message}</p>}

      <p className="auth__foot">
        <Link to={ROUTES.LOGIN}>Back to sign in</Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
