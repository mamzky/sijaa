import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import AppColors from '../Utils/Colors';
import { useNavigate } from 'react-router-dom';
import Constant from '../Utils/Constants';

function Login() {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add your form submission logic here
    console.log('Form submitted with data:', formData);
    localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_DASHBOARD)
    localStorage.setItem(Constant.TOKEN, 'abc123')
    navigate('/')
  };

  return (
    <div>
      <div className="page-header align-items-start min-vh-100"
        style={{
          backgroundColor: AppColors.MainBrand
        }}
      >
        <span className="mask bg-gradient-dark opacity-6"></span>
        <div className="container my-auto">
          <div className="row">
            <div className="col-lg-4 col-md-8 col-12 mx-auto">
              <div className="card z-index-0 fadeIn3 fadeInBottom">
                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                  <div className="shadow-primary border-radius-lg py-3 pe-1"
                    style={{ backgroundColor: AppColors.MainBrand }}>
                    <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">Login</h4>
                    <Form.Label
                      style={{
                        color: AppColors.White,
                        display: 'flex',
                        flex: 1,
                        justifyContent: 'center'
                      }}>Login menggunakan akun JAA</Form.Label>
                  </div>
                </div>
                <div className="card-body">
                  <Form
                    onSubmit={handleSubmit}
                  >
                    <Form.Group controlId="formBasicEmail">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="input"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Username"
                      />
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                      />
                    </Form.Group>
                    <Button
                      style={{ width: "100%", marginTop: 20, backgroundColor: AppColors.MainBrand }}
                      variant="primary"
                      type="submit">
                      Login
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
