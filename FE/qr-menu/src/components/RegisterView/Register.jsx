import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { useRegisterMutation } from '../../features/apis';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState('');

  const [register, { data: loginData, isLoading, isError, error }] =
    useRegisterMutation();

  useEffect(() => {
    if (!loginData) return;
    navigate(`/`);
  }, [loginData]);

  if (isLoading) {
    return <Spinner color="dark">Loading...</Spinner>;
  }

  const validate = () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Wrong email format');
    }
    if (password.length < 5) {
      setValidationError('Pasword needs to have atleast 5 characters');
    }
    if (
      email == '' ||
      name == '' ||
      surname == '' ||
      phone == '' ||
      restaurantName == ''
    ) {
      setValidationError('All fields are required');
    }
  };

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
            style={{ margin: '5px' }}
            onClick={() => {
              validate();
              register({
                email: email,
                password: password,
                name: name,
                surname: surname,
                phone: phone,
                restaurantName: restaurantName
              });
            }}
          >
            Submit
          </Button>
          <p style={{ color: 'red' }}>{validationError}</p>
        </form>
      </div>
    </div>
  );
}

export default Register;
