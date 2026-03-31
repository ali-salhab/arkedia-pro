import { useState, useEffect, useRef, useCallback } from "react";
import {
  useGetChannelConfigQuery,
  useUpdateChannelConfigSectionMutation,
} from "../store/services/api";

/**
 * Drop-in replacement for useLocalStorage for channel manager config sections.
 * - Reads the full config from the API once on mount.
 * - On setter call, updates local state immediately AND persists to the API.
 *
 * @param {string} sectionName - The camelCase key in ChannelManagerConfig (e.g. "guestGroups")
 * @param {*} defaultValue - Value to use when no API data exists yet
 * @returns {[value, setter, isLoading]}
 */
export function useChannelSection(sectionName, defaultValue) {
  const { data: config, isLoading } = useGetChannelConfigQuery();
  const [updateSection] = useUpdateChannelConfigSectionMutation();
  const [value, setValue] = useState(defaultValue);
  const initialized = useRef(false);

  // Once API data loads, initialize local state from it (only once)
  useEffect(() => {
    if (!isLoading && !initialized.current) {
      initialized.current = true;
      const apiVal = config?.[sectionName];
      if (apiVal !== undefined && apiVal !== null) {
        setValue(apiVal);
      }
    }
  }, [config, isLoading, sectionName]);

  const set = useCallback(
    (valOrFn) => {
      // Mark as user-initialized so we don't override on subsequent re-renders
      initialized.current = true;
      setValue((prev) => {
        const next =
          typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
        updateSection({ section: sectionName, data: next });
        return next;
      });
    },
    [sectionName, updateSection],
  );

  return [value, set, isLoading];
}
