import { useEffect, useState } from "react";
import { personalData } from "../services/personalData.js";

export function usePersonalState(key, fallback, validate = () => true) {
  const [value, setValue] = useState(() => {
    const stored = personalData.read(key, fallback);
    return validate(stored) ? stored : fallback;
  });
  useEffect(() => {
    personalData.write(key, value);
  }, [key, value]);
  return [value, setValue];
}
