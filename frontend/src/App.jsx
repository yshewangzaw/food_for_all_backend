import AppRoutes from "./routes/appRoutes";
import AppToaster from "./components/toaster/AppToaster";

/**
 * The whole app: the route table plus the one toast host.
 * The router and auth provider are mounted in main.jsx.
 */
const App = () => (
  <>
    <AppRoutes />
    <AppToaster />
  </>
);

export default App;
