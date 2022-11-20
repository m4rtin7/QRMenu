import { createSlice } from '@reduxjs/toolkit';
import data from '../data/menu.json';

const initialState = {
  menuItems: data.items.filter((item) => item.category === 'Main'),
  allCategories: Array.from(new Set(data.items.map((item) => item.category))),
  allSubcategories: Array.from(
    new Set(data.items.map((item) => item.subcategory))
  ),
  allAllergens: [],
  activeCategory: 'Main'
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const mapAllergens = (data) => {
  let allergens = [];
  data.items.map((item) => {
    item.allergens.forEach((all) => {
      allergens.push(all);
    });
  });
  return allergens.filter(onlyUnique);
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    filter: (state, action) => {
      state.menuItems = data.items.filter(
        (item) => item.category === action.payload
      );
      state.activeCategory = action.payload;
    },
    setAllergensList: (state) => {
      state.allAllergens = mapAllergens(data);
    },
    addCategory: (state, action) => {
      state.allCategories.push(action.payload);
    },
    addProduct: (state, action) => {
      state.menuItems = [
        ...state.menuItems,
        {
          id: data.items.length + 1,
          category: action.payload.category,
          subcategory: action.payload.subcategory,
          name: action.payload.dishName,
          desc: action.payload.description,
          price: action.payload.price,
          allergens: action.payload.allergens
        }
      ];
    },
    editProduct: (state, action) => {
      state.menuItems = [
        ...state.menuItems.filter((item) => item !== action.payload.id),
        {
          id: action.payload.id,
          category: action.payload.category,
          subcategory: action.payload.subcategory,
          name: action.payload.dishName,
          desc: action.payload.description,
          price: action.payload.price,
          allergens: action.payload.allergens
        }
      ];
    },
    deleteCategory: (state, action) => {
      state.allCategories = state.allCategories.filter(
        (category) => category !== action.payload
      );
    }
  }
});

export const { filter } = menuSlice.actions;
export const { addCategory } = menuSlice.actions;
export const { setAllergensList } = menuSlice.actions;
export const { addProduct } = menuSlice.actions;
export const { editProduct } = menuSlice.actions;
export const { deleteCategory } = menuSlice.actions;

export const selectMenu = (state) => state.menu.menuItems;

export const selectCategories = (state) => state.menu.allCategories;

export const selectSubcategories = (state) => state.menu.allSubcategories;

export const selectActiveCategory = (state) => state.menu.activeCategory;

export const selectAllergens = (state) => state.menu.allAllergens;

export default menuSlice.reducer;
