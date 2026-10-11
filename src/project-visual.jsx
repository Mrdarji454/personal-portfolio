function ProjectVisual({ theme: o, large: e = !1 }) {
  return (
    <div
      className={`project-visual ${o} ${e ? "large" : ""}`}
      role={"img"}
      aria-label={`${o === "erp" ? "School dashboard" : o === "market" ? "Service marketplace" : "Weather interface"} concept illustration, not an actual project screenshot`}
    >
      {o === "erp" ? (
        <div className={"erp-window"}>
          <aside>
            <b>
              <span className={"mini-logo"}>{"s"}</span>
              {" school"}
              <span className={"muted"}>{"space"}</span>
            </b>
            <small>{"WORKSPACE"}</small>
            {[
              "Overview",
              "Students",
              "Teachers",
              "Attendance",
              "Timetable",
            ].map((r, i) => (
              <div key={r} className={i === 0 ? "selected" : ""}>
                <span className={"sidebar-icon"}>
                  {["◫", "♧", "◈", "▤", "▦"][i]}
                </span>
                {r}
              </div>
            ))}
            <div className={"sidebar-bottom"}>{"School administration"}</div>
          </aside>
          <div className={"erp-main"}>
            <div className={"mock-top"}>
              {"Overview"}{" "}
              <span>
                {"Admin workspace "}
                <i>{"MD"}</i>
              </span>
            </div>
            <h4>{"A clearer school day."}</h4>
            <p>{"Your school, all in one place."}</p>
            <div className={"mock-stats"}>
              {["Students", "Teachers", "Attendance"].map((r) => (
                <div key={r}>
                  <small>{r}</small>
                  <strong>{"—"}</strong>
                  <span>{"Workspace overview"}</span>
                </div>
              ))}
            </div>
            <div className={"mock-chart"}>
              <b>{"Attendance overview"}</b>
              <div className={"bars"}>
                {[43, 65, 51, 78, 62, 88, 72, 90, 68, 83, 78, 94].map(
                  (r, i) => (
                    <i
                      key={i}
                      style={{
                        height: r + "%",
                      }}
                    />
                  ),
                )}
              </div>
              <small>{"Illustrative dashboard layout"}</small>
            </div>
            <div className={"mock-news"}>
              <span className={"news-dot"} />
              <div>
                <b>{"School updates"}</b>
                <small>{"A shared space for news and notices"}</small>
              </div>
              <span>{"↗"}</span>
            </div>
          </div>
        </div>
      ) : o === "market" ? (
        <div className={"market-window"}>
          <div className={"market-top"}>
            <b>
              <span>{"✳"}</span>
              {" ShramSetu"}
            </b>
            <span>{"Services   ·   Our community"}</span>
            <i>{"Explore services ↗"}</i>
          </div>
          <div className={"market-content"}>
            <span className={"mock-eyebrow"}>
              {"LOCAL PEOPLE. SHARED POSSIBILITIES."}
            </span>
            <h4>
              {"Good work."}
              <br />
              {"Stronger communities."}
            </h4>
            <p>{"A cooperative approach to everyday services."}</p>
            <div className={"mock-search"}>
              {"What can we help you with? "}
              <span>{"↗"}</span>
            </div>
            <div className={"service-tiles"}>
              <div>
                <span>{"⌁"}</span>
                {"Home services"}
              </div>
              <div>
                <span>{"⚒"}</span>
                {"Skilled work"}
              </div>
              <div>
                <span>{"✿"}</span>
                {"Community care"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={"weather-window"}>
          <div className={"weather-top"}>
            <b>{"weather /"}</b>
            <span>{"React concept"}</span>
          </div>
          <div className={"sun-art"}>
            <span />
            <i />
            <i />
            <i />
          </div>
          <h4>
            {"A little clarity."}
            <br />
            {"Whatever the sky."}
          </h4>
          <p>{"A frontend learning project"}</p>
          <div className={"weather-lines"}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
      <span className={"concept-label"}>
        {"INTERFACE CONCEPT · NOT A SCREENSHOT"}
      </span>
    </div>
  );
}
export { ProjectVisual };
