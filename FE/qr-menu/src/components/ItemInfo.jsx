import React from 'react';
import './Header.css';
import TrashIcon from '../icons/trash.svg';
import './ItemInfo.css';
import { useDispatch } from 'react-redux';
import { deleteProductFromCart } from '../features/orderReducer';

export function ItemInfo({ menuItem }) {
  const dispatch = useDispatch();
  return (
    <div>
      <div className="card mb-3">
        <div className="row no-gutters">
          <div className="col-md-3">
            <img
              src={menuItem.imageID}
              className="card-img"
              alt={menuItem.name}
            />
          </div>
          <div className="col-md-5">
            <div className="card-body">
              <h5 className="card-title">{menuItem.name}</h5>
            </div>
          </div>
          <div className="col-md-2">
            <p>{menuItem.price}</p>
          </div>
          <div className="col-md-1 clickable">
            <img
              className="trash-icon"
              src={TrashIcon}
              onClick={() => dispatch(deleteProductFromCart(menuItem.id))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
