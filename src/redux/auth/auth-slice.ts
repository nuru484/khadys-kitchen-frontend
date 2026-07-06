import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "@/types/user.types";

interface AuthState {
  user: IUser | null;
}

const STORAGE_KEY = "kk.auth.user";

// Rehydrate synchronously so the console doesn't flash a logged-out state on
// reload. localStorage is unavailable during SSR (and in reducer unit tests),
// so every access is guarded. Only the *user* is persisted — never tokens,
// which live in httpOnly cookies the browser can't read.
const storedUser =
  typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

const initialState: AuthState = {
  user: storedUser
    ? (() => {
        try {
          return JSON.parse(storedUser) as IUser;
        } catch {
          return null;
        }
      })()
    : null,
};

const persistUser = (user: IUser | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action: PayloadAction<{ user: IUser }>) => {
      state.user = action.payload.user;
      persistUser(action.payload.user);
    },

    userLoggedOut: (state) => {
      state.user = null;
      persistUser(null);
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;

export default authSlice.reducer;
