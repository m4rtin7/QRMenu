import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  editProduct,
  selectCategories,
  selectMenu,
  selectSubcategories,
  deleteItem
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
import Wheat from '../../icons/wheat.svg';
import Egg from '../../icons/egg.svg';
import Milk from '../../icons/milk.svg';
import Peanuts from '../../icons/peanuts.svg';
import Trash from './images/trash.svg';
import { useQuery } from 'react-query';

export default function Items() {
  const [openedModal, setOpenedModal] = useState(null);
  const [prodName, setProdName] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [description, setDescription] = useState('');

  const dispatch = useDispatch();
  const menu = useSelector(selectMenu);
  const categories = useSelector(selectCategories);
  const subcategories = useSelector(selectSubcategories);

  const openModal = (id) => setOpenedModal(id);
  const closeModal = () => setOpenedModal(null);

  const [checkedAllergens, setCheckedAllergens] = useState([]);

  const { data } = useQuery('allergens', () =>
    fetch('https://qrmenu-asdit.herokuapp.com/api/v1/allergens/').then((res) =>
      res.json()
    )
  );

  const handleAllergensChange = (idx) => {
    const updatedCheckedAllergens = checkedAllergens.map((a, i) =>
      i == idx ? !a : a
    );

    setCheckedAllergens(updatedCheckedAllergens);
  };

  return (
    <div className="items-container">
      <div className="group-container">
        <CardGroup>
          {menu.map((item) => {
            const { id, name, category, desc, price, allergens, img } = item;
            return (
              <div key={id} className="card-container">
                <Card color="dark" inverse className="card">
                  <div className="card-image">
                    <img alt="Sample" src={img} />
                  </div>
                  <CardBody>
                    <div style={{ display: 'block' }}>
                      <CardTitle tag="h5" style={{ display: 'inline-block' }}>
                        {name}
                      </CardTitle>
                      <img
                        src={EditIcon}
                        className="edit-icon"
                        alt="Edit Icon"
                        onClick={() => {
                          openModal(id);
                          setProdName(name);
                          setPriceValue(price);
                          setDescription(desc);
                          setCheckedAllergens(
                            data?.allergens.map((a) => allergens.includes(a))
                          );
                        }}
                        id={`${id}_${name}`}
                      />
                      <img
                        src={Trash}
                        className="remove-icon"
                        alt="Remove Icon"
                        onClick={() => {
                          dispatch(deleteItem(name));
                        }}
                      />
                      <Modal isOpen={openedModal === id} toggle={closeModal}>
                        <ModalHeader>Edit menu item</ModalHeader>
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
                                  {subcategories.map((subcat, idx) => {
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
                                <Input
                                  id="dish-name"
                                  value={prodName}
                                  type="text"
                                  onChange={(event) =>
                                    setProdName(event.target.value)
                                  }
                                />
                              </Col>
                              <Col>
                                <span>
                                  Price:{' '}
                                  <Input
                                    id="price"
                                    type="number"
                                    value={priceValue}
                                    onChange={(event) =>
                                      setPriceValue(event.target.value)
                                    }
                                  />
                                </span>
                              </Col>
                            </Row>
                            <span>Allergens:</span>
                            {data?.allergens.map((allergen, idx) => {
                              return (
                                <>
                                  {'  '}
                                  <Input
                                    type="checkbox"
                                    checked={checkedAllergens[idx]}
                                    onChange={() => handleAllergensChange(idx)}
                                    id={idx}
                                  />{' '}
                                  <Label>{allergen.name}</Label>
                                </>
                              );
                            })}
                            <br />
                            <span>Description</span>
                            <Input
                              id="description"
                              type="textarea"
                              rows="4"
                              value={description}
                              onChange={(event) =>
                                setDescription(event.target.value)
                              }
                            />
                            <Label for="exampleFile">File</Label>
                            <Input id="exampleFile" name="file" type="file" />
                            <FormText>Upload picture of item</FormText>
                          </Form>
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            color="dark"
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
                                document.getElementById('description').value;
                              const price =
                                document.getElementById('price').value;
                              const item = {
                                id,
                                category,
                                subcategory,
                                dishName,
                                description,
                                price,
                                allergens: data?.allergens.filter(
                                  (a, i) => checkedAllergens[i]
                                ),
                                img
                              };
                              dispatch(editProduct(item));
                              closeModal();
                            }}
                          >
                            Save
                          </Button>
                        </ModalFooter>
                      </Modal>
                    </div>
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
