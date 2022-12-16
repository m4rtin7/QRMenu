import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input } from 'reactstrap';
import './Header.css';
import {
  addTableNumber,
  getProductsInCart,
  getIsFinalized,
  setIsOrderFinalized,
  getTableNumber
} from '../features/orderReducer';
import { ItemInfo } from './ItemInfo';

const priceCount = (products) => {
  let sum = 0;
  products.map((product) => (sum += +product.price));
  return sum;
};

export const OrderPage = () => {
  const dispatch = useDispatch();
  const orderedProducts = useSelector(getProductsInCart);
  const isOrderFinalized = useSelector(getIsFinalized);
  const tableNumber = useSelector(getTableNumber);
  const total = priceCount(orderedProducts);

  return (
    <div>
      {isOrderFinalized ? (
        <div style={{ marginTop: '5%' }}>
          <h3>Order was successfully created for table number {tableNumber}</h3>
          <p>Total sum of the order: {total}</p>
        </div>
      ) : (
        <div>
          <h1>Order overview</h1>
          <div
            style={{
              display: 'flex',
              marginLeft: '10%',
              marginTop: '5%',
              alignItems: 'baseline'
            }}
          >
            <h4>Table number</h4>
            <div style={{ marginLeft: '3%', width: '75px' }}>
              <Input
                type="number"
                onChange={(event) =>
                  dispatch(addTableNumber(event.target.value))
                }
              />
            </div>
          </div>
          {!orderedProducts || orderedProducts?.length === 0 ? (
            <>
              <h4 style={{ marginTop: '7%' }}>No products to show</h4>
            </>
          ) : (
            <>
              {orderedProducts.map((orderedProduct) => {
                return (
                  <div style={{ marginTop: '4%' }}>
                    <ItemInfo menuItem={orderedProduct} />
                  </div>
                );
              })}
              <div className="order-button">
                <Button
                  color="dark"
                  size="lg"
                  disabled={!tableNumber}
                  onClick={() => dispatch(setIsOrderFinalized(true))}
                >
                  Order
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
