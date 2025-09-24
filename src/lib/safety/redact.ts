// minimal PII/secret scrubbing (extend as needed)
export function redact(text: string) {
  let t = text;
  // emails
  t = t.replace(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    "[redacted-email]"
  );
  // phone numbers (very naive)
  t = t.replace(/\+?\d[\d\s\-().]{7,}\d/g, "[redacted-phone]");
  // API keys (very naive)
  t = t.replace(/(sk-[A-Za-z0-9]{20,})/g, "[redacted-secret]");
  return t;
}
