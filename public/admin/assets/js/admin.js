let currentAction = '';
let currentUser = '';
let chartInstance1 = null;
let chartInstance2 = null;

function showToast(message, type = 'success') {
    const backgroundColor = type === 'success' ? 'linear-gradient(135deg, #10b981, #34d399)' :
                          type === 'error' ? 'linear-gradient(135deg, #ef4444, #f87171)' :
                          'linear-gradient(135deg, #3b82f6, #60a5fa)';
    
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: backgroundColor,
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            fontFamily: "inherit"
        }
    }).showToast();
}

document.getElementById('signInForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/admin/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('signInModal').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            loadDashboardData();
            showToast(`Welcome back, ${username}!`, 'success');
        } else {
            showToast(data.error || 'Sign-in failed', 'error');
        }
    } catch (error) {
        console.error('Sign-in error:', error);
        showToast('Server error during sign-in', 'error');
    }
});

function signOut() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('signInModal').classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showToast('Successfully signed out', 'info');
}

async function loadDashboardData() {
    try {
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        document.getElementById('botName').textContent = config.botName || 'Bot Dashboard';
        document.getElementById('adminUsername').textContent = `Welcome back, ${config.adminUsername || 'Admin'}`;

        const statsResponse = await fetch('/api/admin/stats');
        const stats = await statsResponse.json();
        document.getElementById('totalCommands').textContent = stats.totalCommands || 0;
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('uptime').textContent = stats.uptime || '0d 0h 0m';
        document.getElementById('serverStatus').textContent = stats.serverStatus || 'Offline';
        document.getElementById('statusIndicator').className = stats.serverStatus === 'Online' ? 'w-3 h-3 bg-green-400 rounded-full pulse-animation' : 'w-3 h-3 bg-red-400 rounded-full pulse-animation';
        document.getElementById('statusText').textContent = stats.serverStatus || 'Offline';
        document.getElementById('uptimeTime').textContent = new Date().toLocaleTimeString();
        document.getElementById('statusTime').textContent = new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Dashboard data error:', error);
        showToast('Error loading dashboard data: ' + (error.message || 'Unknown error'), 'error');
    }
    setInterval(loadDashboardData, 30000);
}

function showUsers() {
    document.getElementById('usersModal').classList.remove('hidden');
    loadUsers();
    toggleBodyScroll(true);
}

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        if (users.error && users.error === 'No users found') {
            usersList.innerHTML = '<p class="text-gray-600">No users found.</p>';
            return;
        }
        users.forEach(user => {
            const isAdmin = user.isAdmin ? 'Admin' : 'Active';
            const adminButtonClass = user.isAdmin ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600';
            const adminButtonText = user.isAdmin ? 'Admin' : 'Make Admin';
            const adminAction = user.isAdmin ? 'removeAdmin' : 'makeAdmin';
            const banButtonClass = user.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
            const banButtonText = user.isBanned ? 'Unban' : 'Ban';
            const banAction = user.isBanned ? 'unban' : 'ban';

            usersList.innerHTML += `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-800">${user.name}</h3>
                            <p class="text-sm text-gray-600">ID: ${user.uid} • Joined: ${new Date(user.createdAt).toLocaleDateString()}</p>
                            <span class="inline-block px-2 py-1 ${user.isAdmin ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'} text-xs rounded-full">${isAdmin}</span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="showConfirmation('${adminAction}', '${user.uid}')" 
                                class="px-4 py-2 ${adminButtonClass} rounded-lg transition-all">
                            <i class="fas fa-crown mr-1"></i>${adminButtonText}
                        </button>
                        <button onclick="showConfirmation('${banAction}', '${user.uid}')" 
                                class="px-4 py-2 ${banButtonClass} text-white rounded-lg transition-all">
                            <i class="fas fa-${banAction === 'unban' ? 'check' : 'ban'} mr-1"></i>${banButtonText}
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Users load error:', error);
        showToast('Error loading users: ' + (error.message || 'Unknown error'), 'error');
    }
}

function hideUsers() {
    document.getElementById('usersModal').classList.add('hidden');
    toggleBodyScroll(false);
}

function showBotSettings() {
    document.getElementById('botSettingsModal').classList.remove('hidden');
    loadBotSettings();
    toggleBodyScroll(true);
}

async function loadBotSettings() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        document.getElementById('botNameInput').value = config.botName || '';
        document.getElementById('botAvatarInput').value = config.botAvatar || '';
        document.getElementById('contactUrlInput').value = config.contactUrl || '';
    } catch (error) {
        console.error('Bot settings load error:', error);
        showToast('Error loading bot settings: ' + (error.message || 'Unknown error'), 'error');
    }
}

document.getElementById('botSettingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const botName = document.getElementById('botNameInput').value;
    const botAvatar = document.getElementById('botAvatarInput').value;
    const contactUrl = document.getElementById('contactUrlInput').value;

    try {
        const response = await fetch('/api/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botName, botAvatar, contactUrl })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Bot settings saved successfully', 'success');
            hideBotSettings();
            loadDashboardData();
        } else {
            showToast('Failed to save settings: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Bot settings save error:', error);
        showToast('Server error while saving settings: ' + (error.message || 'Unknown error'), 'error');
    }
});

function hideBotSettings() {
    document.getElementById('botSettingsModal').classList.add('hidden');
    toggleBodyScroll(false);
}

function showAnalytics() {
    document.getElementById('analyticsModal').classList.remove('hidden');
    loadAnalytics();
    toggleBodyScroll(true);
}

async function loadAnalytics() {
    try {
        const commandUsageData = {
            labels: ['waifu', 'coolfact', 'me'],
            datasets: [{
                label: 'Commands Used',
                data: [150, 200, 100],
                backgroundColor: 'rgba(99, 102, 241, 0.6)'
            }]
        };
        const userActivityData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Active Users',
                data: [50, 60, 70, 80, 90, 100],
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                fill: true
            }]
        };

        if (chartInstance1) chartInstance1.destroy();
        if (chartInstance2) chartInstance2.destroy();

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            chartInstance1 = new Chart(document.getElementById('commandUsageChart'), {
                type: 'bar',
                data: commandUsageData,
                options: { responsive: true }
            });
            chartInstance2 = new Chart(document.getElementById('userActivityChart'), {
                type: 'line',
                data: userActivityData,
                options: { responsive: true }
            });
            showToast('Analytics loaded successfully', 'success');
        };
        script.onerror = () => {
            showToast('Error loading Chart.js library', 'error');
        };
        document.body.appendChild(script);
    } catch (error) {
        console.error('Analytics load error:', error);
        showToast('Error loading analytics: ' + (error.message || 'Unknown error'), 'error');
    }
}

function hideAnalytics() {
    document.getElementById('analyticsModal').classList.add('hidden');
    toggleBodyScroll(false);
}

function showConfirmation(action, uid) {
    currentAction = action;
    currentUser = uid;
    
    const modal = document.getElementById('confirmationModal');
    const icon = document.getElementById('confirmIcon');
    const iconClass = document.getElementById('confirmIconClass');
    const title = document.getElementById('confirmTitle');
    const message = document.getElementById('confirmMessage');
    const button = document.getElementById('confirmButton');
    
    if (action === 'ban' || action === 'unban') {
        icon.className = 'w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4';
        iconClass.className = 'fas fa-ban text-white text-2xl';
        title.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} User`;
        message.textContent = `Are you sure you want to ${action} user with UID ${uid}? This action cannot be undone.`;
        button.className = 'flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all';
        button.textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} User`;
    } else if (action === 'makeAdmin' || action === 'removeAdmin') {
        icon.className = 'w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4';
        iconClass.className = 'fas fa-crown text-white text-2xl';
        title.textContent = `${action === 'makeAdmin' ? 'Make' : 'Remove'} Admin`;
        message.textContent = `Are you sure you want to ${action === 'makeAdmin' ? 'make' : 'remove'} user with UID ${uid} as an admin?`;
        button.className = 'flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all';
        button.textContent = `${action === 'makeAdmin' ? 'Make' : 'Remove'} Admin`;
    }
    
    modal.classList.remove('hidden');
    toggleBodyScroll(true);
}

function hideConfirmation() {
    document.getElementById('confirmationModal').classList.add('hidden');
    if (document.getElementById('usersModal').classList.contains('hidden') &&
        document.getElementById('botSettingsModal').classList.contains('hidden') &&
        document.getElementById('analyticsModal').classList.contains('hidden')) {
        toggleBodyScroll(false);
    }
}

async function executeAction() {
    try {
        const response = await fetch('/api/admin/user/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: currentUser, action: currentAction })
        });
        const data = await response.json();
        if (data.success) {
            showToast(data.message, 'success');
            if (document.getElementById('usersModal').classList.contains('hidden')) {
                loadUsers();
            } else {
                hideConfirmation();
                loadUsers();
            }
        } else {
            showToast(data.error || 'Action failed', 'error');
        }
    } catch (error) {
        console.error('Action execution error:', error);
        showToast('Server error during action: ' + (error.message || 'Unknown error'), 'error');
    }
}

function toggleBodyScroll(disable) {
    if (disable) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signInModal').classList.remove('hidden');
});