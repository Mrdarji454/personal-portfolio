let csrfToken = "";
async function api(
  r,
  { method: f = "GET", body: h, headers: y = {}, signal: p } = {},
) {
  if (f !== "GET" && !csrfToken) {
    const w = await fetch("/api/csrf", {
        credentials: "include",
      }),
      U = await w.json();
    if (!w.ok)
      throw new Error(U.error || "Could not initialize a secure request.");
    csrfToken = U.csrf;
  }
  const b = h instanceof FormData;
  let C;
  try {
    C = await fetch(`/api${r}`, {
      method: f,
      credentials: "include",
      headers: {
        ...(h && !b
          ? {
              "Content-Type": "application/json",
            }
          : {}),
        ...(f !== "GET"
          ? {
              "X-CSRF-Token": csrfToken,
            }
          : {}),
        ...y,
      },
      body: h ? (b ? h : JSON.stringify(h)) : void 0,
      signal: p,
    });
  } catch (w) {
    throw w.name === "AbortError"
      ? w
      : new Error(
          "Unable to connect. Your changes are still here; please try again.",
        );
  }
  const D = await C.json().catch(() => ({}));
  if (!C.ok) {
    (C.status === 403 || C.status === 401) && (csrfToken = "");
    const w = new Error(D.error || "The request could not be completed.");
    throw ((w.status = C.status), (w.fields = D.fields), w);
  }
  return (
    D.csrf && (csrfToken = D.csrf),
    r === "/auth/logout" && (csrfToken = ""),
    D
  );
}
export { api };
