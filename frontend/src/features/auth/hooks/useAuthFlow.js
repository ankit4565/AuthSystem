import { useState } from 'react'
import { postAuth } from '../api/authApi'
import { AUTH_MODES, FORGOT_STEPS } from '../constants'

const emptyForm = { name: '', email: '', password: '' }
const emptyForgotForm = { email: '', otp: '', newPassword: '' }

export function useAuthFlow(apiBase) {
  const [mode, setMode] = useState(AUTH_MODES.HOME)
  const [form, setForm] = useState(emptyForm)
  const [forgotForm, setForgotForm] = useState(emptyForgotForm)
  const [forgotStep, setForgotStep] = useState(FORGOT_STEPS.REQUEST)
  const [message, setMessage] = useState('')

  const resetSignupForm = () => {
    setForm(emptyForm)
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

  const submitSignup = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const data = await postAuth(apiBase, '/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      setMessage(data.message || 'Signup successful')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    }
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const data = await postAuth(apiBase, '/api/auth/login', {
        email: form.email,
        password: form.password,
      })
      setMessage(data.message || 'Login successful')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    }
  }

  const submitForgotRequest = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const data = await postAuth(apiBase, '/api/auth/forgot-password', {
        email: forgotForm.email,
      })
      setMessage(data.message || 'OTP sent')
      setForgotStep(FORGOT_STEPS.VERIFY)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    }
  }

  const submitForgotOtp = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const data = await postAuth(apiBase, '/api/auth/verify-reset-otp', {
        email: forgotForm.email,
        otp: forgotForm.otp,
      })
      setMessage(data.message || 'OTP verified')
      setForgotStep(FORGOT_STEPS.RESET)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed')
    }
  }

  const submitNewPassword = async (event) => {
    event.preventDefault()
    setMessage('')

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
    }
  }

  return {
    mode,
    setMode,
    form,
    forgotForm,
    forgotStep,
    message,
    change,
    changeForgot,
    resetSignupForm,
    resetLoginForm,
    resetForgotForm,
    submitSignup,
    submitLogin,
    submitForgotRequest,
    submitForgotOtp,
    submitNewPassword,
  }
}
