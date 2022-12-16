import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { useRegisterMutation } from '../../features/apis';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const navigate = useNavigate();

  const [register, { data: loginData, isLoading, isError, error }] =
    useRegisterMutation();

  useEffect(() => {
    if (!loginData) return;
    navigate(`/`);
  }, [loginData]);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div>
      <h1>Register</h1>
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
          <div>
            <label>Name</label>
            <br></br>
            <input type="text" onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Surname</label>
            <br></br>
            <input type="text" onChange={(e) => setSurname(e.target.value)} />
          </div>
          <div>
            <label>Phone</label>
            <br></br>
            <input type="text" onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label>Restaurant Name</label>
            <br></br>
            <input
              type="text"
              onChange={(e) => setRestaurantName(e.target.value)}
            />
          </div>
          <Button
            onClick={() =>
              register({
                email: email,
                password: password,
                name: name,
                surname: surname,
                phone: phone,
                restaurantName: restaurantName
              })
            }
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Register;
