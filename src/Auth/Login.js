import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import AppColors from '../Utils/Colors';
import { useNavigate } from 'react-router-dom';
import Constant from '../Utils/Constants';
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, query, where } from 'firebase/firestore'

function Login() {

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [failLogin, setFailLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(true)

  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFailLogin(false)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // You can add your form submission logic here
    // console.log('Form submitted with data:', formData);
    // localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_DASHBOARD)
    // localStorage.setItem(Constant.TOKEN, 'abc123')
    // navigate('/')

    console.log(formData);
    const q = query(collection(db, "user"),
      where('username', '==', formData.username),
      where('password', '==', formData.password))

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Data exists
        // console.log('Data exists:', querySnapshot.docs.map(doc => doc.data()));
        const user = querySnapshot.docs.map(doc => doc.data())[0]
        localStorage.setItem(Constant.USERNAME, user?.username)
        localStorage.setItem(Constant.ROLE, user?.roleId)
        setFailLogin(false)
        navigate('/')
      } else {
        // Data does not exist
        console.log('Data does not exist');
        setFailLogin(true)
      }
    } catch (error) {
      console.error('Error checking data existence:', error);
    }
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
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter Username"
                      />
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type= {showPassword ? "password" : "input"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                      />
                      <a style={{ cursor: 'pointer', fontSize: 12, marginLeft: 4 }}
                        onClick={() => setShowPassword(e => !e)}
                      >{showPassword ? 'Show Password' : 'Hide Password'}</a>
                    </Form.Group>
                    {
                      failLogin &&
                      <div style={{
                        width: '100%',
                        borderRadius: 20,
                        marginTop: 20,
                        backgroundColor: AppColors.Error1,
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                        padding: 12,
                      }}>
                        <span style={{ color: AppColors.White }}>Username atau password salah</span>
                      </div>
                    }
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
