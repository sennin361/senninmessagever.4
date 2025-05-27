const chatLog = document.querySelector('.chat-log');
const form = document.getElementById('chatForm');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const leaveBtn = document.getElementById('leaveBtn');

// 管理用の垢バンリストをローカルストレージで管理
let bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');

function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function saveBannedUsers() {
  localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
}

function addMessage(name, text, isMe, isSystem = false, timestamp = null) {
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                         : new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const bubble = document.createElement('div');
  bubble.className = isSystem ? 'bubble system' : 'bubble ' + (isMe ? 'you' : 'other');

  bubble.innerHTML = `
    <div class="meta">
      <span class="name">${isSystem ? '' : name}</span>
      <span class="time">${isSystem ? '' : time}</span>
    </div>
    <div class="text">${text}</div>
  `;

  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// ページ読み込み時に履歴を表示
function loadChatHistory() {
  chatLog.innerHTML = '';
  chatHistory.forEach(msg => {
    addMessage(msg.name, msg.text, msg.isMe, msg.isSystem, msg.timestamp);
  });
}

loadChatHistory();

// 送信処理
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = usernameInput.value.trim();
  const text = messageInput.value.trim();
  if (!name || !text) return;

  if (bannedUsers.includes(name)) {
    alert('あなたは垢バンされています。メッセージを送信できません。');
    messageInput.value = '';
    return;
  }

  // チャット履歴に追加
  const msgObj = {name, text, isMe: true, isSystem: false, timestamp: Date.now()};
  chatHistory.push(msgObj);
  saveChatHistory();

  addMessage(name, text, true);

  messageInput.value = '';
});

// 退室処理
leaveBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return;

  if (!confirm('本当に退室しますか？')) return;

  // 退室メッセージも履歴に残す
  const sysMsg = `「${name}」が退室しました。`;
  chatHistory.push({name: 'システム', text: sysMsg, isMe: false, isSystem: true, timestamp: Date.now()});
  saveChatHistory();

  addMessage('システム', sysMsg, false, true);

  usernameInput.value = '';
  messageInput.value = '';
});
