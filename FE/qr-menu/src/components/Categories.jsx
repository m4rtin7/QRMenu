import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  filter,
  selectActiveCategory,
  selectCategories
} from '../features/menuSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Badge, Nav } from 'reactstrap';
import './Categories.css';
import { useParams } from 'react-router-dom';
import { useGetItemsByRestaurantIdQuery } from '../features/apis';

export default function Categories() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const activeCategory = useSelector(selectActiveCategory);
  const { restaurantId } = useParams();
  const { data: menu, isLoading: isMenuLoading } =
    useGetItemsByRestaurantIdQuery([restaurantId]);
  const allCategories = [
    ...new Set(menu?.menuItems.map((item) => item.category))
  ];
  return (
    <div className="category-container">
      <Nav justified pills>
        {allCategories?.map((category) => {
          return (
            <h3 className="badge-styling">
              <Badge
                className={category === activeCategory ? '' : 'text-dark'}
                color={category === activeCategory ? 'dark' : 'light'}
                pill
                onClick={() => dispatch(filter(category))}
              >
                {category}
              </Badge>
            </h3>
          );
        })}
      </Nav>
    </div>
  );
}
