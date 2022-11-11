import React from "react";
import Categories from "./Categories";
import Items from "./Items";

export default function Menu() {
  return (
    <div className="menu-container">
      <Categories />
      <Items />
    </div>
  );
}
