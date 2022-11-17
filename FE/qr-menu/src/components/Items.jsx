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
  CardGroup
} from 'reactstrap';

export default function Items() {
  const menu = useSelector(selectMenu);
  const groupBySubcategory = _.groupBy(menu, 'subcategory');
  return (
    <div className="items-container">
      {Object.entries(groupBySubcategory).map(([subcategory, items]) => {
        return (
          <div className="group-container" key={subcategory}>
            <h4>{subcategory}</h4>
            <CardGroup key={subcategory}>
              {items.map((item) => {
                const { id, name, category, desc, price, allergens, img } =
                  item;
                return (
                  <div
                    key={id}
                    className="card-container"
                    style={{ margin: '20px' }}
                  >
                    <Card
                      style={{
                        width: '18rem'
                      }}
                    >
                      <img alt="Sample" src={img} />
                      <CardBody>
                        <CardTitle tag="h5">{name}</CardTitle>
                        <CardSubtitle className="mb-2 text-muted" tag="h6">
                          {price}
                        </CardSubtitle>
                        <CardText>{desc}</CardText>
                      </CardBody>
                    </Card>
                  </div>
                );
              })}
            </CardGroup>
          </div>
        );
      })}
    </div>
  );
}
