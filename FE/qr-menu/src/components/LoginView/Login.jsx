import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../features/apis';
import { useEffect } from 'react';
import { setLoggedIn } from '../../features/userReducer';
import { useDispatch } from 'react-redux';
import { Spinner } from 'reactstrap';

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
    return <Spinner color="dark">Loading...</Spinner>;
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
          <Button
            style={{ margin: '5px' }}
            onClick={() => login({ email: email, password: password })}
          >
            Login
          </Button>
          <Button
            style={{ margin: '5px' }}
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </form>
        {isError && <p style={{ color: 'red' }}>Wrong email or password</p>}
      </div>
    </div>
  );
}

export default Login;
