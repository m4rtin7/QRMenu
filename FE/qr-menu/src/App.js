import React, { useEffect } from 'react';
import './App.css';
import Menu from './components/Menu';
import { getUserRole } from './features/userReducer';
import { useDispatch, useSelector } from 'react-redux';
import { setAllergensList } from './features/menuSlice';
import AdminMenu from './components/AdminView/AdminMenu';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/LoginView/Login';

function App() {
  const isAdmin = useSelector(getUserRole);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setAllergensList());
  }, []);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/menu/:menuId"
            element={
              isAdmin ? (
                <section>
                  <AdminMenu />
                </section>
              ) : (
                <>
                  <div style={{ margin: '20px' }}>
                    <h2> Menu </h2>
                  </div>
                  <section>
                    <Menu />
                  </section>
                </>
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
