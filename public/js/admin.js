// 检查登录状态
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (!data.loggedIn) {
            window.location.href = '/login';
            return null;
        }
        window.currentUser = data.user; // 暴露给 collab.js
        document.getElementById('userName').textContent = data.user.name;
        document.getElementById('userAvatar').textContent = data.user.name.charAt(0);
        const roleMap = { admin: '系统管理员', teacher: '教师', student: '学生', class: '班级', course: '课程管理员' };
        document.getElementById('userRoleText').textContent = roleMap[data.user.role] || '教师';
        return data.user;
    } catch (err) {
        window.location.href = '/login';
        return null;
    }
}

// 退出登录
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (err) {}
    window.location.replace('/login');
}

// Toast 提示
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// 显示警告弹窗
function showWarningModal(message) {
    const modal = document.createElement('div');
    modal.className = 'warning-modal-overlay';
    modal.innerHTML = `
        <div class="warning-modal">
            <div class="warning-modal-header">
                <div class="warning-icon">
                    <svg viewBox="0 0 24 24"><path fill="#F59E0B" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
            </div>
            <div class="warning-modal-body">
                <p>${message}</p>
            </div>
            <div class="warning-modal-footer">
                <button class="btn btn-primary" onclick="this.closest('.warning-modal-overlay').remove()">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 模态框控制
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.removeProperty('display');
    modal.classList.add('show');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.removeProperty('display');
    if (id === 'userModal') {
        editingUserId = null;
        document.querySelector('#userModal .modal-title').textContent = '添加用户';
        document.getElementById('userEmployeeId').value = '';
        document.getElementById('userNameInput').value = '';
        document.getElementById('userPassword').value = '';
    }
    if (id === 'batchUserModal') {
        resetBatchUserImport();
    }
}

// ===== 角色映射 =====
const ROLE_LABELS = { admin: '管理员', teacher: '教师', class: '班级', student: '学生', course: '课程管理员' };

// ===== 用户管理 =====
let allUsers = [];

async function loadUsers() {
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        allUsers = data.data || [];
        renderUsers(allUsers);
    } catch (err) {
        showToast('加载用户数据失败', 'error');
    }
}

function filterUsers() {
    const input = document.getElementById('userSearchInput');
    const clearBtn = document.getElementById('userSearchClear');
    const keyword = input.value.trim();
    clearBtn.style.display = keyword ? 'block' : 'none';
    if (!keyword) {
        renderUsers(allUsers);
        return;
    }
    const filtered = allUsers.filter(u => u.employee_id.includes(keyword));
    renderUsers(filtered);
}

function clearSearch() {
    const input = document.getElementById('userSearchInput');
    input.value = '';
    document.getElementById('userSearchClear').style.display = 'none';
    renderUsers(allUsers);
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTable');
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-secondary);">暂无数据</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.employee_id}</td>
            <td>${user.name}</td>
            <td>${user.plain_password || '-'}</td>
            <td>${ROLE_LABELS[user.role] || '教师'}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="editUser(${user.id}, '${user.employee_id}', '${user.name}', '${user.role}', '${user.plain_password || ''}')" title="编辑">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    ${user.employee_id === 'admin' ? '' : `
                    <button class="action-btn" onclick="markAsAbnormal('${user.employee_id}', '${user.name}')" title="标记异常" style="color:#EF4444;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})" title="删除">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>`}
                </div>
            </td>
        </tr>
    `).join('');
}

async function markAsAbnormal(employeeId, name) {
    if (!confirm(`确定要将账号 ${name} (${employeeId}) 标记为异常吗？\n\n标记后该账号将无法登录！`)) return;
    try {
        const res = await fetch('/api/abnormal-accounts/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id: employeeId, name: name })
        });
        const data = await res.json();
        if (data.success) {
            showToast('已标记为异常', 'success');
            loadUsers();
        } else {
            showToast(data.message || '操作失败', 'error');
        }
    } catch (err) {
        showToast('操作失败', 'error');
    }
}

let editingUserId = null;

async function saveUser(e) {
    e.preventDefault();
    const employee_id = document.getElementById('userEmployeeId').value.trim();
    const name = document.getElementById('userNameInput').value.trim();
    const password = document.getElementById('userPassword').value.trim();
    const role = document.getElementById('userRole').value;

    // 前端账号格式校验
    if (!validateUserAccount()) {
        showToast('账号格式不正确，请检查', 'error');
        return;
    }

    const isEdit = editingUserId !== null;

    try {
        const url = isEdit ? `/api/users/${editingUserId}` : '/api/users';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id, name, password, role })
        });
        const data = await res.json();
        if (data.success) {
            showToast(isEdit ? '修改成功' : '添加成功', 'success');
            closeModal('userModal');
            editingUserId = null;
            document.querySelector('#userModal .modal-title').textContent = '添加用户';
            loadUsers();
        } else {
            if (data.message && (data.message.includes('已存在') || data.message.includes('已被使用'))) {
                showWarningModal(data.message);
            } else {
                showToast(data.message || (isEdit ? '修改失败' : '添加失败'), 'error');
            }
        }
    } catch (err) {
        showToast('操作失败', 'error');
    }
    return false;
}

function editUser(id, employeeId, name, role, plainPassword) {
    editingUserId = id;
    document.querySelector('#userModal .modal-title').textContent = '编辑用户';
    document.getElementById('userEmployeeId').value = employeeId;
    document.getElementById('userNameInput').value = name;
    document.getElementById('userPassword').value = plainPassword;
    document.getElementById('userRole').value = role;
    onUserRoleChange();
    openModal('userModal');
}

// ===== 批量导入用户（Excel） =====
let parsedBatchUsers = [];

// 处理 Excel 文件选择
function handleUserFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    document.getElementById('userFileNameDisplay').textContent = `已选择: ${fileName}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 至少需要表头 + 1行数据
            if (jsonData.length < 2) {
                document.getElementById('userPreviewTable').innerHTML = '<p style="color:red;">Excel文件至少需要包含表头和一行数据</p>';
                document.getElementById('userImportBtn').disabled = true;
                return;
            }

            // 解析数据（跳过表头）
            parsedBatchUsers = [];
            const previewRows = [];
            let hasError = false;

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;

                const employee_id = String(row[0] || '').trim();
                const name = String(row[1] || '').trim();
                const password = String(row[2] || '').trim();
                const role = String(row[3] || '').trim().toLowerCase();

                if (!employee_id || !name || !password) {
                    previewRows.push(`<tr><td style="color:red;">第${i + 1}行缺少必填字段</td><td>${employee_id || '-'}</td><td>${name || '-'}</td><td>${password || '-'}</td><td>${role || '-'}</td></tr>`);
                    hasError = true;
                    continue;
                }

                // 角色名映射：中文→英文
                const roleMap = { '教师': 'teacher', '管理员': 'admin', '学生': 'student', '班级': 'class', '课程管理员': 'course', '课程': 'course', 'teacher': 'teacher', 'admin': 'admin', 'student': 'student', 'class': 'class', 'course': 'course' };
                const userRole = roleMap[role] || 'teacher';

                // 账号格式校验
                const idPatterns = { teacher: /^\d{4}$/, student: /^\d{10}$/, class: /^\d{5}$/, admin: /^.{1,20}$/, course: /^.{1,20}$/ };
                if (idPatterns[userRole] && !idPatterns[userRole].test(employee_id)) {
                    const lengthText = userRole === 'student' ? '10位' : (userRole === 'teacher' ? '4位' : (userRole === 'class' ? '5位' : '1-20位'));
                    previewRows.push(`<tr style="background:#fee2e2;"><td>❌ 第${i+1}行: ${ROLE_LABELS[userRole]}账号需${lengthText}${userRole === 'admin' || userRole === 'course' ? '字符' : '数字'}</td><td>${employee_id || '-'}</td><td>${name || '-'}</td><td>${password || '-'}</td><td>${ROLE_LABELS[userRole] || ''}</td></tr>`);
                    hasError = true;
                    continue;
                }

                const roleLabel = ROLE_LABELS[userRole] || '教师';
                previewRows.push(`<tr><td>${employee_id}</td><td>${name}</td><td>${password}</td><td>${roleLabel}</td></tr>`);
                parsedBatchUsers.push({ employee_id, name, password, role: userRole });
            }

            document.getElementById('userPreviewTable').innerHTML = `
                <table style="width:100%;font-size:13px;">
                    <thead><tr><th>账号</th><th>姓名</th><th>密码</th><th>角色</th></tr></thead>
                    <tbody>${previewRows.join('')}</tbody>
                </table>
                <p style="margin-top:8px;color:${hasError ? 'red' : 'var(--primary-color)'};font-weight:500;">
                    共解析 ${parsedBatchUsers.length} 条有效数据
                    ${hasError ? '（部分行有错误）' : ''}
                </p>
            `;

            document.getElementById('userImportBtn').disabled = parsedBatchUsers.length === 0;
        } catch (err) {
            showToast('文件解析失败，请检查文件格式', 'error');
            resetBatchUserImport();
        }
    };
    reader.readAsArrayBuffer(file);
}

// 重置批量导入
function resetBatchUserImport() {
    parsedBatchUsers = [];
    document.getElementById('userFileNameDisplay').textContent = '';
    document.getElementById('userPreviewTable').innerHTML = '';
    document.getElementById('userExcelFileInput').value = '';
    document.getElementById('userImportBtn').disabled = true;
}

// 执行批量导入
async function batchImportUsers() {
    if (parsedBatchUsers.length === 0) {
        showToast('请先选择Excel文件', 'error');
        return;
    }

    try {
        const res = await fetch('/api/users/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: parsedBatchUsers })
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('batchUserModal');
            loadUsers();
        } else {
            showToast(data.message || '导入失败', 'error');
        }
    } catch (err) {
        showToast('导入失败：网络错误', 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('确定要删除这个用户吗？')) return;
    try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('删除成功', 'success');
            loadUsers();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败', 'error');
    }
}


// ============ 清除所有数据 ============

// 清除所有数据（二次确认）
async function clearAllData() {
    // 第一次确认
    if (!confirm('⚠️ 确定要清除所有数据吗？\n\n此操作将删除所有班级、学生、成绩、考试和普通用户账号！\n仅保留管理员账号。\n\n此操作不可恢复！')) {
        return;
    }
    
    // 第二次确认（需要输入 "确认清除" 才能继续）
    const secondConfirm = prompt('⚠️ 再次确认：\n\n清除所有数据将删除所有班级、学生、成绩、考试和普通用户账号。\n仅保留管理员账号。\n\n请输入 "确认清除" 以继续：');
    
    if (secondConfirm !== '确认清除') {
        showToast('已取消清除操作', 'info');
        return;
    }
    
    try {
        const res = await fetch('/api/admin/clear-all-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.success) {
            showToast('所有数据已清除成功！', 'success');
            // 刷新页面
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(data.message || '清除失败', 'error');
        }
    } catch (err) {
        showToast('操作失败: ' + err.message, 'error');
    }
}

// ===== 选项卡切换 =====
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {

            document.querySelectorAll('.tab-btn')
                .forEach(b => b.classList.remove('active'));

            document.querySelectorAll('.tab-content')
                .forEach(c => c.classList.remove('active'));

            this.classList.add('active');

            const target = document.getElementById('tab-' + this.dataset.tab);
            if (target) target.classList.add('active');

            // 切换到异常账号标签页时自动刷新
            if (this.dataset.tab === 'abnormal') {
                refreshAbnormalAccounts();
            }
        });
    });
}

// ===== 异常账号管理 =====
async function refreshAbnormalAccounts() {
    try {
        const res = await fetch('/api/abnormal-accounts');
        const data = await res.json();
        if (data.success) {
            renderAbnormalAccounts(data.data || []);
        } else {
            showToast(data.message || '加载失败', 'error');
        }
    } catch (err) {
        showToast('加载失败', 'error');
    }
}

function renderAbnormalAccounts(accounts) {
    const tbody = document.getElementById('abnormalAccountsTable');
    if (!tbody) return;
    if (!accounts || accounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:40px;">暂无异常账号</td></tr>';
        return;
    }
    const typeLabels = { 'kick': '互踢', 'abnormal': '异常', 'fail': '登录失败' };
    tbody.innerHTML = accounts.map(acc => `
        <tr>
            <td>${acc.employee_id}</td>
            <td>${acc.name}</td>
            <td>${typeLabels[acc.type] || acc.type || '-'}</td>
            <td>
                <button class="btn btn-secondary" onclick="removeAbnormalAccount('${acc.employee_id}')" style="padding:4px 12px;font-size:0.8rem;">解除异常</button>
            </td>
        </tr>
    `).join('');
}

async function removeAbnormalAccount(employeeId) {
    if (!confirm(`确定要解除账号 ${employeeId} 的异常状态吗？`)) return;
    try {
        const res = await fetch('/api/abnormal-accounts/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id: employeeId })
        });
        const data = await res.json();
        if (data.success) {
            showToast('解除成功', 'success');
            refreshAbnormalAccounts();
        } else {
            showToast(data.message || '解除失败', 'error');
        }
    } catch (err) {
        showToast('解除失败', 'error');
    }
}

// 监听异常账号标签页点击，自动刷新
document.addEventListener('DOMContentLoaded', function() {
    const abnormalTab = document.querySelector('[data-tab="abnormal"]');
    if (abnormalTab) {
        abnormalTab.addEventListener('click', function() {
            refreshAbnormalAccounts();
        });
    }
});

// 初始化
(async function init() {
    initTabs();
    const user = await checkAuth();
    if (window.Collab) Collab.connect();
    if (user) {
        loadUsers();
    }
})();
