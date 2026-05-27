// ===== 教师详情页 =====
var _tdTeacher = null;

// ===== 认证与基础 =====
async function checkAuth() {
    try {
        var res = await fetch('/api/auth/check');
        var data = await res.json();
        if (!data.loggedIn) { window.location.href = '/login'; return null; }
        if (data.user.role !== 'course') { window.location.href = '/login'; return null; }
        document.getElementById('userName').textContent = data.user.name;
        document.getElementById('userAvatar').textContent = data.user.name.charAt(0);
        document.getElementById('userRoleText').textContent = '课程管理员';
        return data.user;
    } catch (err) {
        window.location.href = '/login';
        return null;
    }
}

async function logout() {
    try { await fetch('/api/logout', { method: 'POST' }); } catch (err) {}
    window.location.href = '/login';
}

function showToast(message, type) {
    type = type || 'info';
    var toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(function() { toast.className = 'toast'; }, 3000);
}

function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.style.removeProperty('display');
    modal.classList.add('show');
}

function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.removeProperty('display');
}

function openPasswordModal() {
    openModal('passwordModal');
}

async function doChangePassword(e) {
    e.preventDefault();
    var oldPwd = document.getElementById('oldPassword').value;
    var newPwd = document.getElementById('newPassword').value;
    try {
        var res = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_password: oldPwd, new_password: newPwd })
        });
        var data = await res.json();
        if (data.success) {
            showToast('密码修改成功', 'success');
            closeModal('passwordModal');
        } else {
            showToast(data.message || '修改失败', 'error');
        }
    } catch (err) {
        showToast('修改失败', 'error');
    }
    return false;
}

// ===== 辅助函数 =====
function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escJs(s) {
    if (!s) return '';
    return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// ===== 教师详情核心 =====
async function initTeacherDetail() {
    var user = await checkAuth();
    if (!user) return;

    // 从 URL 获取 teacher_id
    var params = new URLSearchParams(window.location.search);
    var teacherId = params.get('id');
    if (!teacherId) { showToast('缺少教师ID', 'error'); return; }

    try {
        var res = await fetch('/api/substitute-teachers');
        var data = await res.json();
        if (!data.success) { showToast('获取教师信息失败', 'error'); return; }
        var t = data.data.find(function(x) { return String(x.id) === String(teacherId); });
        if (!t) { showToast('教师不存在', 'error'); return; }

        _tdTeacher = t;
        document.getElementById('pageTitle').textContent = t.teacher_name;
        document.getElementById('tdInfoName').textContent = t.teacher_name;
        document.getElementById('tdInfoCanSub').textContent = Number(t.can_substitute) === 1 ? '可代课' : '不可代课';
        document.getElementById('tdInfoAssign').textContent = t.current_assignments || '无';

        // 默认加载全部数据
        queryTeacherDetail();
    } catch (err) {
        showToast('加载教师信息失败', 'error');
    }
}

async function queryTeacherDetail() {
    if (!_tdTeacher) return;
    var startDate = document.getElementById('tdStartDate').value;
    var endDate = document.getElementById('tdEndDate').value;
    var params = new URLSearchParams({ teacher_name: _tdTeacher.teacher_name });
    // 只填一个 = 查单天；两个都填 = 查区间
    if (startDate && endDate) {
        params.set('start_date', startDate);
        params.set('end_date', endDate);
    } else if (startDate) {
        params.set('start_date', startDate);
        params.set('end_date', startDate);
    } else if (endDate) {
        params.set('start_date', endDate);
        params.set('end_date', endDate);
    }

    document.getElementById('tdDetailList').innerHTML = '<div class="empty-cell" style="text-align:center;padding:24px;">加载中...</div>';
    try {
        var res = await fetch('/api/teacher-detail?' + params.toString());
        var d = await res.json();
        if (d.success) renderTeacherDetail(d.data);
        else showToast(d.message || '查询失败', 'error');
    } catch (err) { showToast('查询失败', 'error'); }
}

function renderTeacherDetail(data) {
    if (!data) return;
    var s = data.stats;
    document.getElementById('tdCardClassCount').textContent = s.class_count;
    document.getElementById('tdCardSubCount').textContent = s.substitute_count;
    document.getElementById('tdCardLeaveCount').textContent = s.leave_count;
    document.getElementById('tdCardTotalHours').textContent = s.total_hours;
    document.getElementById('tdCardActivityCount').textContent = s.activity_count;

    var list = document.getElementById('tdDetailList');
    if (!data.details || !data.details.length) {
        list.innerHTML = '<div class="empty-cell" style="text-align:center;padding:24px;">暂无记录</div>';
        return;
    }
    var typeCls = { '上课': 'td-type-class', '代课': 'td-type-sub', '请假': 'td-type-leave' };
    list.innerHTML = data.details.map(function(r) {
        var cls = typeCls[r.type] || '';
        var extra = '';
        if (r.type === '上课' && r.hours) extra = '<span class="td-item-hours">' + r.hours + ' 课时</span>';
        return '<div class="td-item">' +
            '<div class="td-item-top"><span class="td-item-date">' + escHtml(r.course_date) + '</span><span class="td-type-tag ' + cls + '">' + (r.type || '') + '</span>' + (extra || '') + '</div>' +
            '<div class="td-item-bot"><span class="td-item-name">' + escHtml(r.name) + '</span>' + (r.detail ? '<span class="td-item-detail">' + escHtml(r.detail) + '</span>' : '') + '</div>' +
            '</div>';
    }).join('');
}

function openTeacherEditForm() {
    if (!_tdTeacher) return;
    document.getElementById('editTeacherId').value = _tdTeacher.id;
    document.getElementById('editTeacherName').value = _tdTeacher.teacher_name;
    document.getElementById('editTeacherCanSub').value = _tdTeacher.can_substitute;
    document.getElementById('editTeacherAssign').value = _tdTeacher.current_assignments || '';
    openModal('teacherEditModal');
}

async function saveTeacherDetail(e) {
    e.preventDefault();
    var id = document.getElementById('editTeacherId').value;
    var body = {
        teacher_name: document.getElementById('editTeacherName').value.trim(),
        can_substitute: parseInt(document.getElementById('editTeacherCanSub').value),
        current_assignments: document.getElementById('editTeacherAssign').value.trim()
    };
    if (!body.teacher_name) { showToast('请输入教师姓名', 'error'); return false; }
    try {
        var res = await fetch('/api/substitute-teachers/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('teacherEditModal');
            _tdTeacher.teacher_name = body.teacher_name;
            _tdTeacher.can_substitute = body.can_substitute;
            _tdTeacher.current_assignments = body.current_assignments;
            document.getElementById('pageTitle').textContent = body.teacher_name;
            document.getElementById('tdInfoName').textContent = body.teacher_name;
            document.getElementById('tdInfoCanSub').textContent = body.can_substitute === 1 ? '可代课' : '不可代课';
            document.getElementById('tdInfoAssign').textContent = body.current_assignments || '无';
        } else {
            showToast(data.message || '保存失败', 'error');
        }
    } catch (err) { showToast('保存失败', 'error'); }
    return false;
}

async function deleteTeacherFromRoster(teacherId, name) {
    if (!confirm('确定要从名单中删除「' + name + '」吗？\n\n注意：该教师的代课记录和活动记录不会被删除。')) return;
    try {
        var res = await fetch('/api/substitute-teachers/' + teacherId, { method: 'DELETE' });
        var data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            history.back();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (err) { showToast('删除失败', 'error'); }
}

// ===== 页面初始化 =====
initTeacherDetail();
