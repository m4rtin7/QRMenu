import React, { useEffect } from 'react';
import './App.css';
import Menu from './components/Menu';
import { getUserRole } from './features/userReducer';
import { useDispatch, useSelector } from 'react-redux';
import { setAllergensList } from './features/menuSlice';
import AdminMenu from './components/AdminView/AdminMenu';

function App() {
  const isAdmin = useSelector(getUserRole);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setAllergensList());
  }, []);
  return (
    <div className="App">
      {isAdmin ? (
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
      )}
    </div>
  );
}

export default App;
