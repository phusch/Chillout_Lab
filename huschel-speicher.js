/* Huschel App Speicher · Chillout Lab V3.8.3.3 · automatische Supabase-Sitzung */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PROJECT_URL = 'https://qijordwpbwwbizfcslrv.supabase.co';
const EXPECTED_UID = '9be7d1bc-4d69-4cb8-bb42-cb2d3c705f75';
const APP_ID = 'chillout-lab';
const KEY_SETTING = 'huschel-supabase-publishable-key-v1';
const AUTH_STORAGE_KEY = 'huschel-chillout-lab-auth-session-v1';
const $ = id => document.getElementById(id);
let supabase = null, authenticated = false, sha = undefined, revision = 0;
let clientKey = null;
let savedAt = null, busy = false, remoteTestData = false, cloudMatches = false, oldScroll = 0;
let cloudSource = null, cloudData = null, pendingConflict = null, approvedHash = null;
let remoteExists = false;
// Herkunft des tatsächlich sichtbaren Datensatzes – unabhängig vom geladenen GitHub-Snapshot.
let activeSource = null;
const bridge = window.HuschelChilloutBridge;

function isAppData(value) { return !!(value && Array.isArray(value.categories) && Array.isArray(value.projects)); }
function log(message) { $('hsMessage').textContent = String(message); }
function lamp(message, mode = 'pending') {
  $('hsLamp').className = 'hs-lamp ' + mode;
  $('hsLamp').textContent = (mode === 'ok' ? '🟢 ' : mode === 'error' ? '🔴 ' : '🟡 ') + message;
}
function metadata() {
  const when = savedAt ? new Date(savedAt).toLocaleString('de-DE') : '–';
  $('hsMeta').textContent = `Privater GitHub-Speicher · Revision: ${sha === undefined ? 'nicht geprüft' : revision} · Letzte Speicherung: ${when}`;
}
function markChanged() {
  cloudMatches = false;
  lamp('Änderungen noch nicht auf GitHub gespeichert');
}
function setAuth(yes, email = '') {
  authenticated = yes;
  $('hsLoggedIn').hidden = !yes;
  $('hsLoginFields').hidden = yes;
  $('hsLogout').hidden = !yes;
  $('hsLoggedEmail').textContent = yes ? email : '';
  $('hsAuthCard').classList.toggle('hs-auth-ok', yes);
  $('hsAuthStatus').className = 'hs-auth-status' + (yes ? ' hs-auth-success' : '');
  $('hsAuthStatus').textContent = yes
    ? '🟢 Angemeldet · Supabase-Zugang aktiv'
    : '⚪ Nicht angemeldet · für GitHub bitte anmelden';
}
function authWarning(message) {
  setAuth(false);
  $('hsAuthStatus').className = 'hs-auth-status hs-auth-error';
  $('hsAuthStatus').textContent = '🔴 ' + message;
}
async function task(fn, action = 'Aktion') {
  if (busy) return;
  busy = true;
  document.querySelectorAll('#hsStorageView button').forEach(button => button.disabled = true);
  try { await fn(); }
  catch(error) {
    const detail = String(error?.message || error || 'Unbekannter Fehler');
    const short = detail.replace(/\s+/g, ' ').slice(0, 105) + (detail.length > 105 ? '…' : '');
    if (action === 'Anmeldung') authWarning('Anmeldung fehlgeschlagen · Zugangsdaten prüfen');
    const headline = action === 'GitHub Speichern' ? 'GitHub-Speicherung nicht bestätigt' : action + ' fehlgeschlagen';
    lamp(headline + ': ' + short, 'error');
    log(headline + '. Grund: ' + detail + (action === 'GitHub Speichern'
      ? '\nBitte vor erneutem Speichern erst mit „GitHub Laden“ den tatsächlichen Stand prüfen.' : ''));
  }
  finally { busy = false; document.querySelectorAll('#hsStorageView button').forEach(button => button.disabled = false); }
}
function cancelled(label, detail) {
  lamp(label);
  log(detail);
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    const sorted = {};
    Object.keys(value).sort().forEach(key => sorted[key] = canonical(value[key]));
    return sorted;
  }
  return value;
}
function sameData(a,b) {
  try { return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b)); }
  catch { return false; }
}
async function fingerprint(value) {
  if (!globalThis.crypto?.subtle) throw Error('Für die sichere Versionsprüfung ist HTTPS erforderlich (Web Crypto nicht verfügbar).');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(canonical(value))));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('');
}
async function published() {
  // Ausschließlich Lesefunktion: kein Austausch der laufenden App-Daten.
  const content = await bridge.published();
  if (!isAppData(content)) throw Error('Veröffentlichte apps.json enthält keine gültigen Chillout-Lab-Daten.');
  const hash = await fingerprint(content);
  $('hsPublishedStatus').textContent = 'Öffentliche apps.json · Prüfsumme ' + hash.slice(0,12) + '… · ' +
    (sameData(bridge.read(), content) ? 'aktuelle App entspricht der Veröffentlichung.' :
      'aktuelle App weicht ab (z. B. lokaler Entwurf oder bisheriger privater Stand).');
  return { data:content, hash };
}
function clearConflict() {
  pendingConflict = null;
  $('hsSourceConflict').hidden = true;
}
function cloudHasMatchingOrigin(remoteData, source, pub) {
  // Gleicher Inhalt ist sicher. Gleiche ursprüngliche Publikation erlaubt bewusste lokale Änderungen.
  if (sameData(remoteData, pub.data)) return true;
  return source?.kind === 'published-apps-json' && source.sha256 === pub.hash;
}
function explainConflict(mode, originUnknown) {
  const label = mode === 'local' ? 'lokale Speicherstand' : mode === 'backup' ? 'JSON-Backup' : 'private GitHub-Speicherstand';
  const why = originUnknown
    ? `Der ${label} hat keine überprüfbare apps.json-Herkunft (älteres Sicherungsformat).`
    : `Der ${label} wurde auf Grundlage einer anderen Version von apps.json gesichert.`;
  const consequence = 'Wenn du inzwischen Bilder in apps.json verkleinert oder App-Einträge veröffentlicht hast, könnten diese beim Laden dieses Stands wieder ersetzt werden.';
  return `${why}\n\n${consequence}\n\nEs wird NICHT automatisch überschrieben. Entscheide ausdrücklich, welchen Stand du möchtest.` +
    (mode === 'save' ? '\n\nAuch das Speichern der aktuellen App-Daten wird bis zu deiner Entscheidung angehalten.' : '');
}
function conflict(mode, pub, candidate = null, source = null) {
  pendingConflict = { mode, pub, candidate, source };
  $('hsSourceConflict').hidden = false;
  $('hsConflictText').textContent = explainConflict(mode, !source?.sha256);
  $('hsUsePrivate').textContent = mode === 'save'
    ? 'Aktuelle App-Daten trotz Unterschied behalten'
    : mode === 'local' ? 'Lokalen Speicherstand trotzdem laden'
    : mode === 'backup' ? 'JSON-Backup trotzdem laden'
    : 'Privaten Speicherstand trotzdem laden';
  lamp('Unterschiedliche Datenstände – Entscheidung erforderlich', 'error');
  log('Versionskonflikt erkannt. Weder die laufenden App-Daten noch GitHub wurden verändert.');
}
async function inspectOnOpen() {
  try { await published(); }
  catch(error) { $('hsPublishedStatus').textContent = 'Öffentliche apps.json nicht prüfbar: ' + error.message; }
}
function openView() {
  if (!bridge?.ready()) { alert('Chillout Lab lädt noch seine Daten. Bitte gleich noch einmal versuchen.'); return; }
  oldScroll = window.scrollY;
  $('labMainPage').hidden = true;
  $('hsStorageView').hidden = false;
  metadata();
  window.scrollTo(0,0);
  void inspectOnOpen();
}
function closeView() {
  $('hsStorageView').hidden = true;
  $('labMainPage').hidden = false;
  window.scrollTo(0, oldScroll);
}
$('hsOpen').addEventListener('click', openView);
$('hsBack').addEventListener('click', closeView);
window.addEventListener('huschel:app-change', markChanged);
metadata();
try { $('hsKey').value = localStorage.getItem(KEY_SETTING) || ''; } catch {}


// Eigene Sitzungskennung verhindert Überschneidungen mit anderen GitHub-Pages-Apps.
// Supabase speichert ausschließlich Tokens im Browser, niemals das eingegebene Passwort.
function getAuthClient(key) {
  if (supabase && clientKey === key) return supabase;
  const previous = supabase;
  const client = createClient(PROJECT_URL, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: AUTH_STORAGE_KEY
    }
  });
  supabase = client;
  clientKey = key;
  if (previous && previous !== client) void previous.auth.stopAutoRefresh();
  client.auth.onAuthStateChange((event) => {
    if (client !== supabase) return;
    if (event === 'SIGNED_OUT') {
      setAuth(false);
      if (!busy) {
        lamp('Nicht angemeldet · GitHub-Datenstand unverändert');
        log('Die Sitzung wurde beendet. Zum Speichern oder Laden erneut anmelden.');
      }
    }
  });
  return client;
}
async function restoreAuthOnStart() {
  const key = $('hsKey').value.trim();
  if (!key.startsWith('sb_publishable_')) return;
  const client = getAuthClient(key);
  $('hsAuthStatus').textContent = '🟡 Gespeicherte Anmeldung wird geprüft…';
  try {
    const { data: sessionInfo, error: sessionError } = await client.auth.getSession();
    if (client !== supabase) return;
    if (sessionError) throw sessionError;
    if (!sessionInfo.session) { setAuth(false); return; }
    // Ein gespeichertes Token allein reicht nicht: Benutzer erneut serverseitig prüfen.
    const { data: userInfo, error: userError } = await client.auth.getUser();
    if (client !== supabase) return;
    if (userError || userInfo.user?.id !== EXPECTED_UID) {
      await client.auth.signOut({ scope: 'local' });
      throw userError || new Error('Dieses Konto ist nicht freigeschaltet.');
    }
    setAuth(true, userInfo.user.email || $('hsEmail').value.trim());
    lamp('GitHub-Datenstand noch nicht geprüft');
    log('Supabase-Anmeldung automatisch wiederhergestellt. Für den GitHub-Datenstand bitte „GitHub Laden“ wählen.');
  } catch (error) {
    if (client !== supabase) return;
    authWarning('Gespeicherte Anmeldung ungültig · bitte neu anmelden');
    log('Die frühere Anmeldung konnte nicht bestätigt werden: ' + (error?.message || String(error)));
  }
}

$('hsLogin').addEventListener('click', () => task(async () => {
  const key = $('hsKey').value.trim();
  if (!key.startsWith('sb_publishable_')) throw Error('Bitte den Publishable Key dieses Supabase-Projekts eingeben.');
  const client = getAuthClient(key);
  const email = $('hsEmail').value.trim();
  const password = $('hsPassword').value;
  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user?.id !== EXPECTED_UID) {
      await supabase.auth.signOut();
      throw Error('Dieses Supabase-Konto ist nicht für Huschel App Speicher freigeschaltet.');
    }
    setAuth(true, email);
    try { localStorage.setItem(KEY_SETTING, key); } catch {}
    lamp('GitHub-Datenstand noch nicht geprüft');
    log('Anmeldung erfolgreich. Supabase-Sitzung auf diesem Gerät gespeichert; bitte „GitHub Laden“ wählen.');
  } finally { $('hsPassword').value = ''; }
}, 'Anmeldung'));
$('hsLogout').addEventListener('click', () => task(async () => {
  if (supabase) await supabase.auth.signOut();
  supabase = null; clientKey = null; authenticated = false; sha = undefined; savedAt = null; revision = 0;
  cloudSource = null; cloudData = null; remoteExists = false; approvedHash = null;
  // Kein Zurücksetzen von activeSource: Die App-Daten bleiben auch nach Logout sichtbar.
  clearConflict(); setAuth(false); metadata(); lamp('Abgemeldet'); log('Sitzung auf diesem Gerät beendet.');
}, 'Abmeldung'));
async function invoke(body) {
  if (!authenticated || !supabase) throw Error('Bitte zuerst mit deinem Supabase-Konto anmelden.');
  const { data, error } = await supabase.functions.invoke('github-app-storage', { body });
  if (error) {
    let message = error.message || 'Verbindungsfehler';
    if (error.context instanceof Response) {
      message += ` (HTTP ${error.context.status})`;
      try { const details = await error.context.json(); message += ': ' + (details.error || JSON.stringify(details)); } catch {}
    }
    throw Error(message);
  }
  if (!data?.ok) throw Error(data?.error || 'Speicherfehler');
  return data;
}
async function verifyBackendVersion() {
  let info;
  try { info = await invoke({ action:'capabilities', app:APP_ID }); }
  catch { throw Error('Bitte zuerst die neue SUPABASE_EdgeFunction_index.ts aus V3.8.2 in Supabase deployen. Der alte Servercode unterstützt noch keine Versionsprüfung.'); }
  if (info.sourceVersioning !== true) throw Error('Supabase-Version ohne apps.json-Konfliktschutz. Bitte V3.8.2-Edge-Function deployen.');
}
function setCloudInfo(result) {
  sha = result.sha;
  revision = result.revision;
  savedAt = result.savedAt;
  cloudSource = result.source ?? null;
  cloudData = result.exists && isAppData(result.data) ? result.data : null;
  remoteExists = result.exists;
  metadata();
}
$('hsGithubLoad').addEventListener('click', () => task(async () => {
  await verifyBackendVersion();
  const pub = await published();
  const result = await invoke({ action:'load', app:APP_ID });
  const current = bridge.read();
  setCloudInfo(result);
  clearConflict(); approvedHash = null;
  if (result.exists && !isAppData(result.data)) {
    // Ältere Pilotspeicherung mit Notizen darf nie als echte App-Daten übernommen werden.
    remoteTestData = true; cloudMatches = false;
    lamp('Auf GitHub liegt noch der Testdatensatz');
    log('Der vorhandene GitHub-Stand enthält nur Testnotizen. App-Daten wurden NICHT verändert. GitHub Speichern ermöglicht das Ersetzen nach ausdrücklicher Bestätigung.');
    return;
  }
  remoteTestData = false;
  if (result.exists && !cloudHasMatchingOrigin(result.data, cloudSource, pub)) {
    cloudMatches = false;
    conflict('load', pub, result.data, cloudSource);
    return;
  }
  if (result.exists && !sameData(current, result.data)) {
    if (!confirm('GitHub Laden ersetzt die aktuellen Chillout-Lab-Daten in dieser App.\n\nBitte bei Bedarf vorher ein JSON-Backup erstellen.\n\nWirklich den GitHub-Stand übernehmen?')) {
      cancelled('GitHub Laden von dir abgebrochen – App-Daten unverändert',
        'Kein Datenstand wurde übernommen oder auf GitHub geschrieben.');
      return;
    }
    bridge.apply(result.data);
  }
  if (result.exists) activeSource = cloudSource?.kind === 'published-apps-json'
    ? cloudSource : { kind:'published-apps-json', sha256:pub.hash };
  else if (sameData(bridge.read(), pub.data)) activeSource = { kind:'published-apps-json', sha256:pub.hash };
  cloudMatches = result.exists && sameData(bridge.read(), result.data);
  metadata();
  if (result.exists) {
    lamp('GitHub-Daten erfolgreich geladen', 'ok');
    log(`GitHub-Laden erfolgreich. Revision ${revision}. Öffentliche apps.json und privater Speicher bleiben getrennt.`);
  } else {
    lamp('Noch kein GitHub-Datenstand – Speichern jetzt möglich');
    log('Noch keine private GitHub-Datei vorhanden. Die aktuellen App-Daten wurden nicht verändert.');
  }
}, 'GitHub Laden'));
$('hsGithubSave').addEventListener('click', () => task(async () => {
  if (sha === undefined) throw Error('Bitte zuerst GitHub Laden auswählen, damit wir die aktuelle GitHub-Version kennen.');
  await verifyBackendVersion();
  const pub = await published();
  const data = bridge.read();
  if (!isAppData(data)) throw Error('Chillout Lab hat keine gültigen App-Daten geliefert.');
  const baselineIsCurrent = activeSource?.kind === 'published-apps-json' && activeSource.sha256 === pub.hash;
  const localIsPublished = sameData(data, pub.data);
  const sourceKnown = baselineIsCurrent || localIsPublished;
  if (!remoteTestData && !sourceKnown && approvedHash !== pub.hash) {
    conflict('save', pub, data, cloudSource);
    return;
  }
  if (remoteTestData && !confirm('Auf GitHub liegt noch der frühere Testdatensatz.\n\nDurch die ECHTEN Chillout-Lab-Daten ersetzen?')) {
    cancelled('GitHub Speichern von dir abgebrochen – Testdaten bleiben bestehen', 'Es wurde keine neue Speicherung gestartet.');
    return;
  }
  // Niemals eine alte private Version als aus einer neuen apps.json entstanden ausgeben.
  const source = localIsPublished || baselineIsCurrent
    ? { kind:'published-apps-json', sha256:pub.hash }
    : activeSource?.kind === 'published-apps-json' ? activeSource : null;
  const result = await invoke({ action:'save', app:APP_ID, sha, revision, data, source });
  setCloudInfo({ ...result, exists:true, data, source:result.source ?? source });
  remoteTestData = false; cloudMatches = true; approvedHash = null;
  activeSource = source;
  clearConflict(); metadata();
  if (source?.sha256 !== pub.hash) {
    lamp('Privat gespeichert – öffentliche apps.json weicht ab');
    log(`GitHub-Speicherung erfolgreich · Revision ${revision}. WARNUNG: Der private Datenstand stammt weiterhin aus einer anderen/ungeprüften apps.json-Version. Beim nächsten Laden bleibt der Konfliktschutz aktiv.`);
  } else {
    lamp('Sicher auf GitHub gespeichert', 'ok');
    log(`GitHub-Speicherung erfolgreich · Revision ${revision}. Der öffentliche apps.json-Stand wurde nicht verändert.`);
  }
}, 'GitHub Speichern'));
$('hsUsePublished').addEventListener('click', () => task(async () => {
  if (!pendingConflict) return;
  const expectedHash = pendingConflict.pub.hash;
  const pub = await published();
  if (pub.hash !== expectedHash) throw Error('apps.json wurde inzwischen erneut geändert. Bitte GitHub Laden und Versionsvergleich wiederholen.');
  if (!sameData(bridge.read(), pub.data) && !confirm('Die veröffentlichte apps.json übernehmen?\n\nAktuelle lokale Änderungen und Bilder in dieser App werden ersetzt. Bitte bei Bedarf vorher ein JSON-Backup erstellen.')) return;
  bridge.applyPublished(pub.data);
  activeSource = { kind:'published-apps-json', sha256:pub.hash };
  cloudMatches = false;
  approvedHash = null;
  clearConflict();
  lamp('Aktuelle apps.json übernommen – noch nicht privat gespeichert');
  log('Die veröffentlichte apps.json wurde übernommen. Öffentlicher Stand bleibt unverändert. Zum Aktualisieren des privaten Backups jetzt „GitHub Speichern“ wählen.');
}));
$('hsUsePrivate').addEventListener('click', () => task(async () => {
  if (!pendingConflict) return;
  const choice = pendingConflict;
  const fresh = await published();
  if (fresh.hash !== choice.pub.hash) throw Error('apps.json wurde inzwischen erneut geändert. Bitte Versionen erneut prüfen.');
  if (choice.mode === 'load') {
    if (!isAppData(choice.candidate)) throw Error('Privater Datenstand ungültig.');
    const label = choice.mode === 'local' ? 'lokalen Stand' : choice.mode === 'backup' ? 'JSON-Backup' : 'privaten GitHub-Stand';
    if (!confirm('ACHTUNG: Der ' + label + ' weicht von der veröffentlichten apps.json ab.\n\nNeue oder verkleinerte Bilder können durch ältere ersetzt werden.\n\nTrotzdem in Chillout Lab übernehmen?')) return;
    bridge.apply(choice.candidate);
    activeSource = choice.source?.kind === 'published-apps-json' ? choice.source : null;
    cloudMatches = choice.mode === 'load';
    approvedHash = choice.mode === 'load' ? fresh.hash : null;
    clearConflict();
    lamp('Abweichender Stand geladen – apps.json weicht ab');
    log('Abweichenden Stand bewusst geladen. GitHub wurde nicht geändert. Bei einer späteren privaten Speicherung erfolgt erneut die Versionsprüfung.');
  } else {
    if (!confirm('Die aktuellen App-Daten weichen von der veröffentlichten apps.json ab.\n\nDiese Daten bewusst als privaten Stand behalten und anschließend speichern?')) return;
    approvedHash = fresh.hash;
    clearConflict();
    lamp('Abweichenden Stand bestätigt – GitHub noch nicht geändert');
    log('Daten beibehalten. „GitHub Speichern“ muss erneut gewählt werden. Die Herkunft einer älteren Version wird dabei nicht verschleiert.');
  }
}));
$('hsCancelConflict').addEventListener('click', () => {
  clearConflict(); approvedHash = null;
  lamp('Versionsauswahl abgebrochen – keine Daten verändert');
  log('Kein Datenstand wurde übernommen oder auf GitHub geschrieben.');
});

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('huschel-app-speicher-v1', 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('snapshots')) request.result.createObjectStore('snapshots'); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Lokaler Speicher nicht verfügbar.'));
  });
}
async function localPut(value) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readwrite');
      tx.objectStore('snapshots').put(value, APP_ID);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('Lokales Speichern fehlgeschlagen.'));
      tx.onabort = () => reject(tx.error || new Error('Lokales Speichern abgebrochen.'));
    });
  } finally { db.close(); }
}
async function localGet() {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readonly');
      const request = tx.objectStore('snapshots').get(APP_ID);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Lokales Laden fehlgeschlagen.'));
    });
  } finally { db.close(); }
}
// Alle Speicherarten tragen soweit nachweisbar die veröffentlichte Ausgangsversion mit.
function sourceForCurrentData(pub) {
  const current = bridge.read();
  if (sameData(current, pub.data)) return { kind:'published-apps-json', sha256:pub.hash };
  return activeSource?.kind === 'published-apps-json' ? activeSource : null;
}
$('hsOptimizeIcons').addEventListener('click', () => task(async () => {
  if(!bridge.optimizeIcons)throw Error('Icon-Optimierung in dieser App-Version nicht verfügbar.');
  const result=await bridge.optimizeIcons();
  if(result.changed){
    lamp('Icons verkleinert – Änderungen noch nicht gespeichert');
    log(`${result.changed} Icon(s) optimiert: eingebettete Bilddaten von ${Math.round(result.before/1024)} KB auf ${Math.round(result.after/1024)} KB. Für die öffentliche apps.json „GitHub-Dateien erstellen“ verwenden; für den privaten Speicher „GitHub Speichern“. Vorher gegebenenfalls Versionskonflikt bestätigen.`);
  }else{
    log('Alle eingebetteten Icons sind bereits klein. App-Daten und GitHub wurden nicht verändert.');
  }
}));
$('hsLocalSave').addEventListener('click', () => task(async () => {
  const pub = await published();
  await localPut({ format:'huschel-backup-v1', app:APP_ID, savedAt:new Date().toISOString(),
    source:sourceForCurrentData(pub), data:bridge.read() });
  log('Lokale Gerätekopie gespeichert, mit Versionszuordnung soweit möglich. GitHub bleibt unverändert.');
}));
$('hsLocalLoad').addEventListener('click', () => task(async () => {
  const stored = await localGet();
  if (!stored || !isAppData(stored.data)) throw Error('Kein gültiger lokaler Speicherstand gefunden.');
  const pub = await published();
  if (!cloudHasMatchingOrigin(stored.data, stored.source, pub)) {
    conflict('local', pub, stored.data, stored.source); return;
  }
  if (!confirm('Lokale Gerätekopie laden? Die aktuell geöffneten App-Daten werden ersetzt.')) return;
  bridge.apply(stored.data);
  activeSource = stored.source?.kind === 'published-apps-json'
    ? stored.source : { kind:'published-apps-json', sha256:pub.hash };
  log('Lokale Daten geladen. Diese Änderungen sind noch nicht auf GitHub gespeichert.');
}));
$('hsExport').addEventListener('click', () => task(async () => {
  const pub = await published();
  const backup = { format:'huschel-backup-v1', app:APP_ID, exportedAt:new Date().toISOString(),
    source:sourceForCurrentData(pub), data:bridge.read() };
  const blob = new Blob([JSON.stringify(backup,null,2)], {type:'application/json;charset=utf-8'});
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `chillout-lab-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  log('JSON-Backup erstellt. Die GitHub-Daten wurden nicht verändert.');
}));
$('hsImport').addEventListener('click', () => $('hsFile').click());
$('hsFile').addEventListener('change', () => task(async () => {
  const file = $('hsFile').files?.[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (backup.format !== 'huschel-backup-v1' || backup.app !== APP_ID || !isAppData(backup.data)) {
      throw Error('Die Backup-Datei passt nicht zum Format oder zur App Chillout Lab.');
    }
    const pub = await published();
    if (!cloudHasMatchingOrigin(backup.data, backup.source, pub)) {
      conflict('backup', pub, backup.data, backup.source); return;
    }
    if (!confirm('JSON-Backup laden? Die aktuellen App-Daten werden ersetzt.')) return;
    bridge.apply(backup.data);
    activeSource = backup.source?.kind === 'published-apps-json'
      ? backup.source : { kind:'published-apps-json', sha256:pub.hash };
    log('JSON-Backup geladen. GitHub wurde nicht verändert; bei Bedarf anschließend „GitHub Speichern“ wählen.');
  } finally { $('hsFile').value = ''; }
}));

// Erst nach Aufbau aller Bedienelemente starten; dabei wird kein Passwort benötigt.
void restoreAuthOnStart();
