// ===== 认证与基础 =====
let scheduleFile = null;
let clubFile = null;

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
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
    window.location.replace('/login');
}

function showToast(message, type) {
    type = type || 'info';
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(function() { toast.className = 'toast'; }, 3000);
}

// ===== 面板切换 =====
function switchPanel(panel, el) {
    document.querySelectorAll('#courseSubMenu .nav-item').forEach(function(b) { b.classList.remove('active'); });
    if (el) el.classList.add('active');

    document.querySelectorAll('.course-module-view').forEach(function(v) { v.classList.remove('active'); });
    var view = document.getElementById('panel-' + panel);
    if (view) view.classList.add('active');

    var titles = { schedule: '课程表统计', club: '社团统计' };
    document.getElementById('panelTitle').textContent = titles[panel] || '课程管理';

    if (panel === 'schedule') loadScheduleStats();
    if (panel === 'club') loadClubStats();
}

function toggleSubMenu(parent) {
    parent.classList.toggle('expanded');
    var sub = parent.nextElementSibling;
    if (sub) sub.classList.toggle('expanded');
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

// ===== 模态框 =====
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

// ===== 文件上传 =====
function initFileUpload(areaId, inputId, onSelect) {
    var area = document.getElementById(areaId);
    var input = document.getElementById(inputId);
    if (!area || !input) return;
    area.addEventListener('click', function() { input.click(); });
    area.addEventListener('dragover', function(e) { e.preventDefault(); area.style.borderColor = '#4F46E5'; });
    area.addEventListener('dragleave', function() { area.style.borderColor = ''; });
    area.addEventListener('drop', function(e) {
        e.preventDefault();
        area.style.borderColor = '';
        if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; onSelect({ target: input }); }
    });
}

// ==================== 课程表统计 ====================

async function loadScheduleStats() {
    var params = new URLSearchParams();
    var sd = document.getElementById('schStartDate').value;
    var ed = document.getElementById('schEndDate').value;
    var t = document.getElementById('schTeacher').value.trim();
    var s = document.getElementById('schSubject').value.trim();
    if (sd) params.set('start_date', sd);
    if (ed) params.set('end_date', ed);
    if (t) params.set('teacher', t);
    if (s) params.set('subject', s);

    try {
        var res = await fetch('/api/course-hours/stats?' + params.toString());
        var data = await res.json();
        if (!data.success) return;
        var d = data.data;

        document.getElementById('scheduleRecordCount').textContent = (d.totals && d.totals.record_count) || 0;
        document.getElementById('scheduleTotalHours').textContent = (d.totals && d.totals.total_hours) || 0;
        document.getElementById('scheduleTeacherCount').textContent = (d.totals && d.totals.teacher_count) || 0;

        var tbody = document.getElementById('scheduleTableBody');
        if (!d.records || !d.records.length) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-cell">暂无数据，请导入Excel</td></tr>';
            return;
        }
        tbody.innerHTML = d.records.map(function(r) {
            return '<tr>' +
                '<td>' + (r.course_date || '') + '</td>' +
                '<td>' + (r.teacher_employee_id || '') + '</td>' +
                '<td>' + (r.teacher_name || '') + '</td>' +
                '<td>' + (r.subject || '') + '</td>' +
                '<td>' + (r.class_name || '') + '</td>' +
                '<td>' + (r.weekday || '') + '</td>' +
                '<td>' + (r.period_no || '') + '</td>' +
                '<td>' + (r.hours || '') + '</td>' +
                '<td><button class="btn btn-sm" style="background:#FEE2E2;color:#EF4444;padding:4px 10px;font-size:0.78rem;" onclick="deleteScheduleRecord(' + r.id + ')">删除</button></td>' +
                '</tr>';
        }).join('');
    } catch (err) {
        console.error('loadScheduleStats:', err);
    }
}

function clearScheduleFilters() {
    document.getElementById('schStartDate').value = '';
    document.getElementById('schEndDate').value = '';
    document.getElementById('schTeacher').value = '';
    document.getElementById('schSubject').value = '';
    loadScheduleStats();
}

async function deleteScheduleRecord(id) {
    if (!confirm('确定删除该条课时记录吗？')) return;
    try {
        var res = await fetch('/api/course-hours/' + id, { method: 'DELETE' });
        var data = await res.json();
        if (data.success) { showToast('删除成功', 'success'); loadScheduleStats(); }
        else { showToast(data.message || '删除失败', 'error'); }
    } catch (err) { showToast('删除失败', 'error'); }
}

function handleScheduleImport() { openModal('scheduleImportModal'); }

function handleScheduleFileSelect(e) {
    var file = e.target.files[0];
    if (!file) return;
    scheduleFile = file;
    document.getElementById('scheduleFileName').textContent = file.name;
    document.getElementById('scheduleImportBtn').disabled = false;
}

async function doScheduleImport() {
    if (!scheduleFile) return;
    var btn = document.getElementById('scheduleImportBtn');
    btn.disabled = true;
    btn.textContent = '导入中...';

    var formData = new FormData();
    formData.append('file', scheduleFile);

    try {
        var res = await fetch('/api/course-hours/import', { method: 'POST', body: formData });
        var data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('scheduleImportModal');
            scheduleFile = null;
            document.getElementById('scheduleFileName').textContent = '';
            document.getElementById('scheduleFileInput').value = '';
            loadScheduleStats();
        } else {
            showToast(data.message || '导入失败', 'error');
        }
    } catch (err) { showToast('导入失败', 'error'); }
    btn.disabled = false;
    btn.textContent = '导入';
}

function exportSchedule() {
    var params = new URLSearchParams();
    var sd = document.getElementById('schStartDate').value;
    var ed = document.getElementById('schEndDate').value;
    var t = document.getElementById('schTeacher').value.trim();
    var s = document.getElementById('schSubject').value.trim();
    if (sd) params.set('start_date', sd);
    if (ed) params.set('end_date', ed);
    if (t) params.set('teacher', t);
    if (s) params.set('subject', s);

    // Use the stats API to get filtered data, then export via XLSX library
    fetch('/api/course-hours/stats?' + params.toString())
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success || !data.data) return;
            var d = data.data;
            // Build summary sheet
            var summaryData = [['总记录数', d.totals.record_count], ['总课时数', d.totals.total_hours], ['教师数量', d.totals.teacher_count], [], ['教师', '课时数', '课节数']];
            (d.byTeacher || []).forEach(function(t) { summaryData.push([t.teacher_name, t.total_hours, t.lesson_count]); });
            summaryData.push([], ['学科', '课时数', '课节数']);
            (d.bySubject || []).forEach(function(s) { summaryData.push([s.subject, s.total_hours, s.lesson_count]); });

            var recordsData = [['日期', '教师账号', '教师姓名', '课程/学科', '班级', '星期', '节次', '课时数']];
            (d.records || []).forEach(function(r) { recordsData.push([r.course_date, r.teacher_employee_id, r.teacher_name, r.subject, r.class_name, r.weekday, r.period_no, r.hours]); });

            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), '汇总统计');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(recordsData), '课时明细');
            XLSX.writeFile(wb, '课时统计_' + new Date().toISOString().slice(0,10) + '.xlsx');
        }).catch(function(err) { showToast('导出失败', 'error'); });
}

// ==================== 社团统计 ====================

async function loadClubStats() {
    var params = new URLSearchParams();
    var sd = document.getElementById('clubStartDate').value;
    var ed = document.getElementById('clubEndDate').value;
    var t = document.getElementById('clubTeacher').value.trim();
    var c = document.getElementById('clubCourse').value.trim();
    if (sd) params.set('start_date', sd);
    if (ed) params.set('end_date', ed);
    if (t) params.set('teacher', t);
    if (c) params.set('course_name', c);

    try {
        var res = await fetch('/api/substitute-dashboard?' + params.toString());
        var data = await res.json();
        if (!data.success) return;
        var d = data.data;

        // 统计卡片
        document.getElementById('clubSubstituteCount').textContent = d.totals.substitute_count || 0;
        document.getElementById('clubTeacherCount').textContent = d.totals.teacher_count || 0;
        document.getElementById('clubCourseCount').textContent = d.totals.course_count || 0;
        document.getElementById('clubActivityCount').textContent = d.totals.activity_count || 0;

        // 代课明细表
        var recordsBody = document.getElementById('clubRecordsTable');
        if (!d.records || !d.records.length) {
            recordsBody.innerHTML = '<tr><td colspan="8" class="empty-cell">暂无代课记录</td></tr>';
        } else {
            recordsBody.innerHTML = d.records.map(function(r) {
                return '<tr>' +
                    '<td>' + (r.course_date || '') + '</td>' +
                    '<td>' + (r.activity_type || '') + '</td>' +
                    '<td>' + (r.course_name || '') + '</td>' +
                    '<td>' + (r.original_teacher || '') + '</td>' +
                    '<td>' + (r.substitute_teacher || '') + '</td>' +
                    '<td>' + (r.reason || '') + '</td>' +
                    '<td class="subtle-cell">' + (r.notes || '') + '</td>' +
                    '<td><button class="btn btn-sm" style="background:#FEE2E2;color:#EF4444;padding:4px 10px;font-size:0.78rem;" onclick="deleteClubRecord(' + r.id + ')">删除</button></td>' +
                    '</tr>';
            }).join('');
        }

        // 教师代课统计
        var tsBody = document.getElementById('clubTeacherStatsTable');
        if (!d.teacherStats || !d.teacherStats.length) {
            tsBody.innerHTML = '<tr><td colspan="3" class="empty-cell">暂无数据</td></tr>';
        } else {
            tsBody.innerHTML = d.teacherStats.map(function(r) {
                return '<tr><td>' + (r.substitute_teacher || '') + '</td><td>' + (r.substitute_count || 0) + '</td><td class="subtle-cell">' + (r.details || '') + '</td></tr>';
            }).join('');
        }

        // 社团开展统计
        var csBody = document.getElementById('clubCourseStatsTable');
        if (!d.courseStats || !d.courseStats.length) {
            csBody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无数据</td></tr>';
        } else {
            csBody.innerHTML = d.courseStats.map(function(r) {
                return '<tr><td>' + (r.course_name || '') + '</td><td>' + (r.activity_type || '') + '</td><td>' + (r.session_count || 0) + '</td><td>' + (r.first_date || '') + '</td><td>' + (r.last_date || '') + '</td></tr>';
            }).join('');
        }

        // 活动开展明细
        var arBody = document.getElementById('clubActivityRecordsTable');
        if (!d.activityRecords || !d.activityRecords.length) {
            arBody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无数据，请导入Excel</td></tr>';
        } else {
            arBody.innerHTML = d.activityRecords.map(function(r) {
                return '<tr><td>' + (r.course_date || '') + '</td><td>' + (r.activity_type || '') + '</td><td>' + (r.course_name || '') + '</td><td>' + (r.scheduled_teacher || '') + '</td><td>' + (r.substitute_teacher || '') + '</td></tr>';
            }).join('');
        }

        // 教师名单
        var trBody = document.getElementById('clubTeacherRosterTable');
        if (!d.teacherRoster || !d.teacherRoster.length) {
            trBody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无数据，请导入Excel</td></tr>';
        } else {
            trBody.innerHTML = d.teacherRoster.map(function(r) {
                var canSub = Number(r.can_substitute) === 1;
                var statusHtml = canSub
                    ? '<span class="status-pill ok">可代课</span>'
                    : '<span class="status-pill muted">不可代课</span>';
                return '<tr>' +
                    '<td>' + (r.teacher_name || '') + '</td>' +
                    '<td>' + statusHtml + '</td>' +
                    '<td class="subtle-cell">' + (r.current_assignments || '') + '</td>' +
                    '<td>' + (r.substitute_count || 0) + '</td>' +
                    '<td>' + (r.leave_count || 0) + '</td>' +
                    '</tr>';
            }).join('');
        }

        // 缓存数据供添加代课弹窗下拉使用
        cachedTeachers = d.teacherRoster || [];
        cachedCourses = [];
        if (d.courseStats) {
            var seen = {};
            d.courseStats.forEach(function(s) {
                if (s.course_name && !seen[s.course_name]) {
                    seen[s.course_name] = true;
                    cachedCourses.push(s.course_name);
                }
            });
        }
    } catch (err) {
        console.error('loadClubStats:', err);
    }
}

function clearClubFilters() {
    document.getElementById('clubStartDate').value = '';
    document.getElementById('clubEndDate').value = '';
    document.getElementById('clubTeacher').value = '';
    document.getElementById('clubCourse').value = '';
    loadClubStats();
}

async function clearAllClubData() {
    if (!confirm('确定要清空全部社团/代课数据吗？\n\n这将删除：\n- 教师名单\n- 所有代课记录\n- 所有活动记录\n\n此操作不可恢复！')) return;
    try {
        var res = await fetch('/api/club-data/clear-all', { method: 'DELETE' });
        if (!res.ok) { showToast('请求失败 (' + res.status + ')，请确认已用课程管理员账号登录', 'error'); return; }
        var data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            cachedTeachers = [];
            cachedCourses = [];
            loadClubStats();
        } else {
            showToast(data.message || '清理失败', 'error');
        }
    } catch (err) {
        console.error('清理数据失败:', err);
        showToast('清理失败: ' + (err.message || '网络错误'), 'error');
    }
}

async function deleteClubRecord(id) {
    if (!confirm('确定删除该条代课记录吗？')) return;
    try {
        var res = await fetch('/api/substitute-requests/' + id, { method: 'DELETE' });
        var data = await res.json();
        if (data.success) { showToast('删除成功', 'success'); loadClubStats(); }
        else { showToast(data.message || '删除失败', 'error'); }
    } catch (err) { showToast('删除失败', 'error'); }
}

function handleClubImport() { openModal('clubImportModal'); }

function handleClubFileSelect(e) {
    var file = e.target.files[0];
    if (!file) return;
    clubFile = file;
    document.getElementById('clubFileName').textContent = file.name;
    document.getElementById('clubImportBtn').disabled = false;
}

async function doClubImport() {
    if (!clubFile) return;
    var btn = document.getElementById('clubImportBtn');
    btn.disabled = true;
    btn.textContent = '导入中...';

    var formData = new FormData();
    formData.append('file', clubFile);

    try {
        var res = await fetch('/api/substitute-teachers/import', { method: 'POST', body: formData });
        var data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('clubImportModal');
            clubFile = null;
            document.getElementById('clubFileName').textContent = '';
            document.getElementById('clubFileInput').value = '';
            await loadClubStats();
        } else {
            showToast(data.message || '导入失败', 'error');
        }
    } catch (err) { showToast('导入失败', 'error'); }
    btn.disabled = false;
    btn.textContent = '导入';
}

function exportClub() {
    var params = new URLSearchParams();
    var sd = document.getElementById('clubStartDate').value;
    var ed = document.getElementById('clubEndDate').value;
    var t = document.getElementById('clubTeacher').value.trim();
    var c = document.getElementById('clubCourse').value.trim();
    if (sd) params.set('start_date', sd);
    if (ed) params.set('end_date', ed);
    if (t) params.set('teacher', t);
    if (c) params.set('course_name', c);

    window.open('/api/substitute-dashboard/export?' + params.toString(), '_blank');
}

// ===== 添加代课记录 =====
var cachedTeachers = [];
var cachedCourses = [];

function populateSubSelects() {
    var originalSel = document.getElementById('subOriginal');
    var subTeacherSel = document.getElementById('subTeacher');
    var courseSel = document.getElementById('subCourseName');
    if (!originalSel || !subTeacherSel || !courseSel) return;

    var originalHtml = '<option value="">请选择老师</option>';
    var subTeacherHtml = '<option value="">请选择代课老师</option>';
    cachedTeachers.forEach(function(t) {
        originalHtml += '<option value="' + t.teacher_name + '">' + t.teacher_name + '</option>';
        if (Number(t.can_substitute) === 1) {
            subTeacherHtml += '<option value="' + t.teacher_name + '">' + t.teacher_name + '</option>';
        }
    });
    originalSel.innerHTML = originalHtml;
    subTeacherSel.innerHTML = subTeacherHtml;

    var courseHtml = '<option value="">请选择社团/课程</option>';
    cachedCourses.forEach(function(c) {
        courseHtml += '<option value="' + c + '">' + c + '</option>';
    });
    courseSel.innerHTML = courseHtml;
}

async function openAddSubModal() {
    // 如果缓存为空，先加载数据
    if (!cachedTeachers.length && !cachedCourses.length) {
        try {
            var res = await fetch('/api/substitute-dashboard');
            var data = await res.json();
            if (data.success && data.data) {
                var d = data.data;
                cachedTeachers = d.teacherRoster || [];
                cachedCourses = [];
                if (d.courseStats) {
                    var seen = {};
                    d.courseStats.forEach(function(s) {
                        if (s.course_name && !seen[s.course_name]) {
                            seen[s.course_name] = true;
                            cachedCourses.push(s.course_name);
                        }
                    });
                }
            }
        } catch (err) {
            console.error('加载下拉数据失败:', err);
        }
    }
    document.getElementById('subActivityType').value = '社团';
    document.getElementById('subDate').value = '';
    document.getElementById('subReason').value = '';
    document.getElementById('subNotes').value = '';
    populateSubSelects();
    openModal('addSubModal');
}

async function saveSubRequest(e) {
    e.preventDefault();
    var body = {
        activity_type: document.getElementById('subActivityType').value,
        course_name: document.getElementById('subCourseName').value,
        course_date: document.getElementById('subDate').value,
        original_teacher: document.getElementById('subOriginal').value,
        substitute_teacher: document.getElementById('subTeacher').value,
        reason: document.getElementById('subReason').value,
        notes: document.getElementById('subNotes').value
    };
    try {
        var res = await fetch('/api/substitute-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var data = await res.json();
        if (data.success) {
            showToast('代课记录已添加', 'success');
            closeModal('addSubModal');
            loadClubStats();
        } else {
            showToast(data.message || '添加失败', 'error');
        }
    } catch (err) { showToast('添加失败', 'error'); }
    return false;
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    checkAuth().then(function(user) {
        if (!user) return;
        loadScheduleStats();
    });

    // 文件上传拖拽
    initFileUpload('scheduleFileUploadArea', 'scheduleFileInput', handleScheduleFileSelect);
    initFileUpload('clubFileUploadArea', 'clubFileInput', handleClubFileSelect);
});
