import React from 'react';
import { useSelector } from 'react-redux';
import { selectMenu } from '../features/menuSlice';
import _ from 'lodash';
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
import ShoppingCart from '../icons/shopping_cart.png';
import Wheat from '../icons/wheat.svg';
import Egg from '../icons/egg.svg';
import Milk from '../icons/milk.svg';
import Peanuts from '../icons/peanuts.svg';
import { useParams } from 'react-router-dom';
import { useGetItemsByRestaurantIdQuery } from '../features/apis';

export default function Items() {
  const { restaurantId } = useParams();
  const { data: menu, isLoading: isMenuLoading } =
    useGetItemsByRestaurantIdQuery([restaurantId]);
  return (
    <div className="items-container">
      <div className="group-container">
        <CardGroup className="card-group">
          {menu?.menuItems.map((menuItem) => {
            const {
              id,
              name,
              category,
              description: desc,
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
