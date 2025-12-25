import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
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
      query: () => "/users",
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
} = api;
