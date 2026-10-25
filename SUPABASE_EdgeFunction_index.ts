import { withSupabase } from "npm:@supabase/server@1";

// Server-side allowlist: clients cannot choose a GitHub path or repository.
const USER_ID = "9be7d1bc-4d69-4cb8-bb42-cb2d3c705f75";
const REPOSITORY = "phusch/huschel-app-data";
const APPS: Record<string, string> = {
  "chillout-lab": "chillout-lab/data.json",
  "tour-navigator": "tour-navigator/data.json",
  "wildhogs-reiseplaner": "wildhogs-reiseplaner/data.json",
  "skipper-cockpit": "skipper-cockpit/data.json",
  "abnehmcoach": "abnehmcoach/data.json",
};
const LIMIT = 8_000_000; // full Chillout-Lab app data incl. iconData; 8 MB hard limit
const json = (value: unknown, status = 200) => Response.json(value, { status });
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "Huschel-App-Storage/1.0",
});
function toBase64(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(result);
}
function fromBase64(content: string): string {
  const raw = atob(content.replace(/\s/g, ""));
  const bytes = Uint8Array.from(raw, (ch) => ch.charCodeAt(0));
  return decoder.decode(bytes);
}
function failureMessage(status: number): string {
  if (status === 401) return "GitHub-Token ungültig oder abgelaufen";
  if (status === 403) return "GitHub-Zugriff verweigert; Contents-Berechtigung überprüfen";
  if (status === 404) return "Privates Repository nicht erreichbar oder Token ohne Zugriff";
  return `GitHub-Fehler (HTTP ${status})`;
}
export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (ctx.userClaims?.id !== USER_ID) return json({ ok: false, error: "Zugriff verweigert" }, 403);
    if (req.method !== "POST") return json({ ok: false, error: "Nur POST erlaubt" }, 405);
    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) return json({ ok: false, error: "GITHUB_TOKEN fehlt in Supabase Secrets" }, 500);
    let body: any;
    try { body = await req.json(); } catch { return json({ ok: false, error: "Ungültiges JSON" }, 400); }
    const action = body?.action;
    const app = body?.app;
    if (typeof app !== "string" || !Object.hasOwn(APPS, app)) {
      return json({ ok: false, error: "App nicht freigeschaltet" }, 400);
    }
    if (action === "capabilities") {
      return json({ ok: true, version: "1.1-source-check", sourceVersioning: true });
    }
    if (action !== "load" && action !== "save") return json({ ok: false, error: "Ungültige Aktion" }, 400);
    const url = `https://api.github.com/repos/${REPOSITORY}/contents/${APPS[app]}`;
    try {
      if (action === "load") {
        const response = await fetch(url, { headers: headers(token), cache: "no-store" });
        if (response.status === 404) {
          // A missing file and inaccessible repository are indistinguishable on GitHub.
          // Confirm repository access before reporting an empty app state.
          const repoCheck = await fetch(`https://api.github.com/repos/${REPOSITORY}`, { headers: headers(token) });
          if (!repoCheck.ok) return json({ ok: false, error: failureMessage(repoCheck.status) }, 502);
          return json({ ok: true, exists: false, app, sha: null, data: null, savedAt: null, revision: 0 });
        }
        if (!response.ok) return json({ ok: false, error: failureMessage(response.status) }, 502);
        const file = await response.json();
        if (file.type !== "file" || typeof file.sha !== "string") {
          return json({ ok: false, error: "GitHub lieferte keine gültige Datei" }, 502);
        }
        if (typeof file.size === "number" && file.size > LIMIT) {
          return json({ ok: false, error: "GitHub-Datei zu groß (max. 8 MB)" }, 413);
        }
        let base64Content = file.content;
        // GitHub liefert bei Dateien über 1 MB im Contents-API keinen base64-Inhalt mehr.
        // Wir laden dann den Blob über dessen SHA (bis 100 MB API-Unterstützung).
        if (file.encoding === "none" || !base64Content) {
          const blobResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/git/blobs/${file.sha}`, {
            headers: headers(token), cache: "no-store"
          });
          if (!blobResponse.ok) return json({ ok: false, error: failureMessage(blobResponse.status) }, 502);
          const blob = await blobResponse.json();
          if (blob.encoding !== "base64" || typeof blob.content !== "string") {
            return json({ ok: false, error: "GitHub-Blob konnte nicht gelesen werden" }, 502);
          }
          base64Content = blob.content;
        }
        if (typeof base64Content !== "string") return json({ ok: false, error: "GitHub-Datei ohne Inhalt" }, 502);
        const stored = JSON.parse(fromBase64(base64Content));
        if (stored?.format !== "huschel-storage-v1" || stored?.app !== app || !Number.isInteger(stored?.revision)) {
          return json({ ok: false, error: "Unbekanntes Datenformat; nichts überschrieben" }, 409);
        }
        return json({ ok: true, exists: true, app, sha: file.sha, data: stored.data,
          savedAt: stored.savedAt, revision: stored.revision,
          source: stored.source ?? null });
      }
      // The client must load first: sha:null permits only creating a NEW file.
      if (!Object.hasOwn(body, "sha") || !(body.sha === null ||
         (typeof body.sha === "string" && /^[a-f0-9]{40}$/.test(body.sha)))) {
        return json({ ok: false, error: "Fehlende oder ungültige GitHub-Version; zuerst laden" }, 400);
      }
      if (body.data === undefined || typeof body.data !== "object" || body.data === null || Array.isArray(body.data)) {
        return json({ ok: false, error: "data muss ein JSON-Objekt sein" }, 400);
      }
      if (!Number.isInteger(body.revision) || body.revision < 0) {
        return json({ ok: false, error: "Ungültige Revision; zuerst laden" }, 400);
      }
      // Optionale Herkunft der veröffentlichten apps.json (rückwärtskompatibel).
      // SHA-256 ist ein Vergleichswert, keine Behauptung über das Veröffentlichungsdatum.
      const source = body.source == null ? null : body.source;
      if (source !== null && (app !== "chillout-lab" ||
          source.kind !== "published-apps-json" ||
          typeof source.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(source.sha256))) {
        return json({ ok: false, error: "Ungültige apps.json-Herkunft" }, 400);
      }
      const stored = { format: "huschel-storage-v1", app,
        revision: body.revision + 1, savedAt: new Date().toISOString(), data: body.data,
        ...(source === null ? {} : { source: { kind: source.kind, sha256: source.sha256 } }) };
      const raw = JSON.stringify(stored);
      const bytes = encoder.encode(raw);
      if (bytes.byteLength > LIMIT) return json({ ok: false, error: "Daten zu groß (max. 8 MB)" }, 413);
      const payload: Record<string, unknown> = {
        message: `Save ${app} revision ${stored.revision}`, content: toBase64(bytes),
      };
      if (body.sha !== null) payload.sha = body.sha;
      // GitHub's SHA check prevents overwriting changes made since last load/save.
      const response = await fetch(url, { method: "PUT", headers: headers(token), body: JSON.stringify(payload) });
      if ([409, 412, 422].includes(response.status)) {
        return json({ ok: false, conflict: true,
          error: "Speicherkonflikt: GitHub wurde inzwischen verändert. Bitte erst Backup erstellen, dann neu laden." }, 409);
      }
      if (!response.ok) return json({ ok: false, error: failureMessage(response.status) }, 502);
      const result = await response.json();
      return json({ ok: true, app, sha: result.content?.sha ?? null,
        revision: stored.revision, savedAt: stored.savedAt,
        source: stored.source ?? null });
    } catch (_error) {
      return json({ ok: false, error: "Speicheroperation fehlgeschlagen. Netzwerk oder Dateiformat prüfen." }, 502);
    }
  }),
};
