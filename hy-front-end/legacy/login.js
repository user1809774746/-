(function () {
  const phone = document.getElementById('phone');
  const code = document.getElementById('code');
  const password = document.getElementById('password');
  const togglePwBtn = document.getElementById('togglePwBtn');
  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const loginForm = document.getElementById('loginForm');
  const tabs = document.querySelectorAll('.tab-btn');
  const codeBox = document.querySelector('.code-box');
  const passwordGroup = document.querySelector('.password-group');

  // 当前模式：'code' 或 'password'
  let mode = 'password';

  function isValidPhone(p) {
    return /^1[3-9]\d{9}$/.test(p);
  }
  function isValidCode(c) {
    return /^\d{6}$/.test(c);
  }
  function isValidPassword(pw) {
    // 简单演示：长度>=6
    return typeof pw === 'string' && pw.length >= 6;
  }

  let countdown = 0, timer = null;
  function updateSendBtn() {
    if (mode !== 'code') {
      sendCodeBtn.style.display = 'none';
      return;
    } else {
      sendCodeBtn.style.display = '';
    }
    if (countdown > 0) {
      sendCodeBtn.textContent = `重试(${countdown}s)`;
      sendCodeBtn.disabled = true;
    } else {
      sendCodeBtn.textContent = '获取验证码';
      sendCodeBtn.disabled = false;
    }
  }

  // 切换模式
  function applyMode(next) {
    mode = next;
    tabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    if (mode === 'code') {
      // 切回验证码时确保密码输入为隐藏状态
      if (password) { password.type = 'password'; }
      if (togglePwBtn) { 
        togglePwBtn.classList.remove('active'); 
        togglePwBtn.src = './imge/小眼睛闭眼.png';
      }
      codeBox.style.display = '';
      passwordGroup.style.display = 'none';
    } else {
      codeBox.style.display = 'none';
      passwordGroup.style.display = '';
      // 切到密码模式时，若在倒计时，停止倒计时并重置
      if (timer) { clearInterval(timer); timer = null; }
      countdown = 0;
      // 初始为隐藏密码
      if (password) { password.type = 'password'; }
      if (togglePwBtn) { 
        togglePwBtn.classList.remove('active'); 
        togglePwBtn.src = './imge/小眼睛关闭-copy.png';
      }
    }
    updateSendBtn();
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => applyMode(btn.dataset.mode));
  });

  sendCodeBtn.addEventListener('click', () => {
    if (mode !== 'code') return;
    const p = phone.value.trim();
    if (!isValidPhone(p)) { alert('请输入正确的手机号'); return; }
    // 演示：模拟发送验证码
    alert('验证码已发送：123456（演示）');
    countdown = 60;
    updateSendBtn();
    timer = setInterval(() => {
      countdown--;
      updateSendBtn();
      if (countdown <= 0) { clearInterval(timer); timer = null; }
    }, 1000);
  });

  // 显示/隐藏密码
  if (togglePwBtn) {
    togglePwBtn.addEventListener('click', () => {
      if (!password) return;
      const isHidden = password.type === 'password';
      password.type = isHidden ? 'text' : 'password';
      // 切换图标：闭眼（隐藏）<-> 睁眼（显示）
      togglePwBtn.src = isHidden ? './imge/小眼睛打开-copy.png' : './imge/小眼睛关闭-copy.png';
      togglePwBtn.classList.toggle('active', isHidden);
    });
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = phone.value.trim();

    if (!isValidPhone(p)) { alert('手机号格式不正确'); return; }

    if (mode === 'code') {
      const c = code.value.trim();
      if (!isValidCode(c)) { alert('验证码为6位数字'); return; }
    } else {
      const pw = password.value;
      if (!isValidPassword(pw)) { alert('密码长度至少为6位'); return; }
    }

    // 演示登录成功
    localStorage.setItem('auth_token', 'demo-token');
    localStorage.setItem('user_phone', p);
    localStorage.setItem('login_mode', mode);
    alert('登录成功');
    location.href = './index.html';
  });

  // 初始化
  applyMode('password');
})();