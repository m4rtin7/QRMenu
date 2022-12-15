import { configureStore } from '@reduxjs/toolkit';
import menuReducer from '../features/menuSlice';
import userReducer from '../features/userReducer';
import { defaultApi } from '../features/apis';

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    isAdmin: userReducer,
    [defaultApi.reducerPath]: defaultApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(defaultApi.middleware)
});
