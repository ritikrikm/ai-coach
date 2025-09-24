// All calls from client components go through these helpers.
// Automatically attaches headers, handles JSON and errors.

export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

// Usage inside a client component:
// const data = await postJSON<{ ok: boolean; data: any }>("/api/competency", { jd });
