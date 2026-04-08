import { AUTH_MODES, FORGOT_STEPS, SIGNUP_STEPS } from '../constants'
import { useAuthFlow } from '../hooks/useAuthFlow'
import './AuthPage.css'

function AuthPage() {
 const apiBase = 
  import.meta.env.MODE === "development"
    ? "http://localhost:5500"
    : "https://authsystem-w7d3.onrender.com";
  const {
    mode,
    setMode,
    form,
    signupStep,
    signupOtp,
    forgotForm,
    forgotStep,
    message,
    isLoading,
    change,
    changeSignupOtp,
    changeForgot,
    resetSignupForm,
    resetLoginForm,
    resetForgotForm,
    submitSignup,
    submitSignupOtp,
    submitLogin,
    submitForgotRequest,
    submitForgotOtp,
    submitNewPassword,
  } = useAuthFlow(apiBase)

  const isHome = mode === AUTH_MODES.HOME
  const isSignup = mode === AUTH_MODES.SIGNUP
  const isLogin = mode === AUTH_MODES.LOGIN
  const isForgot = mode === AUTH_MODES.FORGOT

  return (
    <main className="page">
      <section className="card">
        {isHome ? (
          <>
            <h1>AuthSystem</h1>
            <p className="text">Choose signup or login.</p>
            <div className="actions">
              <button
                type="button"
                onClick={() => {
                  resetSignupForm()
                  setMode(AUTH_MODES.SIGNUP)
                }}
              >
                Signup
              </button>
              <button
                type="button"
                onClick={() => {
                  resetLoginForm()
                  setMode(AUTH_MODES.LOGIN)
                }}
              >
                Login
              </button>
            </div>
          </>
        ) : null}

        {isSignup ? (
          <>
            <h1>{signupStep === SIGNUP_STEPS.DETAILS ? 'Signup' : 'Verify OTP'}</h1>

            {signupStep === SIGNUP_STEPS.DETAILS ? (
              <form onSubmit={submitSignup} className="form">
                <input name="name" value={form.name} onChange={change} placeholder="Name" disabled={isLoading} />
                <input name="email" value={form.email} onChange={change} placeholder="Email" disabled={isLoading} />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={change}
                  placeholder="Password"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>{isLoading ? 'Sending OTP...' : 'Send OTP'}</button>
              </form>
            ) : null}

            {signupStep === SIGNUP_STEPS.VERIFY ? (
              <form onSubmit={submitSignupOtp} className="form">
                <input
                  name="otp"
                  value={signupOtp}
                  onChange={changeSignupOtp}
                  placeholder="Enter OTP"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>{isLoading ? 'Verifying OTP...' : 'Verify OTP'}</button>
              </form>
            ) : null}

            <div className="secondary-actions">
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  resetLoginForm()
                  setMode(AUTH_MODES.LOGIN)
                }}
              >
                Already have an account? Login
              </button>
              <button type="button" className="link-button" onClick={resetSignupForm}>
                Reset
              </button>
            </div>
          </>
        ) : null}

        {isLogin ? (
          <>
            <h1>Login</h1>
            <form onSubmit={submitLogin} className="form">
              <input name="email" value={form.email} onChange={change} placeholder="Email" disabled={isLoading} />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={change}
                placeholder="Password"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
            </form>
            <div className="secondary-actions">
              <div className='btn-group'>
                <button
                type="button"
                className="link-button"
                onClick={() => {
                  resetForgotForm()
                  setMode(AUTH_MODES.FORGOT)
                }}
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  resetSignupForm()
                  setMode(AUTH_MODES.SIGNUP)
                }}
              >
                New user?
              </button>
              </div>
              <button type="button" className="link-button" onClick={resetLoginForm}>
                Reset
              </button>
            </div>
          </>
        ) : null}

        {isForgot ? (
          <>
            <h1>Forgot Password</h1>
            {forgotStep === FORGOT_STEPS.REQUEST ? (
              <form onSubmit={submitForgotRequest} className="form">
                <input
                  name="email"
                  value={forgotForm.email}
                  onChange={changeForgot}
                  placeholder="Email"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>{isLoading ? 'Sending OTP...' : 'Send reset OTP'}</button>
              </form>
            ) : null}

            {forgotStep === FORGOT_STEPS.VERIFY ? (
              <form onSubmit={submitForgotOtp} className="form">
                <input
                  name="email"
                  value={forgotForm.email}
                  onChange={changeForgot}
                  placeholder="Email"
                  disabled={isLoading}
                />
                <input
                  name="otp"
                  value={forgotForm.otp}
                  onChange={changeForgot}
                  placeholder="Enter OTP"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>{isLoading ? 'Verifying OTP...' : 'Verify OTP'}</button>
              </form>
            ) : null}

            {forgotStep === FORGOT_STEPS.RESET ? (
              <form onSubmit={submitNewPassword} className="form">
                <input
                  name="email"
                  value={forgotForm.email}
                  onChange={changeForgot}
                  placeholder="Email"
                  disabled={isLoading}
                />
                <input
                  name="otp"
                  value={forgotForm.otp}
                  onChange={changeForgot}
                  placeholder="OTP"
                  disabled={isLoading}
                />
                <input
                  name="newPassword"
                  type="password"
                  value={forgotForm.newPassword}
                  onChange={changeForgot}
                  placeholder="New password"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>{isLoading ? 'Updating password...' : 'Set new password'}</button>
              </form>
            ) : null}

            <div className="secondary-actions">
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  resetLoginForm()
                  setMode(AUTH_MODES.LOGIN)
                }}
              >
                Back to login
              </button>
              <button type="button" className="link-button" onClick={resetForgotForm}>
                Reset
              </button>
            </div>
          </>
        ) : null}

        {isLoading ? <p className="loading-message">Please wait...</p> : null}
        {message ? <p className="message">{message}</p> : null}
      </section>
    </main>
  )
}

export default AuthPage
