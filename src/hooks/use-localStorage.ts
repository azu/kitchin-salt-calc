// Hook
import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        if (!process.browser) {
            return initialValue;
        }
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const upSetStorage = () => {
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            const loadedValue = item ? JSON.parse(item) : initialValue;
            setStoredValue(loadedValue);
            return loadedValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    };
    useEffect(() => {
        window.addEventListener("load", upSetStorage);
        return () => {
            window.removeEventListener("load", upSetStorage);
        };
    });
    // Return a wrapped version of useState's setter function that ...

    // ... persists the new value to localStorage.

    const setValue = (value: T) => {
        try {
            if (!process.browser) {
                return;
            }
            // Save state
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
