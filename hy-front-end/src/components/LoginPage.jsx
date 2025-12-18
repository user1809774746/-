import React, { useState, useEffect } from 'react'
import { sendVerificationCode, loginWithPassword, loginWithCode, smartLogin, checkAutoLogin } from '../api/config'

function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('password') // 'code' 或 'password'
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [userType, setUserType] = useState('user') // 'user' 或 'admin'
  
  // 七天免密登录相关状态
  // 🔒 已注释：为避免用户误会，暂时禁用七天免密登录功能
  const [canAutoLogin, setCanAutoLogin] = useState(false)
  const [autoLoginChecking, setAutoLoginChecking] = useState(false)
  const [autoLoginLoading, setAutoLoginLoading] = useState(false)
  const [isAutoLoginAttempted, setIsAutoLoginAttempted] = useState(false) // 标记是否已尝试过自动登录

  // 居中提示对话框
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  
  // 控制管理员选项显示状态
  const [showAdminOption, setShowAdminOption] = useState(false)

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

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 页面加载时尝试自动登录
  // 🔒 已注释：为避免用户误会，暂时禁用自动登录功能
  useEffect(() => {
    const attemptAutoLogin = async () => {
      const token = localStorage.getItem('auth_token')
      const lastPhone = localStorage.getItem('user_phone')
      const userType = localStorage.getItem('user_type') || 'user'
      
      // 🔒 已注释：不再尝试自动登录，避免用户误会
      // if (token && lastPhone && isValidPhone(lastPhone)) {
      //   console.log('🔍 页面加载，尝试七天免密登录...')
      //   setPhone(lastPhone)
      //   setAutoLoginLoading(true)
      //   
      //   try {
      //     const result = await smartLogin(lastPhone, userType, token)
      //     
      //     if (result.success) {
      //       console.log('✅ 七天免密登录成功，正在跳转...')
      //       alert('欢迎回来！七天免密登录成功')
      //       if (onLoginSuccess) {
      //         onLoginSuccess()
      //       }
      //     } else {
      //       console.log('❌ 七天免密登录失败:', result.message)
      //       setCanAutoLogin(false)
      //       setIsAutoLoginAttempted(true)
      //       checkAutoLoginStatus(lastPhone)
      //     }
      //   } catch (error) {
      //     console.error('自动登录异常:', error)
      //     setCanAutoLogin(false)
      //     setIsAutoLoginAttempted(true)
      //     
      //     if (error.status === 401) {
      //       localStorage.removeItem('auth_token')
      //     }
      //   } finally {
      //     setAutoLoginLoading(false)
      //   }
      // } else {
      //   if (lastPhone && isValidPhone(lastPhone)) {
      //     setPhone(lastPhone)
      //     checkAutoLoginStatus(lastPhone)
      //   }
      //   setIsAutoLoginAttempted(true)
      // }
      
      // 🔒 简化逻辑：仅自动填充上次登录的手机号
      if (lastPhone && isValidPhone(lastPhone)) {
        setPhone(lastPhone)
      }
      setIsAutoLoginAttempted(true)
    }
    
    attemptAutoLogin()
  }, [])

  // 当手机号变化时检查免密登录状态
  // 🔒 已注释：为避免用户误会，暂时禁用免密登录状态检查
  useEffect(() => {
    // if (isValidPhone(phone)) {
    //   checkAutoLoginStatus(phone)
    // } else {
    //   setCanAutoLogin(false)
    // }
    
    // 🔒 强制设置为不可用
    setCanAutoLogin(false)
  }, [phone])

  // 检查七天免密登录状态
  const checkAutoLoginStatus = async (phoneNumber) => {
    if (!isValidPhone(phoneNumber)) {
      setCanAutoLogin(false)
      return
    }

    setAutoLoginChecking(true)
    try {
      const result = await checkAutoLogin(phoneNumber, 'user')
      setCanAutoLogin(result.code === 200 && result.data.canAutoLogin)
    } catch (error) {
      console.log('检查免密登录状态失败:', error.message)
      setCanAutoLogin(false)
    } finally {
      setAutoLoginChecking(false)
    }
  }

  // 执行七天免密登录（按钮点击）
  const handleAutoLogin = async () => {
    if (!isValidPhone(phone)) {
      showDialog('请输入正确的手机号')
      return
    }


    // 获取本地存储的token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      showDialog('没有找到有效的登录凭证，请使用密码或验证码登录')
      setCanAutoLogin(false)
      return
    }


    setAutoLoginLoading(true)
    try {
      const result = await smartLogin(phone, 'user', token)
      
      if (result.success) {
        showDialog('七天免密登录成功！')
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      } else {
        showDialog(result.message || '免密登录失败，请使用密码或验证码登录')

        // 免密登录失败，刷新状态
        setCanAutoLogin(false)
        
        // 如果是401错误，清除token
        if (result.message && result.message.includes('失效')) {
          localStorage.removeItem('auth_token')
        }
      }
    } catch (error) {
      showDialog('免密登录失败：' + error.message)
      setCanAutoLogin(false)

      
      // 如果是401错误，清除token
      if (error.status === 401) {
        localStorage.removeItem('auth_token')
      }
    } finally {
      setAutoLoginLoading(false)
    }
  }

  // 切换登录模式
  const handleModeChange = (newMode) => {
    setMode(newMode)
    // 切换模式时重置密码显示状态
    setShowPassword(false)
    if (newMode === 'password') {
      setCountdown(0)
    }
  }

  // 发送验证码
  const handleSendCode = async () => {
    if (mode !== 'code') return
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
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // 表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    const p = phone.trim()

    if (!isValidPhone(p)) {
      showDialog('手机号格式不正确')
      return
    }


    try {
      let response

      if (mode === 'code') {
        // 验证码登录
        const c = code.trim()
        if (!isValidCode(c)) {
          showDialog('验证码为6位数字')
          return
        }

        
        response = await loginWithCode(p, c, userType)
      } else {
        // 密码登录
        if (!isValidPassword(password)) {
          showDialog('密码长度至少为6位')
          return
        }

        
        response = await loginWithPassword(p, password, userType)
      }

      // 登录成功，保存用户信息
      if (response && response.data) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user_phone', response.data.phone)
        localStorage.setItem('user_type', response.data.userType)
        localStorage.setItem('login_time', Date.now().toString())
        localStorage.setItem('login_mode', mode)
        localStorage.setItem('login_type', 'manual_login')
        
        // 友好的登录成功提示
        const loginTip = '登录成功！\n\n温馨提示：为保护账号安全，同一账号同时只能在一个设备登录。如在其他设备登录，当前登录将自动失效。'
        showDialog(loginTip)

        
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      }
    } catch (error) {
      showDialog(`登录失败: ${error.message}`)
      console.error('登录失败:', error)
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

      <header className="sticky top-0 z-10 bg-transparent border-none p-[10px_12px] flex items-center justify-center">
        {/* <div className="font-semibold text-base">登录</div> */}
      </header>

      {/* 自动登录加载中提示 */}
      {/* 🔒 已注释：为避免用户误会，暂时隐藏自动登录加载提示 */}
      {/* {autoLoginLoading && !isAutoLoginAttempted && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-[9999]">
          <i className="fa-solid fa-spinner fa-spin text-[48px] text-[#007bff] mb-5"></i>
          <p className="text-[18px] text-[#333] mb-2.5">正在自动登录...</p>
          <p className="text-[14px] text-[#666]">使用七天免密登录功能</p>
        </div>
      )} */}

      <main className="p-4 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: "url('/聊天背景3.jpg')" }}>
        <div className="flex gap-6 p-3 pt-3 pb-1 justify-center bg-transparent" role="tablist">
          <div
            className={`flex-none py-2 border-none rounded-none bg-transparent text-[#724B10] font-semibold text-xl relative transition-colors duration-300 cursor-pointer select-none ${mode === 'password' ? 'active' : ''}`}
            onClick={() => handleModeChange('password')}
            style={{ fontFamily: "'宋体', 'SimSun', serif" }}
          >
            密码登录
            {mode === 'password' && (
              <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-GuText"></span>
            )}
          </div>
          <div
            className={`flex-none py-2 border-none rounded-none bg-transparent text-[#724B10] font-semibold text-xl relative transition-colors duration-300 cursor-pointer select-none ${mode === 'code' ? 'active' : ''}`}
            onClick={() => handleModeChange('code')}
            style={{ fontFamily: "'宋体', 'SimSun', serif" }}
          >
            验证码登录
            {mode === 'code' && (
              <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-GuText"></span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" noValidate className="bg-white mt-5 bg-opacity-70 p-4 grid gap-3 rounded-xl backdrop-blur-sm border-none">
          {/* 用户类型选择 - 美化版 */}
          <div className="grid gap-1.5">
            {/* <label htmlFor="userType" className="flex items-center gap-2 mb-3 text-sm" style={{ color: '#724B10' }}>
              <i className="fa-solid fa-user-circle" style={{ color: '#724B10' }}></i>
              <span>登录身份</span>
            </label> */}
            <div className="flex flex-col gap-3 mt-2">
              {userType === 'user' ? (
                <div 
                  className={`flex items-center gap-3 p-[14px] border rounded-xl bg-white bg-opacity-60 cursor-pointer transition-all duration-300 hover:border-loginPrimary hover:bg-white hover:bg-opacity-80 hover:transform hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(168,120,204,0.15)] ${userType === 'user' ? 'active border-loginPrimary bg-gradient-to-br from-loginSecondary to-white bg-opacity-90 shadow-[0_4px_12px_rgba(168,120,204,0.25)]' : 'border-loginSecondary'}`}
                  onClick={() => setUserType('user')}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white text-2xl shrink-0 transition-all duration-300 overflow-hidden ${userType === 'user' ? 'opacity-70 transform scale-110' : 'opacity-70'}`}>
                    <img src="/登录用户.jpg" className='w-full h-full object-cover z-10' alt="用户图标"/>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-base font-semibold text-gray-800">普通用户</div>
                    <div className="text-sm" style={{ color: '#724B10' }}>浏览和发布内容</div>
                  </div>
                  <div className="flex items-center justify-center text-xl shrink-0" style={{ color: userType === 'user' ? '#A8B78C' : '#d1d5db' }}>
                    <i className={`fa-${userType === 'user' ? 'solid fa-circle-dot' : 'regular fa-circle'}`}></i>
                  </div>
                </div>
              ) : (
                <div 
                  className={`flex items-center gap-3 p-[14px] border rounded-xl bg-white bg-opacity-60 cursor-pointer transition-all duration-300 hover:border-loginPrimary hover:bg-white hover:bg-opacity-80 hover:transform hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(168,120,204,0.15)] ${userType === 'admin' ? 'active border-loginPrimary bg-gradient-to-br from-loginSecondary to-white bg-opacity-90 shadow-[0_4px_12px_rgba(168,120,204,0.25)]' : 'border-loginSecondary'}`}
                  onClick={() => setUserType('admin')}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white text-2xl shrink-0 transition-all duration-300 overflow-hidden ${userType === 'admin' ? 'opacity-70 transform scale-110' : 'opacity-70'}`}>
                    <img src="/登录管理员.jpg" className='w-full h-full object-cover z-10' alt="管理员图标"/>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-base font-semibold text-gray-800">管理员</div>
                    <div className="text-sm" style={{ color: '#724B10' }}>审核和管理帖子</div>
                  </div>
                  <div className="flex items-center justify-center text-xl shrink-0" style={{ color: userType === 'admin' ? '#A878C' : '#d1d5db' }}>
                    <i className={`fa-${userType === 'admin' ? 'solid fa-circle-dot' : 'regular fa-circle'}`}></i>
                  </div>
                </div>
              )}
              

            </div>
            
            {/* 管理员注册提示 */}
            {userType === 'admin' && (
              <div className="flex items-center gap-2 mt-3 p-[10px_12px] bg-loginSecondary bg-opacity-50 border border-loginSecondary rounded-lg text-sm text-gray-800 backdrop-blur-sm">
                <i className="fa-solid fa-info-circle" style={{ color: '#724B10' }}></i>
                <span>管理员账号需要通过快速注册接口创建</span>
              </div>
            )}
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
            
            {/* 七天免密登录状态提示 */}
            {/* 🔒 已注释：为避免用户误会，暂时隐藏免密登录状态提示 */}
            {/* {isValidPhone(phone) && userType === 'user' && (
              <div className="auto-login-status">
                {autoLoginChecking ? (
                  <div className="status-checking">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>检查免密登录状态...</span>
                  </div>
                ) : canAutoLogin ? (
                  <div className="status-available">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>七天免密登录可用</span>
                  </div>
                ) : (
                  <div className="status-unavailable">
                    <i className="fa-solid fa-info-circle"></i>
                    <span>需要密码或验证码登录</span>
                  </div>
                )}
              </div>
            )} */}
          </div>

          {/* 验证码登录模式 */}
          {mode === 'code' && (
            <div className="flex flex-row gap-2 items-end">
              <div className="grid gap-1.5 flex-1 min-w-0">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="请输入6位验证码"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-10 px-2.5 py-2 border border-loginSecondary rounded-3xl text-sm bg-white bg-opacity-80"
                />
              </div>
              <button
                id="sendCodeBtn"
                type="button"
                className="h-10 shrink-0 text-GuText px-4 whitespace-nowrap border border-loginSecondary rounded-3xl bg-white bg-opacity-80 text-loginPrimary text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleSendCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `重试(${countdown}s)` : '获取验证码'}
              </button>
            </div>
          )}

          {/* 密码登录模式 */}
          {mode === 'password' && (
            <div className="grid gap-1.5 password-group">
              <div className="relative grid gap-1.5">
                <label htmlFor="password" className="text-sm" style={{ color: '#724B10' }}>密码</label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  maxLength="32"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 px-2.5 py-2 pr-11 border border-loginSecondary rounded-3xl text-sm bg-white bg-opacity-80"
                />
                <img 
                  src="/小眼睛关闭-copy.png"
                  id="togglePwBtn"
                  className={`absolute bottom-2 right-2 w-6 h-6 cursor-pointer border-none bg-transparent p-0 opacity-60 transition-opacity hover:opacity-100 ${showPassword ? 'active' : ''}`}
                  aria-label="切换显示密码"
                  onClick={togglePasswordVisibility}
                />
              </div>
            </div>
          )}

          {/* 七天免密登录按钮（仅普通用户可用） */}
          {/* 🔒 已注释：为避免用户误会，暂时隐藏七天免密登录按钮 */}
          {/* {canAutoLogin && userType === 'user' && (
            <button 
              type="button" 
              className="auto-login-btn"
              onClick={handleAutoLogin}
              disabled={autoLoginLoading}
            >
              {autoLoginLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-rocket"></i>
                  <span>七天免密登录</span>
                </>
              )}
            </button>
          )} */}

          <button type="submit" className="h-10 border-none rounded-3xl bg-[#a8b78c] text-white font-bold hover:bg-[#e0c6c4]">
            登录
          </button>

          {/* 安全提示 */}
          <div className="m-4 p-3 bg-loginSecondary bg-opacity-60 border border-loginSecondary rounded-3xl backdrop-blur-sm">
            <div className="flex items-start gap-2.5">
              <i className="fa-solid fa-shield-alt text-loginPrimary text-base mt-0.5 shrink-0"></i>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: '#724B10' }}>账号安全保护</p>
                <p className="text-xs m-0 leading-5" style={{ color: '#724B10' }}>为保护您的账号安全，同一账号同时只能在一个设备登录</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center">
            <p className="text-xs m-0" style={{ color: '#724B10' }}>好游，好旅行</p>
            {userType === 'user' && (
              <p 
                className="text-xs m-0 cursor-pointer hover:opacity-70 transition-opacity" 
                style={{ color: '#724B10' }}
                onClick={() => setUserType('admin')}
              >
                我是管理员
              </p>
            )}
            {/* 注册按钮（仅普通用户可用） */}
            {userType === 'user' && (
              <a
                href="#"
                className="text-xs text-loginPrimary no-underline text-GuText"
                onClick={(e) => {
                  e.preventDefault()
                  if (onNavigateToRegister) {
                    onNavigateToRegister()
                  }
                }}
              >
                注册
              </a>
            )}
            
            {/* 切换到普通用户（仅管理员可用） */}
            {userType === 'admin' && (
              <p 
                className="text-xs m-0 cursor-pointer hover:opacity-70 transition-opacity" 
                style={{ color: '#724B10' }}
                onClick={() => setUserType('user')}
              >
                切换到普通用户
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}

export default LoginPage

