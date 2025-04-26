// 标签切换逻辑
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');


authTabs.forEach(tab => {
    tab.addEventListener('click', function () {
        authTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        if (this.dataset.tab === 'login') {
            loginForm.style.display = 'flex';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'flex';
        }
    });
});

// 注册功能
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 前端验证
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }

    if (password.length < 6) {
        alert('密码长度不能少于6位');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '注册失败');
        }

        alert('注册成功！');
        // 切换到登录标签页
        document.querySelector('.auth-tab[data-tab="login"]').click();
        // 自动填充用户名
        document.getElementById('loginUsername').value = username;
        // 清空注册表单
        this.reset();
    } catch (error) {
        console.error('注册错误:', error);
        alert(error.message);
    }
});

// 登录功能
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '登录失败');
        }

        // 保存token到本地存储


        // 登录成功 跳转到首页
        window.location.href = '../html/client.html';
    } catch (error) {
        console.error('登录错误:', error);
        alert(error.message);
    }
});
