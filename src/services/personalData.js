import { readStorage, writeStorage } from "../storage.js";

// Preserve the existing browser keys; the account-backed adapter belongs to stage 5.
export const personalData = {
  read: readStorage,
  write: writeStorage,
};
