import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addCategory,
  deleteCategory,
  filter,
  initializeMenu,
  selectActiveCategory,
  selectCategories
} from '../../features/menuSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Badge,
  Button,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem
} from 'reactstrap';
import { getUserRole } from '../../features/userReducer';
import EditIcon from './images/edit.svg';
import Trash from './images/trash.svg';
import './Categories.css';
import QRCode from 'react-qr-code';
import { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import {
  useGetAllAlergensQuery,
  useGetItemsByRestaurantIdQuery,
  useUploadMenuItemForRestaurantIdMutation
} from '../../features/apis';
import { useParams } from 'react-router-dom';

export default function Categories() {
  const { restaurantId } = useParams();
  const [modal, setModal] = useState(false);
  const [open, setOpen] = useState('0');
  const toggleAccordion = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const toggle = () => setModal(!modal);
  const isAdmin = useSelector(getUserRole);
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const { data: allergensResponse } = useGetAllAlergensQuery();
  const activeCategory = useSelector(selectActiveCategory);
  const QRCodeRef = useRef(null);
  const [validationError, setValidationError] = useState('');

  function validate(subcategory, dishName, description, price) {
    if (subcategory == '') {
      setValidationError('Subcategory cannot be empty');
      return false;
    }
    if (dishName == '') {
      setValidationError('Dish name cannot be empty');
      return false;
    }
    const number = parseInt(price);
    if (isNaN(number)) {
      setValidationError('Price needs to be number');
      return false;
    }
    if (description == '') {
      setValidationError('Description cannot be empty');
      return false;
    }
    setValidationError('');
    return true;
  }

  const [uploadMenuItem] = useUploadMenuItemForRestaurantIdMutation();
  const { data, status: menuLoadedStatus } = useGetItemsByRestaurantIdQuery([
    restaurantId
  ]);

  useEffect(() => {
    if (menuLoadedStatus === 'fulfilled') {
      dispatch(initializeMenu(data.menuItems));
    }
  }, [menuLoadedStatus]);

  return (
    <div style={{ margin: '20px' }}>
      <Nav justified pills vertical>
        {isAdmin ? (
          <>
            <NavItem onClick={toggle} className="edit-button">
              <Button color="dark" outline>
                <span>Edit menu</span>
                <img className="add-icon" src={EditIcon} alt="Edit Icon" />
              </Button>
            </NavItem>
            <Modal isOpen={modal} toggle={toggle}>
              <ModalHeader toggle={toggle}>Add menu items</ModalHeader>
              <ModalBody>
                <div>
                  <Accordion open={open} toggle={toggleAccordion}>
                    <AccordionItem>
                      <AccordionHeader targetId="1">
                        Add category
                      </AccordionHeader>
                      <AccordionBody accordionId="1">
                        <span>Category name</span>
                        <input id="new_category_id" style={{ width: '100%' }} />
                        <Button
                          color="dark"
                          onClick={() => {
                            dispatch(
                              addCategory(
                                document.getElementById('new_category_id').value
                              )
                            );
                            setOpen('0');
                            document.getElementById('new_category_id').reset();
                          }}
                        >
                          Add
                        </Button>
                      </AccordionBody>
                    </AccordionItem>
                    <AccordionItem>
                      <AccordionHeader targetId="2">
                        Add menu item
                      </AccordionHeader>
                      <AccordionBody accordionId="2">
                        <span>Choose related category:</span>
                        <Input id="category-select" name="select" type="select">
                          {categories.map((category, idx) => {
                            return (
                              <option key={idx}>
                                <span>{category}</span>
                              </option>
                            );
                          })}
                        </Input>
                        <span>Add subcategory:</span>
                        <input
                          id="subcategory-name"
                          style={{ width: '100%' }}
                        />
                        <span>Dish name</span>
                        <input id="dish-name" style={{ width: '100%' }} />
                        <br />
                        <span>Allergens:</span>
                        {allergensResponse?.allergens?.map((allergen, idx) => {
                          return (
                            <>
                              {'  '}
                              <Input type="checkbox" id={idx} />{' '}
                              <Label check>{allergen.name}</Label>
                            </>
                          );
                        })}
                        <br />
                        <br />
                        <span>
                          Price: <input id="price" type="number" />
                        </span>
                        <br />
                        <span>Description</span>
                        <textarea
                          id="description"
                          style={{ width: '100%' }}
                          rows="4"
                        />
                        <Label for="exampleFile">File</Label>
                        <Input id="exampleFile" name="file" type="file" />
                        <FormText>Upload picture of item</FormText>
                        <br />
                        <Button
                          color="dark"
                          onClick={() => {
                            const category =
                              document.getElementById('category-select').value;
                            const subcategory =
                              document.getElementById('subcategory-name').value;
                            const dishName =
                              document.getElementById('dish-name').value;
                            const description =
                              document.getElementById('description').value;
                            const price =
                              document.getElementById('price').value;
                            const item = {
                              category,
                              subcategory,
                              name: dishName,
                              description,
                              price,
                              imageID: 2,
                              allergenIDs: []
                            };
                            if (
                              validate(
                                subcategory,
                                dishName,
                                description,
                                price
                              )
                            ) {
                              uploadMenuItem({ restaurantId, menuItem: item });
                              setOpen('0');
                            }
                          }}
                        >
                          Add
                        </Button>
                        <p style={{ color: 'red' }}>{validationError}</p>
                      </AccordionBody>
                    </AccordionItem>
                  </Accordion>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
          </>
        ) : null}
        {categories.map((category, index) => {
          return (
            <>
              <NavItem key={index} className="categories-container">
                <div>
                  <h2>
                    <Badge
                      className={category === activeCategory ? '' : 'text-dark'}
                      color={category === activeCategory ? 'dark' : 'light'}
                      pill
                      onClick={() => dispatch(filter(category))}
                    >
                      {category}
                    </Badge>
                  </h2>
                </div>
                <Button
                  color="light"
                  onClick={() => {
                    dispatch(deleteCategory(category));
                  }}
                >
                  <img alt="" src={Trash} />
                </Button>
              </NavItem>
            </>
          );
        })}
      </Nav>
      <QRCode
        className="qr-code"
        value={window.location.href}
        ref={QRCodeRef}
      />
      <ReactToPrint
        trigger={() => <Button color="dark">Print QRcode</Button>}
        content={() => QRCodeRef.current}
      />
    </div>
  );
}
