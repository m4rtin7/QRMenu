import { Link } from 'react-router-dom';

import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import CheckButton from 'react-validation/build/button';
import React, { useState, useRef } from 'react';
import { useQuery } from 'react-query';

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {email: '',
                  password: ''};

    this.userResponseData = {accessToken: '',
                        profile: {
                        id: 0,
                        fullname: ''
                        }};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    // Simple POST request with a JSON body using fetch
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    };
    fetch('https://qrmenu-asdit.herokuapp.com/api/v1/authorization/login', requestOptions)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Login wasnt successful!");
      })
      .then(data => {
        this.userResponseData.accessToken = data.accessToken;
        this.userResponseData.profile.id = data.profile.id;
        this.userResponseData.profile.fullname = data.profile.fullname;
        console.log(this.userResponseData);
      })
      .catch(err => console.log(err));

  }


  handleChange(event) {
    const value = event.target.value;
    const name = event.target.name;

    this.setState({
      [name]: value
    });

  }

  handleSubmit(event) { //TO DO
    console.log('A name was submitted : ' + this.state.email + ' with password: ' + this.state.password);
    event.preventDefault();
    this.componentDidMount()
  }

  render() {
    return (
      <div className="col-md-12">
        <div className="card card-container">
          <img
            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
            alt="profile-img"
            className="profile-img-card"
          />
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" name="email" value={this.state.email} onChange={this.handleChange} />
        </label>
        <label>
          Password:
          <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
        </div>
      </div>
    );
  }
}

export default NameForm;
