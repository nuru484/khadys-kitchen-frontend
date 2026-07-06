"use client";

import { Provider } from "react-redux";
import type { ReactNode } from "react";
import store from "@/redux/store";

/** Mounts the Redux store at the root so any client island can use RTK Query. */
export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
