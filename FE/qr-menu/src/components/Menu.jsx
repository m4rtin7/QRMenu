import React, { useEffect } from 'react';
import Categories from './Categories';
import Items from './Items';
import { useParams } from 'react-router-dom';
import { useGetItemsByRestaurantIdQuery } from '../features/apis';
import { Spinner } from 'reactstrap';
import { initializeMenu, setAllergensList } from '../features/menuSlice';
import { useDispatch } from 'react-redux';

export default function Menu() {
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
    <div className="menu-container">
      <h2 className="page-header">Menu</h2>
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
