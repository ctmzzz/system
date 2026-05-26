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
        document.getElementById('userAvatar').textContent = data.user.name.charAt(0);
        const userRole = data.user.role || 'teacher';
        const roleMap = { admin: '系统管理员', teacher: '班主任', student: '学生' };
        const roleText = roleMap[userRole] || '班主任';
        document.getElementById('userName').textContent = data.user.name + ' ' + roleText;
        localStorage.setItem('sidebarUserAvatar', data.user.name.charAt(0));
        localStorage.setItem('sidebarUserName', data.user.name + ' ' + roleText);
        return data.user;
    } catch (err) {
        window.location.href = '/login';
        return null;
    }
}

// 登出
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

function getTopOverlayZIndex() {
    return Array.from(document.querySelectorAll('.modal-overlay.show, .warning-modal-overlay'))
        .reduce((max, el) => {
            const zIndex = Number.parseInt(window.getComputedStyle(el).zIndex, 10);
            return Number.isNaN(zIndex) ? max : Math.max(max, zIndex);
        }, 9999);
}

function appendTopOverlay(modal) {
    modal.style.zIndex = String(getTopOverlayZIndex() + 10);
    document.body.appendChild(modal);
    return modal;
}

// 当前编辑的ID
let editingClassId = null;
let editingStudentId = null;
let editingScoreId = null;

// 考试固定顺序
const EXAM_ORDER = [
    '高一上期中', '高一上期末',
    '高一下期中', '高一下期末',
    '高二上期中', '高二上期末',
    '高二下期中', '高二下期末',
    '高三上期中', '高三上期末',
    '高三下期中', '高三下期末'
];

// 模态框操作
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.removeProperty('display');
    modal.classList.add('show');
    if (id === 'studentModal' || id === 'batchStudentModal') {
        loadClassesForSelect();
    }
    if (id === 'scoreModal') {
        loadExamsForSelect();
        loadClassesForSelect();
        loadStudentsForSelect();
    }
    if (id === 'batchScoreModal') {
        loadExamsForSelect();
        loadClassesForSelect();
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.removeProperty('display');
    if (id === 'studentModal') {
        document.getElementById('editStudentId').value = '';
        document.getElementById('studentId').value = '';
        document.getElementById('studentName').value = '';
        document.getElementById('studentClass').value = '';
        editingStudentId = null;
        document.querySelector('#studentModal .modal-title').textContent = '添加学生';
    }
    if (id === 'classModal') {
        document.getElementById('className').value = '';
        document.querySelector('#classModal .modal-title').textContent = '添加班级';
        editingClassId = null;
    }
    if (id === 'scoreModal') {
        document.getElementById('editScoreId').value = '';
        document.getElementById('scoreSubject').value = '';
        document.getElementById('scoreExam').value = '';
        document.getElementById('scoreClass').value = '';
        document.getElementById('scoreStudent').value = '';
        document.getElementById('scoreSelect').value = '';
        document.getElementById('scoreValue').value = '';
        document.getElementById('scoreNumberInput').style.display = 'none';
        document.getElementById('scoreTotal').value = '';
        // 恢复可编辑状态
        document.getElementById('scoreSubject').disabled = false;
        document.getElementById('scoreExam').disabled = false;
        document.getElementById('scoreClass').disabled = false;
        document.getElementById('scoreStudent').disabled = false;
        editingScoreId = null;
        document.querySelector('#scoreModal .modal-title').textContent = '添加成绩';
    }
    if (id === 'batchScoreModal') {
        resetBatchScoreImport();
    }
    if (id === 'batchStudentModal') {
        resetBatchImport();
    }
}

// 标签页切换
// 切换标签页
function switchTab(tabName) {
    const normalizedTab = tabName === 'scores' ? 'exams' : tabName;
    const tabContent = document.getElementById(`tab-${normalizedTab}`);
    if (!tabContent) {
        localStorage.setItem('activeTab', 'classes');
        switchTab('classes');
        return;
    }

    localStorage.setItem('activeTab', normalizedTab);
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${normalizedTab}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    tabContent.classList.add('active');
    
    // 切换后自动刷新对应的数据
    if (normalizedTab === 'classes') {
        loadClasses();
    } else if (normalizedTab === 'students') {
        loadStudents();
        loadClassesForSelect();
    } else if (normalizedTab === 'exams') {
        refreshScoresTab();
    }
}

// 初始化标签页状态
function initTabState() {
    // 从localStorage获取上次选中的标签，默认为'classes'
    const savedTab = localStorage.getItem('activeTab') || 'classes';
    
    // 切换到保存的标签
    switchTab(savedTab);
}

// 绑定标签点击事件
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// 加载班级列表
async function loadClasses() {
    try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        const tbody = document.getElementById('classesTable');
        
        if (!data.success || !data.data || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:30px;color:var(--text-secondary);">暂无数据</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.data.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn delete" onclick="deleteClass(${c.id})">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showToast('加载班级数据失败', 'error');
    }
}

// 加载班级到选择器
async function loadClassesForSelect() {
    try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        const selects = [document.getElementById('studentClass'), document.getElementById('batchStudentClass'), document.getElementById('batchScoreClass'), document.getElementById('scoreClass')];
        selects.forEach(select => {
            if (!select) return;
            const current = select.value;
            select.innerHTML = '<option value="">选择班级</option>';
            data.data.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });
            if (current) select.value = current;
        });
    } catch (err) {
        showToast('加载班级列表失败', 'error');
    }
}

// 编辑班级
function editClass(id, name) {
    editingClassId = id;
    document.getElementById('className').value = name;
    document.querySelector('#classModal .modal-title').textContent = '编辑班级';
    openModal('classModal');
}

// 保存班级
async function saveClass(e) {
    e.preventDefault();
    const editId = editingClassId;
    const isEdit = editId !== null;
    const name = document.getElementById('className').value.trim();
    closeModal('classModal');

    if (!name) {
        showWarningModal('请输入班级名称');
        return false;
    }

    try {
        let res, data;
        if (isEdit) {
            // 更新班级
            res = await fetch(`/api/classes/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            data = await res.json();
            if (data.success) {
                showToast('修改成功', 'success');
                loadClasses();
            } else {
                if (data.message && data.message.includes('班级名称已存在')) {
                    showWarningModal('班级名称已存在，请使用其他名称');
                } else {
                    showToast(data.message || '修改失败', 'error');
                }
            }
        } else {
            // 添加班级
            res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            data = await res.json();
            if (data.success) {
                showToast('添加成功', 'success');
                loadClasses();
            } else {
                if (data.code === 'SAME_USER_DUPLICATE') {
                    showWarningModal('班级名称已存在，请重新输入');
            } else if (data.code === 'OTHER_USER_CREATED') {
                // 其他账号创建的班级：显示警告弹窗（不允许继续创建）
                const modal = document.createElement('div');
                modal.className = 'warning-modal-overlay';
                modal.innerHTML = `
                    <div class="warning-modal">
                        <div class="warning-modal-header">
                            <h3>警告</h3>
                        </div>
                        <div class="warning-modal-body">
                            <p>${data.message}</p>
                        </div>
                        <div class="warning-modal-footer" style="display:flex;gap:10px;justify-content:center;">
                            <button class="btn btn-primary" onclick="this.closest('.warning-modal-overlay').remove()">确定</button>
                        </div>
                    </div>
                `;
                appendTopOverlay(modal);
                } else {
                    showToast(data.message || '添加失败', 'error');
                }
            }
        }
    } catch (err) {
        showToast('操作失败', 'error');
    }
    return false;
}

// 强制创建班级（忽略其他账号创建的重复）
async function forceCreateClass(name) {
    try {
        const res = await fetch('/api/classes/force-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data.success) {
            showToast('添加成功', 'success');
            closeModal('classModal');
            loadClasses();
        } else {
            showToast(data.message || '添加失败', 'error');
        }
    } catch (err) {
        showToast('操作失败', 'error');
    }
}

// 删除班级
async function deleteClass(id) {
    // 弹出警告弹窗
    const modal = document.createElement('div');
    modal.className = 'warning-modal-overlay';
    modal.innerHTML = `
        <div class="warning-modal" style="max-width:480px;">
            <div class="warning-modal-header">
                <div class="warning-icon">
                    <svg viewBox="0 0 24 24"><path fill="#DC2626" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
            </div>
            <div class="warning-modal-body">
                <h3 style="margin:0 0 12px 0;color:#1e293b;font-size:1.1rem;">确认删除该班级？</h3>
                <p style="color:#64748b;font-size:0.9rem;line-height:1.6;margin:0;">
                    删除班级后，以下所有关联数据将被<strong style="color:#DC2626;">永久清除</strong>，无法恢复：
                </p>
                <ul style="color:#64748b;font-size:0.88rem;line-height:1.8;margin:10px 0 0 0;padding-left:20px;">
                    <li>该班级的所有学生信息</li>
                    <li>该班级的所有考试成绩</li>
                    <li>该班级的所有美丽学分记录</li>
                    <li>该班级的所有考勤记录</li>
                </ul>
            </div>
            <div class="warning-modal-footer" style="display:flex;gap:10px;justify-content:center;">
                <button class="btn btn-secondary" onclick="this.closest('.warning-modal-overlay').remove()">取消</button>
                <button class="btn btn-danger" style="background:#DC2626;color:white;border:none;padding:10px 28px;border-radius:8px;font-size:0.9rem;font-weight:600;cursor:pointer;" onclick="confirmDeleteClass(${id}, this)">确认删除</button>
            </div>
        </div>
    `;
    appendTopOverlay(modal);
}

async function confirmDeleteClass(id, btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = '删除中...';
    try {
        const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
        const data = await res.json();
        btnEl.closest('.warning-modal-overlay').remove();
        if (data.success) {
            showToast('✅ 班级及所有关联数据已删除', 'success');
            loadClasses();
            // 同时刷新其他管理页面的数据
            try { loadExams(); } catch(e) {}
        } else {
            showToast('❌ ' + (data.message || '删除失败'), 'error');
        }
    } catch (err) {
        btnEl.closest('.warning-modal-overlay').remove();
        showToast('❌ 删除失败', 'error');
    }
}

// 加载学生列表
let allStudents = [];

async function loadStudents() {
    try {
        const res = await fetch('/api/students');
        const data = await res.json();
        const tbody = document.getElementById('studentsTable');
        
        if (!data.success || !data.data) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-secondary);">加载失败</td></tr>';
            return;
        }
        
        // 先按班级排序，然后按学号升序排序
        allStudents = data.data.sort((a, b) => {
            // 获取班级名称，空值转换为空字符串
            const classNameA = a.class_name || '';
            const classNameB = b.class_name || '';
            
            // 先按班级名称排序（空班级排在最后）
            const classCompare = classNameA.localeCompare(classNameB);
            if (classCompare !== 0) {
                return classCompare;
            }
            
            // 班级相同时，按学号升序排序
            return String(a.student_id).localeCompare(String(b.student_id), undefined, { numeric: true });
        });
        
        if (allStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-secondary);">暂无数据</td></tr>';
            return;
        }
        
        tbody.innerHTML = allStudents.map(s => `
            <tr>
                <td><input type="checkbox" class="student-checkbox" value="${s.id}" onchange="updateSelectedCount()"></td>
                <td>${s.student_id}</td>
                <td>${s.name}</td>
                <td>${s.class_name || '0'}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editStudent(${s.id}, '${s.student_id}', '${s.name.replace(/'/g, "\\'")}', ${s.class_id || ''})">
                            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </button>
                        <button class="action-btn delete" onclick="deleteStudent(${s.id})">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // 重置选择状态
        document.getElementById('selectAllStudents').checked = false;
        updateSelectedCount();
    } catch (err) {
        showToast('加载学生数据失败', 'error');
    }
}

// 全选/取消全选
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAllStudents').checked;
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll);
    updateSelectedCount();
}

// 更新已选数量
function updateSelectedCount() {
    const checked = document.querySelectorAll('.student-checkbox:checked');
    const count = checked.length;
    document.getElementById('selectedCount').textContent = count;
    document.getElementById('batchDeleteBtn').style.display = count > 0 ? 'inline-flex' : 'none';
}

// 批量删除学生
async function batchDeleteStudents() {
    const checked = document.querySelectorAll('.student-checkbox:checked');
    if (checked.length === 0) {
        showToast('请选择要删除的学生', 'error');
        return;
    }

    // 弹出确认弹窗
    if (!await confirmDeleteDialog(`确定删除选中的 <strong>${checked.length}</strong> 名学生吗？`, '学生删除后不可恢复')) return;

    const ids = Array.from(checked).map(cb => parseInt(cb.value));

    // 显示加载弹窗
    const loadingModal = appendTopOverlay(createLoadingModal('正在删除学生...', `正在删除 ${ids.length} 名学生，请稍候`));

    try {
        const res = await fetch('/api/students/batch-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids })
        });
        const data = await res.json();
        loadingModal.remove();

        if (data.success) {
            // 删除成功后立即隐藏按钮
            document.getElementById('batchDeleteBtn').style.display = 'none';
            document.getElementById('selectAllStudents').checked = false;
            showCompleteModal('✅ 删除完成', `成功删除 ${ids.length} 名学生`);
            loadStudents();
        } else {
            showCompleteModal('❌ 删除失败', data.message || '删除失败');
        }
    } catch (err) {
        loadingModal.remove();
        showCompleteModal('❌ 删除失败', '网络错误，请检查服务器连接');
    }
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
    appendTopOverlay(modal);
}

// 编辑学生
function editStudent(id, studentId, name, classId) {
    editingStudentId = id;
    document.getElementById('editStudentId').value = id;
    document.getElementById('studentId').value = studentId;
    document.getElementById('studentName').value = name;
    document.getElementById('studentClass').value = classId;
    document.querySelector('#studentModal .modal-title').textContent = '编辑学生';
    openModal('studentModal');
}

// 保存学生（支持添加和编辑）
async function saveStudent(e) {
    e.preventDefault();
    const editId = document.getElementById('editStudentId').value;
    const isEdit = !!editId;
    const student_id = document.getElementById('studentId').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const class_id = document.getElementById('studentClass').value;
    closeModal('studentModal');

    if (!student_id || !name || !class_id) {
        showWarningModal('请填写完整学生信息');
        return false;
    }

    // 学号必须为10位数字
    if (!/^\d{10}$/.test(student_id)) {
        showWarningModal('学号必须为10位数字');
        return false;
    }

    // 班级必选
    if (!class_id) {
        showWarningModal('请选择班级');
        return false;
    }

    try {
        const res = await fetch(isEdit ? `/api/students/${editId}` : '/api/students', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id, name, class_id: parseInt(class_id) })
        });
        const data = await res.json();
        if (data.success) {
            showToast(isEdit ? '修改成功' : '添加成功', 'success');
            document.getElementById('studentModal').style.animation = 'none';
            loadStudents();
        } else {
            if (data.message && data.message.includes('学号已存在')) {
                showWarningModal('学号已存在，请使用其他学号');
            } else {
                showToast(data.message || (isEdit ? '修改失败' : '添加失败'), 'error');
            }
        }
    } catch (err) {
        showToast('操作失败', 'error');
    }
    return false;
}

// 批量导入学生
let parsedStudents = [];

async function batchImportStudents() {
    const class_id = document.getElementById('batchStudentClass').value;

    if (!class_id) {
        showToast('请选择班级', 'error');
        return;
    }

    if (parsedStudents.length === 0) {
        showToast('请先选择Excel文件', 'error');
        return;
    }

    try {
        const res = await fetch('/api/students/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students: parsedStudents, class_id: parseInt(class_id) })
        });
        const result = await res.json();
        
        if (result.failed && result.failed > 0 && result.failedIds && result.failedIds.length > 0) {
            // 有失败记录：显示警告弹窗
            const modal = document.createElement('div');
            modal.className = 'warning-modal-overlay';
            modal.innerHTML = `
                <div class="warning-modal">
                    <div class="warning-modal-header">
                        <div class="warning-icon">
                            <svg viewBox="0 0 24 24"><path fill="#DC2626" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        </div>
                        <h3>部分导入失败</h3>
                    </div>
                    <div class="warning-modal-body">
                        <p style="color:#059669;font-weight:500;margin-bottom:8px;">成功导入 <span style="font-size:1.2rem;">${result.imported || 0}</span> 条</p>
                        <p style="color:#dc2626;font-weight:500;margin-bottom:8px;">失败 <span style="font-size:1.2rem;">${result.failed}</span> 条，原因：学号已存在</p>
                        <p style="font-size:0.85rem;color:#475569;background:#f8fafc;padding:10px;border-radius:6px;font-family:monospace;margin-top:8px;">${result.failedIds.join('<br>')}</p>
                    </div>
                    <div class="warning-modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.warning-modal-overlay').remove();closeModal('batchStudentModal');resetBatchImport();loadStudents();">确定</button>
                    </div>
                </div>
            `;
            appendTopOverlay(modal);
        } else {
            // 全部成功：显示成功弹窗
            const resultModal = document.createElement('div');
            resultModal.className = 'warning-modal-overlay';
            resultModal.innerHTML = `
                <div class="warning-modal">
                    <div class="warning-modal-header">
                        <div class="warning-icon">
                            <svg viewBox="0 0 24 24"><path fill="#10B981" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </div>
                        <h3>导入成功</h3>
                    </div>
                    <div class="warning-modal-body">
                        <p style="font-size:1rem;font-weight:500;color:#1e293b;">成功导入 <span style="color:#10B981;font-size:1.2rem;">${result.imported || parsedStudents.length}</span> 条学生数据</p>
                    </div>
                    <div class="warning-modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.warning-modal-overlay').remove();closeModal('batchStudentModal');resetBatchImport();loadStudents();">确定</button>
                    </div>
                </div>
            `;
            appendTopOverlay(resultModal);
        }
    } catch (err) {
        showToast('导入失败', 'error');
    }
}

// 下载学生导入样例
function downloadSampleStudent() {
    const sampleData = [
        ['学号', '姓名'],
        ['2024000001', '张三'],
        ['2024000002', '李四'],
        ['2024000003', '王五']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '学生名单');
    
    // 设置列宽
    ws['!cols'] = [{ wch: 14 }, { wch: 10 }];
    
    XLSX.writeFile(wb, '学生名单样例.xlsx');
}

// 下载成绩导入样例
function downloadSampleScore() {
    const sampleData = [
        ['学号', '姓名', '语文', '数学', '英语'],
        ['2024000001', '张三', 85, 92, 88],
        ['2024000002', '李四', 78, 85, 90],
        ['2024000003', '王五', 92, 88, 76]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '成绩数据');
    
    // 设置列宽
    ws['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];
    
    XLSX.writeFile(wb, '成绩导入样例.xlsx');
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    document.getElementById('fileNameDisplay').textContent = `已选择: ${fileName}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 解析数据（跳过表头）
            parsedStudents = [];
            const previewRows = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row.length >= 2 && row[0] && row[1]) {
                    const sid = String(row[0]).trim();
                    // 学号必须为10位数字
                    if (!/^\d{10}$/.test(sid)) {
                        previewRows.push([`❌ 第${i+1}行学号需10位数字`, sid || '-', String(row[1]).trim() || '-']);
                        continue;
                    }
                    const student = { student_id: sid, name: String(row[1]).trim() };
                    if (student.name) {
                        parsedStudents.push(student);
                        previewRows.push(row);
                    }
                }
            }

            // 显示预览表格
            const previewHtml = `
                <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                    <thead>
                        <tr style="background:var(--bg-color);">
                            <th style="padding:10px;border:1px solid var(--border-color);">学号</th>
                            <th style="padding:10px;border:1px solid var(--border-color);">姓名</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${previewRows.slice(0, 10).map(row => `
                            <tr>
                                <td style="padding:8px;border:1px solid var(--border-color);">${row[0]}</td>
                                <td style="padding:8px;border:1px solid var(--border-color);">${row[1]}</td>
                            </tr>
                        `).join('')}
                        ${previewRows.length > 10 ? `<tr><td colspan="2" style="padding:8px;text-align:center;color:var(--text-secondary);">... 还有 ${previewRows.length - 10} 条数据</td></tr>` : ''}
                    </tbody>
                </table>
                <p style="margin-top:10px;color:var(--secondary-color);font-weight:500;">共 ${previewRows.length} 名学生</p>
            `;
            document.getElementById('previewTable').innerHTML = previewHtml;

            // 启用导入按钮
            document.getElementById('importBtn').disabled = false;

        } catch (err) {
            showToast('文件解析失败，请检查文件格式', 'error');
            resetBatchImport();
        }
    };
    reader.readAsArrayBuffer(file);
}

// 重置批量导入
function resetBatchImport() {
    parsedStudents = [];
    document.getElementById('fileNameDisplay').textContent = '';
    document.getElementById('previewTable').innerHTML = '';
    document.getElementById('excelFileInput').value = '';
    document.getElementById('importBtn').disabled = true;
}

// 删除学生
async function deleteStudent(id) {
    if (!confirm('确定删除该学生吗？')) return;
    
    try {
        const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('删除成功', 'success');
            loadStudents();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败', 'error');
    }
}

// 班级筛选变化：加载学科和学号下拉数据
async function onFilterClassChange() {
    const classId = document.getElementById('scoreFilterClass')?.value || '';
    const subjectSelect = document.getElementById('scoreFilterSubject');
    const studentSelect = document.getElementById('scoreFilterStudent');

    // 重置学科和学号下拉
    subjectSelect.innerHTML = '<option value="">全部学科</option>';
    studentSelect.innerHTML = '<option value="">全部学号</option>';

    if (!classId) {
        // 未选择班级：禁用两个下拉
        subjectSelect.disabled = true;
        studentSelect.disabled = true;
    } else {
        // 选中班级：启用并加载数据
        subjectSelect.disabled = false;
        studentSelect.disabled = false;
        await loadSubjectsForFilter(classId);
        await loadStudentsForFilter(classId);
    }

    // 重新加载成绩列表
    loadExams();
}

// 加载学科列表（用于筛选，按班级筛选成绩中的学科）
async function loadSubjectsForFilter(classId) {
    try {
        const params = new URLSearchParams();
        params.append('class_id', classId);
        const res = await fetch(`/api/scores?${params.toString()}`);
        const data = await res.json();
        const select = document.getElementById('scoreFilterSubject');
        if (!select) return;

        const subjects = new Set();
        if (data.success && data.data) {
            data.data.forEach(s => {
                if (s.subject) subjects.add(s.subject);
            });
        }
        // 按字母/数字排序
        [...subjects].sort().forEach(sub => {
            select.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    } catch (err) {
        console.error('加载学科筛选列表失败', err);
    }
}

// 加载学号列表（用于筛选，按班级）
async function loadStudentsForFilter(classId) {
    try {
        const res = await fetch(`/api/students?class_id=${classId}`);
        const data = await res.json();
        const select = document.getElementById('scoreFilterStudent');
        if (!select) return;

        if (data.success && data.data) {
            data.data.forEach(s => {
                select.innerHTML += `<option value="${s.student_id}">${s.student_id} - ${s.name}</option>`;
            });
        }
    } catch (err) {
        console.error('加载学号筛选列表失败', err);
    }
}

// 加载成绩列表（支持筛选和按学号排序）
async function loadExams() {
    try {
        const examId = document.getElementById('scoreFilterExam')?.value || '';
        const classId = document.getElementById('scoreFilterClass')?.value || '';
        const subject = document.getElementById('scoreFilterSubject')?.value || '';
        const studentId = document.getElementById('scoreFilterStudent')?.value || '';

        // 构建查询参数
        const params = new URLSearchParams();
        if (examId) params.append('exam_id', examId);
        if (classId) params.append('class_id', classId);
        if (subject) params.append('subject', subject);
        if (studentId) params.append('student_id', studentId);

        const res = await fetch(`/api/scores?${params.toString()}`);
        const data = await res.json();
        const tbody = document.getElementById('scoresTable');
        
        if (!data.success || !data.data || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-secondary);">暂无数据</td></tr>';
            document.getElementById('selectAllScores').checked = false;
            document.getElementById('batchDeleteScoreBtn').disabled = true;
            return;
        }
        
        // 先按学科排序，再按学号升序排序
        let sortedData = [...data.data].sort((a, b) => {
            // 先比较学科
            const subjectCompare = (a.subject || '').localeCompare(b.subject || '');
            if (subjectCompare !== 0) return subjectCompare;
            // 学科相同，按学号数字排序
            const aNum = parseInt(a.stu_no) || 0;
            const bNum = parseInt(b.stu_no) || 0;
            return aNum - bNum;
        });
        
        tbody.innerHTML = sortedData.map(s => `
            <tr>
                <td><input type="checkbox" class="score-checkbox" value="${s.id}" onchange="updateScoreSelectedCount()"></td>
                <td>${s.subject || '-'}</td>
                <td>${s.stu_no}</td>
                <td>${s.stu_name}</td>
                <td>${s.class_name || '0'}</td>
                <td>${s.total_score === '缺考' ? '<span style="color:red;font-weight:bold;">缺考</span>' : s.total_score === '免修' ? '免修' : s.total_score}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editScore(${s.id})">
                            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </button>
                        <button class="action-btn delete" onclick="deleteScore(${s.id})">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // 重置选择状态，确保按钮可用
        document.getElementById('selectAllScores').checked = false;
        document.getElementById('batchDeleteScoreBtn').disabled = false;
        updateScoreSelectedCount();
    } catch (err) {
        showToast('加载成绩数据失败', 'error');
    }
}

// 全选/取消全选成绩
function toggleSelectAllScores() {
    const selectAll = document.getElementById('selectAllScores').checked;
    const checkboxes = document.querySelectorAll('.score-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll);
    updateScoreSelectedCount();
}

// 更新成绩已选数量
function updateScoreSelectedCount() {
    const checked = document.querySelectorAll('.score-checkbox:checked');
    const count = checked.length;
    document.getElementById('batchDeleteScoreBtn').style.display = count > 0 ? 'inline-flex' : 'none';
}

// 批量删除成绩
async function batchDeleteScores() {
    const checked = document.querySelectorAll('.score-checkbox:checked');
    if (checked.length === 0) {
        showToast('请选择要删除的成绩', 'error');
        return;
    }

    // 弹出确认弹窗
    if (!await confirmDeleteDialog(`确定删除选中的 <strong>${checked.length}</strong> 条成绩吗？`, '成绩删除后不可恢复')) return;

    const ids = Array.from(checked).map(cb => parseInt(cb.value));

    // 显示加载弹窗
    const loadingModal = appendTopOverlay(createLoadingModal('正在删除成绩...', `正在删除 ${ids.length} 条成绩，请稍候`));

    try {
        const res = await fetch('/api/scores/batch-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids })
        });
        const data = await res.json();
        loadingModal.remove();

        if (data.success) {
            // 删除成功后立即隐藏按钮
            document.getElementById('batchDeleteScoreBtn').style.display = 'none';
            document.getElementById('selectAllScores').checked = false;
            showCompleteModal('✅ 删除完成', `成功删除 ${ids.length} 条成绩`);
            loadExams();
        } else {
            showCompleteModal('❌ 删除失败', data.message || '删除失败');
        }
    } catch (err) {
        loadingModal.remove();
        showCompleteModal('❌ 删除失败', '网络错误，请检查服务器连接');
    }
}

// 考试列表缓存（从后端动态加载）
let cachedExamList = [];

// 学科排序状态
let subjectSortOrder = 'asc'; // 'asc' 或 'desc'

// 切换学科排序
function toggleSubjectSort() {
    subjectSortOrder = subjectSortOrder === 'asc' ? 'desc' : 'asc';
    const icon = document.getElementById('subjectSortIcon');
    icon.textContent = subjectSortOrder === 'asc' ? '↑' : '↓';
    loadExams();
}

// 加载考试场次筛选列表
async function loadExamFilter() {
    try {
        const res = await fetch('/api/exams');
        const data = await res.json();
        const select = document.getElementById('scoreFilterExam');
        if (!select) return;

        if (data.success && data.data) {
            cachedExamList = data.data;
            // 按固定考试顺序排序
            const sortedExams = [...data.data].sort((a, b) => {
                const idxA = EXAM_ORDER.indexOf(a.name);
                const idxB = EXAM_ORDER.indexOf(b.name);
                if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
            });
            select.innerHTML = '<option value="">全部考试场次</option>' +
                sortedExams.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
        }
    } catch (err) {
        console.error('加载考试筛选列表失败', err);
    }
}

// 加载班级筛选列表（默认选中最后创建的班级）
async function loadClassFilter() {
    try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        const select = document.getElementById('scoreFilterClass');
        if (!select) return;

        if (!data.success || !data.data || data.data.length === 0) {
            select.innerHTML = '<option value="">暂无班级</option>';
            return;
        }

        // 按ID降序排序（最新创建的班级在前面）
        const sortedClasses = [...data.data].sort((a, b) => b.id - a.id);

        select.innerHTML = '<option value="">全部班级</option>' +
            sortedClasses.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('');

        // 默认选中最后创建的班级（不触发change事件）
        select.value = sortedClasses[0].id;
    } catch (err) {
        console.error('加载班级筛选列表失败', err);
    }
}

// 刷新成绩管理页面（筛选器 + 成绩表格）
// 刷新成绩管理页面（筛选器 + 成绩表格）
// 刷新成绩管理页面（筛选器 + 成绩表格）
async function refreshScoresTab() {
    // 1. 重新加载考试场次和班级下拉框
    await loadExamFilter();
    await loadClassFilter();

    // 2. 获取当前选中的班级（默认已由 loadClassFilter 设置为最新班级）
    const classSelect = document.getElementById('scoreFilterClass');
    const classId = classSelect.value;
    const subjectSelect = document.getElementById('scoreFilterSubject');
    const studentSelect = document.getElementById('scoreFilterStudent');

    // 3. 根据班级重置并加载学科、学号下拉
    if (classId) {
        subjectSelect.innerHTML = '<option value="">全部学科</option>';
        studentSelect.innerHTML = '<option value="">全部学号</option>';
        subjectSelect.disabled = false;
        studentSelect.disabled = false;
        await loadSubjectsForFilter(classId);
        await loadStudentsForFilter(classId);
    } else {
        subjectSelect.innerHTML = '<option value="">全部学科</option>';
        studentSelect.innerHTML = '<option value="">全部学号</option>';
        subjectSelect.disabled = true;
        studentSelect.disabled = true;
    }

    // 4. 强制刷新成绩表格（重要！）
    await loadExams();
}

// 加载考试列表到选择器（添加成绩/批量导入弹窗用）
async function loadExamsForSelect() {
    try {
        const res = await fetch('/api/exams');
        const data = await res.json();
        const selects = [document.getElementById('scoreExam'), document.getElementById('batchScoreExam')];
        if (!data.success || !data.data) return;

        // 按固定顺序排序
        const sortedExams = [...data.data].sort((a, b) => {
            const idxA = EXAM_ORDER.indexOf(a.name);
            const idxB = EXAM_ORDER.indexOf(b.name);
            if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });

        selects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">选择考试</option>';
            sortedExams.forEach(e => {
                select.innerHTML += `<option value="${e.id}">${e.name}</option>`;
            });
        });
    } catch (err) {
        console.error('加载考试列表失败', err);
    }
}

// 加载学生列表到选择器
async function loadStudentsForSelect() {
    const select = document.getElementById('scoreStudent');
    if (!select) return;
    select.innerHTML = '<option value="">请先选择班级</option>';
    select.disabled = true;
}

// 按班级加载学生（用于添加成绩时的班级筛选）
async function loadStudentsByClass() {
    const classId = document.getElementById('scoreClass').value;
    const select = document.getElementById('scoreStudent');
    if (!select) return;

    if (!classId) {
        select.innerHTML = '<option value="">请先选择班级</option>';
        select.disabled = true;
        return;
    }

    try {
        const res = await fetch(`/api/students?class_id=${classId}`);
        const data = await res.json();
        select.innerHTML = '<option value="">选择学生</option>';
        select.disabled = false;
        if (data.success && data.data) {
            data.data.forEach(s => {
                select.innerHTML += `<option value="${s.id}">${s.student_id} - ${s.name}</option>`;
            });
        }
    } catch (err) {
        showToast('加载学生列表失败', 'error');
    }
}

// 分数类型切换
function onScoreTypeChange() {
    const type = document.getElementById('scoreSelect').value;
    const numInput = document.getElementById('scoreNumberInput');
    const hidden = document.getElementById('scoreTotal');
    
    if (type === '分数') {
        numInput.style.display = 'block';
        hidden.value = '';
    } else {
        numInput.style.display = 'none';
        document.getElementById('scoreValue').value = '';
        hidden.value = type;
    }
}

// 编辑成绩
async function editScore(id) {
    try {
        const res = await fetch(`/api/scores`);
        const data = await res.json();
        const score = (data.data || []).find(s => s.id == id);
        if (!score) {
            showToast('未找到该成绩', 'error');
            return;
        }

        editingScoreId = id;
        document.getElementById('editScoreId').value = id;
        document.getElementById('editScoreExamId').value = score.exam_id;
        document.getElementById('editScoreStudentId').value = score.student_id;
        document.getElementById('editScoreSubject').value = score.subject || '';

        // 1. 先加载下拉框数据
        await loadExamsForSelect();
        await loadClassesForSelect();

        // 2. 设置各字段值
        document.getElementById('scoreSubject').value = score.subject || '';
        document.getElementById('scoreExam').value = score.exam_id;
        document.getElementById('scoreClass').value = score.stu_class_id || '';
        if (score.stu_class_id) {
            await loadStudentsByClass();
        }
        document.getElementById('scoreStudent').value = score.student_id;

        // 3. 禁用非分数控件（数据可见但不可修改）
        document.getElementById('scoreSubject').disabled = true;
        document.getElementById('scoreExam').disabled = true;
        document.getElementById('scoreClass').disabled = true;
        document.getElementById('scoreStudent').disabled = true;

        // 4. 设置分数（保持可编辑）
        const scoreVal = score.total_score;
        if (['缺考', '免修'].includes(scoreVal)) {
            document.getElementById('scoreSelect').value = scoreVal;
            document.getElementById('scoreNumberInput').style.display = 'none';
            document.getElementById('scoreValue').value = '';
            document.getElementById('scoreTotal').value = scoreVal;
        } else {
            document.getElementById('scoreSelect').value = '分数';
            document.getElementById('scoreNumberInput').style.display = 'block';
            document.getElementById('scoreValue').value = scoreVal;
            document.getElementById('scoreTotal').value = '';
        }

        document.querySelector('#scoreModal .modal-title').textContent = '编辑成绩';
        openModal('scoreModal');
    } catch (err) {
        showToast('加载成绩信息失败', 'error');
    }
}

// 保存成绩
async function saveScore(e) {
    e.preventDefault();
    const editId = document.getElementById('editScoreId').value;
    const isEdit = !!editId;
    // 优先读取可见控件（用户可能修改了），若不可见控件无值则读隐藏字段备
    const subject = (document.getElementById('scoreSubject').value || document.getElementById('editScoreSubject').value).trim();
    const exam_id = document.getElementById('scoreExam').value || document.getElementById('editScoreExamId').value;
    const student_id = document.getElementById('scoreStudent').value || document.getElementById('editScoreStudentId').value;
    const scoreType = document.getElementById('scoreSelect').value;
    const scoreVal = document.getElementById('scoreValue').value;
    closeModal('scoreModal');

    if (!subject || !exam_id || !student_id) {
        showWarningModal('请填写完整成绩信息');
        return false;
    }

    if (!scoreType) {
        showWarningModal('请选择分数类型');
        return false;
    }

    let total_score;
    if (scoreType === '分数') {
        const score = parseFloat(scoreVal);
        if (isNaN(score) || score < 0 || score > 100) {
            showWarningModal('分数必须在0-100之间');
            return false;
        }
        total_score = score;
    } else {
        total_score = scoreType; // '缺考' or '免修'
    }

    try {
        const res = await fetch(isEdit ? `/api/scores/${editId}` : '/api/scores', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exam_id: parseInt(exam_id), student_id: parseInt(student_id), subject, total_score: String(total_score) })
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message || (isEdit ? '修改成功' : '添加成功'), 'success');
            loadExams();
        } else {
            showWarningModal(data.message || (isEdit ? '修改失败' : '添加失败'));
        }
    } catch (err) {
        showToast('操作失败', 'error');
    }
    return false;
}

// 删除成绩
async function deleteScore(id) {
    if (!confirm('确定删除该成绩吗？')) return;
    
    try {
        const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('删除成功', 'success');
            loadExams();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败', 'error');
    }
}

// 批量导入成绩相关
let parsedScores = [];
let scoreSubjects = []; // 存储解析出的学科列表

// 处理成绩文件选择
async function handleScoreFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    document.getElementById('scoreFileNameDisplay').textContent = `已选择: ${fileName}`;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 验证数据格式
            if (jsonData.length < 2) {
                document.getElementById('scorePreviewTable').innerHTML = '<p style="color:red;">Excel文件至少需要包含表头和一行数据</p>';
                document.getElementById('scoreImportBtn').disabled = true;
                return;
            }

            // 获取表头（第一行）
            const header = jsonData[0];
            if (header.length < 3) {
                document.getElementById('scorePreviewTable').innerHTML = '<p style="color:red;">表头至少需要包含：学号、姓名、学科成绩</p>';
                document.getElementById('scoreImportBtn').disabled = true;
                return;
            }

            // 提取学科列表（从第三列开始）
            scoreSubjects = header.slice(2).map(s => s ? String(s).trim() : '').filter(s => s);
            if (scoreSubjects.length === 0) {
                document.getElementById('scorePreviewTable').innerHTML = '<p style="color:red;">请在表头中指定至少一个学科（第三列及以后）</p>';
                document.getElementById('scoreImportBtn').disabled = true;
                return;
            }

            // 获取系统中学生信息用于验证（根据选择的班级过滤）
            const classId = document.getElementById('batchScoreClass').value;
            const studentUrl = classId ? `/api/students?class_id=${classId}` : '/api/students';
            const studentRes = await fetch(studentUrl);
            const studentData = await studentRes.json();
            const studentMap = new Map(); // key: 学号, value: {id, name}
            
            if (studentData.success && studentData.data) {
                studentData.data.forEach(s => {
                    studentMap.set(s.student_id, { id: s.id, name: s.name, class_id: s.class_id });
                });
            }

            // 解析数据（跳过表头）
            parsedScores = [];
            const previewRows = [];
            const errors = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row[0]) continue; // 跳过空行

                const studentId = String(row[0]).trim();
                const studentName = row[1] ? String(row[1]).trim() : '';

                // 验证学号是否存在
                const systemStudent = studentMap.get(studentId);
                if (!systemStudent) {
                    errors.push(`第${i+1}行：学号 "${studentId}" 不存在于系统中`);
                    continue;
                }

                // 验证姓名是否匹配
                if (studentName && systemStudent.name !== studentName) {
                    errors.push(`第${i+1}行：学号 "${studentId}" 的姓名不匹配（系统: ${systemStudent.name}, 导入: ${studentName}）`);
                    continue;
                }

                // 解析各学科成绩
                for (let j = 0; j < scoreSubjects.length; j++) {
                    const subject = scoreSubjects[j];
                    const scoreValue = row[j + 2];
                    
                    if (scoreValue !== undefined && scoreValue !== null) {
                        const strVal = String(scoreValue).trim();
                        // 支持数字分数、缺考、免修
                        if (strVal === '缺考' || strVal === '免修') {
                            parsedScores.push({
                                student_id: studentId,
                                subject: subject,
                                total_score: strVal
                            });
                        } else {
                            const totalScore = parseFloat(strVal);
                            if (!isNaN(totalScore)) {
                                parsedScores.push({
                                    student_id: studentId,
                                    subject: subject,
                                    total_score: totalScore
                                });
                            }
                        }
                    }
                }

                previewRows.push(row);
            }

            // 显示错误信息
            if (errors.length > 0) {
                document.getElementById('scorePreviewTable').innerHTML = 
                    '<p style="color:red;margin-bottom:10px;">导入失败，存在以下错误：</p><ul style="color:red;text-align:left;margin:0;padding-left:20px;max-height:200px;overflow-y:auto;">' + 
                    errors.slice(0, 20).map(e => `<li>${e}</li>`).join('') + 
                    (errors.length > 20 ? `<li>...共 ${errors.length} 个错误</li>` : '') +
                    '</ul>';
                document.getElementById('scoreImportBtn').disabled = true;
                parsedScores = [];
                return;
            }

            // 显示预览表格
            const headerHtml = `<th style="padding:10px;border:1px solid var(--border-color);">学号</th>
                               <th style="padding:10px;border:1px solid var(--border-color);">姓名</th>` +
                               scoreSubjects.map(s => `<th style="padding:10px;border:1px solid var(--border-color);">${s}</th>`).join('');
            
            const rowHtml = previewRows.slice(0, 10).map(row => {
                let html = `<tr><td style="padding:8px;border:1px solid var(--border-color);">${row[0]}</td>
                            <td style="padding:8px;border:1px solid var(--border-color);">${row[1] || '-'}</td>`;
                scoreSubjects.forEach((_, j) => {
                    html += `<td style="padding:8px;border:1px solid var(--border-color);">${row[j + 2] || '-'}</td>`;
                });
                html += '</tr>';
                return html;
            }).join('');

            const previewHtml = `
                <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                    <thead>
                        <tr style="background:var(--bg-color);">${headerHtml}</tr>
                    </thead>
                    <tbody>
                        ${rowHtml}
                        ${previewRows.length > 10 ? `<tr><td colspan="${scoreSubjects.length + 2}" style="padding:8px;text-align:center;color:var(--text-secondary);">... 还有 ${previewRows.length - 10} 条数据</td></tr>` : ''}
                    </tbody>
                </table>
                <p style="margin-top:10px;color:var(--secondary-color);font-weight:500;">共 ${parsedScores.length} 条成绩记录（${scoreSubjects.length} 个学科）</p>
            `;
            document.getElementById('scorePreviewTable').innerHTML = previewHtml;

            // 启用导入按钮
            document.getElementById('scoreImportBtn').disabled = false;

        } catch (err) {
            console.error('文件解析失败:', err);
            showToast('文件解析失败，请检查文件格式', 'error');
            resetBatchScoreImport();
        }
    };
    reader.readAsArrayBuffer(file);
}

// 重置批量成绩导入
function resetBatchScoreImport() {
    parsedScores = [];
    document.getElementById('scoreFileNameDisplay').textContent = '';
    document.getElementById('scorePreviewTable').innerHTML = '';
    document.getElementById('scoreExcelFileInput').value = '';
    document.getElementById('scoreImportBtn').disabled = true;
}

// 批量导入成绩
async function batchImportScores() {
    const exam_id = document.getElementById('batchScoreExam').value;

    if (!exam_id) {
        showToast('请选择考试场次', 'error');
        return;
    }

    if (parsedScores.length === 0) {
        showToast('请先选择Excel文件', 'error');
        return;
    }

    // 显示加载弹窗
    const loadingModal = appendTopOverlay(createLoadingModal('正在导入成绩...', `共 ${parsedScores.length} 条数据，请稍候`));

    try {
        const res = await fetch('/api/scores/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exam_id: parseInt(exam_id), scores: parsedScores })
        });
        const result = await res.json();
        loadingModal.remove();

        if (result.success) {
            const count = result.imported || parsedScores.length;
            closeModal('batchScoreModal');
            resetBatchScoreImport();
            loadExams();
            // 显示完成弹窗
            showCompleteModal('✅ 成绩导入完成', `成功导入 ${count} 条成绩数据`);
        } else {
            showCompleteModal('❌ 导入失败', result.message || '导入失败，请检查数据格式');
        }
    } catch (err) {
        loadingModal.remove();
        showCompleteModal('❌ 导入失败', '网络错误，请检查服务器连接');
    }
}

// 创建加载弹窗
function createLoadingModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'warning-modal-overlay';
    modal.innerHTML = `
        <div class="warning-modal" style="text-align:center;padding:40px;">
            <div style="margin-bottom:16px;">
                <div class="loading-spinner" style="width:40px;height:40px;border:4px solid #e2e8f0;border-top:4px solid #6366F1;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto;"></div>
            </div>
            <h3 style="margin:0 0 8px 0;color:#1e293b;font-size:1.1rem;">${title}</h3>
            <p style="color:#64748b;font-size:0.9rem;margin:0;">${message}</p>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </div>
    `;
    return modal;
}

// 显示完成弹窗
function showCompleteModal(title, message) {
    const existing = document.querySelector('.import-complete-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'warning-modal-overlay import-complete-modal';
    modal.innerHTML = `
        <div class="warning-modal" style="text-align:center;padding:36px 40px;max-width:400px;">
            <div style="margin-bottom:12px;">
                <div style="width:56px;height:56px;border-radius:50%;background:${title.includes('✅') ? '#ecfdf5' : '#fef2f2'};display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:28px;">
                    ${title.includes('✅') ? '✅' : '❌'}
                </div>
            </div>
            <h3 style="margin:0 0 8px 0;color:#1e293b;font-size:1.1rem;">${title.replace('✅ ','').replace('❌ ','')}</h3>
            <p style="color:#64748b;font-size:0.9rem;margin:0 0 20px 0;">${message}</p>
            <button class="btn btn-primary" onclick="this.closest('.warning-modal-overlay').remove()" style="min-width:100px;">确定</button>
        </div>
    `;
    appendTopOverlay(modal);
}

// 通用确认弹窗（返回 Promise<boolean>）
function confirmDeleteDialog(message, subMessage) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className = 'warning-modal-overlay';
        modal.innerHTML = `
            <div class="warning-modal" style="text-align:center;padding:36px 40px;max-width:400px;">
                <div style="margin-bottom:12px;">
                    <div style="width:56px;height:56px;border-radius:50%;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:28px;">
                        ⚠️
                    </div>
                </div>
                <h3 style="margin:0 0 8px 0;color:#1e293b;font-size:1.1rem;">确认删除</h3>
                <p style="color:#64748b;font-size:0.9rem;margin:0 0 4px 0;">${message}</p>
                ${subMessage ? `<p style="color:#94a3b8;font-size:0.82rem;margin:0 0 20px 0;">${subMessage}</p>` : ''}
                <div style="display:flex;gap:10px;justify-content:center;">
                    <button class="btn btn-secondary" onclick="this.closest('.warning-modal-overlay').remove();window._confirmResult=false;">取消</button>
                    <button class="btn btn-danger" style="background:#DC2626;color:white;border:none;padding:10px 28px;border-radius:8px;font-size:0.9rem;font-weight:600;cursor:pointer;" onclick="this.closest('.warning-modal-overlay').remove();window._confirmResult=true;">确认删除</button>
                </div>
            </div>
        `;
        appendTopOverlay(modal);

        const checkInterval = setInterval(() => {
            if (!document.body.contains(modal)) {
                clearInterval(checkInterval);
                const result = window._confirmResult === true;
                window._confirmResult = undefined;
                resolve(result);
            }
        }, 100);
    });
}

// 初始化
async function init() {
    const user = await checkAuth();
    if (!user) return;

    if (window.Collab) Collab.connect();

    // 检查是否有权限访问（管理员也可以访问）
    if (user.role !== 'admin' && user.role !== 'teacher') {
        window.location.href = '/dashboard';
        return;
    }

    // 初始化标签页状态（刷新页面后保持上次选中的标签）
    initTabState();

    loadClasses();
    loadStudents();

    // 先加载筛选器，等待它们完成后再加载成绩数据
    await loadExamFilter();
    await loadClassFilter();

    // 绑定班级筛选变化事件（避免重复绑定）
    const filterClassSelect = document.getElementById('scoreFilterClass');
    filterClassSelect.removeEventListener('change', onFilterClassChange);
    filterClassSelect.addEventListener('change', onFilterClassChange);

    // 根据默认选中的班级，初始化学科和学号下拉，然后加载成绩
    await onFilterClassChange();
}

init();
