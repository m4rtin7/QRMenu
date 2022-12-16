import React from 'react';
import Categories from './Categories';
import Items from './Items';
import './AdminMenu.css';
import { useGetItemsByRestaurantIdQuery } from '../../features/apis';
import { Spinner } from 'reactstrap';
import { useParams } from 'react-router-dom';

export default function AdminMenu() {
  const { restaurantId } = useParams();
  const { isLoading: isMenuLoading } = useGetItemsByRestaurantIdQuery([
    restaurantId
  ]);
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
