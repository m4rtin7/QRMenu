import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const defaultApi = createApi({
  reducerPath: 'defaultApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://qrmenu-asdit.herokuapp.com/api/v1',
    prepareHeaders: (headers) => {
      headers.set(
        'Authorization',
        `Bearer ${localStorage.getItem('token') || ''}`
      );
      return headers;
    }
  }),
  tagTypes: ['Menu'],
  endpoints: (builder) => ({
    getAllAlergens: builder.query({
      query: () => ({ url: '/allergens', method: 'GET' }),
      providesTags: []
    }),
    getItemsByRestaurantId: builder.query({
      query: (id) => ({
        url: `/${id}/menu-items`,
        method: 'GET'
      }),
      providesTags: ['Menu']
    }),
    //mutations
    login: builder.mutation({
      query: (loginCredentials) => ({
        url: '/authorization/login',
        body: loginCredentials,
        method: 'POST'
      })
    }),
    uploadMenuItemForRestaurantId: builder.mutation({
      query: ({ restaurantId, menuItem }) => ({
        url: `/${restaurantId}/menu-items`,
        method: 'POST',
        body: menuItem
      }),
      invalidatesTags: ['Menu']
    }),
    deleteMenuItemForRestaurantId: builder.mutation({
      query: ({ restaurantId, menuItemId }) => ({
        url: `/${restaurantId}/menu-items/${menuItemId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Menu']
    }),
    updateMenuItemForRestaurantId: builder.mutation({
      query: ({ restaurantId, menuItemId, menuItem }) => ({
        url: `/${restaurantId}/menu-items/${menuItemId}`,
        method: 'PATCH',
        body: menuItem
      }),
      invalidatesTags: ['Menu']
    })
  })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetAllAlergensQuery,
  useDeleteMenuItemForRestaurantIdMutation,
  useGetItemsByRestaurantIdQuery,
  useLoginMutation,
  useUpdateMenuItemForRestaurantIdMutation,
  useUploadMenuItemForRestaurantIdMutation
} = defaultApi;
