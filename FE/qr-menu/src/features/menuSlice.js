import { createSlice } from "@reduxjs/toolkit";
import data from "../data/menu.json";

const initialState = {
  menuItems: data.items.filter(
    (item) => item.category === "Main"
  ),
  allCategories: Array.from(new Set(data.items.map((item) => item.category))),
  activeCategory: "Main",
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    filter: (state, action) => {
      state.menuItems = data.items.filter(
        (item) => item.category === action.payload
      );
      state.activeCategory = action.payload;
    },
  },
});

export const { filter } = menuSlice.actions;

export const selectMenu = (state) => state.menu.menuItems;

export const selectCategories = (state) => state.menu.allCategories;

export const selectActiveCategory = (state) => state.menu.activeCategory;

export default menuSlice.reducer;
