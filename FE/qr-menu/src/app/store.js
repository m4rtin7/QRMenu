import { configureStore } from '@reduxjs/toolkit';
import menuReducer from '../features/menuSlice';
import userReducer from '../features/userReducer';

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    isAdmin: userReducer
  }
});
