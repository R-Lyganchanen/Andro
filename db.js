// db.js
const DB_NAME = 'AppDB';
const DB_VERSION = 1;
const STORE_CODES = 'codes';
let _db;

function openDB(callback) {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_CODES)) {
      db.createObjectStore(STORE_CODES, { keyPath: 'id', autoIncrement: true });
    }
  };
  req.onsuccess = (e) => {
    _db = e.target.result;
    if (callback) callback(_db);
  };
  req.onerror = () => console.error('IndexedDB error:', req.error);
}

function saveCode(value) {
  if (!_db) return openDB(() => saveCode(value));
  const tx = _db.transaction(STORE_CODES, 'readwrite');
  tx.objectStore(STORE_CODES).add({ value, created: Date.now() });
}

function getCodes(callback) {
  if (!_db) return openDB(() => getCodes(callback));
  const tx = _db.transaction(STORE_CODES, 'readonly');
  const req = tx.objectStore(STORE_CODES).getAll();
  req.onsuccess = () => callback(req.result || []);
  req.onerror = () => console.error('getCodes error:', req.error);
}

function clearCodes() {
  if (!_db) return openDB(clearCodes);
  const tx = _db.transaction(STORE_CODES, 'readwrite');
  tx.objectStore(STORE_CODES).clear();
}
