import { isFakeAuthEnabled } from "../../services/fakeAuth";

/**
 * A strip across the top of every page while VITE_USE_FAKE_AUTH=true, so a
 * faked session can never be mistaken for a real one.
 *
 * Renders nothing when the flag is off, which is the case for any real build.
 */
const TestModeBanner = () => {
  if (!isFakeAuthEnabled()) return null;

  return (
    <div className="test-banner" role="status">
      <strong>Test mode</strong>
      <span>
        Sign-in is faked (VITE_USE_FAKE_AUTH=true). Data still comes from the real API.
      </span>
    </div>
  );
};

export default TestModeBanner;
