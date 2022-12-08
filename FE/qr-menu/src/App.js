import React, { useEffect } from 'react';
import './App.css';
import Menu from './components/Menu';
import { getUserRole } from './features/userReducer';
import { useDispatch, useSelector } from 'react-redux';
import { setAllergensList } from './features/menuSlice';
import AdminMenu from './components/AdminView/AdminMenu';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/LoginView/Login';
import { Header } from './components/Header';
import { QueryClient, QueryClientProvider } from 'react-query';
import axios from 'axios';
import { BASE_URL } from './constants';

function createQueryFn(baseUrl) {
  return async ({ queryKey }) => {
    const res = await axios.get(baseUrl + queryKey);
    return res.data;
  };
}

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: createQueryFn(BASE_URL)
      }
    }
  });
  const isAdmin = useSelector(getUserRole);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setAllergensList());
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router>
          <Routes>
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
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
