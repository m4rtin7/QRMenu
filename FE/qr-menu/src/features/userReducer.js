import { createSlice } from '@reduxjs/toolkit';

const initialState = false;

export const userReducer = createSlice({
  name: 'role',
  initialState
});

export const getUserRole = (state) => state.isAdmin;

export default userReducer.reducer;
