import { createSlice } from '@reduxjs/toolkit';

const initialState = false;

export const userReducer = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setUserRole: (state) => {
      state = !state;
      return state;
    }
  }
});

export const getUserRole = (state) => state.isAdmin;

export const { setUserRole } = userReducer.actions;

export default userReducer.reducer;
