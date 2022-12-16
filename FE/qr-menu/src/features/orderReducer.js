import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tableNumber: undefined,
  isOrderFinalized: false,
  products: []
};

export const orderReducer = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addProductToTheCart: (state, action) => {
      state.products.push(action.payload);
    },
    addTableNumber: (state, action) => {
      state.tableNumber = action.payload;
    },
    deleteProductFromCart: (state, action) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload
      );
    },
    setIsOrderFinalized: (state, action) => {
      state.isOrderFinalized = action.payload;
    },
    resetCart: (state, action) => {
      return initialState;
    }
  }
});

export const getProductsInCart = (state) => {
  return state.order.products;
};

export const getIsFinalized = (state) => {
  return state.order.isOrderFinalized;
};

export const getTableNumber = (state) => {
  return state.order.tableNumber;
};

export const {
  addProductToTheCart,
  addTableNumber,
  deleteProductFromCart,
  setIsOrderFinalized,
  resetCart
} = orderReducer.actions;

export default orderReducer.reducer;
