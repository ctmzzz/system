let substituteDashboardCache = null;

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (!data.loggedIn) {
            window.location.href = '/login';
            return null;
        }
        if (data.user.role !== 'course') {
            window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
            return null;
        }
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
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (err) {}
    window.location.href = '/login';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    if (id === 'courseImportModal') {
        const input = document.getElementById('courseExcelFile');
        if (input) input.value = '';
    }
    if (id === 'substitutePoolModal') {
        const input = document.getElementById('substitutePoolFile');
        if (input) input.value = '';
    }
}

function switchCourseModule(moduleName) {
    const isClub = moduleName === 'club';
    document.getElementById('courseScheduleView').classList.toggle('active', !isClub);
    document.getElementById('clubSubstituteView').classList.toggle('active', isClub);
    document.getElementById('courseScheduleTab').classList.toggle('active', !isClub);
    document.getElementById('clubSubstituteTab').classList.toggle('active', isClub);
    document.getElementById('courseScheduleSideTab').classList.toggle('active', !isClub);
    document.getElementById('clubSubstituteSideTab').classList.toggle('active', isClub);
    document.getElementById('coursePageTitle').textContent = isClub ? '社团代课总表' : '课程表统计';
}

function formatCourseNumber(value) {
    const num = Number(value || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

function courseEmptyRow(colspan, text) {
    return `<tr><td colspan="${colspan}" class="empty-cell">${escapeHtml(text)}</td></tr>`;
}

async function importCourseHours() {
    const input = document.getElementById('courseExcelFile');
    const file = input && input.files ? input.files[0] : null;
    if (!file) {
        showToast('请选择课程表 Excel 文件', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/course-hours/import', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message || '导入成功', 'success');
            closeModal('courseImportModal');
            loadCourseHourStats();
        } else {
            showToast(data.message || '导入失败', 'error');
        }
    } catch (err) {
        showToast('导入失败：网络错误', 'error');
    }
}

async function loadCourseHourStats() {
    const params = new URLSearchParams();
    const start = document.getElementById('courseStartDate').value;
    const end = document.getElementById('courseEndDate').value;
    const teacher = document.getElementById('courseTeacherFilter').value.trim();
    const subject = document.getElementById('courseSubjectFilter').value.trim();
    if (start) params.set('start_date', start);
    if (end) params.set('end_date', end);
    if (teacher) params.set('teacher', teacher);
    if (subject) params.set('subject', subject);

    try {
        const res = await fetch('/api/course-hours/stats?' + params.toString());
        const data = await res.json();
        if (!data.success) {
            showToast(data.message || '加载课时统计失败', 'error');
            return;
        }
        renderCourseHourStats(data.data || {});
    } catch (err) {
        showToast('加载课时统计失败', 'error');
    }
}

function renderCourseHourStats(data) {
    const totals = data.totals || {};
    document.getElementById('courseTotalHours').textContent = formatCourseNumber(totals.total_hours);
    document.getElementById('courseTeacherCount').textContent = totals.teacher_count || 0;
    document.getElementById('courseRecordCount').textContent = totals.record_count || 0;

    const teachers = data.byTeacher || [];
    document.getElementById('courseTeacherStatsTable').innerHTML = teachers.length ? teachers.map(row => `
        <tr>
            <td>${escapeHtml(row.teacher_name || '-')}</td>
            <td>${escapeHtml(row.teacher_employee_id || '-')}</td>
            <td>${formatCourseNumber(row.total_hours)}</td>
            <td>${row.lesson_count || 0}</td>
        </tr>
    `).join('') : courseEmptyRow(4, '暂无教师课时数据');

    const subjects = data.bySubject || [];
    document.getElementById('courseSubjectStatsTable').innerHTML = subjects.length ? subjects.map(row => `
        <tr>
            <td>${escapeHtml(row.subject || '未填写')}</td>
            <td>${formatCourseNumber(row.total_hours)}</td>
            <td>${row.lesson_count || 0}</td>
        </tr>
    `).join('') : courseEmptyRow(3, '暂无科目课时数据');

    const records = data.records || [];
    document.getElementById('courseRecordsTable').innerHTML = records.length ? records.map(row => `
        <tr>
            <td>${escapeHtml(row.course_date || '-')}</td>
            <td>${escapeHtml(row.weekday || '-')}</td>
            <td>${escapeHtml(row.period_no || '-')}</td>
            <td>${escapeHtml(row.teacher_name || '-')}${row.teacher_employee_id ? `（${escapeHtml(row.teacher_employee_id)}）` : ''}</td>
            <td>${escapeHtml(row.subject || '-')}</td>
            <td>${escapeHtml(row.class_name || '-')}</td>
            <td>${formatCourseNumber(row.hours)}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="deleteCourseHour(${row.id})">删除</button></td>
        </tr>
    `).join('') : courseEmptyRow(8, '暂无课程明细');
}

function resetCourseHourFilters() {
    ['courseStartDate', 'courseEndDate', 'courseTeacherFilter', 'courseSubjectFilter'].forEach(id => {
        document.getElementById(id).value = '';
    });
    loadCourseHourStats();
}

async function deleteCourseHour(id) {
    if (!confirm('确定删除这条课程记录吗？')) return;
    try {
        const res = await fetch(`/api/course-hours/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('删除成功', 'success');
            loadCourseHourStats();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败', 'error');
    }
}

async function clearCourseHours() {
    if (!confirm('确定清空所有教师课时数据吗？此操作不可恢复。')) return;
    try {
        const res = await fetch('/api/course-hours/clear', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showToast(data.message || '已清空', 'success');
            loadCourseHourStats();
        } else {
            showToast(data.message || '清空失败', 'error');
        }
    } catch (err) {
        showToast('清空失败', 'error');
    }
}

async function importSubstituteTeachers() {
    const input = document.getElementById('substitutePoolFile');
    const file = input && input.files ? input.files[0] : null;
    if (!file) {
        showToast('请选择社团/第二课堂 Excel 文件', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/substitute-teachers/import', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message || '导入成功', 'success');
            closeModal('substitutePoolModal');
            await loadSubstituteDashboard();
        } else {
            showToast(data.message || '导入失败', 'error');
        }
    } catch (err) {
        showToast('导入失败：网络错误', 'error');
    }
}

function buildSubstituteParams() {
    const params = new URLSearchParams();
    const start = document.getElementById('subStartDate').value;
    const end = document.getElementById('subEndDate').value;
    const teacher = document.getElementById('subTeacherFilter').value.trim();
    const course = document.getElementById('subCourseFilter').value.trim();
    if (start) params.set('start_date', start);
    if (end) params.set('end_date', end);
    if (teacher) params.set('teacher', teacher);
    if (course) params.set('course_name', course);
    return params;
}

async function loadSubstituteDashboard() {
    try {
        const params = buildSubstituteParams();
        const res = await fetch('/api/substitute-dashboard?' + params.toString());
        const data = await res.json();
        if (!data.success) {
            showToast(data.message || '加载社团代课总表失败', 'error');
            return;
        }
        substituteDashboardCache = data.data || {};
        renderSubstituteDashboard(substituteDashboardCache);
    } catch (err) {
        showToast('加载社团代课总表失败', 'error');
    }
}

async function exportSubstituteDashboard() {
    try {
        const params = buildSubstituteParams();
        const res = await fetch('/api/substitute-dashboard/export?' + params.toString());
        if (!res.ok) {
            showToast('导出失败', 'error');
            return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `社团代课总表_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast('导出成功', 'success');
    } catch (err) {
        showToast('导出失败：网络错误', 'error');
    }
}

function resetSubstituteFilters() {
    ['subStartDate', 'subEndDate', 'subTeacherFilter', 'subCourseFilter'].forEach(id => {
        document.getElementById(id).value = '';
    });
    loadSubstituteDashboard();
}

function renderSubstituteDashboard(data) {
    const totals = data.totals || {};
    document.getElementById('availableSubTeacherCount').textContent = totals.available_teachers || 0;
    document.getElementById('substituteRequestCount').textContent = totals.substitute_count || 0;
    document.getElementById('substituteCourseCount').textContent = totals.course_count || 0;
    document.getElementById('substituteDateCount').textContent = totals.date_count || 0;

    renderSubstituteRecords(data.records || []);
    renderSubstituteTeacherStats(data.teacherStats || []);
    renderSubstituteCourseStats(data.courseStats || []);
    renderSubstituteTeacherRoster(data.teacherRoster || []);
}

function renderSubstituteRecords(records) {
    document.getElementById('substituteRecordsTable').innerHTML = records.length ? records.map(row => `
        <tr>
            <td>${escapeHtml(row.course_date || '-')}</td>
            <td>${escapeHtml(row.activity_type || '-')}</td>
            <td>${escapeHtml(row.course_name || '-')}</td>
            <td>${escapeHtml(row.original_teacher || '-')}</td>
            <td><strong>${escapeHtml(row.substitute_teacher || '-')}</strong></td>
            <td>${escapeHtml(row.reason || '-')}</td>
            <td class="subtle-cell">${escapeHtml(row.notes || '-')}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="deleteSubstituteRequest(${row.id})">删除</button></td>
        </tr>
    `).join('') : courseEmptyRow(8, '暂无代课记录');
}

function renderSubstituteTeacherStats(rows) {
    document.getElementById('substituteTeacherStatsTable').innerHTML = rows.length ? rows.map(row => `
        <tr>
            <td>${escapeHtml(row.substitute_teacher || '-')}</td>
            <td><strong>${row.substitute_count || 0}</strong></td>
            <td class="subtle-cell">${escapeHtml(row.details || '-')}</td>
        </tr>
    `).join('') : courseEmptyRow(3, '暂无代课老师统计');
}

function renderSubstituteCourseStats(rows) {
    document.getElementById('substituteCourseStatsTable').innerHTML = rows.length ? rows.map(row => {
        const dateRange = row.first_date === row.last_date
            ? (row.first_date || '-')
            : `${row.first_date || '-'} 至 ${row.last_date || '-'}`;
        return `
            <tr>
                <td>${escapeHtml(row.course_name || '未填写')}</td>
                <td>${escapeHtml(row.activity_type || '-')}</td>
                <td><strong>${row.session_count || 0}</strong></td>
                <td>${escapeHtml(dateRange)}</td>
            </tr>
        `;
    }).join('') : courseEmptyRow(4, '暂无社团/课程开展统计');
}

function renderSubstituteTeacherRoster(rows) {
    document.getElementById('availableSubTeachersTable').innerHTML = rows.length ? rows.map(row => `
        <tr>
            <td>${escapeHtml(row.teacher_name || '-')}</td>
            <td><span class="status-pill ${Number(row.can_substitute) === 1 ? 'ok' : 'muted'}">${Number(row.can_substitute) === 1 ? '可代课' : '不可代课'}</span></td>
            <td class="subtle-cell">${escapeHtml(row.current_assignments || '-')}</td>
            <td>${row.substitute_count || 0}</td>
            <td>${row.leave_count || 0}</td>
        </tr>
    `).join('') : courseEmptyRow(5, '暂无老师名单，请先导入社团代课名单');

    const available = rows.filter(row => Number(row.can_substitute) === 1);
    const select = document.getElementById('substituteTeacherSelect');
    select.innerHTML = available.length
        ? '<option value="">请选择代课老师</option>' + available.map(row => `<option value="${escapeHtml(row.teacher_name)}">${escapeHtml(row.teacher_name)}</option>`).join('')
        : '<option value="">暂无可选老师</option>';
}

async function saveSubstituteRequest(event) {
    event.preventDefault();
    const body = {
        activity_type: document.getElementById('subActivityType').value,
        course_name: document.getElementById('subCourseName').value.trim(),
        course_date: document.getElementById('subCourseDate').value,
        original_teacher: document.getElementById('subOriginalTeacher').value.trim(),
        substitute_teacher: document.getElementById('substituteTeacherSelect').value,
        reason: document.getElementById('subReason').value.trim(),
        notes: document.getElementById('subNotes').value.trim()
    };

    if (!body.original_teacher || !body.substitute_teacher) {
        showToast('请填写请假老师并选择代课老师', 'error');
        return false;
    }

    try {
        const res = await fetch('/api/substitute-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message || '保存成功', 'success');
            closeModal('substituteRequestModal');
            ['subCourseName', 'subCourseDate', 'subOriginalTeacher', 'subReason', 'subNotes'].forEach(id => {
                document.getElementById(id).value = '';
            });
            document.getElementById('substituteTeacherSelect').value = '';
            loadSubstituteDashboard();
        } else {
            showToast(data.message || '保存失败', 'error');
        }
    } catch (err) {
        showToast('保存失败：网络错误', 'error');
    }
    return false;
}

async function loadSubstituteTeachers() {
    await loadSubstituteDashboard();
}

async function loadSubstituteRequests() {
    await loadSubstituteDashboard();
}

async function deleteSubstituteRequest(id) {
    if (!confirm('确定删除这条代课记录吗？')) return;
    try {
        const res = await fetch(`/api/substitute-requests/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('删除成功', 'success');
            loadSubstituteDashboard();
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (err) {
        showToast('删除失败', 'error');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadCourseHourStats();
        loadSubstituteDashboard();
    }
});
