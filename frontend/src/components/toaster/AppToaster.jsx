import { Toaster } from "react-hot-toast";

/**
 * Mounted once in App.jsx. Anywhere else, just call
 *   import toast from "react-hot-toast";  toast.success("Saved.");
 */
const AppToaster = () => (
  <Toaster
    position="top-right"
    gutter={10}
    toastOptions={{
      duration: 4000,
      style: {
        background: "#132034",
        color: "#fff",
        fontSize: "13.5px",
        borderRadius: "8px",
        padding: "10px 14px",
        maxWidth: "420px",
      },
      success: { iconTheme: { primary: "#0e7c6b", secondary: "#fff" } },
      error: { duration: 5500, iconTheme: { primary: "#e0605a", secondary: "#fff" } },
    }}
  />
);

export default AppToaster;
