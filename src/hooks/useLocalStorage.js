import { useState, useEffect } from "react";
import { getItem, setItem } from "../utils/Storage";

// A reusable custom hook: works just like useState,
// but automatically keeps the value synced with localStorage.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getItem(key, initialValue));

  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  return [value, setValue];
}