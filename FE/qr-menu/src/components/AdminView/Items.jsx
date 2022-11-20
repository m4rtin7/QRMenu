import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  editProduct,
  selectCategories,
  selectMenu,
  selectSubcategories
} from '../../features/menuSlice';
import _ from 'lodash';
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  CardGroup,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Label,
  FormText,
  ModalFooter,
  Modal,
  Col,
  Row,
  Form
} from 'reactstrap';
import EditIcon from './images/edit.svg';

export default function Items() {
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  const menu = useSelector(selectMenu);
  const groupBySubcategory = _.groupBy(menu, 'subcategory');
  const categories = useSelector(selectCategories);
  const subcategories = useSelector(selectSubcategories);
  const toggle = () => setModal(!modal);
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
                        <div style={{ display: 'block' }}>
                          <CardTitle
                            tag="h5"
                            style={{ display: 'inline-block' }}
                          >
                            {name}
                          </CardTitle>
                          <img
                            src={EditIcon}
                            style={{
                              width: '24px',
                              height: '24px',
                              display: 'inline-block',
                              margin: '0 0 5px 30px'
                            }}
                            alt="Edit Icon"
                            onClick={toggle}
                            id={`${id}_${name}`}
                          />
                          <Modal isOpen={modal} toggle={toggle}>
                            <ModalHeader toggle={toggle}>
                              Edit menu item
                            </ModalHeader>
                            <ModalBody>
                              <Form>
                                <Row>
                                  <Col>
                                    <span>Category:</span>
                                    <Input
                                      id="category-select"
                                      name="select"
                                      type="select"
                                    >
                                      <option>{category}</option>
                                      {categories
                                        .filter((opt) => opt !== category)
                                        .map((cat, idx) => {
                                          return (
                                            <option key={idx}>
                                              <span>{cat}</span>
                                            </option>
                                          );
                                        })}
                                    </Input>
                                  </Col>
                                  <Col>
                                    <span>Subcategory:</span>
                                    <Input
                                      id="subcategory-select"
                                      name="subcategory-select"
                                      type="select"
                                    >
                                      <option>{subcategory}</option>
                                      {subcategories
                                        .filter((opt) => opt !== subcategory)
                                        .map((subcat, idx) => {
                                          return (
                                            <option key={idx}>
                                              <span>{subcat}</span>
                                            </option>
                                          );
                                        })}
                                    </Input>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <span>Dish name</span>
                                    <input
                                      id="dish-name"
                                      style={{ width: '100%' }}
                                      value={name}
                                    />
                                  </Col>
                                  <Col>
                                    <span>
                                      Price:{' '}
                                      <input
                                        id="price"
                                        type="number"
                                        value={price}
                                      />
                                    </span>
                                  </Col>
                                </Row>
                                <span>Allergens:</span>
                                {allergens.map((allergen, idx) => {
                                  return (
                                    <>
                                      {'  '}
                                      <Input type="checkbox" id={idx} />{' '}
                                      <Label check>{allergen}</Label>
                                    </>
                                  );
                                })}
                                <br />
                                <span>Description</span>
                                <textarea
                                  id="description"
                                  style={{ width: '100%' }}
                                  rows="4"
                                  value={desc}
                                />
                                <Label for="exampleFile">File</Label>
                                <Input
                                  id="exampleFile"
                                  name="file"
                                  type="file"
                                />
                                <FormText>Upload picture of item</FormText>
                              </Form>
                            </ModalBody>
                            <ModalFooter>
                              <Button
                                color="primary"
                                onClick={() => {
                                  const category =
                                    document.getElementById(
                                      'category-select'
                                    ).value;
                                  const subcategory =
                                    document.getElementById(
                                      'subcategory-select'
                                    ).value;
                                  const dishName =
                                    document.getElementById('dish-name').value;
                                  const description =
                                    document.getElementById(
                                      'description'
                                    ).value;
                                  const price =
                                    document.getElementById('price').value;
                                  const item = {
                                    id,
                                    category,
                                    subcategory,
                                    dishName,
                                    description,
                                    price,
                                    allergens: []
                                  };
                                  dispatch(editProduct(item));
                                  toggle();
                                }}
                              >
                                Save
                              </Button>
                            </ModalFooter>
                          </Modal>
                        </div>
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
