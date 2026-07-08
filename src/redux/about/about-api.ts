import { apiSlice } from "../api-slice";
import type {
  IAboutContent,
  IAboutResponse,
  IAboutUpdateInput,
} from "@/types/about.types";

/** A new image travels WITH the save as multipart (a `payload` JSON part +
 * the `storyImage` file the backend expects); without one we send plain JSON. */
const toMultipart = (body: IAboutUpdateInput, image: File): FormData => {
  const form = new FormData();
  form.append("payload", JSON.stringify(body));
  form.append("storyImage", image);
  return form;
};

/** The home page's About (Our Story) content — public read, admin write. */
export const aboutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicAbout: builder.query<IAboutResponse, void>({
      query: () => ({ url: "about", method: "GET" }),
      providesTags: ["About"],
    }),

    getAdminAbout: builder.query<IAboutResponse, void>({
      query: () => ({ url: "admin/about", method: "GET" }),
      providesTags: ["About"],
    }),

    updateAbout: builder.mutation<
      { message: string; data: IAboutContent },
      { body: IAboutUpdateInput; image?: File }
    >({
      query: ({ body, image }) => ({
        url: "admin/about",
        method: "PATCH",
        body: image ? toMultipart(body, image) : body,
      }),
      invalidatesTags: ["About"],
    }),
  }),
});

export const {
  useGetPublicAboutQuery,
  useGetAdminAboutQuery,
  useUpdateAboutMutation,
} = aboutApi;
