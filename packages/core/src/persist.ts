import { decryptBytes, encryptBytes, type EncryptedBlob } from "./crypto.js";

const DB_NAME = "funds-local";
const STORE = "vault";
const KEY = "sqlite";

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export async function saveEncryptedDb(
  dbBytes: Uint8Array,
  passphrase: string,
): Promise<void> {
  const encrypted = await encryptBytes(dbBytes, passphrase);
  const db = await openIdb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    await idbRequest(tx.objectStore(STORE).put(encrypted, KEY));
  } finally {
    db.close();
  }
}

export async function loadEncryptedDb(
  passphrase: string,
): Promise<Uint8Array | null> {
  const db = await openIdb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const value = await idbRequest(
      tx.objectStore(STORE).get(KEY) as IDBRequest<EncryptedBlob | undefined>,
    );
    if (!value) return null;
    return decryptBytes(value, passphrase);
  } finally {
    db.close();
  }
}

export async function hasStoredDb(): Promise<boolean> {
  const db = await openIdb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const value = await idbRequest(tx.objectStore(STORE).get(KEY));
    return value != null;
  } finally {
    db.close();
  }
}

export async function wipeStoredDb(): Promise<void> {
  const db = await openIdb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    await idbRequest(tx.objectStore(STORE).delete(KEY));
  } finally {
    db.close();
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToUint8(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export async function loadDb(passphrase: string | null): Promise<Uint8Array | null> {
  const db = await openIdb();
  let value: unknown;
  try {
    const tx = db.transaction(STORE, "readonly");
    value = await idbRequest(tx.objectStore(STORE).get(KEY));
  } finally {
    db.close();
  }
  if (!value || typeof value !== "object") return null;

  const record = value as {
    version?: number;
    plaintext?: Uint8Array | { b64: string };
    salt?: string;
    iv?: string;
    ciphertext?: string;
  };

  if (record.version === 0) {
    const plain = record.plaintext;
    if (plain instanceof Uint8Array) return plain;
    if (plain && typeof plain === "object" && "b64" in plain) {
      return base64ToUint8(plain.b64);
    }
    return null;
  }

  if (!passphrase) {
    throw new Error("A passphrase is required to unlock this vault.");
  }
  if (!record.salt || !record.iv || !record.ciphertext) {
    throw new Error("Vault data is corrupted.");
  }
  return decryptBytes(
    {
      version: 1,
      salt: record.salt,
      iv: record.iv,
      ciphertext: record.ciphertext,
    },
    passphrase,
  );
}

export async function saveDb(
  dbBytes: Uint8Array,
  passphrase: string | null,
): Promise<void> {
  if (passphrase) {
    await saveEncryptedDb(dbBytes, passphrase);
    return;
  }
  const db = await openIdb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    await idbRequest(
      tx.objectStore(STORE).put(
        { version: 0, plaintext: { b64: uint8ToBase64(dbBytes) } },
        KEY,
      ),
    );
  } finally {
    db.close();
  }
}
