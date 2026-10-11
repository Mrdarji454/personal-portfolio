import React, { Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Outlet,
  Link,
} from "react-router-dom";
import { SiteProvider } from "./site";
import { Nav, Footer } from "./ui";
import "./styles.css";
import "./upgrade.css";
import "./responsive.css";
import { ThemeProvider } from "./theme";
const page = (name) =>
  lazy(() => import("./pages/PublicPages").then((m) => ({ default: m[name] })));
const Home = page("Home"),
  About = page("About"),
  Projects = page("Projects"),
  Contact = page("Contact"),
  Resume = page("Resume"),
  CaseStudy = page("CaseStudy");
const Admin = lazy(() => import("./pages/Admin"));
function Layout() {
  return (
    <SiteProvider>
      <Nav />
      <div className="public-layout">
        <Outlet />
      </div>
      <Footer />
    </SiteProvider>
  );
}
function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <Suspense
      fallback={
        <div className="state-screen" role="status">
          Loading page…
        </div>
      }
    >
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<CaseStudy />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="*"
            element={
              <main id="main" className="not-found">
                <h1>Page not found.</h1>
                <Link to="/">Back to portfolio ↗</Link>
              </main>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider><App /></ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
