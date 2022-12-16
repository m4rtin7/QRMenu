import React, { useEffect } from 'react';
import Categories from './Categories';
import Items from './Items';
import './AdminMenu.css';
import { useGetItemsByRestaurantIdQuery } from '../../features/apis';
import { Spinner } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initializeMenu, setAllergensList } from '../../features/menuSlice';

export default function AdminMenu() {
  const dispatch = useDispatch();
  const { restaurantId } = useParams();
  const { data, isLoading: isMenuLoading } = useGetItemsByRestaurantIdQuery([
    restaurantId
  ]);
  const { menuItems } = data || {};
  useEffect(() => {
    if (!isMenuLoading) {
      dispatch(initializeMenu(menuItems));
      dispatch(setAllergensList());
    }
  }, [isMenuLoading]);
  return (
    <div className="admin-menu-container">
      {isMenuLoading ? (
        <Spinner color="dark">Loading...</Spinner>
      ) : (
        <>
          <Categories />
          <Items />
        </>
      )}
    </div>
  );
}
