import { Link } from "react-router-dom";
import Button from "../../components/button/Button";
import ROUTES from "../../constants/routes";
import { APP_NAME } from "../../constants/appConstants";

/**
 * Public marketing page. It talks to no API — everything here is static copy,
 * so it loads instantly and works whether or not the backend is running.
 */

const FEATURES = [
  {
    key: "members",
    title: "The network, mapped",
    text: "Sponsors, depth and direct-referral counts stay in step because the closure table is maintained on every sign-up.",
  },
  {
    key: "catalog",
    title: "Packages and products",
    text: "Set prices and PV once. Entry packages activate accounts; qualifying packages keep members eligible each month.",
  },
  {
    key: "orders",
    title: "Orders through to payment",
    text: "Track an order from pending payment to paid, review the proof a member uploaded, then approve or send it back.",
  },
  {
    key: "commissions",
    title: "Rules, not spreadsheets",
    text: "Define commission rules per level with a minimum PV and an optional ceiling, and see what each rule paid out.",
  },
  {
    key: "wallet",
    title: "An append-only ledger",
    text: "Every credit and debit records the balance before and after, so a wallet total can always be traced back.",
  },
  {
    key: "compliance",
    title: "KYC you can act on",
    text: "Review identity documents in one queue, approve them, or reject with a reason the member actually receives.",
  },
];

const LandingPage = () => (
  <div className="landing">
    <header className="landing__nav">
      <div className="landing__nav-inner">
        <Link to={ROUTES.LANDING} className="landing__brand">
          <span className="sidebar__logo" aria-hidden="true">
            N
          </span>
          {APP_NAME}
        </Link>

        <nav className="landing__links" aria-label="Sections">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="u-flex u-gap-2">
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="sm">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </header>

    <section className="landing__hero">
      <div className="landing__section-inner">
        <span className="landing__eyebrow">Admin console</span>
        <h1 className="landing__title">
          Run the whole network from one screen — members, orders, commissions and payouts.
        </h1>
        <p className="landing__lead">
          Approve a payment, settle a commission, release a withdrawal. Everything the back
          office does, in one place, backed by a ledger you can audit.
        </p>

        <div className="landing__cta">
          <Link to={ROUTES.LOGIN}>
            <Button variant="primary" size="lg">
              Sign in to the console
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="secondary" size="lg">
              Create an account
            </Button>
          </Link>
        </div>

        {/* Signature element: the hero closes on the domain itself. */}
        <div className="ledger-strip">
          <div className="ledger-strip__cell">
            <p className="ledger-strip__key">Network</p>
            <p className="ledger-strip__val">Members &amp; sponsors</p>
          </div>
          <div className="ledger-strip__cell">
            <p className="ledger-strip__key">Catalog</p>
            <p className="ledger-strip__val">Packages &amp; products</p>
          </div>
          <div className="ledger-strip__cell">
            <p className="ledger-strip__key">Earnings</p>
            <p className="ledger-strip__val">Rules &amp; wallet</p>
          </div>
          <div className="ledger-strip__cell">
            <p className="ledger-strip__key">Compliance</p>
            <p className="ledger-strip__val">KYC &amp; payouts</p>
          </div>
        </div>
      </div>
    </section>

    <section className="landing__section" id="features">
      <div className="landing__section-inner">
        <h2 className="landing__section-title">What the console covers</h2>
        <p className="landing__section-lead">
          Every module below maps to a real endpoint in the API — nothing is a mock-up.
        </p>

        <div className="u-grid u-grid-3 u-mt-5">
          {FEATURES.map((feature) => (
            <article className="feature" key={feature.key}>
              <p className="feature__key">{feature.key}</p>
              <h3 className="feature__title">{feature.title}</h3>
              <p className="feature__text">{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="landing__section landing__section--muted" id="about">
      <div className="landing__section-inner">
        <h2 className="landing__section-title">About</h2>
        <p className="landing__section-lead">
          This console is the administrative front end for a network marketing platform. It
          reads and writes through a REST API built on Express and Sequelize, so what you see
          here is exactly what is in the database — no separate copy, no nightly sync.
        </p>
        <p className="landing__section-lead">
          Access is limited to staff accounts. Sessions are held with a JSON Web Token that
          expires after seven days, and every request carries it.
        </p>
      </div>
    </section>

    <section className="landing__section" id="contact">
      <div className="landing__section-inner">
        <h2 className="landing__section-title">Contact</h2>
        <p className="landing__section-lead">
          Locked out, or spotted something that looks wrong in the numbers? Reach the platform
          team and include the record id you were looking at.
        </p>

        <div className="u-grid u-grid-3 u-mt-5">
          <article className="feature">
            <p className="feature__key">support</p>
            <h3 className="feature__title">Account access</h3>
            <p className="feature__text">support@example.com</p>
          </article>
          <article className="feature">
            <p className="feature__key">finance</p>
            <h3 className="feature__title">Payouts and commissions</h3>
            <p className="feature__text">finance@example.com</p>
          </article>
          <article className="feature">
            <p className="feature__key">phone</p>
            <h3 className="feature__title">Weekdays, 9am–5pm</h3>
            <p className="feature__text">+251 11 000 0000</p>
          </article>
        </div>
      </div>
    </section>

    <footer className="landing__footer">
      © {new Date().getFullYear()} {APP_NAME}. Staff access only.
    </footer>
  </div>
);

export default LandingPage;
