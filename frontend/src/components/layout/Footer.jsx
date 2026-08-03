import { APP_NAME } from "../../constants/appConstants";

const Footer = () => (
  <footer className="footer">
    <span>
      © {new Date().getFullYear()} {APP_NAME}
    </span>
    <span className="u-faint">
      Connected to {import.meta.env.VITE_API_BASE_URL || "no API URL configured"}
    </span>
  </footer>
);

export default Footer;
