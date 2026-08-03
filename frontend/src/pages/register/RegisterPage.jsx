import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import useAuth from "../../hooks/useAuth";
import { registerSchema } from "../../utils/validators";
import ROUTES from "../../constants/routes";

/**
 * POST /api/auth/register — backend routes/authRoutes.js
 *
 * The backend accepts fullName, email, phone, password and an optional
 * referralCode (it looks the sponsor up by that code and grows the network
 * tree). It does NOT return a token, so we send the new user to Sign in.
 */
const RegisterPage = () => {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // confirmPassword is a client-side check only — the API never sees it.
      const { confirmPassword, ...payload } = values;
      await registerAccount(payload);
      navigate(ROUTES.LOGIN, { replace: true, state: { from: { pathname: ROUTES.LOGIN } } });
    } catch (error) {
      // The interceptor already handles the auth-specific error message.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth__title">Create an account</h1>
      <p className="auth__sub">
        Have a sponsor&apos;s referral code? Add it and you&apos;ll be placed under them.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          name="fullName"
          required
          autoComplete="name"
          placeholder="Amira Bekele"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

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
          label="Phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+251912345678"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          hint="At least 6 characters."
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Input
          label="Referral code"
          name="referralCode"
          placeholder="Optional"
          hint="Leave blank to join without a sponsor."
          error={errors.referralCode?.message}
          {...register("referralCode")}
        />

        <Button type="submit" variant="primary" size="lg" block isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="auth__foot">
        Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
      </p>
    </>
  );
};

export default RegisterPage;
