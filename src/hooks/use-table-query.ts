"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "./use-debounce";

/** The shape `queryParams` always carries before the table's own filters. */
export interface TableQueryBase {
  page: number;
  limit?: number;
  search?: string;
}

/**
 * URL-synced table state: page + a debounced search + string filters.
 *
 * Local state is the source of truth; it seeds once from the URL, then mirrors
 * changes back into the query string. The mirror effect reads the *live* URL
 * (window.location) rather than the reactive `searchParams`, so writing the URL
 * can't feed back and cause a render loop, and it only navigates when the URL
 * actually differs (`router.replace(..., { scroll: false })` - no page jump).
 *
 * `search` is the immediate input value; `queryParams.search` is the debounced
 * value that feeds the RTK query, so typing isn't chatty. Changing the search
 * or a filter resets to page 1. Pass a stable `defaults` (module const) and an
 * optional `prefix` to namespace params when two tables share a page.
 */
export function useTableQuery<
  F extends Record<string, string>,
  TQuery extends object = TableQueryBase & Record<string, unknown>,
>({
  defaults,
  prefix = "",
  pageSize,
  filterKeys,
}: {
  defaults: F;
  prefix?: string;
  pageSize?: number;
  /** Renames a filter in `queryParams` to the API's param name (e.g.
   * `{ payment: "paymentStatus" }`) so call sites don't hand-map. Pass a
   * stable object (module const). */
  filterKeys?: Partial<Record<keyof F, string>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const key = useCallback(
    (name: string) => (prefix ? `${prefix}_${name}` : name),
    [prefix],
  );

  // Session memory: re-entering a table through the sidebar (a bare URL, no
  // params) restores the last page, search and filters - while an
  // explicit URL always wins and a fresh browser session starts clean.
  const storageKey = `kk-table:${pathname}${prefix ? `:${prefix}` : ""}`;

  // Effective initial state, computed ONCE (lazy useState) so a restored
  // table issues its first request with the restored params instead of a
  // throwaway defaults request. The admin tables mount post-hydration
  // (behind the auth guard), so sessionStorage is available; the
  // `typeof window` guard keeps any server render safe by falling back to
  // the URL params.
  const [initial] = useState(() => {
    let source: Pick<URLSearchParams, "get"> = searchParams;
    if (typeof window !== "undefined") {
      const live = new URLSearchParams(window.location.search);
      const names = ["page", "search", ...Object.keys(defaults)];
      if (!names.some((n) => live.has(key(n)))) {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) source = new URLSearchParams(saved);
      }
    }
    const parsedPage = Number(source.get(key("page")) ?? "1");
    const initialFilters = { ...defaults };
    for (const name of Object.keys(defaults)) {
      const value = source.get(key(name));
      if (value) (initialFilters as Record<string, string>)[name] = value;
    }
    return {
      page: parsedPage > 0 ? parsedPage : 1,
      search: source.get(key("search")) ?? "",
      filters: initialFilters,
    };
  });

  const [page, setPageState] = useState(initial.page);
  const [searchInput, setSearchInput] = useState(initial.search);
  const [filters, setFiltersState] = useState<F>(initial.filters);

  const debouncedSearch = useDebounce(searchInput, 350);

  // State → URL. Depends only on state (never on searchParams), reads the live
  // URL to preserve unrelated params, and navigates only when it changed.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const set = (name: string, value: null | string) => {
      if (value) params.set(key(name), value);
      else params.delete(key(name));
    };
    set("page", page > 1 ? String(page) : null);
    set("search", debouncedSearch.trim() || null);
    for (const [name, value] of Object.entries(filters)) {
      set(name, value && value !== defaults[name] ? value : null);
    }
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    if (target !== `${window.location.pathname}${window.location.search}`) {
      router.replace(target, { scroll: false });
    }

    // Remember only this table's own params for the session-memory restore.
    const mine = new URLSearchParams();
    if (page > 1) mine.set(key("page"), String(page));
    if (debouncedSearch.trim()) mine.set(key("search"), debouncedSearch.trim());
    for (const [name, value] of Object.entries(filters)) {
      if (value && value !== defaults[name]) mine.set(key(name), value);
    }
    if (mine.toString()) sessionStorage.setItem(storageKey, mine.toString());
    else sessionStorage.removeItem(storageKey);
  }, [page, debouncedSearch, filters, pathname, key, router, defaults, storageKey]);

  // URL → state, for browser back/forward only. The mirror above uses
  // `router.replace` (history.replaceState), which does NOT emit `popstate`, so
  // this listener can't fire from our own writes - no feedback loop. A real
  // back/forward changes the URL without touching our state, so we adopt the
  // popped URL's values here; the mirror then sees the URL already matches state
  // and skips navigating (no extra history entry).
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const parsedPage = Number(params.get(key("page")) ?? "1");
      setPageState(parsedPage > 0 ? parsedPage : 1);
      setSearchInput(params.get(key("search")) ?? "");
      const next = { ...defaults };
      for (const name of Object.keys(defaults)) {
        const value = params.get(key(name));
        if (value) (next as Record<string, string>)[name] = value;
      }
      setFiltersState(next);
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, [key, defaults]);

  const setSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPageState(1);
  }, []);

  const setFilter = useCallback((name: string, value: string) => {
    setFiltersState((prev) => ({ ...prev, [name]: value }) as F);
    setPageState(1);
  }, []);

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next));
    // A new page of rows starts at the top, not wherever the pager sat.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** Back to the default filters (and page 1); the search text stays. */
  const resetFilters = useCallback(() => {
    setFiltersState(defaults);
    setPageState(1);
  }, [defaults]);

  // Typed for the consumer's query interface; the cast is the one central
  // assertion that the defaults/filterKeys the caller provided line up with
  // that interface (they name the same API params).
  const queryParams = useMemo(() => {
    const clean: Record<string, unknown> = { page };
    if (pageSize) clean.limit = pageSize;
    if (debouncedSearch.trim()) clean.search = debouncedSearch.trim();
    for (const [name, value] of Object.entries(filters)) {
      if (value && value !== defaults[name]) {
        clean[filterKeys?.[name as keyof F] ?? name] = value;
      }
    }
    return clean as unknown as TQuery;
  }, [page, pageSize, debouncedSearch, filters, defaults, filterKeys]);

  return {
    page,
    search: searchInput,
    filters,
    resetFilters,
    setSearch,
    setFilter,
    setPage,
    queryParams,
  };
}
