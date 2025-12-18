(function () {
  const phone = document.getElementById('phone');
  const code = document.getElementById('code');
  const password = document.getElementById('password');
  const password2 = document.getElementById('password2');
  const togglePwBtn = document.getElementById('togglePwBtn');
  const togglePwBtn2 = document.getElementById('togglePwBtn2');
  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const registerForm = document.getElementById('registerForm');

  // 验证函数
  function isValidPhone(p) {
    return /^1[3-9]\d{9}$/.test(p);
  }
  function isValidCode(c) {
    return /^\d{6}$/.test(c);
  }
  function isValidPassword(pw) {
    return typeof pw === 'string' && pw.length >= 6;
  }

  // 验证码倒计时
  let countdown = 0, timer = null;
  let codeVerified = false; // 标记验证码是否已验证

  function updateSendBtn() {
    if (countdown > 0) {
      sendCodeBtn.textContent = `重试(${countdown}s)`;
      sendCodeBtn.disabled = true;
    } else {
      sendCodeBtn.textContent = '获取验证码';
      sendCodeBtn.disabled = false;
    }
  }

  // 获取验证码
  sendCodeBtn.addEventListener('click', () => {
    const p = phone.value.trim();
    if (!isValidPhone(p)) {
      alert('请输入正确的手机号');
      phone.focus();
      return;
    }
    
    // 演示：模拟发送验证码
    alert('验证码已发送：123456（演示）');
    countdown = 60;
    updateSendBtn();
    timer = setInterval(() => {
      countdown--;
      updateSendBtn();
      if (countdown <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  });

  // 验证码输入框监听 - 自动验证并启用密码输入
  code.addEventListener('input', () => {
    const c = code.value.trim();
    if (isValidCode(c)) {
      // 演示：假设123456是正确的验证码
      if (c === '123456') {
        codeVerified = true;
        password.disabled = false;
        password2.disabled = false;
        code.style.borderColor = 'var(--primary)';
        alert('验证码正确，请设置密码');
      } else {
        codeVerified = false;
        password.disabled = true;
        password2.disabled = true;
        code.style.borderColor = '#ef4444';
      }
    } else {
      codeVerified = false;
      password.disabled = true;
      password2.disabled = true;
      code.style.borderColor = '';
    }
  });

  // 显示/隐藏密码 - 密码1
  if (togglePwBtn) {
    togglePwBtn.addEventListener('click', () => {
      if (!password || password.disabled) return;
      const isHidden = password.type === 'password';
      password.type = isHidden ? 'text' : 'password';
      togglePwBtn.src = isHidden ? './imge/小眼睛打开-copy.png' : './imge/小眼睛关闭-copy.png';
      togglePwBtn.classList.toggle('active', isHidden);
    });
  }

  // 显示/隐藏密码 - 密码2
  if (togglePwBtn2) {
    togglePwBtn2.addEventListener('click', () => {
      if (!password2 || password2.disabled) return;
      const isHidden = password2.type === 'password';
      password2.type = isHidden ? 'text' : 'password';
      togglePwBtn2.src = isHidden ? './imge/小眼睛打开-copy.png' : './imge/小眼睛关闭-copy.png';
      togglePwBtn2.classList.toggle('active', isHidden);
    });
  }

  // 注册表单提交
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const p = phone.value.trim();
    const c = code.value.trim();
    const pw = password.value;
    const pw2 = password2.value;

    // 验证手机号
    if (!isValidPhone(p)) {
      alert('手机号格式不正确');
      phone.focus();
      return;
    }

    // 验证验证码
    if (!isValidCode(c)) {
      alert('请输入6位验证码');
      code.focus();
      return;
    }

    if (!codeVerified) {
      alert('验证码错误，演示验证码为：123456');
      code.focus();
      return;
    }

    // 验证密码
    if (!isValidPassword(pw)) {
      alert('密码长度至少为6位');
      password.focus();
      return;
    }

    // 验证两次密码是否一致
    if (pw !== pw2) {
      alert('两次输入的密码不一致');
      password2.focus();
      return;
    }

    // 演示注册成功
    localStorage.setItem('auth_token', 'demo-token');
    localStorage.setItem('user_phone', p);
    alert('注册成功！');
    location.href = './index.html';
  });
})();