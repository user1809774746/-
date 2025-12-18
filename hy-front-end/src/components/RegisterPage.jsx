import React, { useState, useEffect } from 'react'
import { sendVerificationCode, registerUser } from '../api/config'

function RegisterPage({ onRegisterSuccess, onNavigateToLogin }) {
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [codeVerified, setCodeVerified] = useState(false)
  
  // 对话框状态
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  
  const showDialog = (message) => {
    setDialogMessage(message)
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
    setDialogMessage('')
  }

  // 验证函数
  const isValidPhone = (p) => /^1[3-9]\d{9}$/.test(p)
  const isValidCode = (c) => /^\d{6}$/.test(c)
  const isValidPassword = (pw) => typeof pw === 'string' && pw.length >= 6
  const isValidUsername = (name) => typeof name === 'string' && name.trim().length > 0

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 验证码输入监听 - 先允许用户输入，后续在提交时验证
  useEffect(() => {
    const c = code.trim()
    if (isValidCode(c)) {
      // 允许输入6位验证码后启用密码输入
      setCodeVerified(true)
    } else {
      setCodeVerified(false)
    }
  }, [code])

  // 发送验证码
  const handleSendCode = async () => {
    const p = phone.trim()
    if (!isValidPhone(p)) {
      showDialog('请输入正确的手机号')
      return
    }

    try {
      await sendVerificationCode(p)
      showDialog('验证码已发送')
      setCountdown(60)
    } catch (error) {
      showDialog(`发送验证码失败: ${error.message}`)
      console.error('发送验证码失败:', error)
    }
  }

  // 切换密码显示/隐藏
  const togglePassword1Visibility = () => {
    if (!codeVerified) return
    setShowPassword(!showPassword)
  }

  const togglePassword2Visibility = () => {
    if (!codeVerified) return
    setShowPassword2(!showPassword2)
  }

  // 表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = username.trim()
    const p = phone.trim()
    const c = code.trim()
    const pw = password
    const pw2 = password2

    if (!isValidUsername(name)) {
      showDialog('用户名不能为空')
      return
    }

    // 验证手机号
    if (!isValidPhone(p)) {
      showDialog('手机号格式不正确')
      return
    }

    // 验证验证码
    if (!isValidCode(c)) {
      showDialog('请输入6位验证码')
      return
    }

    // 验证密码
    if (!isValidPassword(pw)) {
      showDialog('密码长度至少为6位')
      return
    }

    // 验证两次密码是否一致
    if (pw !== pw2) {
      showDialog('两次输入的密码不一致')
      return
    }

    try {
      // 调用注册API
      await registerUser({
        phone: p,
        username: name,
        verificationCode: c,
        password: pw,
        confirmPassword: pw2
      })
      
      showDialog('注册成功！请登录')
      
      // 注册成功后跳转到登录页面
      setTimeout(() => {
        if (onNavigateToLogin) {
          onNavigateToLogin()
        }
      }, 1500) // 延迟跳转，让用户看到成功提示
    } catch (error) {
      showDialog(`注册失败: ${error.message}`)
      console.error('注册失败:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {dialogVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-35 flex items-center justify-center z-[9999]">
          <div className="min-w-[260px] max-w-[420px] bg-white bg-opacity-90 rounded-xl border border-loginSecondary p-6 text-center backdrop-blur-sm shadow-[0_12px_40px_rgba(168,120,204,0.25)]">
            <div className="text-sm text-gray-800 leading-6 whitespace-pre-line">
              {dialogMessage}
            </div>
            <button
              type="button"
              className="mt-4 px-[18px] py-[6px] rounded-full border border-loginPrimary bg-loginSecondary text-loginPrimary text-sm font-medium cursor-pointer hover:bg-loginPrimary hover:text-white transition-colors"
              onClick={hideDialog}
            >
              确定
            </button>
          </div>
        </div>
      )}

      <main className="p-4 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: "url('/聊天背景4.jpg')" }}>

      <header className="sticky top-0 z-10 bg-transparent border-none p-[10px_12px] flex items-center justify-center">
        <div className="font-semibold text-xl text-GuText"style={{ fontFamily: '宋体, SimSun, serif' }}>注册</div>
      </header>

        <form onSubmit={handleSubmit} autoComplete="off" noValidate className="bg-white bg-opacity-70 p-4 grid gap-3 rounded-xl backdrop-blur-sm border-none">
          <div className="grid gap-1.5">
            <label htmlFor="username" className="text-sm" style={{ color: '#724B10' }}>用户名</label>
            <input
              id="username"
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-10 px-2.5 py-2 border border-loginSecondary rounded-3xl text-sm bg-white bg-opacity-80"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="phone" className="text-sm" style={{ color: '#724B10' }}>手机号</label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="请输入11位手机号"
              maxLength="11"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 px-2.5 py-2 border border-loginSecondary rounded-3xl text-sm bg-white bg-opacity-80"
            />
          </div>

          <div className="flex gap-2 items-end">
            <div className="grid gap-1.5 flex-1 min-w-0">
              <label htmlFor="code" className="text-sm" style={{ color: '#724B10' }}>验证码</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="请输入6位验证码"
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  borderColor: code.trim().length === 6
                    ? code.trim() === '123456'
                      ? '#2a7cf0'
                      : '#ef4444'
                    : '',
                  backgroundColor: code.trim().length === 6 && code.trim() === '123456' ? '#eef5ff' : ''
                }}
                className="h-10 px-2.5 py-2 border border-loginSecondary rounded-3xl text-sm bg-white bg-opacity-80"
              />
            </div>
            <button
              type="button"
              className="h-10 shrink-0 text-GuText px-4 whitespace-nowrap border border-loginSecondary rounded-3xl bg-white bg-opacity-80 text-loginPrimary text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleSendCode}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `重试(${countdown}s)` : '获取验证码'}
            </button>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm" style={{ color: '#724B10' }}>设置密码</label>
            <div className="relative grid gap-1.5">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请设置密码(至少6位)"
                maxLength="32"
                disabled={!codeVerified}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-10 px-2.5 py-2 pr-11 border border-loginSecondary rounded-3xl text-sm bg-white bg-opacity-80 ${!codeVerified ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              />
              <img
                src={showPassword ? '/小眼睛打开-copy.png' : '/小眼睛关闭-copy.png'}
                alt="显示密码"
                className={`absolute bottom-2 right-2 w-6 h-6 cursor-pointer bg-transparent p-0 opacity-60 transition-opacity hover:opacity-100 ${showPassword ? 'opacity-100' : ''} ${!codeVerified ? 'opacity-30 cursor-not-allowed' : ''}`}
                onClick={togglePassword1Visibility}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password2" className="text-sm" style={{ color: '#724B10' }}>确认密码</label>
            <div className="relative grid gap-1.5">
              <input
                id="password2"
                type={showPassword2 ? 'text' : 'password'}
                placeholder="请再次输入密码"
                maxLength="32"
                disabled={!codeVerified}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className={`h-10 px-2.5 py-2 pr-11 border border-loginSecondary rounded-3xl text-sm bg-white bg-opacity-80 ${!codeVerified ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              />
              <img
                src={showPassword2 ? '/小眼睛打开-copy.png' : '/小眼睛关闭-copy.png'}
                alt="显示密码"
                className={`absolute bottom-2 right-2 w-6 h-6 cursor-pointer bg-transparent p-0 opacity-60 transition-opacity hover:opacity-100 ${showPassword2 ? 'opacity-100' : ''} ${!codeVerified ? 'opacity-30 cursor-not-allowed' : ''}`}
                onClick={togglePassword2Visibility}
              />
            </div>
          </div>

          <button type="submit" className="h-10 border-none rounded-3xl bg-[#a8b78c] text-white font-bold hover:bg-[#e0c6c4]">
            注册
          </button>

          <div className="flex flex-row justify-between items-center">
            <p className="text-xs m-0" style={{ color: '#724B10' }}>好游，好旅行</p>
            <a
              href="#"
              className="text-xs text-loginPrimary no-underline text-GuText"
              onClick={(e) => {
                e.preventDefault()
                if (onNavigateToLogin) {
                  onNavigateToLogin()
                }
              }}
            >
              已有账号？去登录
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}

export default RegisterPage

