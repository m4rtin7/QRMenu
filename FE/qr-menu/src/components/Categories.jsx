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

export default function Categories() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const activeCategory = useSelector(selectActiveCategory);
  return (
    <div className="category-container">
      <Nav justified pills>
        {categories.map((category) => {
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
