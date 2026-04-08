import { useState } from 'react'
import { postAuth } from '../api/authApi'
import { AUTH_MODES, FORGOT_STEPS, SIGNUP_STEPS } from '../constants'

const emptyForm = { name: '', email: '', password: '' }
const emptyForgotForm = { email: '', otp: '', newPassword: '' }

export function useAuthFlow(apiBase) {
  const [mode, setMode] = useState(AUTH_MODES.HOME)
  const [form, setForm] = useState(emptyForm)
  const [signupStep, setSignupStep] = useState(SIGNUP_STEPS.DETAILS)
  const [signupUserId, setSignupUserId] = useState('')
  const [signupOtp, setSignupOtp] = useState('')
  const [forgotForm, setForgotForm] = useState(emptyForgotForm)
  const [forgotStep, setForgotStep] = useState(FORGOT_STEPS.REQUEST)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const resetSignupForm = () => {
    setForm(emptyForm)
    setSignupStep(SIGNUP_STEPS.DETAILS)
    setSignupUserId('')
    setSignupOtp('')
    setMessage('')
  }

  const resetLoginForm = () => {
    setForm(emptyForm)
    setMessage('')
  }

  const resetForgotForm = () => {
    setForgotStep(FORGOT_STEPS.REQUEST)
    setForgotForm(emptyForgotForm)
    setMessage('')
  }

  const change = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const changeForgot = (event) => {
    const { name, value } = event.target
    setForgotForm((current) => ({ ...current, [name]: value }))
  }

  const changeSignupOtp = (event) => {
    setSignupOtp(event.target.value)
  }

  const submitSignup = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const data = await postAuth(apiBase, '/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      setSignupUserId(data.userId || '')
      setSignupStep(SIGNUP_STEPS.VERIFY)
      setMessage(data.message || 'OTP sent to your email')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const submitSignupOtp = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const data = await postAuth(apiBase, '/api/auth/verify-otp', {
        userId: signupUserId,
        otp: signupOtp,
      })
      setMessage(data.message || 'Account created successfully')
      setSignupStep(SIGNUP_STEPS.DETAILS)
      setSignupUserId('')
      setSignupOtp('')
      setForm(emptyForm)
      setMode(AUTH_MODES.LOGIN)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const data = await postAuth(apiBase, '/api/auth/login', {
        email: form.email,
        password: form.password,
      })
      setMessage(data.message || 'Login successful')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const submitForgotRequest = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const data = await postAuth(apiBase, '/api/auth/forgot-password', {
        email: forgotForm.email,
      })
      setMessage(data.message || 'OTP sent')
      setForgotStep(FORGOT_STEPS.VERIFY)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const submitForgotOtp = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const data = await postAuth(apiBase, '/api/auth/verify-reset-otp', {
        email: forgotForm.email,
        otp: forgotForm.otp,
      })
      setMessage(data.message || 'OTP verified')
      setForgotStep(FORGOT_STEPS.RESET)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const submitNewPassword = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const data = await postAuth(apiBase, '/api/auth/reset-password', {
        email: forgotForm.email,
        otp: forgotForm.otp,
        newPassword: forgotForm.newPassword,
      })
      setMessage(data.message || 'Password updated')
      setForgotStep(FORGOT_STEPS.REQUEST)
      setForgotForm(emptyForgotForm)
      setMode(AUTH_MODES.LOGIN)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  return {
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
  }
}
