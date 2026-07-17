import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      // Exchange Google token for our custom 7-day sliding JWT
      const res = await axios.post('/api/auth/login', {
        token: credentialResponse.credential
      });
      
      if (res.data.success && res.data.token) {
        localStorage.setItem('mysafar_token', res.data.token);
        navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Server error during login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
    setError('Google Sign-In was cancelled or failed.');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.png" alt="MySafar Logo" className="login-logo-img" />
          </div>
          <h1>Welcome to MySafar</h1>
          <p>Track your opportunities, applications, and internships in one place.</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="login-actions">
          {loading ? (
            <div className="login-loading">Logging in securely...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              size="large"
              text="continue_with"
              shape="circle"
            />
          )}
        </div>

        <div className="login-footer">
          <p>Secure login provided by Google.</p>
        </div>
      </div>
    </div>
  );
}
