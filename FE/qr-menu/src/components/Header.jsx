import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Button } from 'reactstrap';
import { getUserRole, setUserRole } from '../features/userReducer';
import './Header.css';
import ShoppingCart from '../icons/shopping-cart.svg';
import { useNavigate } from 'react-router-dom';
import {
  getIsFinalized,
  getProductsInCart,
  resetCart
} from '../features/orderReducer';
import { useParams } from 'react-router-dom';

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = useSelector(getUserRole);
  const productsInCart = useSelector(getProductsInCart);
  const isOrderFinalized = useSelector(getIsFinalized);
  const { restaurantId } = useParams();

  return (
    <div className="header">
      <span className="name"> Remy kitchen</span>
      <div style={{ display: 'flex' }}>
        <span
          className="name clickable"
          onClick={() => navigate('/menu/' + restaurantId)}
        >
          Menu
        </span>
        <span className="name">About us</span>
        <Button onClick={() => dispatch(setUserRole())}>Switch user</Button>
        {!isAdmin && (
          <>
            <img
              className="shopping-cart-icon"
              src={ShoppingCart}
              onClick={() => {
                navigate('/menu/1/shoppingcart');
                if (isOrderFinalized) {
                  dispatch(resetCart());
                }
              }}
            />
            {productsInCart?.length && !isOrderFinalized && (
              <Badge className="badge-style">{productsInCart.length}</Badge>
            )}
          </>
        )}
      </div>
    </div>
  );
};
