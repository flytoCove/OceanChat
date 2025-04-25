// 全局变量
let currentUser = null;
let contacts = [
    { id: 1, name: "张海洋", avatar: "海", lastMsg: "项目提案我已经看过了", time: "10:30", online: true },
    { id: 2, name: "李星辰", avatar: "星", lastMsg: "设计稿需要再调整一下", time: "昨天", online: false },
    { id: 3, name: "王晨曦", avatar: "晨", lastMsg: "会议安排在下午3点", time: "星期一", online: true },
    { id: 4, name: "赵天宇", avatar: "天", lastMsg: "预算已经审批通过", time: "2023/05/10", online: true },
    { id: 5, name: "钱雨桐", avatar: "雨", lastMsg: "客户反馈很积极", time: "2023/05/08", online: false }
];

let messages = {
    1: [
        { sender: "张海洋", content: "项目提案我已经看过了，有几个建议", time: "10:30", self: false },
        { sender: "我", content: "好的，您有什么建议？", time: "10:32", self: true },
        { sender: "张海洋", content: "主要是预算部分需要更详细一些", time: "10:33", self: false }
    ],
    2: [
        { sender: "李星辰", content: "设计稿需要再调整一下", time: "09:15", self: false },
        { sender: "我", content: "具体是哪些部分需要调整？", time: "09:20", self: true }
    ],
    3: [
        { sender: "王晨曦", content: "会议安排在下午3点，可以吗？", time: "星期一", self: false },
        { sender: "我", content: "没问题，我会准时参加", time: "星期一", self: true }
    ],
    4: [
        { sender: "赵天宇", content: "预算已经审批通过", time: "2023/05/10", self: false },
        { sender: "我", content: "太好了，我们可以开始实施了", time: "2023/05/10", self: true }
    ],
    5: [
        { sender: "钱雨桐", content: "客户反馈很积极，他们很喜欢新设计", time: "2023/05/08", self: false },
        { sender: "我", content: "这是团队共同努力的结果", time: "2023/05/08", self: true }
    ]
};

let currentChatId = null;
let isMobileView = window.innerWidth <= 768;

// DOM元素
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const contactList = document.getElementById('contactList');
const chatTitle = document.getElementById('chatTitle');
const messageArea = document.getElementById('messageArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const searchInput = document.getElementById('searchInput');
const searchBox = document.querySelector('.search-box');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查窗口大小
    checkViewport();
    window.addEventListener('resize', checkViewport);

    // 从本地存储获取用户信息
    const authToken = localStorage.getItem('authToken');
    // if (!authToken) {
    //     window.location.href = 'login.html';
    //     return;
    // }

    // 模拟获取用户信息
    setTimeout(() => {
        currentUser = {
            id: 100,
            username: "OceanUser",
            avatar: "O"
        };
        updateUserInfo();
        renderContactList();

        // 显示欢迎消息
        showWelcomeMessage();
    }, 500);

    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 搜索联系人
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.lastMsg.toLowerCase().includes(searchTerm)
        );
        renderContactList(filteredContacts);
    });

    // 搜索框点击事件（移动端）
    searchBox.addEventListener('click', function() {
        if (isMobileView) {
            this.classList.add('expanded');
            searchInput.style.display = 'block';
            searchInput.focus();
        }
    });

    // 点击其他地方收起搜索框（移动端）
    document.addEventListener('click', function(e) {
        if (isMobileView && !searchBox.contains(e.target) && searchBox.classList.contains('expanded')) {
            searchBox.classList.remove('expanded');
            searchInput.style.display = 'none';
            searchInput.value = '';
            renderContactList();
        }
    });

    // 退出登录
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });

    // 主题切换
    themeToggle.addEventListener('click', toggleTheme);
});

// 检查视口大小
function checkViewport() {
    isMobileView = window.innerWidth <= 768;
    updateMobileView();
}

// 更新移动端视图
function updateMobileView() {
    if (isMobileView) {
        searchInput.style.display = 'none';
        searchBox.classList.remove('expanded');
    } else {
        searchInput.style.display = 'block';
    }
    renderContactList();
}

// 更新用户信息
function updateUserInfo() {
    if (currentUser) {
        userAvatar.textContent = currentUser.avatar;
        userName.textContent = currentUser.username;
    }
}

// 显示欢迎消息
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'message';
    welcomeDiv.style.opacity = '0';
    welcomeDiv.style.animation = 'fadeInUp 0.5s forwards';
    welcomeDiv.style.animationDelay = '0.3s';
    welcomeDiv.innerHTML = `
        <div class="message-avatar">O</div>
        <div class="message-content">
            <div class="message-info">
                <div class="message-sender">OceanChat</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
            <div class="message-text">欢迎使用OceanChat！开始与您的联系人聊天吧。</div>
        </div>
    `;
    messageArea.appendChild(welcomeDiv);
}

// 渲染联系人列表
function renderContactList(contactsToRender = contacts) {
    contactList.innerHTML = '';
    contactsToRender.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = `contact-item ${contact.online ? 'online' : ''}`;
        contactItem.dataset.id = contact.id;

        // 移动端只显示头像和在线状态
        const contactInfo = isMobileView ? '' : `
            <div class="contact-info">
                <div class="contact-name">${contact.name} ${contact.online ? '<span class="online-dot"></span>' : ''}</div>
                <div class="contact-last-msg">${contact.lastMsg}</div>
            </div>
            <div class="contact-time">${contact.time}</div>
        `;

        contactItem.innerHTML = `
            <div class="contact-avatar">${contact.avatar}</div>
            ${contactInfo}
        `;
        contactItem.addEventListener('click', () => openChat(contact.id));
        contactList.appendChild(contactItem);
    });
}

// 打开聊天
function openChat(contactId) {
    currentChatId = contactId;

    // 更新联系人选中状态
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id == contactId) {
            item.classList.add('active');
        }
    });

    // 更新聊天标题
    const contact = contacts.find(c => c.id == contactId);
    if (contact) {
        chatTitle.textContent = isMobileView ? contact.name : `${contact.name} ${contact.online ? '· 在线' : '· 离线'}`;
    }

    // 渲染消息
    renderMessages(contactId);
}

// 渲染消息
function renderMessages(contactId) {
    messageArea.innerHTML = '';
    const chatMessages = messages[contactId] || [];

    chatMessages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.self ? 'message-self' : ''}`;
        messageDiv.style.opacity = '0';
        messageDiv.style.animation = `fadeInUp 0.3s forwards`;
        messageDiv.style.animationDelay = `${index * 0.1}s`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${msg.sender.charAt(0)}</div>
            <div class="message-content">
                <div class="message-info">
                    <div class="message-sender">${msg.sender}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
                <div class="message-text">${msg.content}</div>
            </div>
        `;
        messageArea.appendChild(messageDiv);
    });

    // 滚动到底部
    messageArea.scrollTop = messageArea.scrollHeight;
}

// 发送消息
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentChatId) return;

    // 创建新消息
    const newMessage = {
        sender: "我",
        content: content,
        time: getCurrentTime(),
        self: true
    };

    // 添加到消息列表
    if (!messages[currentChatId]) {
        messages[currentChatId] = [];
    }
    messages[currentChatId].push(newMessage);

    // 更新UI
    renderMessages(currentChatId);

    // 清空输入框
    messageInput.value = '';

    // 模拟回复
    setTimeout(() => {
        const contact = contacts.find(c => c.id == currentChatId);
        if (contact) {
            const replyMessage = {
                sender: contact.name,
                content: getRandomReply(),
                time: getCurrentTime(),
                self: false
            };
            messages[currentChatId].push(replyMessage);
            renderMessages(currentChatId);

            // 更新联系人最后消息
            contact.lastMsg = replyMessage.content;
            contact.time = replyMessage.time;
            renderContactList();
        }
    }, 1000 + Math.random() * 2000);
}

// 获取当前时间
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// 随机回复
function getRandomReply() {
    const replies = [
        "好的，我知道了",
        "谢谢你的消息",
        "我明白了",
        "这个主意不错",
        "我们稍后再讨论",
        "我需要考虑一下",
        "听起来很有趣",
        "我同意你的看法",
        "让我们明天再谈",
        "祝你今天愉快"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
}

// 切换主题
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}