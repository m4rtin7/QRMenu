import React from 'react';
import Categories from './Categories';
import Items from './Items';
import './AdminMenu.css';

export default function AdminMenu() {
  return (
    <div className="admin-menu-container">
      <Categories />
      <Items />
    </div>
  );
}
