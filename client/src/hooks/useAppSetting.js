import { useState, useEffect, useRef, useCallback } from "react";
import { useGetAppSettingQuery, useUpsertAppSettingMutation } from "../store/services/api";

/**
 * Hook for reading and writing app-wide settings (super-admin CMS).
 * Drop-in replacement for useLocalStorage for AppSettings-backed keys.
 * Supports updater functions: set(prev => newVal).
 *
 * @param {string} key - Setting key (e.g. "platform_fees", "countries_list")
 * @param {*} defaultValue - Value to use when no API data exists yet
 * @returns {[value, setter, isLoading, isSaving]}
 */
export function useAppSetting(key, defaultValue) {
  const { data: apiValue, isLoading } = useGetAppSettingQuery(key);
  const [upsert, { isLoading: isSaving }] = useUpsertAppSettingMutation();
  const [value, setValue] = useState(defaultValue);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isLoading && !initialized.current) {
      initialized.current = true;
      if (apiValue !== undefined && apiValue !== null) {
        setValue(apiValue);
      }
    }
  }, [apiValue, isLoading]);

  const set = useCallback(
    (valOrFn) => {
      initialized.current = true;
      setValue((prev) => {
        const next =
          typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
        upsert({ key, value: next });
        return next;
      });
    },
    [key, upsert],
  );

  return [value, set, isLoading, isSaving];
}

