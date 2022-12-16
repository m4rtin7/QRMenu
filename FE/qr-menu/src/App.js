import React from 'react';
import './App.css';
import Menu from './components/Menu';
import { getUserRole } from './features/userReducer';
import { useSelector } from 'react-redux';
import AdminMenu from './components/AdminView/AdminMenu';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/LoginView/Login';
import { Header } from './components/Header';
import { QueryClient, QueryClientProvider } from 'react-query';
import axios from 'axios';
import { BASE_URL } from './constants';
import { OrderPage } from './components/OrderPage';
import Register from './components/RegisterView/Register';

function App() {
  const isAdmin = useSelector(getUserRole);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route
            path="/menu/:restaurantId"
            element={
              isAdmin ? (
                <>
                  <Header />
                  <section>
                    <AdminMenu />
                  </section>
                </>
              ) : (
                <>
                  <Header />
                  <section>
                    <Menu />
                  </section>
                </>
              )
            }
          />
          <Route
            path="/menu/:restaurantId/shoppingcart"
            element={
              <>
                <Header />
                <OrderPage />
              </>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
