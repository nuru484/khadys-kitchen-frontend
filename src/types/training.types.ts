/**
 * Trainings (classes students enrol in), mirroring the backend `toTrainingDTO`.
 * A training stands alone — its name IS its kind ("Bakery Class", "Wedding
 * Cake Class"…).
 */
export interface IFeeItem {
  id: string;
  name: string;
  /** Minor units (pesewas). 0 for free / bring-your-own rows. */
  amount: number;
  kind: string;
  required: boolean;
  note: string | null;
  /** Unit label after the price, e.g. "for 2 months". */
  suffix: string | null;
  /** Overrides the formatted price, e.g. "Free", "—". */
  priceLabel: string | null;
  position: number;
}

export interface ITraining {
  id: string;
  name: string;
  slug: string;
  /** One short paragraph shown on cards and at the top of the class page. */
  summary: string;
  coverImage: string | null;
  /** "What you'll learn" bullets. */
  learnOutcomes: string[];
  /** Tools/items to bring. */
  whatToBring: string[];
  /** "What's included" bullets. */
  included: string[];
  /** Who it's for / prerequisites. */
  forWho: string[];
  /** Downloadable prospectus (PDF) URL. */
  prospectusUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  /** e.g. "Saturdays, 9am–1pm". */
  schedule: string | null;
  /** e.g. "2 months". */
  duration: string | null;
  /** e.g. "In-person · Kumasi studio". */
  mode: string | null;
  hasCertificate: boolean;
  currency: string;
  capacity: number | null;
  applicationsOpen: boolean;
  isPublished: boolean;
  /** Shows in the home page's featured trainings section (newest 3). */
  isFeatured: boolean;
  feeItems?: IFeeItem[];
  counts?: { applications: number; students: number };
  createdAt: string;
  updatedAt: string;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** `GET /trainings` — published classes, newest first. */
export interface ITrainingListResponse {
  message: string;
  data: ITraining[];
  meta: IPaginationMeta;
}

export interface ITrainingResponse {
  message: string;
  data: ITraining;
}

export interface IFeeItemInput {
  name: string;
  amount: number;
  kind: string;
  required: boolean;
  note?: string;
  suffix?: string;
  priceLabel?: string;
  position?: number;
}

/** Body for creating/updating a training (the admin form). */
export interface ITrainingInput {
  name: string;
  summary: string;
  coverImage?: string | null;
  learnOutcomes?: string[];
  whatToBring?: string[];
  included?: string[];
  forWho?: string[];
  prospectusUrl?: string | null;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  duration?: string;
  mode?: string;
  hasCertificate?: boolean;
  capacity?: number;
  applicationsOpen?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  feeItems?: IFeeItemInput[];
}

export interface ITrainingListQuery {
  /** Created-date window, YYYY-MM-DD (inclusive). */
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  applicationsOpen?: boolean;
  /** `true` = only home-page-featured classes. */
  featured?: boolean;
  published?: boolean;
  search?: string;
}
