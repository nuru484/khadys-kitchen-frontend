import type { IUser } from "./user.types";

export interface IUserLoginInput {
  email: string;
  password: string;
}

/**
 * A 2FA challenge — login returns this *instead of* a user when the account has
 * two-factor enabled. The backend also sets a short-lived `twoFactorPending`
 * httpOnly cookie (10 min) that bridges the login step to the verify step, so
 * the verify call carries no user identifier in its body.
 *
 * NOTE: the exact challenge shape is inferred from the backend's intended
 * contract (the endpoints don't exist yet). Align this once they ship.
 */
export interface ITwoFactorChallenge {
  twoFactorRequired: true;
  /** Masked destination the code was sent to, for display (e.g. k***@mail.com). */
  email?: string;
}

export type LoginData = IUser | ITwoFactorChallenge;

/** Login response envelope — `data` is either a session user or a 2FA challenge. */
export interface ILoginResponse {
  message: string;
  data: LoginData;
}

/** Narrows a login payload to the 2FA-challenge branch. */
export function isTwoFactorChallenge(
  data: LoginData,
): data is ITwoFactorChallenge {
  return (data as ITwoFactorChallenge).twoFactorRequired === true;
}

export interface ITwoFactorVerifyInput {
  code: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token: string;
  password: string;
}

/** Bare success envelope with no data payload (`{ message }`). */
export interface IMessageResponse {
  message: string;
}
