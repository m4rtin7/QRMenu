import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectMenu } from '../features/menuSlice';
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  CardGroup,
  Button
} from 'reactstrap';
import './Items.css';
import ShoppingCart from '../icons/shopping-cart.svg';
import Wheat from '../icons/1.svg';
import Egg from '../icons/3.svg';
import Milk from '../icons/7.svg';
import Peanuts from '../icons/5.svg';
import {
  addProductToTheCart,
  getProductsInCart
} from '../features/orderReducer';

export default function Items() {
  const menu = useSelector(selectMenu);
  const dispatch = useDispatch();
  const orderedProducts = useSelector(getProductsInCart);

  return (
    <div className="items-container">
      <div className="group-container">
        <CardGroup className="card-group">
          {menu?.map((menuItem) => {
            const {
              id,
              name,
              category,
              desc,
              price,
              allergens,
              imageId: img
            } = menuItem;
            return (
              <div key={id} className="card-container">
                <Card color="dark" inverse className="card">
                  <div className="card-image">
                    <img alt="Sample" src={img} />
                  </div>
                  <CardBody>
                    <CardTitle tag="h5">{name}</CardTitle>
                    <CardSubtitle className="mb-2 text-muted" tag="h6">
                      <span className="dot">
                        <img src={Wheat} />
                      </span>
                      <span className="dot">
                        <img src={Egg} />
                      </span>
                      <span className="dot">
                        <img src={Milk} />
                      </span>
                      <span className="dot">
                        <img src={Peanuts} />
                      </span>
                    </CardSubtitle>
                    <CardText>{desc}</CardText>
                    <div className="bottom-panel">
                      <span className="price">€ {price}</span>
                      <Button
                        style={{ background: '#FFBE33' }}
                        className="rounded-circle"
                        onClick={() => {
                          if (
                            !orderedProducts.find(
                              (product) => product.id === menuItem.id
                            )
                          ) {
                            dispatch(addProductToTheCart(menuItem));
                          }
                        }}
                      >
                        <img
                          style={{ height: '30px', width: '30px' }}
                          src={ShoppingCart}
                          alt=""
                        />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </CardGroup>
      </div>
    </div>
  );
}
