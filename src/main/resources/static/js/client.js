// ===== 全局变量 =====
let currentUser = null;
let contacts = [];   // 联系人列表
let messages = {};      // 储存会话
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

        // 处理当前登录用户信息
        currentUser = {
            id: userData.id,
            username: userData.username,
            avatar: userData.username.charAt(0)
        };
        updateUserInfo();

        // 处理好友列表
        contacts = friendsData.map(friend => ({
            id: friend.friendId,
            name: friend.friendName,
            avatar: friend.friendName.charAt(0),
            lastMsg: "新联系人",
            time: getCurrentTime(),
            pinned: false
        }));

        // 处理消息会话数据
        processSessionsData(sessionsData);



        // 渲染最近聊天列表
        renderRecentChats();

        //显示欢迎信息
        showWelcomeMessage();

    } catch (error) {
        console.error('初始化数据失败:', error);
        fallbackGuestUser();
    }
}

// ======= 功能函数 =======

//  ==== 用户相关函数 ====
/**
 * 回退到访客模式 - 当用户数据加载失败时使用
 * 设置当前用户为Guest，并更新UI显示
 */
function fallbackGuestUser() {
    currentUser = { id: 0, username: 'Guest', avatar: 'G' };
    updateUserInfo();
}

/**
 * 更新UI显示用户信息
 * 将当前用户信息显示在界面顶部
 */
function updateUserInfo() {
    if (currentUser) {
        DOM.userAvatar.textContent = currentUser.avatar;
        DOM.userName.textContent = currentUser.username;
    }
}

// === 视图控制函数 ===

/**
 * 检查视口大小，判断是否为移动端视图
 * 更新isMobileView全局变量
 */
function checkViewport() {
    isMobileView = window.innerWidth <= 768;
    updateMobileView();
}

/**
 * 根据isMobileView状态更新移动端视图
 * 调整搜索框显示/隐藏，并重新渲染联系人列表
 */
function updateMobileView() {
    if (isMobileView) {
        DOM.searchInput.style.display = 'none';
        DOM.searchBox.classList.remove('expanded');
    } else {
        DOM.searchInput.style.display = 'block';
    }
    renderContactList();
}


/**
 * 显示欢迎消息 - 首次进入应用时显示
 * 创建一个欢迎消息div并添加到消息区域
 */
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

// ==== 联系人列表相关函数 ====

/**
 * 渲染联系人列表
 * @param {Array} list - 要渲染的联系人数组，默认为全局contacts
 */
function renderContactList(list = contacts) {
    DOM.contactList.innerHTML = '';
    if (list.length === 0) {
        renderEmptyState();
        return;
    }

    // 将置顶联系人放在前面
    const pinned = list.filter(c => c.pinned);
    const normal = list.filter(c => !c.pinned);
    [...pinned, ...normal].forEach(renderContactItem);
}

/**
 * 渲染空状态 - 当联系人列表或消息列表为空时显示
 */
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

/**
 * 渲染单个联系人项
 * @param {Object} contact - 联系人对象
 */
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

/**
 * 渲染最近聊天列表
 * 按最后一条消息时间排序后渲染
 */
function renderRecentChats() {
    const recents = contacts.filter(c => messages[c.id]?.length);
    recents.sort((a, b) => new Date(messages[b.id].slice(-1)[0].time) - new Date(messages[a.id].slice(-1)[0].time));

    DOM.contactList.style.opacity = 0;
    setTimeout(() => {
        renderContactList(recents);
        DOM.contactList.style.opacity = 1;
    }, 100);
}


//==== 聊天相关函数 ====

/**
 * 打开与指定联系人的聊天
 * @param {number} contactId - 联系人ID
 */
async function openChat(contactId) {
    document.querySelector('.app-container').classList.add('view-transition');
    DOM.showMessagesBtn.classList.add('active');
    DOM.showContactsBtn.classList.remove('active');

    currentChatId = contactId;
    highlightCurrentContact();
    updateChatTitle(contactId);

    // 如果没有消息记录，先请求后端创建一个会话
    if (!messages[contactId]) {
        // console.log(contactId)
        try {
            const response = await fetch('/api/addMsgSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactId)
            });

            if (!response.ok) throw new Error('创建会话失败');

            const data = await response.json();
            console.log('新会话创建成功，sessionId:', data.sessionId);

            // 创建一条初始化消息（比如“开始新的对话”）
            messages[contactId] = [{
                sender: contacts.find(c => c.id == contactId).name,
                content: '开始新的对话',
                time: getCurrentTime(),
                self: false
            }];
        } catch (error) {
            console.error('打开聊天失败:', error);
            alert('无法创建新会话，请稍后重试');
            document.querySelector('.app-container').classList.remove('view-transition');
            return;
        }
    }

    renderRecentChats();
    renderMessages(contactId);

    setTimeout(() => document.querySelector('.app-container').classList.remove('view-transition'), 300);
}


/**
 * 高亮当前聊天联系人
 */
function highlightCurrentContact() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === currentChatId);
    });
}

/**
 * 更新聊天标题为当前联系人的名字
 * @param {number} contactId - 联系人ID
 */
function updateChatTitle(contactId) {
    const contact = contacts.find(c => c.id == contactId);
    if (contact) {
        DOM.chatTitle.textContent = contact.name;
    }
}

/**
 * 渲染指定联系人的消息
 * @param {number} contactId - 联系人ID
 */
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


/**
 * 发送消息处理函数
 */
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

    // 模拟对方回复
    setTimeout(() => simulateReply(contact), 1000 + Math.random() * 2000);
}


/**
 * 模拟对方回复
 * @param {Object} contact - 联系人对象
 */
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


/**
 * 将指定联系人移到列表顶部
 * @param {number} id - 联系人ID
 */
function moveContactToTop(id) {
    const idx = contacts.findIndex(c => c.id == id);
    if (idx > -1) {
        const [contact] = contacts.splice(idx, 1);
        contacts.unshift(contact);
    }
}

/**
 * 更新单个联系人项的UI
 * @param {Object} contact - 联系人对象
 */
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


//==== 工具函数 ====
/**
 * 获取当前时间，格式为HH:MM
 * @returns {string} 格式化后的时间字符串
 */
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 获取随机文本（用于模拟回复）
 * @param {string} type - 文本类型: 'reply'或'message'
 * @returns {string} 随机文本
 */
function getRandomText(type = 'reply') {
    const texts = {
        reply: ["好的，我知道了", "谢谢你的消息", "明白了", "这个主意不错", "稍后讨论", "我考虑一下", "听起来不错", "我同意", "明天再聊", "祝好"],
        message: ["你好！", "最近怎么样？", "聊聊天？", "项目如何？", "周末计划？", "查收邮件", "见面时间？", "感谢帮助", "好主意", "愉快的一天"]
    };
    const arr = texts[type] || texts.reply;
    return arr[Math.floor(Math.random() * arr.length)];
}


//==== 数据处理函数 ====

/**
 * 处理会话数据
 * @param {Array} sessionsData - 会话数据数组
 */
function processSessionsData(sessionsData) {
    console.log(JSON.stringify(sessionsData));
    // 遍历每个会话对象
    sessionsData.forEach(session => {

        // 1.提取好友信息
        const friend = session.friendList[0];
        const id = friend.friendId;

        // 2.
        messages[id] = messages[id] || [];
        messages[id].push({ sender: friend.friendName, content: session.lastMsg, time: getCurrentTime(), self: false });

        const contact = contacts.find(c => c.id == id);
        if (contact) {
            contact.lastMsg = session.lastMsg;
            contact.time = getCurrentTime();
        }
    });
}


// ==== 事件处理函数 ====
/**
 * 绑定所有事件监听器
 */
function bindEventListeners() {
    // 发送消息相关
    DOM.sendBtn.addEventListener('click', sendMessage);
    DOM.messageInput.addEventListener('keypress', e => e.key == 'Enter' && sendMessage());

    // 搜索相关
    DOM.searchInput.addEventListener('input', searchContacts);
    DOM.searchBox.addEventListener('click', expandSearchBox);

    // 导航相关
    DOM.logoutBtn.addEventListener('click', handleLogout);
    DOM.showMessagesBtn.addEventListener('click', () => { switchTab('messages'); });
    DOM.showContactsBtn.addEventListener('click', () => { switchTab('contacts'); });

    // 右键菜单相关
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', hideContextMenu);

    // 右键菜单项
    DOM.contextPin.addEventListener('click', pinContact);
    DOM.contextClear.addEventListener('click', clearChatHistory);
    DOM.contextDelete.addEventListener('click', removeFromRecent);
}


/**
 * 搜索联系人
 */
function searchContacts() {
    const term = this.value.toLowerCase();
    const filtered = contacts.filter(c => c.name.toLowerCase().includes(term) || c.lastMsg.toLowerCase().includes(term));
    renderContactList(filtered);
}

/**
 * 在移动端展开搜索框
 */
function expandSearchBox() {
    if (isMobileView) {
        DOM.searchBox.classList.add('expanded');
        DOM.searchInput.style.display = 'block';
        DOM.searchInput.focus();
    }
}


/**
 * 处理登出操作
 */
function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
}


/**
 * 切换标签页（消息/联系人）
 * @param {string} tab - 要切换到的标签页: 'messages'或'contacts'
 */
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

/**
 * 处理右键菜单事件
 * @param {Event} e - 事件对象
 */
function handleContextMenu(e) {
    const item = e.target.closest('.contact-item');
    if (!item) return;

    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, item.dataset.id);
}


/**
 * 显示右键菜单
 * @param {number} x - 菜单X坐标
 * @param {number} y - 菜单Y坐标
 * @param {number} id - 联系人ID
 */
function showContextMenu(x, y, id) {
    currentContextContactId = id;
    const contact = contacts.find(c => c.id == id);

    DOM.contextPin.innerHTML = `<i class="fas fa-thumbtack"></i> <span>${contact.pinned ? '取消置顶' : '置顶联系人'}</span>`;
    DOM.contextMenu.style.top = `${y}px`;
    DOM.contextMenu.style.left = `${x}px`;
    DOM.contextMenu.style.display = 'block';
}


/**
 * 隐藏右键菜单
 */
function hideContextMenu() {
    DOM.contextMenu.style.display = 'none';
}


/**
 * 置顶/取消置顶联系人
 */
function pinContact() {
    const contact = contacts.find(c => c.id == currentContextContactId);
    if (!contact) return;

    contact.pinned = !contact.pinned;

    // 移动到列表顶部或重新排序
    if (contact.pinned) {
        moveContactToTop(contact.id);
    }

    // 重新渲染
    const isMessagesView = DOM.showMessagesBtn.classList.contains('active');
    if (isMessagesView) {
        renderRecentChats();
    } else {
        renderContactList();
    }

    hideContextMenu();
}

/**
 * 清空聊天记录
 */
function clearChatHistory() {
    if (messages[currentContextContactId]) {
        messages[currentContextContactId] = [];
    }
    if (currentChatId == currentContextContactId) {
        renderMessages(currentChatId);
    }
    hideContextMenu();
}

/**
 * 删除最近聊天（不会删好友，只是从最近列表移除）
 */
function removeFromRecent() {
    if (messages[currentContextContactId]) {
        delete messages[currentContextContactId];
    }

    const contact = contacts.find(c => c.id == currentContextContactId);
    if (contact) {
        contact.lastMsg = "新联系人";
        contact.time = getCurrentTime();
    }

    const isMessagesView = DOM.showMessagesBtn.classList.contains('active');
    if (isMessagesView) {
        renderRecentChats();
    } else {
        renderContactList();
    }

    hideContextMenu();
}
