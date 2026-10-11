import * as React from "react";
import { api } from "./api";
const SiteContext = React.createContext(null);
function useSite() {
  return React.useContext(SiteContext);
}
function SiteProvider({ children: r }) {
  const [f, h] = React.useState(null),
    [y, p] = React.useState(""),
    [b, C] = React.useState(0);
  return (
    React.useEffect(() => {
      const D = new AbortController();
      return (
        p(""),
        Promise.all([
          api("/site", {
            signal: D.signal,
          }),
          api("/projects", {
            signal: D.signal,
          }),
        ])
          .then(([w, U]) =>
            h({
              ...w,
              projects: U,
            }),
          )
          .catch((w) => {
            w.name !== "AbortError" && p(w.message);
          }),
        () => D.abort()
      );
    }, [b]),
    y ? (
      <main className={"state-screen"}>
        <span className={"eyebrow"}>{"PORTFOLIO"}</span>
        <h1>{"We couldn’t load the portfolio."}</h1>
        <p role={"alert"}>{y}</p>
        <button className={"button primary"} onClick={() => C((D) => D + 1)}>
          {"Try again"}
        </button>
        <small>
          {
            "If you’re setting up this project, start the API and run the seed script."
          }
        </small>
      </main>
    ) : f ? (
      <SiteContext.Provider value={f}>{r}</SiteContext.Provider>
    ) : (
      <main className={"state-screen"} aria-busy={"true"}>
        <div className={"loading-mark"}>
          {"md"}
          <span>{"."}</span>
        </div>
        <p role={"status"}>{"Loading the portfolio…"}</p>
      </main>
    )
  );
} /**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
export { SiteContext, useSite, SiteProvider };
