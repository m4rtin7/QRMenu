import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import axios from 'axios';
import { useMutation } from 'react-query';
import { BASE_URL } from '../../constants';
import { useNavigate } from 'react-router-dom';

const login = (user) => {
  return axios.post(BASE_URL + '/api/v1/authorization/login', user);
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { mutate, isLoading, isError, error } = useMutation(login, {
    onSuccess: (successData) => {
      const restaurantId = successData.data.profile.restaurant.id;
      navigate('/menu/' + restaurantId.toString());
    }
  });

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
        <form onSublit={(e) => e.preventDefault()}>
          <div>
            <label>Email</label>
            <input type="text" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={() => mutate({ email: email, password: password })}>
            Submit
          </Button>
        </form>
      </div>
      <Link to="/menu/1">Click here for menu page!</Link>
    </div>
  );
}

export default Login;
