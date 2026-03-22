import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../slices/authSlice";
import { showGlobalError } from "../slices/uiSlice";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

// Automatically refresh the access token on 401 and retry the original request.
let isRefreshing = false;

function getRequestPath(args) {
  if (typeof args === "string") return args;
  if (args && typeof args === "object") return args.url || "";
  return "";
}

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error.data === "string") return error.data;
  if (error.data && typeof error.data === "object" && error.data.message) {
    return error.data.message;
  }
  return error.error || "Request failed";
}

function shouldSuppressGlobalError(path, status) {
  return (
    path.includes("/auth/login") ||
    path.includes("/auth/refresh") ||
    status === 401
  );
}

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const path = getRequestPath(args);
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401 && !isRefreshing) {
    isRefreshing = true;
    const refreshToken = api.getState().auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions,
      );

      if (refreshResult?.data) {
        const {
          user,
          accessToken,
          refreshToken: newRefreshToken,
        } = refreshResult.data;
        api.dispatch(
          setCredentials({ user, accessToken, refreshToken: newRefreshToken }),
        );
        // Retry the original request with the new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed — log user out
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
    isRefreshing = false;
  }

  if (result?.error && !shouldSuppressGlobalError(path, result.error.status)) {
    api.dispatch(
      showGlobalError({
        message: getErrorMessage(result.error),
        status: result.error.status,
      }),
    );
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Hotel",
    "Restaurant",
    "Activity",
    "Booking",
    "Room",
    "Finance",
    "Report",
    "Sidebar",
    "Icon",
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    refresh: builder.mutation({
      query: (body) => ({ url: "/auth/refresh", method: "POST", body }),
    }),
    getSidebar: builder.query({
      query: () => "/sidebar",
      providesTags: ["Sidebar"],
    }),
    // Users CRUD
    getUsers: builder.query({
      query: (params) => ({
        url: "/users",
        params: params || undefined,
      }),
      providesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ _id, ...body }) => ({
        url: `/users/${_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    // Hotels CRUD
    getHotels: builder.query({
      query: () => "/hotels",
      providesTags: ["Hotel"],
    }),
    createHotel: builder.mutation({
      query: (body) => ({ url: "/hotels", method: "POST", body }),
      invalidatesTags: ["Hotel"],
    }),
    updateHotel: builder.mutation({
      query: ({ _id, ...body }) => ({
        url: `/hotels/${_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Hotel"],
    }),
    deleteHotel: builder.mutation({
      query: (id) => ({ url: `/hotels/${id}`, method: "DELETE" }),
      invalidatesTags: ["Hotel"],
    }),
    // Restaurants CRUD
    getRestaurants: builder.query({
      query: () => "/restaurants",
      providesTags: ["Restaurant"],
    }),
    createRestaurant: builder.mutation({
      query: (body) => ({ url: "/restaurants", method: "POST", body }),
      invalidatesTags: ["Restaurant"],
    }),
    updateRestaurant: builder.mutation({
      query: ({ _id, ...body }) => ({
        url: `/restaurants/${_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Restaurant"],
    }),
    deleteRestaurant: builder.mutation({
      query: (id) => ({ url: `/restaurants/${id}`, method: "DELETE" }),
      invalidatesTags: ["Restaurant"],
    }),
    // Activities CRUD
    getActivities: builder.query({
      query: () => "/activities",
      providesTags: ["Activity"],
    }),
    createActivity: builder.mutation({
      query: (body) => ({ url: "/activities", method: "POST", body }),
      invalidatesTags: ["Activity"],
    }),
    updateActivity: builder.mutation({
      query: ({ _id, ...body }) => ({
        url: `/activities/${_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Activity"],
    }),
    deleteActivity: builder.mutation({
      query: (id) => ({ url: `/activities/${id}`, method: "DELETE" }),
      invalidatesTags: ["Activity"],
    }),
    // Bookings CRUD
    getBookings: builder.query({
      query: () => "/bookings",
      providesTags: ["Booking"],
    }),
    createBooking: builder.mutation({
      query: (body) => ({ url: "/bookings", method: "POST", body }),
      invalidatesTags: ["Booking"],
    }),
    updateBooking: builder.mutation({
      query: ({ _id, ...body }) => ({
        url: `/bookings/${_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),
    deleteBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Booking"],
    }),
    // Rooms CRUD
    getRooms: builder.query({
      query: () => "/rooms",
      providesTags: ["Room"],
    }),
    createRoom: builder.mutation({
      query: (body) => ({ url: "/rooms", method: "POST", body }),
      invalidatesTags: ["Room"],
    }),
    updateRoom: builder.mutation({
      query: ({ _id, ...body }) => ({
        url: `/rooms/${_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Room"],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({ url: `/rooms/${id}`, method: "DELETE" }),
      invalidatesTags: ["Room"],
    }),
    // Finance (read-only)
    getFinance: builder.query({
      query: () => "/finance",
      providesTags: ["Finance"],
    }),
    // Reports (read-only)
    getReports: builder.query({
      query: () => "/reports",
      providesTags: ["Report"],
    }),
    // Icons library
    getIcons: builder.query({
      query: () => "/icons",
      providesTags: ["Icon"],
    }),
    getIconRequests: builder.query({
      query: () => "/icons/requests",
      providesTags: ["Icon"],
    }),
    createIcon: builder.mutation({
      query: (body) => ({ url: "/icons", method: "POST", body }),
      invalidatesTags: ["Icon"],
    }),
    updateIcon: builder.mutation({
      query: ({ _id, ...body }) => ({
        url: `/icons/${_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Icon"],
    }),
    deleteIcon: builder.mutation({
      query: (id) => ({ url: `/icons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Icon"],
    }),
    requestIcon: builder.mutation({
      query: (body) => ({ url: "/icons/request", method: "POST", body }),
      invalidatesTags: ["Icon"],
    }),
    // Hotel selected icons
    updateHotelIcons: builder.mutation({
      query: ({ hotelId, selectedIcons }) => ({
        url: `/hotels/${hotelId}`,
        method: "PUT",
        body: { selectedIcons },
      }),
      invalidatesTags: ["Hotel"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useGetSidebarQuery,
  // Users
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // Hotels
  useGetHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  // Restaurants
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  // Activities
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  // Bookings
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  // Rooms
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  // Finance & Reports
  useGetFinanceQuery,
  useGetReportsQuery,
  // Icons
  useGetIconsQuery,
  useGetIconRequestsQuery,
  useCreateIconMutation,
  useUpdateIconMutation,
  useDeleteIconMutation,
  useRequestIconMutation,
  useUpdateHotelIconsMutation,
} = api;
