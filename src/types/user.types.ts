/**
 * The authenticated admin/staff user, mirroring the backend `User` model
 * (`prisma/schema.prisma`) — the safe, client-facing subset (never the
 * password or `tokenVersion`). Khady's Kitchen users are console operators,
 * not storefront customers.
 */
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  role: UserRole;
  twoFactorEnabled: boolean;
}

/** Standard success envelope carrying a single user: `{ message, data }`. */
export interface IUserResponse {
  message: string;
  data: IUser;
}
