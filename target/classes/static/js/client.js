// ===== 全局变量 =====
let currentUser = null;
let contacts = [];
let messages = {};
let currentChatId = null;
let isMobileView = window.innerWidth <= 768;

// ===== DOM元素 =====
const DOM = {
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    contactList: document.getElementById('contactList'),
    chatTitle: document.getElementById('chatTitle'),
    messageArea: document.getElementById('messageArea'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    searchInput: document.getElementById('searchInput'),
    searchBox: document.querySelector('.search-box'),
    logoutBtn: document.getElementById('logoutBtn'),
    themeToggle: document.getElementById('themeToggle'),
    contextMenu: document.getElementById('contextMenu'),
    contextPin: document.getElementById('contextPin'),
    contextClear: document.getElementById('contextClear'),
    contextDelete: document.getElementById('contextDelete'),
    showMessagesBtn: document.getElementById('showMessages'),
    showContactsBtn: document.getElementById('showContacts')
};
let currentContextContactId = null;

// ===== 页面初始化 =====
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    checkViewport();
    window.addEventListener('resize', checkViewport);
    bindEventListeners();

    try {
        const [userRes, sessionRes, friendRes] = await Promise.all([
            fetch('/api/userInfo'),
            fetch('/api/MsgSessionList'),
            fetch('/api/friendList')
        ]);

        const userData = await userRes.json();
        const sessionsData = await sessionRes.json();
        const friendsData = await friendRes.json();

        currentUser = {
            id: userData.id,
            username: userData.username,
            avatar: userData.username.charAt(0)
        };
        updateUserInfo();

        contacts = friendsData.map(friend => ({
            id: friend.friendId,
            name: friend.friendName,
            avatar: friend.friendName.charAt(0),
            lastMsg: "新联系人",
            time: getCurrentTime(),
            pinned: false
        }));

        processSessionsData(sessionsData);
        renderRecentChats();
        showWelcomeMessage();
    } catch (error) {
        console.error('初始化数据失败:', error);
        fallbackGuestUser();
    }
}

// ===== 功能函数 =====
function fallbackGuestUser() {
    currentUser = { id: 0, username: 'Guest', avatar: 'G' };
    updateUserInfo();
}

function checkViewport() {
    isMobileView = window.innerWidth <= 768;
    updateMobileView();
}

function updateMobileView() {
    if (isMobileView) {
        DOM.searchInput.style.display = 'none';
        DOM.searchBox.classList.remove('expanded');
    } else {
        DOM.searchInput.style.display = 'block';
    }
    renderContactList();
}

function updateUserInfo() {
    if (currentUser) {
        DOM.userAvatar.textContent = currentUser.avatar;
        DOM.userName.textContent = currentUser.username;
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
    DOM.messageArea.appendChild(welcomeDiv);
}

function renderContactList(list = contacts) {
    DOM.contactList.innerHTML = '';
    if (list.length === 0) {
        renderEmptyState();
        return;
    }

    const pinned = list.filter(c => c.pinned);
    const normal = list.filter(c => !c.pinned);
    [...pinned, ...normal].forEach(renderContactItem);
}

function renderEmptyState() {
    const isMessagesView = DOM.showMessagesBtn.classList.contains('active');
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <div class="empty-icon">
            <i class="fas ${isMessagesView ? 'fa-comment-alt' : 'fa-user-friends'}"></i>
        </div>
        <h3 class="empty-title">${isMessagesView ? '没有最近聊天' : '没有联系人'}</h3>
        <p class="empty-description">
            ${isMessagesView ? '开始与联系人聊天，对话将显示在这里' : '添加联系人开始聊天或等待好友请求'}
        </p>
        ${!isMessagesView ? '<button class="empty-action" id="addContactBtn">添加联系人</button>' : ''}
    `;
    DOM.contactList.appendChild(emptyState);

    if (!isMessagesView) {
        document.getElementById('addContactBtn').addEventListener('click', () => alert('打开添加联系人界面'));
    }
}

function renderContactItem(contact) {
    const item = document.createElement('div');
    item.className = `contact-item ${contact.pinned ? 'pinned' : ''}`;
    item.dataset.id = contact.id;
    item.innerHTML = `
        <div class="contact-avatar">${contact.avatar}</div>
        ${!isMobileView ? `<div class="contact-info">
            <div class="contact-name">${contact.name}</div>
            <div class="contact-last-msg">${contact.lastMsg}</div>
        </div>
        <div class="contact-time">${contact.time}</div>` : ''}
        ${contact.pinned ? '<i class="fas fa-thumbtack pinned-icon"></i>' : ''}
    `;
    item.addEventListener('click', () => openChat(contact.id));
    DOM.contactList.appendChild(item);
}

function renderRecentChats() {
    const recents = contacts.filter(c => messages[c.id]?.length);
    recents.sort((a, b) => new Date(messages[b.id].slice(-1)[0].time) - new Date(messages[a.id].slice(-1)[0].time));

    DOM.contactList.style.opacity = 0;
    setTimeout(() => {
        renderContactList(recents);
        DOM.contactList.style.opacity = 1;
    }, 100);
}

function openChat(contactId) {
    document.querySelector('.app-container').classList.add('view-transition');
    DOM.showMessagesBtn.classList.add('active');
    DOM.showContactsBtn.classList.remove('active');

    currentChatId = contactId;
    highlightCurrentContact();
    updateChatTitle(contactId);

    if (!messages[contactId]) {
        messages[contactId] = [{ sender: contacts.find(c => c.id == contactId).name, content: '开始新的对话', time: getCurrentTime(), self: false }];
    }

    renderRecentChats();
    renderMessages(contactId);

    setTimeout(() => document.querySelector('.app-container').classList.remove('view-transition'), 300);
}

function highlightCurrentContact() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id == currentChatId);
    });
}

function updateChatTitle(contactId) {
    const contact = contacts.find(c => c.id == contactId);
    if (contact) {
        DOM.chatTitle.textContent = contact.name;
    }
}

function renderMessages(contactId) {
    DOM.messageArea.innerHTML = '';
    DOM.messageArea.style.opacity = 0;

    (messages[contactId] || []).forEach((msg, idx) => {
        const div = document.createElement('div');
        div.className = `message ${msg.self ? 'message-self' : ''}`;
        div.style.setProperty('--delay', idx);
        div.innerHTML = `
            <div class="message-avatar">${msg.sender.charAt(0)}</div>
            <div class="message-content">
                <div class="message-info">
                    <div class="message-sender">${msg.sender}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
                <div class="message-text">${msg.content}</div>
            </div>
        `;
        DOM.messageArea.appendChild(div);
    });

    setTimeout(() => {
        DOM.messageArea.style.opacity = 1;
        DOM.messageArea.scrollTop = DOM.messageArea.scrollHeight;
    }, 10);
}

function sendMessage() {
    const content = DOM.messageInput.value.trim();
    if (!content || !currentChatId) return;

    const now = getCurrentTime();
    const contact = contacts.find(c => c.id == currentChatId);

    messages[currentChatId] = messages[currentChatId] || [];
    messages[currentChatId].push({ sender: currentUser.username, content, time: now, self: true });

    contact.lastMsg = content;
    contact.time = now;

    moveContactToTop(contact.id);
    updateSingleContactItem(contact);

    renderMessages(currentChatId);
    DOM.messageInput.value = '';

    setTimeout(() => simulateReply(contact), 1000 + Math.random() * 2000);
}

function simulateReply(contact) {
    const replyTime = getCurrentTime();
    const replyContent = getRandomText('reply');

    messages[currentChatId].push({ sender: contact.name, content: replyContent, time: replyTime, self: false });

    contact.lastMsg = replyContent;
    contact.time = replyTime;

    moveContactToTop(contact.id);
    updateSingleContactItem(contact);

    renderMessages(currentChatId);
}

function moveContactToTop(id) {
    const idx = contacts.findIndex(c => c.id == id);
    if (idx > -1) {
        const [contact] = contacts.splice(idx, 1);
        contacts.unshift(contact);
    }
}

function updateSingleContactItem(contact) {
    const item = document.querySelector(`.contact-item[data-id="${contact.id}"]`);
    if (!item || isMobileView) return;

    item.querySelector('.contact-name').textContent = contact.name;
    item.querySelector('.contact-last-msg').textContent = contact.lastMsg;
    item.querySelector('.contact-time').textContent = contact.time;

    if (contact.pinned) {
        item.classList.add('pinned');
        if (!item.querySelector('.pinned-icon')) {
            item.innerHTML += '<i class="fas fa-thumbtack pinned-icon"></i>';
        }
    } else {
        item.classList.remove('pinned');
        const icon = item.querySelector('.pinned-icon');
        if (icon) icon.remove();
    }
}

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function getRandomText(type = 'reply') {
    const texts = {
        reply: ["好的，我知道了", "谢谢你的消息", "明白了", "这个主意不错", "稍后讨论", "我考虑一下", "听起来不错", "我同意", "明天再聊", "祝好"],
        message: ["你好！", "最近怎么样？", "聊聊天？", "项目如何？", "周末计划？", "查收邮件", "见面时间？", "感谢帮助", "好主意", "愉快的一天"]
    };
    const arr = texts[type] || texts.reply;
    return arr[Math.floor(Math.random() * arr.length)];
}

function processSessionsData(sessionsData) {
    sessionsData.forEach(session => {
        const friend = session.friendList[0];
        const id = friend.friendId;

        messages[id] = messages[id] || [];
        messages[id].push({ sender: friend.friendName, content: session.lastMsg, time: getCurrentTime(), self: false });

        const contact = contacts.find(c => c.id == id);
        if (contact) {
            contact.lastMsg = session.lastMsg;
            contact.time = getCurrentTime();
        }
    });
}

function bindEventListeners() {
    DOM.sendBtn.addEventListener('click', sendMessage);
    DOM.messageInput.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());
    DOM.searchInput.addEventListener('input', searchContacts);
    DOM.searchBox.addEventListener('click', expandSearchBox);
    DOM.logoutBtn.addEventListener('click', handleLogout);
    DOM.showMessagesBtn.addEventListener('click', () => { switchTab('messages'); });
    DOM.showContactsBtn.addEventListener('click', () => { switchTab('contacts'); });
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', hideContextMenu);

    DOM.contextPin.addEventListener('click', pinContact);
    DOM.contextClear.addEventListener('click', clearChatHistory);
    DOM.contextDelete.addEventListener('click', removeFromRecent);
}

function searchContacts() {
    const term = this.value.toLowerCase();
    const filtered = contacts.filter(c => c.name.toLowerCase().includes(term) || c.lastMsg.toLowerCase().includes(term));
    renderContactList(filtered);
}

function expandSearchBox() {
    if (isMobileView) {
        DOM.searchBox.classList.add('expanded');
        DOM.searchInput.style.display = 'block';
        DOM.searchInput.focus();
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
}

function switchTab(tab) {
    if (tab === 'messages') {
        DOM.showMessagesBtn.classList.add('active');
        DOM.showContactsBtn.classList.remove('active');
        renderRecentChats();
    } else {
        DOM.showContactsBtn.classList.add('active');
        DOM.showMessagesBtn.classList.remove('active');
        renderContactList();
    }
}

function handleContextMenu(e) {
    const item = e.target.closest('.contact-item');
    if (!item) return;

    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, item.dataset.id);
}

function showContextMenu(x, y, id) {
    currentContextContactId = id;
    const contact = contacts.find(c => c.id == id);

    DOM.contextPin.innerHTML = `<i class="fas fa-thumbtack"></i> <span>${contact.pinned ? '取消置顶' : '置顶联系人'}</span>`;
    DOM.contextMenu.style.top = `${y}px`;
    DOM.contextMenu.style.left = `${x}px`;
    DOM.contextMenu.style.display = 'block';
}

function hideContextMenu() {
    DOM.contextMenu.style.display = 'none';
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
    if (confirm('确定要清空与该联系人的聊天记录吗？')) {
        delete messages[currentContextContactId];
        if (currentChatId == currentContextContactId) {
            DOM.messageArea.innerHTML = '';
            DOM.chatTitle.textContent = '选择联系人开始聊天';
        }
        renderRecentChats();
    }
    hideContextMenu();
}

function removeFromRecent() {
    if (DOM.showMessagesBtn.classList.contains('active')) {
        if (confirm('确定要从最近聊天中移除？')) {
            delete messages[currentContextContactId];
            renderRecentChats();
        }
    }
    hideContextMenu();
}
