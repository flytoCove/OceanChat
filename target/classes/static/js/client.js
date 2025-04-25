// 全局变量
let currentUser = null;
let contacts = [
    { id: 1, name: "张海洋", avatar: "海", lastMsg: "项目提案我已经看过了", time: "10:30", online: true, pinned: false },
    { id: 2, name: "李星辰", avatar: "星", lastMsg: "设计稿需要再调整一下", time: "昨天", online: false, pinned: false },
    { id: 3, name: "王晨曦", avatar: "晨", lastMsg: "会议安排在下午3点", time: "星期一", online: true, pinned: false },
    { id: 4, name: "赵天宇", avatar: "天", lastMsg: "预算已经审批通过", time: "2023/05/10", online: true, pinned: false },
    { id: 5, name: "钱雨桐", avatar: "雨", lastMsg: "客户反馈很积极", time: "2023/05/08", online: false, pinned: false },
    { id: 6, name: "钱雨桐", avatar: "雨", lastMsg: "客户反馈很积极", time: "2023/05/08", online: false, pinned: false },
    { id: 7, name: "钱雨桐", avatar: "雨", lastMsg: "客户反馈很积极", time: "2023/05/08", online: false, pinned: false },
    { id: 8, name: "钱雨桐", avatar: "雨", lastMsg: "客户反馈很积极", time: "2023/05/08", online: false, pinned: false }
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

// 右键菜单元素
const contextMenu = document.getElementById('contextMenu');
const contextPin = document.getElementById('contextPin');
const contextClear = document.getElementById('contextClear');
const contextDelete = document.getElementById('contextDelete');
let currentContextContactId = null;

// 切换按钮元素
const showMessagesBtn = document.getElementById('showMessages');
const showContactsBtn = document.getElementById('showContacts');

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    checkViewport();
    window.addEventListener('resize', checkViewport);

    // 初始化用户信息
    fetch('/user/getUserInfo')
        .then(response => {
            if (!response.ok) {
                throw new Error('获取用户信息失败');
            }
            return response.json();
        })
        .then(userData => {
            currentUser = {
                id: userData.id,
                username: userData.username,
                avatar: userData.username.charAt(1) || userData.username.charAt(0) // 使用第二个字符，如果没有则用第一个
            };
            updateUserInfo();
            renderRecentChats();
            showWelcomeMessage();
        })
        .catch(error => {
            console.error('初始化用户数据错误:', error);
            // 可以设置一个默认用户或显示错误信息
            currentUser = {
                id: 0,
                username: 'Guest',
                avatar: 'G'
            };
            updateUserInfo();
        });

    // 事件监听器
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    searchInput.addEventListener('input', searchContacts);
    searchBox.addEventListener('click', handleSearchBoxClick);
    document.addEventListener('click', handleDocumentClick);
    logoutBtn.addEventListener('click', handleLogout);

    // 导航切换
    showMessagesBtn.addEventListener('click', function() {
        this.classList.add('active');
        showContactsBtn.classList.remove('active');
        renderRecentChats();
    });

    showContactsBtn.addEventListener('click', function() {
        this.classList.add('active');
        showMessagesBtn.classList.remove('active');
        renderContactList();
    });

    // 右键菜单
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', hideContextMenu);
    contextPin.addEventListener('click', pinContact);
    contextClear.addEventListener('click', clearChatHistory);
    contextDelete.addEventListener('click', removeFromRecent);
});

// 功能函数
function checkViewport() {
    isMobileView = window.innerWidth <= 768;
    updateMobileView();
}

function updateMobileView() {
    if (isMobileView) {
        searchInput.style.display = 'none';
        searchBox.classList.remove('expanded');
    } else {
        searchInput.style.display = 'block';
    }
    renderContactList();
}

function updateUserInfo() {
    if (currentUser) {
        userAvatar.textContent = currentUser.avatar;
        userName.textContent = currentUser.username;
    }
}

function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <div class="message">
            <div class="message-avatar">O</div>
            <div class="message-content">
                <div class="message-info">
                    <div class="message-sender">OceanChat</div>
                    <div class="message-time">${getCurrentTime()}</div>
                </div>
                <div class="message-text">欢迎使用OceanChat！开始与您的联系人聊天吧。</div>
            </div>
        </div>
    `;
    messageArea.appendChild(welcomeDiv);
}

function renderContactList(contactsToRender = contacts) {
    contactList.innerHTML = '';

    // 先显示置顶联系人
    const pinnedContacts = contactsToRender.filter(c => c.pinned);
    const normalContacts = contactsToRender.filter(c => !c.pinned);

    pinnedContacts.forEach(renderContactItem);
    normalContacts.forEach(renderContactItem);
}

function renderContactItem(contact) {
    const contactItem = document.createElement('div');
    contactItem.className = `contact-item ${contact.pinned ? 'pinned' : ''}`;
    contactItem.dataset.id = contact.id;

    const contactInfo = isMobileView ? '' : `
        <div class="contact-info">
            <div class="contact-name">${contact.name}</div>
            <div class="contact-last-msg">${contact.lastMsg}</div>
        </div>
        <div class="contact-time">${contact.time}</div>
    `;

    contactItem.innerHTML = `
        <div class="contact-avatar">${contact.avatar}</div>
        ${contactInfo}
        ${contact.pinned ? '<i class="fas fa-thumbtack pinned-icon"></i>' : ''}
    `;

    contactItem.addEventListener('click', () => openChat(contact.id));
    contactList.appendChild(contactItem);
}

function renderRecentChats() {
    const recentContacts = contacts.filter(contact =>
        messages[contact.id] && messages[contact.id].length > 0
    );
    renderContactList(recentContacts);
}

function openChat(contactId) {
    currentChatId = contactId;
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id == contactId) item.classList.add('active');
    });

    const contact = contacts.find(c => c.id == contactId);
    if (contact) chatTitle.textContent = isMobileView ? contact.name : `${contact.name}`;
    renderMessages(contactId);
}

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

    messageArea.scrollTop = messageArea.scrollHeight;
}

function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentChatId) return;

    const newMessage = {
        sender: "我",
        content,
        time: getCurrentTime(),
        self: true
    };

    if (!messages[currentChatId]) messages[currentChatId] = [];
    messages[currentChatId].push(newMessage);

    renderMessages(currentChatId);
    messageInput.value = '';

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

            // 更新联系人列表
            contact.lastMsg = replyMessage.content;
            contact.time = replyMessage.time;
            renderContactList();
        }
    }, 1000 + Math.random() * 2000);
}

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
}

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

// 搜索功能
function searchContacts() {
    const searchTerm = this.value.toLowerCase();
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.lastMsg.toLowerCase().includes(searchTerm)
    );
    renderContactList(filteredContacts);
}

function handleSearchBoxClick() {
    if (isMobileView) {
        this.classList.add('expanded');
        searchInput.style.display = 'block';
        searchInput.focus();
    }
}

function handleDocumentClick(e) {
    if (isMobileView && !searchBox.contains(e.target) && searchBox.classList.contains('expanded')) {
        searchBox.classList.remove('expanded');
        searchInput.style.display = 'none';
        searchInput.value = '';
        renderContactList();
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
}

// 右键菜单功能
function handleContextMenu(e) {
    const contactItem = e.target.closest('.contact-item');
    if (contactItem) {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, contactItem.dataset.id);
    }
}

function showContextMenu(x, y, contactId) {
    currentContextContactId = contactId;
    const contact = contacts.find(c => c.id == contactId);

    // 更新菜单项状态
    contextPin.innerHTML = `
        <i class="fas fa-thumbtack"></i>
        <span>${contact.pinned ? '取消置顶' : '置顶联系人'}</span>
    `;

    // 定位菜单
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.display = 'block';

    // 确保菜单在可视区域内
    const rect = contextMenu.getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = `${window.innerHeight - rect.height - 5}px`;
    }
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = `${window.innerWidth - rect.width - 5}px`;
    }
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
}

function pinContact() {
    const contact = contacts.find(c => c.id == currentContextContactId);
    if (contact) {
        contact.pinned = !contact.pinned;
        renderContactList();
    }
    hideContextMenu();
}

function clearChatHistory() {
    if (confirm('确定要清空与这个联系人的所有聊天记录吗？')) {
        if (messages[currentContextContactId]) {
            delete messages[currentContextContactId];
            if (currentChatId == currentContextContactId) {
                messageArea.innerHTML = '';
                chatTitle.textContent = '选择联系人开始聊天';
            }
            renderRecentChats();
        }
    }
    hideContextMenu();
}

function removeFromRecent() {
    if (showMessagesBtn.classList.contains('active')) {
        if (confirm('确定要从最近聊天中移除这个联系人吗？')) {
            delete messages[currentContextContactId];
            renderRecentChats();
        }
    }
    hideContextMenu();
}