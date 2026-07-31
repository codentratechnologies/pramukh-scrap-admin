import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setError('');

    if (!email.trim()) {
      setEmailError('Please enter your username or email');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.trim().length < 3) {
      setEmailError('Please enter a valid username or email');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) return;

    if (email === 'pramukhscrap36@gmail.com' && password === 'Pramukh@36') {
      setError('');
      alert('Login successful');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-wrapper" style={{ backgroundImage: "url('/login page bg.png')" }}>
      {/* Left Side */}
      <div className="login-left">
        <div className="left-content">
          <div className="logo-area">
            <img 
              src="/pramukh scrap logo.png" 
              alt="Pramukh Scrap Logo" 
              className="logo-img"
            />
          </div>

        </div>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="login-card-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome back! <span className="wave">👋</span></h2>
              <p>Login to continue to your account</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username or Email</label>
                <div className={`input-with-icon ${emailError ? 'has-error' : ''}`}>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input
                    type="text"
                    placeholder="Enter your username or email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                  />
                </div>
                {emailError && <div className="field-error">{emailError}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label>Password</label>
                <div className={`input-with-icon ${passwordError ? 'has-error' : ''}`}>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                  />
                  <button 
                    type="button" 
                    className="eye-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
                {passwordError && <div className="field-error">{passwordError}</div>}
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
              </div>

              {error && <div className="error-text">{error}</div>}

              <button type="submit" className="btn-primary">
                Login
              </button>

            </form>
          </div>
          
          <div className="secure-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="#439641" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
            Your data is safe and secure with us.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
