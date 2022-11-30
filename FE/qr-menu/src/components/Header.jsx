import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { getUserRole, setUserRole } from '../features/userReducer';
import './Header.css';

export const Header = () => {
  const dispatch = useDispatch();
  return (
    <div className="header">
      <span className="name"> Remy kitchen</span>
      <div>
        <span className="name">Menu</span>
        <span className="name">About us</span>
        <Button onClick={() => dispatch(setUserRole())}>Switch user</Button>
      </div>
    </div>
  );
};
