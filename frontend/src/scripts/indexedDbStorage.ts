import type { StateStorage } from "zustand/middleware";
import { ensureConsistency, migrateToLatest } from "./utils";

const DB_NAME = "CoindoDB";
const STORE_NAME = "keyval";
const DB_VERSION = 1;
const OLD_LOCALSTORAGE_KEY = "coindo_app_state_v1";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is unavailable in this environment"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const indexedDbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await openDB();
      // let valueSource = "NONE";
      let stateValue = null;

      // The string from the db is expected to be JSON parseable into {state: any, version:number}
      stateValue = await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(name);

        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });

      if(stateValue === null){
        // 2. Fallback: IndexedDB has no record; check localStorage for legacy data
        if (typeof window !== "undefined" && window.localStorage) {
          // Legacy data is expected to be a string of the raw state (no wrapping within {state:, version})
          const legacyData = localStorage.getItem(OLD_LOCALSTORAGE_KEY);
  
          if (legacyData) {
            // Migrate to latest version
            const migratedData = migrateToLatest(legacyData);
            // Convert to a common format (Zustand imposed)
            stateValue = JSON.stringify({state: JSON.parse(migratedData || ""), version: 0});
            // valueSource = "LOCALSTORAGE";
          }
        }
      }
      // console.log(stateValue);
      
      if(stateValue !== null){
        // Extract the state and pass it through the function that ensures consistency
        const consistentState = ensureConsistency(JSON.parse(stateValue).state);
        console.log("Consistent state", consistentState)

        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(consistentState, name);

          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        return JSON.stringify({state: consistentState, version:0});
      }


      return null;
    } catch(err) {
      console.error("Some error in getting value from db", err)
      return null;
    }

    
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, name);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("Error writing to IndexedDB:", err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(name);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("Error removing from IndexedDB:", err);
    }
  },
};