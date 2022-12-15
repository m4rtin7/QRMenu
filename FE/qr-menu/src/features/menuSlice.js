import { createSlice } from '@reduxjs/toolkit';

const allCategories = (items) => {
  let categories = ['All'];
  items.map((item) => {
    if (categories.indexOf(item.category) === -1) {
      categories.push(item.category);
    }
  });
  return categories;
};

const initialState = {
  allItems: [],
  menuItems: [],
  allCategories: [],
  allSubcategories: [],
  allAllergens: [],
  activeCategory: 'All'
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const mapAllergens = (data) => {
  let allergens = [];
  data.map((item) => {
    item.allergens.forEach((allergen) => {
      allergens.push({
        id: allergen.id,
        name: allergen.name,
        description: allergen.description
      });
    });
  });
  return allergens.filter(onlyUnique);
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    initializeMenu: (state, action) => {
      state.allItems = action.payload;
      state.menuItems = action.payload;
      state.allCategories = allCategories(action.payload);
      state.allSubcategories = Array.from(
        new Set(action.payload.map((item) => item.subcategory))
      );
    },
    filter: (state, action) => {
      state.menuItems =
        action.payload === 'All'
          ? state.allItems
          : state.allItems.filter((item) => item.category === action.payload);
      state.activeCategory = action.payload;
    },
    setAllergensList: (state) => {
      state.allAllergens = mapAllergens(state.allItems);
    },
    addCategory: (state, action) => {
      state.allCategories.push(action.payload);
    },
    addProduct: (state, action) => {
      state.menuItems = [
        ...state.menuItems,
        {
          id: Math.max(...state.allItems.map((it) => it.id)) + 1,
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
        ...state.menuItems.filter((item) => item.id !== action.payload.id),
        {
          id: action.payload.id,
          category: action.payload.category,
          subcategory: action.payload.subcategory,
          name: action.payload.dishName,
          desc: action.payload.description,
          price: action.payload.price,
          allergens: action.payload.allergens,
          img: action.payload.img
        }
      ].sort(function (a, b) {
        return a.id - b.id;
      });
    },
    deleteCategory: (state, action) => {
      state.allCategories = state.allCategories.filter(
        (category) => category !== action.payload
      );
    },
    deleteItem: (state, action) => {
      state.menuItems = state.menuItems.filter(
        (item) => item.name !== action.payload
      );
    }
  }
});

export const { filter, initializeMenu } = menuSlice.actions;
export const { addCategory } = menuSlice.actions;
export const { setAllergensList } = menuSlice.actions;
export const { addProduct } = menuSlice.actions;
export const { editProduct } = menuSlice.actions;
export const { deleteCategory } = menuSlice.actions;
export const { deleteItem } = menuSlice.actions;

export const selectMenu = (state) => state.menu.menuItems;

export const selectCategories = (state) => state.menu.allCategories;

export const selectSubcategories = (state) => state.menu.allSubcategories;

export const selectActiveCategory = (state) => state.menu.activeCategory;

export const selectAllergens = (state) => state.menu.allAllergens;

export default menuSlice.reducer;
