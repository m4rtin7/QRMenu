import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  filter,
  selectActiveCategory,
  selectCategories,
} from "../features/menuSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { Nav, NavItem, NavLink } from "reactstrap";

export default function Categories() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const activeCategory = useSelector(selectActiveCategory);
  return (
    <div className="categories-container">
      <Nav justified pills>
        {categories.map((category, index) => {
          return (
            <NavItem onClick={() => dispatch(filter(category))} key={index}>
              <NavLink active={category == activeCategory} href="#">
                {category}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
    </div>
  );
}
