import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../features/apis';
import { useEffect } from 'react';
import { setLoggedIn } from '../../features/userReducer';
import { useDispatch } from 'react-redux';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [login, { data: loginData, isLoading, isError, error }] =
    useLoginMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loginData) return;
    localStorage.setItem('token', loginData.accessToken);
    dispatch(setLoggedIn());
    navigate(`/menu/${loginData.profile.restaurant.id}`);
  }, [loginData]);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }
  return (
    <div>
      <h1>LOGIN</h1>
      <div className="formClass">
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label>Email</label>
            <br></br>
            <input type="text" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <br></br>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={() => login({ email: email, password: password })}>
            Submit
          </Button>
        </form>
      </div>
      <Link to="/menu/1">Click here for menu page!</Link>
      <br></br>
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Login;
