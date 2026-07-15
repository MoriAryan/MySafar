import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    // Store the Google JWT token in localStorage
    localStorage.setItem('mysafar_token', credentialResponse.credential);
    // Redirect to dashboard
    navigate('/');
  };

  const handleError = () => {
    console.error('Login Failed');
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

        <div className="login-actions">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="circle"
          />
        </div>

        <div className="login-footer">
          <p>Secure login provided by Google.</p>
        </div>
      </div>
    </div>
  );
}
