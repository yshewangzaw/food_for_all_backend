import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/card/Card";
import Input from "../../components/input/Input";
import Textarea from "../../components/input/Textarea";
import Button from "../../components/button/Button";
import StatusBadge from "../../components/statusBadge/StatusBadge";
import DetailList from "../../components/layout/DetailList";
import PageLoader from "../../components/loading/PageLoader";
import EmptyState from "../../components/emptyState/EmptyState";
import Table from "../../components/table/Table";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import userService from "../../services/userService";
import commissionService from "../../services/commissionService";
import walletTransactionService from "../../services/walletTransactionService";
import withdrawalRequestService from "../../services/withdrawalRequestService";
import ROUTES from "../../constants/routes";
import {
  requiredText,
  optionalText,
  emailRule,
  phoneRule,
  optionalUrl,
} from "../../utils/validators";
import {
  formatMoney,
  formatDate,
  formatDateTime,
  humanize,
  initialsOf,
} from "../../utils/helpers";

const profileSchema = yup.object({
  fullName: requiredText("Full name"),
  email: emailRule,
  phone: phoneRule,
  city: optionalText("City", 80),
  address: optionalText("Address", 500),
  avatarUrl: optionalUrl("Avatar URL"),
});

/**
 * The backend has no /users/me, so we read the signed-in user's row by the id
 * that came back from POST /api/auth/login.
 * TODO(backend): add GET /api/auth/me and swap the first call below for it.
 */
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);

  const profile = useFetch(() => userService.getProfile(userId), [userId]);
  const commissions = useFetch(
    () => (userId ? commissionService.getByUserId(userId) : Promise.resolve([])),
    [userId],
    []
  );
  const wallet = useFetch(
    () => (userId ? walletTransactionService.getByUserId(userId) : Promise.resolve([])),
    [userId],
    []
  );
  const withdrawals = useFetch(
    () => (userId ? withdrawalRequestService.getByUserId(userId) : Promise.resolve([])),
    [userId],
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    values: {
      fullName: profile.data?.fullName || "",
      email: profile.data?.email || "",
      phone: profile.data?.phone || "",
      city: profile.data?.city || "",
      address: profile.data?.address || "",
      avatarUrl: profile.data?.avatarUrl || "",
    },
    mode: "onTouched",
  });

  if (!userId) {
    return (
      <Card>
        <EmptyState
          icon="?"
          title="No account loaded"
          message="Sign out and back in to reload your profile."
        />
      </Card>
    );
  }

  if (profile.isLoading) {
    return <PageLoader message="Loading your profile" />;
  }

  const record = profile.data;

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile(userId, values);
      updateUser({ fullName: updated?.fullName || values.fullName });
      toast.success("Profile updated.");
      profile.reload();
    } catch (error) {
      // Toast already shown by the interceptor.
    } finally {
      setIsSaving(false);
    }
  };

  const commissionColumns = [
    { key: "id", label: "ID", render: (value) => <span className="u-mono">#{value}</span> },
    { key: "commissionType", label: "Type", render: (value) => humanize(value) },
    {
      key: "commissionAmount",
      label: "Amount",
      align: "right",
      render: (value) => <span className="u-mono">{formatMoney(value)}</span>,
    },
    { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
    { key: "createdAt", label: "Earned", render: (value) => formatDate(value) },
  ];

  const walletColumns = [
    { key: "id", label: "ID", render: (value) => <span className="u-mono">#{value}</span> },
    { key: "transactionType", label: "Type", render: (value) => humanize(value) },
    { key: "direction", label: "Direction", render: (value) => <StatusBadge value={value} /> },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (value) => <span className="u-mono">{formatMoney(value)}</span>,
    },
    {
      key: "balanceAfter",
      label: "Balance after",
      align: "right",
      render: (value) => <span className="u-mono">{formatMoney(value)}</span>,
    },
    { key: "createdAt", label: "Posted", render: (value) => formatDateTime(value) },
  ];

  const withdrawalColumns = [
    { key: "id", label: "ID", render: (value) => <span className="u-mono">#{value}</span> },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (value) => <span className="u-mono">{formatMoney(value)}</span>,
    },
    { key: "accountNumber", label: "Account" },
    { key: "status", label: "Status", render: (value) => <StatusBadge value={value} /> },
    { key: "createdAt", label: "Requested", render: (value) => formatDate(value) },
  ];

  const TABS = [
    { key: "details", label: "Details" },
    { key: "edit", label: "Edit profile" },
    { key: "commissions", label: `Commissions (${commissions.data?.length || 0})` },
    { key: "wallet", label: `Wallet (${wallet.data?.length || 0})` },
    { key: "withdrawals", label: `Withdrawals (${withdrawals.data?.length || 0})` },
  ];

  return (
    <>
      <PageHeader
        title="Your profile"
        description="Your account details, earnings and payout history."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Profile" }]}
      />

      <Card className="u-mb-4">
        <div className="profile-head">
          <span className="avatar avatar--lg" aria-hidden="true">
            {initialsOf(record?.fullName)}
          </span>
          <div className="u-grow">
            <h2>{record?.fullName}</h2>
            <p className="u-muted u-small">
              {record?.email} · {record?.phone}
            </p>
            <div className="u-flex u-gap-2 u-mt-2 u-wrap">
              <StatusBadge value={record?.role} />
              <StatusBadge value={record?.status} />
              <StatusBadge value={record?.kycStatus} />
            </div>
          </div>
          <div className="u-right">
            <p className="stat__label">Wallet balance</p>
            <p className="stat__value">{formatMoney(record?.wallet)}</p>
          </div>
        </div>
      </Card>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab${activeTab === tab.key ? " tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <Card title="Account details">
          <DetailList
            items={[
              { label: "Full name", value: record?.fullName },
              { label: "Email", value: record?.email },
              { label: "Phone", value: record?.phone },
              { label: "Referral code", value: record?.referralCode },
              { label: "Role", value: <StatusBadge value={record?.role} /> },
              { label: "Status", value: <StatusBadge value={record?.status} /> },
              { label: "KYC status", value: <StatusBadge value={record?.kycStatus} /> },
              { label: "Sponsor id", value: record?.sponsorId ? `#${record.sponsorId}` : "No sponsor" },
              { label: "Depth in tree", value: record?.depth },
              { label: "Direct referrals", value: record?.directReferralCount },
              { label: "City", value: record?.city },
              { label: "Joined", value: formatDateTime(record?.createdAt) },
              { label: "Address", value: record?.address, wide: true },
            ]}
          />
        </Card>
      )}

      {activeTab === "edit" && (
        <Card
          title="Edit your profile"
          subtitle="Changes go straight to PUT /api/users/:id."
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form__grid">
              <Input
                label="Full name"
                name="fullName"
                required
                error={errors.fullName?.message}
                {...register("fullName")}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                required
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                required
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Input label="City" name="city" error={errors.city?.message} {...register("city")} />
              <Input
                label="Avatar URL"
                name="avatarUrl"
                wide
                error={errors.avatarUrl?.message}
                {...register("avatarUrl")}
              />
              <Textarea
                label="Address"
                name="address"
                error={errors.address?.message}
                {...register("address")}
              />
            </div>

            <div className="form__actions">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === "commissions" && (
        <Card title="Your commissions" flush>
          {commissions.isLoading ? (
            <PageLoader message="Loading commissions" />
          ) : !commissions.data?.length ? (
            <EmptyState
              icon="◈"
              title="No commissions yet"
              message="Earnings appear here once a downline order is paid and processed."
            />
          ) : (
            <Table columns={commissionColumns} rows={commissions.data} />
          )}
        </Card>
      )}

      {activeTab === "wallet" && (
        <Card title="Your wallet ledger" flush>
          {wallet.isLoading ? (
            <PageLoader message="Loading ledger" />
          ) : !wallet.data?.length ? (
            <EmptyState
              icon="≡"
              title="No ledger entries yet"
              message="Every credit and debit against your wallet will be listed here."
            />
          ) : (
            <Table columns={walletColumns} rows={wallet.data} />
          )}
        </Card>
      )}

      {activeTab === "withdrawals" && (
        <Card title="Your withdrawal requests" flush>
          {withdrawals.isLoading ? (
            <PageLoader message="Loading withdrawals" />
          ) : !withdrawals.data?.length ? (
            <EmptyState
              icon="↧"
              title="No withdrawals yet"
              message="Payout requests you make will be tracked here."
            />
          ) : (
            <Table columns={withdrawalColumns} rows={withdrawals.data} />
          )}
        </Card>
      )}
    </>
  );
};

export default ProfilePage;
