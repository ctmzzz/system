// ===== 认证与基础 =====
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
    document.querySelectorAll('.nav-menu .nav-parent').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-menu .nav-item').forEach(function(s) { s.classList.remove('active'); });
    if (el) el.classList.add('active');

    document.querySelectorAll('.course-module-view').forEach(function(v) { v.classList.remove('active'); });
    var view = document.getElementById('panel-' + panel);
    if (view) view.classList.add('active');

    var titles = {
        'club-calendar': '日程表',
        'club-events': '事件',
        'club-teachers': '教师人员'
    };
    document.getElementById('panelTitle').textContent = titles[panel] || '课程管理';

    if (panel === 'club-calendar') loadClubData().then(renderClubOverview);
    if (panel === 'club-events') { loadClubData().then(function(d) { if (d) { document.getElementById('clubCalCourseCount').textContent = d.totals.course_count || 0; document.getElementById('clubCalActivityCount').textContent = d.totals.activity_count || 0; } renderClubSubstitute(d); }); loadClubDailyView(); }
    if (panel === 'club-teachers') loadClubData().then(renderClubTeachers);
}

function switchClubPanel(panel, el) {
    // 高亮父菜单
    document.querySelectorAll('.nav-menu .nav-parent').forEach(function(p) { p.classList.remove('active'); });
    var parent = el.closest('.nav-group').querySelector('.nav-parent');
    if (parent) parent.classList.add('active');
    // 高亮子项
    document.querySelectorAll('.nav-menu .nav-item').forEach(function(s) { s.classList.remove('active'); });
    el.classList.add('active');

    document.querySelectorAll('.course-module-view').forEach(function(v) { v.classList.remove('active'); });
    var view = document.getElementById('panel-' + panel);
    if (view) view.classList.add('active');

    var titles = { 'club-calendar': '日程表', 'club-events': '事件' };
    document.getElementById('panelTitle').textContent = titles[panel] || '社团总表';

    if (panel === 'club-calendar') loadClubData().then(renderClubOverview);
    if (panel === 'club-events') { loadClubData().then(function(d) { if (d) { document.getElementById('clubCalCourseCount').textContent = d.totals.course_count || 0; document.getElementById('clubCalActivityCount').textContent = d.totals.activity_count || 0; } renderClubSubstitute(d); }); loadClubDailyView(); }
}

function downloadTemplate(type) {
    var url = '/api/download-template/' + type;
    fetch(url)
        .then(function(r) {
            if (!r.ok) throw new Error('下载失败');
            return r.blob();
        })
        .then(function(blob) {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = '教师人员导入样表.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        })
        .catch(function(err) { showToast('下载样表失败：接口不存在或服务器未启动', 'error'); });
}

function switchEventsTab(tab, el) {
    document.querySelectorAll('#panel-club-events .course-module-tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    document.querySelectorAll('#panel-club-events .events-tab-content').forEach(function(c) { c.classList.remove('active'); });
    document.getElementById('eventsTab-' + tab).classList.add('active');
    if (tab === 'stats') loadClubData().then(renderClubSubstitute);
}

function toggleClubSubmenu() {
    var sub = document.getElementById('clubSubmenu');
    if (!sub) return;
    var expanded = sub.classList.contains('expanded');
    if (expanded) {
        sub.classList.remove('expanded');
    } else {
        sub.classList.add('expanded');
    }
    var arrow = document.querySelector('.nav-arrow');
    if (arrow) arrow.style.transform = expanded ? 'rotate(0deg)' : 'rotate(180deg)';
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

// ==================== 社团数据共享 ====================
var clubDataCache = null;
var cachedTeachers = [];
var cachedCourses = [];

async function loadClubData() {
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
        if (!data.success) return null;
        clubDataCache = data.data;

        // 缓存教师名单和课程名（下拉用）
        cachedTeachers = clubDataCache.teacherRoster || [];
        cachedCourses = [];
        if (clubDataCache.courseStats) {
            var seen = {};
            clubDataCache.courseStats.forEach(function(s) {
                if (s.course_name && !seen[s.course_name]) {
                    seen[s.course_name] = true;
                    cachedCourses.push(s.course_name);
                }
            });
        }
        return clubDataCache;
    } catch (err) {
        console.error('loadClubData:', err);
        return null;
    }
}

// ===== 社团日历状态 =====
var clubCalView = 'month'; // 'month' | 'week' | 'day' | 'schedule'
var clubCalDate = new Date(); // 当前选中的日期 (for month: year+month, for week: any day in week, for day: that day)
var _editCalSessionDate = null; // 日历编辑时的事件实际日期，优先于 clubCalDate

function renderClubOverview(d) {
    if (!d) return;
    renderClubMainCal(d);
}

// ========== 社团主日历 ==========
function clubCalGetViewRange() {
    var y = clubCalDate.getFullYear(), m = clubCalDate.getMonth();
    if (clubCalView === 'month') {
        return { type: 'month', year: y, month: m, start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
    } else if (clubCalView === 'week') {
        var d = new Date(clubCalDate);
        var day = d.getDay();
        var monOff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + monOff);
        var start = new Date(d), end = new Date(d);
        end.setDate(end.getDate() + 6);
        return { type: 'week', start: start, end: end };
    } else {
        return { type: 'schedule', start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
    }
}

function clubCalFormatDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function renderClubMainCal(d) {
    if (!d) return;
    var activityRecords = d.activityRecords || [];
    // 建立日期→活动映射
    var dateMap = {};
    activityRecords.forEach(function(r) {
        var dt = r.course_date;
        if (!dt) return;
        if (!dateMap[dt]) dateMap[dt] = [];
        dateMap[dt].push(r);
    });

    var range = clubCalGetViewRange();
    var whEl = document.getElementById('clubWeekHeader');
    var grid = document.getElementById('clubDateGrid');
    var now = new Date();
    var todayStr = clubCalFormatDate(now);

    // 更新工具栏标签和按钮状态
    ['clubTbMonth', 'clubTbWeek', 'clubTbSchedule'].forEach(function(id) {
        var btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    var activeMap = { month: 'clubTbMonth', week: 'clubTbWeek', schedule: 'clubTbSchedule' };
    var activeBtn = document.getElementById(activeMap[clubCalView]);
    if (activeBtn) activeBtn.classList.add('active');

    if (clubCalView === 'month') {
        document.getElementById('clubToolbarLabel').textContent = range.year + ' 年 ' + (range.month + 1) + ' 月';
    } else if (clubCalView === 'week') {
        var s = range.start, e = range.end;
        if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
            document.getElementById('clubToolbarLabel').textContent = s.getFullYear() + '年' + (s.getMonth()+1) + '月 ' + s.getDate() + '日 - ' + e.getDate() + '日';
        } else {
            document.getElementById('clubToolbarLabel').textContent = s.getFullYear() + '/' + (s.getMonth()+1) + '/' + s.getDate() + ' - ' + e.getFullYear() + '/' + (e.getMonth()+1) + '/' + e.getDate();
        }
    } else {
        document.getElementById('clubToolbarLabel').textContent = range.start.getFullYear() + '年' + (range.start.getMonth()+1) + '月' + range.start.getDate() + '日 - ' + range.end.getFullYear() + '年' + (range.end.getMonth()+1) + '月' + range.end.getDate() + '日';
    }

    // 渲染视图
    if (clubCalView === 'week') {
        renderClubWeekView(range, whEl, grid, todayStr, dateMap);
    } else if (clubCalView === 'schedule') {
        renderClubScheduleView(range, whEl, grid, todayStr, dateMap);
    } else {
        renderClubMonthView(range, whEl, grid, todayStr, dateMap);
    }

    renderClubMiniCal();
}

// ========== 月视图 ==========
function renderClubMonthView(range, whEl, grid, todayStr, dateMap) {
    whEl.style.display = '';
    grid.style.display = '';
    grid.style.flexDirection = '';
    grid.style.gridTemplateColumns = '';

    var year = range.year, month = range.month;
    whEl.innerHTML = '';
    ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'].forEach(function(dn, i) {
        whEl.innerHTML += '<div class="cal-wh-cell' + (i >= 5 ? ' weekend' : '') + '">' + dn + '</div>';
    });

    var firstDow = new Date(year, month, 1).getDay();
    firstDow = firstDow === 0 ? 6 : firstDow - 1; // 周一=0
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var prevDays = new Date(year, month, 0).getDate();

    var html = '';
    // 上月
    for (var i = firstDow - 1; i >= 0; i--) {
        var day = prevDays - i;
        var dow = (firstDow - 1 - i + 1) % 7;
        html += '<div class="cal-cell other-month' + (dow >= 5 ? ' weekend' : '') + '"><span class="cal-date-num">' + day + '</span><div class="cal-events-area"></div></div>';
    }
    // 当月
    for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var fullDow = new Date(year, month, d).getDay(); // 0=Sun
        var isWeekend = fullDow === 0 || fullDow === 6;
        var isToday = dateStr === todayStr;
        var isSelected = clubCalFormatDate(clubCalDate) === dateStr;
        var cls = 'cal-cell';
        if (isWeekend) cls += ' weekend';
        if (isToday || (isSelected && !isToday)) cls += ' today-cell';
        var numCls = 'cal-date-num' + (isToday ? ' today-num' : '');
        html += '<div class="' + cls + '" onclick="onClubCalCellClick(' + year + ',' + month + ',' + d + ')"><span class="' + numCls + '">' + d + '</span><div class="cal-events-area"></div></div>';
    }
    // 下月
    var totalCells = firstDow + daysInMonth;
    var remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (var dd = 1; dd <= remaining; dd++) {
        var ndow = (firstDow + dd - 1) % 7;
        html += '<div class="cal-cell other-month' + (ndow >= 5 ? ' weekend' : '') + '"><span class="cal-date-num">' + dd + '</span><div class="cal-events-area"></div></div>';
    }
    grid.innerHTML = html;
    fillClubCellEvents(grid, todayStr, dateMap);
}

// ========== 周视图 ==========
function renderClubWeekView(range, whEl, grid, todayStr, dateMap) {
    whEl.style.display = '';
    grid.style.display = '';
    grid.style.flexDirection = '';

    var start = new Date(range.start);
    var weekDays = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
    whEl.innerHTML = '';
    for (var i = 0; i < 7; i++) {
        var d = new Date(start);
        d.setDate(start.getDate() + i);
        var dateStr = clubCalFormatDate(d);
        var isToday = dateStr === todayStr;
        var isWeekend = i >= 5;
        var label = weekDays[i] + '<br><span style="font-size:1.1rem;font-weight:700;">' + d.getDate() + '/' + (d.getMonth()+1) + '</span>';
        whEl.innerHTML += '<div class="cal-wh-cell' + (isWeekend ? ' weekend' : '') + (isToday ? ' today-num' : '') + '" style="padding:4px 0;line-height:1.4;">' + label + '</div>';
    }

    var html = '';
    for (var i = 0; i < 7; i++) {
        var d2 = new Date(start);
        d2.setDate(start.getDate() + i);
        var dateStr2 = clubCalFormatDate(d2);
        var isToday2 = dateStr2 === todayStr;
        var isWeekend2 = i >= 5;
        var isSelected2 = clubCalFormatDate(clubCalDate) === dateStr2;
        var cls = 'cal-cell';
        if (isWeekend2) cls += ' weekend';
        if (isToday2 || (isSelected2 && !isToday2)) cls += ' today-cell';
        if (d2.getMonth() !== start.getMonth() && d2.getMonth() !== new Date(start.getFullYear(), start.getMonth()+1, 0).getMonth()) cls += ' other-month';
        var numCls = 'cal-date-num' + (isToday2 ? ' today-num' : '');
        html += '<div class="' + cls + '" onclick="onClubCalCellClick(' + d2.getFullYear() + ',' + d2.getMonth() + ',' + d2.getDate() + ')"><span class="' + numCls + '">' + d2.getDate() + '</span><div class="cal-events-area"></div></div>';
    }
    grid.innerHTML = html;
    fillClubCellEvents(grid, todayStr, dateMap);
}

// ========== 日视图 ==========
function renderClubDayView(range, whEl, grid, todayStr, dateMap) {
    var date = range.start;
    var dateStr = clubCalFormatDate(date);
    var weekDays = ['日','一','二','三','四','五','六'];
    var dow = date.getDay();
    whEl.innerHTML = '';
    whEl.style.display = 'flex';
    whEl.style.justifyContent = 'center';
    whEl.style.alignItems = 'center';
    whEl.style.padding = '16px 0';
    whEl.innerHTML = '<div style="text-align:center;"><div style="font-size:0.9rem;color:#64748b;">星期' + weekDays[dow] + '</div><div style="font-size:2.2rem;font-weight:700;color:#1e293b;margin:4px 0;">' + date.getDate() + '</div><div style="font-size:0.9rem;color:#64748b;">' + date.getFullYear() + '年' + (date.getMonth()+1) + '月</div></div>';

    var events = dateMap[dateStr] || [];
    var html = '<div class="day-schedule" style="flex:1;overflow-y:auto;padding:12px 16px;">';
    if (events.length === 0) {
        html += '<div class="day-no-events">当日暂无活动</div>';
    } else {
        events.forEach(function(s) {
            var hasSub = s.substitute_teacher && s.substitute_teacher.trim();
            var borderColor = s.activity_type === '社团' ? '#F59E0B' : '#3B82F6';
            var statusColor = s.status === '请假' ? '#EF4444' : '#22C55E';
            var statusBg = s.status === '请假' ? '#FEF2F2' : '#F0FDF4';
            var typeBg = s.activity_type === '社团' ? '#FEF3C7' : '#DBEAFE';
            var typeColor = s.activity_type === '社团' ? '#92400E' : '#1E40AF';
            var rowBg = s.status === '请假' ? 'background:#FFFDF5;' : '';
            html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;padding:12px 16px;margin-bottom:8px;border-radius:8px;border-left:4px solid ' + borderColor + ';' + rowBg + 'border:1px solid #F3F4F6;">' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                        '<span style="display:inline-block;padding:1px 8px;border-radius:4px;font-size:0.72rem;font-weight:600;background:' + typeBg + ';color:' + typeColor + ';">' + escHtml(s.activity_type) + '</span>' +
                        '<span style="display:inline-block;padding:1px 8px;border-radius:10px;font-size:0.72rem;font-weight:500;background:' + statusBg + ';color:' + statusColor + ';">' + escHtml(s.status) + '</span>' +
                    '</div>' +
                    '<div style="font-size:0.9rem;font-weight:600;color:#111827;line-height:1.4;">' + escHtml(s.course_name) + '</div>' +
                    '<div style="font-size:0.82rem;color:#374151;margin-top:2px;">' + escHtml(s.scheduled_teacher) + (hasSub ? ' <span style="color:#EF4444;">→ ' + escHtml(s.substitute_teacher) + '（代课）</span>' : '') + '</div>' +
                    (s.location ? '<div style="font-size:0.78rem;color:#9ca3af;margin-top:2px;">' + escHtml(s.location) + '</div>' : '') +
                    (s.reason ? '<div style="font-size:0.78rem;color:#EF4444;margin-top:2px;">原因：' + escHtml(s.reason) + '</div>' : '') +
                '</div>' +
                '<div style="display:flex;gap:6px;flex-shrink:0;margin-left:12px;">' +
                    '<button class="btn btn-sm" style="background:#E0F2FE;color:#0369A1;padding:2px 10px;" onclick="event.stopPropagation();editDailySessionForClubCal(' + s.id + ',\'' + escJs(s.scheduled_teacher) + '\',\'' + escJs(s.course_name) + '\',\'' + escJs(s.activity_type) + '\',\'' + escJs(s.location || '') + '\',\'' + escJs(s.status) + '\',\'' + escJs(s.substitute_teacher || '') + '\',\'' + escJs(s.reason || '') + '\',\'' + dateStr + '\')">编辑</button>' +
                    '<button class="btn btn-sm" style="background:#FEE2E2;color:#EF4444;padding:2px 10px;" onclick="event.stopPropagation();deleteClubCalSession(' + s.id + ')">删除</button>' +
                '</div></div>';
        });
    }
    html += '</div>';
    grid.innerHTML = html;
}

// ========== 日程表视图（缩略图） ==========
function renderClubScheduleView(range, whEl, grid, todayStr, dateMap) {
    whEl.style.display = 'flex';
    whEl.style.justifyContent = 'center';
    whEl.style.alignItems = 'center';
    whEl.style.padding = '8px 0';
    whEl.innerHTML = '<div style="font-size:0.95rem;font-weight:600;color:#374151;">全部活动安排</div>';
    grid.style.display = 'block';
    grid.style.gridTemplateColumns = '';

    var allEvents = [];
    var startStr = clubCalFormatDate(range.start), endStr = clubCalFormatDate(range.end);
    Object.keys(dateMap).forEach(function(ds) {
        if (ds >= startStr && ds <= endStr) {
            dateMap[ds].forEach(function(s) { allEvents.push({ date: ds, session: s }); });
        }
    });
    allEvents.sort(function(a, b) { return a.date.localeCompare(b.date) || a.session.course_name.localeCompare(b.session.course_name); });

    var html = '<div class="schedule-list">';
    if (allEvents.length === 0) {
        html += '<div class="day-no-events">暂无活动</div>';
    } else {
        var lastDate = '';
        allEvents.forEach(function(item) {
            if (item.date !== lastDate) {
                lastDate = item.date;
                var parts = item.date.split('-');
                var weekDays = ['日','一','二','三','四','五','六'];
                var wd = weekDays[new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])).getDay()];
                html += '<div style="font-weight:700;color:#111827;font-size:0.9rem;margin:14px 0 6px;padding:4px 8px;border-bottom:2px solid #6366f1;">' + parts[1] + '月' + parts[2] + '日 星期' + wd + '</div>';
                html += '<div class="schedule-thumb-row">';
            }
            var s = item.session;
            var hasSub = s.substitute_teacher && s.substitute_teacher.trim();
            var typeBg = s.activity_type === '社团' ? '#FEF3C7' : '#DBEAFE';
            var typeColor = s.activity_type === '社团' ? '#92400E' : '#1E40AF';
            var borderColor = s.activity_type === '社团' ? '#F59E0B' : '#3B82F6';
            var statusColor = hasSub ? '#EF4444' : '#22C55E';
            var evtStatus = hasSub ? '请假' : '正常';
            html += '<div class="schedule-thumb" onclick="editDailySessionForClubCal(' + s.id + ',\'' + escJs(s.scheduled_teacher) + '\',\'' + escJs(s.course_name) + '\',\'' + escJs(s.activity_type) + '\',\'' + escJs(s.location || '') + '\',\'' + escJs(evtStatus) + '\',\'' + escJs(s.substitute_teacher || '') + '\',\'' + escJs('') + '\',\'' + item.date + '\')">' +
                '<div class="schedule-thumb-top">' +
                    '<span class="schedule-thumb-type" style="background:' + typeBg + ';color:' + typeColor + ';">' + escHtml(s.activity_type) + '</span>' +
                    '<span class="schedule-thumb-status" style="color:' + statusColor + ';">' + (hasSub ? '⚠' : '✓') + '</span>' +
                '</div>' +
                '<div class="schedule-thumb-course">' + escHtml(s.course_name) + '</div>' +
                '<div class="schedule-thumb-teacher">' + escHtml(s.scheduled_teacher) + (hasSub ? ' →' + escHtml(s.substitute_teacher) : '') + '</div>' +
                '</div>';

            // Check if this is the last event for this date
            var nextIdx = allEvents.indexOf(item) + 1;
            if (nextIdx >= allEvents.length || allEvents[nextIdx].date !== lastDate) {
                html += '</div>';
            }
        });
    }
    html += '</div>';
    grid.innerHTML = html;
}

// ========== 填充事件芯片 ==========
function fillClubCellEvents(grid, todayStr, dateMap) {
    var cells = grid.querySelectorAll('.cal-cell');
    cells.forEach(function(cell) {
        var onclick = cell.getAttribute('onclick');
        if (!onclick) return;
        var match = onclick.match(/onClubCalCellClick\((\d+),(\d+),(\d+)\)/);
        if (!match) return;
        var y = parseInt(match[1]), m = parseInt(match[2]), d = parseInt(match[3]);
        var dateStr = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var evtArea = cell.querySelector('.cal-events-area');
        if (!evtArea) return;
        var events = dateMap[dateStr] || [];
        evtArea.innerHTML = events.slice(0, 8).map(function(s) {
            var hasSub = s.substitute_teacher && s.substitute_teacher.trim();
            var cls = 'cal-event-chip ' + (s.activity_type === '社团' ? 'club' : 'course');
            if (hasSub) cls += ' substitute';
            var label = (s.activity_type === '社团' ? '社' : '课') + ' ' + escHtml(s.course_name) + ' · ' + escHtml(s.scheduled_teacher);
            if (hasSub) label += '→' + escHtml(s.substitute_teacher);
            var evtStatus = hasSub ? '请假' : '正常';
            return '<div class="' + cls + '" onclick="event.stopPropagation();editDailySessionForClubCal(' + s.id + ',\'' + escJs(s.scheduled_teacher) + '\',\'' + escJs(s.course_name) + '\',\'' + escJs(s.activity_type) + '\',\'' + escJs(s.location || '') + '\',\'' + escJs(evtStatus) + '\',\'' + escJs(s.substitute_teacher || '') + '\',\'' + escJs('') + '\',\'' + dateStr + '\')" title="点击编辑">' + label + '</div>';
        }).join('');
        if (events.length > 8) {
            evtArea.innerHTML += '<div style="font-size:0.65rem;color:#9ca3af;padding:2px 5px;">+ ' + (events.length - 8) + ' 更多</div>';
        }
    });
}

// ========== 单元格点击 → 打开日弹窗 ==========
function onClubCalCellClick(year, month, day) {
    var evt = window.event;
    if (evt) {
        var target = evt.target || evt.srcElement;
        if (target && target.closest && target.closest('.cal-event-chip')) return;
    }
    var d = new Date(year, month, day);
    openClubDayModal(d);
}

// ========== 日详情弹窗 ==========
var clubDayModalDate = null;

function openClubDayModal(d) {
    clubDayModalDate = d;
    var dateStr = clubCalFormatDate(d);
    var weekDays = ['日','一','二','三','四','五','六'];
    var wd = weekDays[d.getDay()];
    document.getElementById('clubDayModalTitle').textContent = (d.getMonth()+1) + '月' + d.getDate() + '日 星期' + wd;
    document.getElementById('clubDayModalBody').innerHTML = '<div class="day-no-events">加载中...</div>';
    openModal('clubDayModal');

    fetch('/api/daily-board?date=' + encodeURIComponent(dateStr))
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var sessions = data.success ? (data.data.teacherSessions || []) : [];
            var body = document.getElementById('clubDayModalBody');
            if (!sessions.length) {
                body.innerHTML = '<div class="day-no-events">当日暂无活动</div>';
                return;
            }
            body.innerHTML = sessions.map(function(s) {
                var hasSub = s.substitute_teacher && s.substitute_teacher.trim();
                var borderColor = s.activity_type === '社团' ? '#F59E0B' : '#3B82F6';
                var statusColor = s.status === '请假' ? '#EF4444' : '#22C55E';
                var statusBg = s.status === '请假' ? '#FEF2F2' : '#F0FDF4';
                var typeBg = s.activity_type === '社团' ? '#FEF3C7' : '#DBEAFE';
                var typeColor = s.activity_type === '社团' ? '#92400E' : '#1E40AF';
                var rowBg = s.status === '请假' ? 'background:#FFFDF5;' : '';
                return '<div style="display:flex;align-items:flex-start;justify-content:space-between;padding:10px 14px;margin-bottom:6px;border-radius:8px;border-left:4px solid ' + borderColor + ';' + rowBg + 'border:1px solid #F3F4F6;">' +
                    '<div style="flex:1;min-width:0;">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                            '<span style="display:inline-block;padding:1px 8px;border-radius:4px;font-size:0.72rem;font-weight:600;background:' + typeBg + ';color:' + typeColor + ';">' + escHtml(s.activity_type) + '</span>' +
                            '<span style="display:inline-block;padding:1px 8px;border-radius:10px;font-size:0.72rem;font-weight:500;background:' + statusBg + ';color:' + statusColor + ';">' + escHtml(s.status) + '</span>' +
                        '</div>' +
                        '<div style="font-size:0.9rem;font-weight:600;color:#111827;line-height:1.4;">' + escHtml(s.course_name) + '</div>' +
                        '<div style="font-size:0.82rem;color:#374151;margin-top:2px;">' + escHtml(s.scheduled_teacher) + (hasSub ? ' <span style="color:#EF4444;">→ ' + escHtml(s.substitute_teacher) + '（代课）</span>' : '') + '</div>' +
                        (s.location ? '<div style="font-size:0.78rem;color:#9ca3af;margin-top:2px;">📍 ' + escHtml(s.location) + '</div>' : '') +
                        (s.reason ? '<div style="font-size:0.78rem;color:#EF4444;margin-top:2px;">原因：' + escHtml(s.reason) + '</div>' : '') +
                    '</div>' +
                    '<div style="display:flex;gap:6px;flex-shrink:0;margin-left:12px;">' +
                        '<button class="btn btn-sm" style="background:#E0F2FE;color:#0369A1;padding:2px 10px;" onclick="event.stopPropagation();editDailySessionForClubCal(' + s.id + ',\'' + escJs(s.scheduled_teacher) + '\',\'' + escJs(s.course_name) + '\',\'' + escJs(s.activity_type) + '\',\'' + escJs(s.location || '') + '\',\'' + escJs(s.status) + '\',\'' + escJs(s.substitute_teacher || '') + '\',\'' + escJs(s.reason || '') + '\',\'' + dateStr + '\')">编辑</button>' +
                        '<button class="btn btn-sm" style="background:#FEE2E2;color:#EF4444;padding:2px 10px;" onclick="event.stopPropagation();deleteClubCalSessionFromModal(' + s.id + ')">删除</button>' +
                    '</div></div>';
            }).join('');
        })
        .catch(function() {
            document.getElementById('clubDayModalBody').innerHTML = '<div class="day-no-events">加载失败</div>';
        });
}

function openDailySessionForClubDay() {
    if (!clubDayModalDate) return;
    closeModal('clubDayModal');
    _editCalSessionDate = clubCalFormatDate(clubDayModalDate);
    var dateStr = clubCalFormatDate(clubDayModalDate);
    document.getElementById('dailySessionModalTitle').textContent = dateStr + ' 添加安排';
    document.getElementById('dailySessionId').value = '';
    document.getElementById('dailySessionTeacher').value = '';
    document.getElementById('dailySessionCourse').value = '';
    document.getElementById('dailySessionType').value = '社团';
    document.getElementById('dailySessionLocation').value = '';
    document.getElementById('dailySessionStatus').value = '正常';
    document.getElementById('dailySessionSub').value = '';
    document.getElementById('dailySessionReason').value = '';
    onDailySessionStatusChange();
    populateDailySessionSelects();
    openModal('dailySessionModal');
}

function deleteClubCalSessionFromModal(id) {
    if (!confirm('确定删除该条安排吗？')) return;
    fetch('/api/daily-board/session/' + id, { method: 'DELETE' })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.success) {
                showToast('删除成功', 'success');
                clubDataCache = null;
                loadClubData().then(function(d2) { renderClubMainCal(d2); });
                if (clubDayModalDate) openClubDayModal(clubDayModalDate);
            } else showToast(d.message || '删除失败', 'error');
        });
}

// ========== 小日历 ==========
function renderClubMiniCal() {
    var grid = document.getElementById('clubMiniCalGrid');
    if (!grid) return;
    var y = clubCalDate.getFullYear(), m = clubCalDate.getMonth();
    document.getElementById('clubMiniCalTitle').textContent = y + '年' + (m + 1) + '月';

    var weekHeads = ['一','二','三','四','五','六','日'];
    var html = '';
    weekHeads.forEach(function(w, i) {
        html += '<div class="cal-mini-wd' + (i >= 5 ? ' weekend' : '') + '">' + w + '</div>';
    });

    var firstDow = new Date(y, m, 1).getDay();
    firstDow = firstDow === 0 ? 6 : firstDow - 1; // 周一=0
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();
    var todayStr = clubCalFormatDate(new Date());

    // 上月
    for (var i = firstDow - 1; i >= 0; i--) {
        html += '<div class="cal-mini-day other-month" onclick="clubMiniCalGoDay(' + (prevDays - i) + ', -1)">' + (prevDays - i) + '</div>';
    }
    // 当月
    for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var fullDow = new Date(y, m, d).getDay();
        var isWeekend = fullDow === 0 || fullDow === 6;
        var isToday = dateStr === todayStr;
        var isSelected = clubCalFormatDate(clubCalDate) === dateStr;
        var cls = 'cal-mini-day';
        if (isWeekend) cls += ' weekend';
        if (isToday) cls += ' today';
        if (isSelected) cls += ' selected';
        html += '<div class="' + cls + '" onclick="clubMiniCalGoDay(' + d + ', 0)">' + d + '</div>';
    }
    // 下月
    var totalCells = firstDow + daysInMonth;
    var remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (var dd = 1; dd <= remaining; dd++) {
        html += '<div class="cal-mini-day other-month" onclick="clubMiniCalGoDay(' + dd + ', 1)">' + dd + '</div>';
    }
    grid.innerHTML = html;
}

function clubMiniCalGoDay(day, offset) {
    var m = clubCalDate.getMonth() + offset;
    var y = clubCalDate.getFullYear();
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    clubCalDate = new Date(y, m, day);
    loadClubData().then(renderClubMainCal);
}

function clubMiniCalNav(delta) {
    var m = clubCalDate.getMonth() + delta;
    var y = clubCalDate.getFullYear();
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    // 保持同一天，如果超出则钳制
    var d = Math.min(clubCalDate.getDate(), new Date(y, m + 1, 0).getDate());
    clubCalDate = new Date(y, m, d);
    loadClubData().then(renderClubMainCal);
}

function clubCalNav(delta) {
    var range = clubCalGetViewRange();
    if (clubCalView === 'month') {
        var m = clubCalDate.getMonth() + delta;
        var y = clubCalDate.getFullYear();
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        var d = Math.min(clubCalDate.getDate(), new Date(y, m + 1, 0).getDate());
        clubCalDate = new Date(y, m, d);
    } else {
        clubCalDate.setDate(clubCalDate.getDate() + delta * 7);
    }
    loadClubData().then(renderClubMainCal);
}

function clubCalGoToday() {
    clubCalDate = new Date();
    loadClubData().then(renderClubMainCal);
}

function switchClubCalView(view) {
    clubCalView = view;
    loadClubData().then(renderClubMainCal);
}

// ========== 模态框操作 ==========
function openDailySessionForClubCal() {
    _editCalSessionDate = clubCalFormatDate(clubCalDate);
    var dateStr = clubCalFormatDate(clubCalDate);
    document.getElementById('dailySessionModalTitle').textContent = dateStr + ' 添加安排';
    document.getElementById('dailySessionId').value = '';
    document.getElementById('dailySessionTeacher').value = '';
    document.getElementById('dailySessionCourse').value = '';
    document.getElementById('dailySessionType').value = '社团';
    document.getElementById('dailySessionLocation').value = '';
    document.getElementById('dailySessionStatus').value = '正常';
    document.getElementById('dailySessionSub').value = '';
    document.getElementById('dailySessionReason').value = '';
    onDailySessionStatusChange();
    populateDailySessionSelects();
    openModal('dailySessionModal');
}

function editDailySessionForClubCal(id, teacher, course, type, location, status, subTeacher, reason, date) {
    closeModal('clubDayModal');
    _editCalSessionDate = date || clubCalFormatDate(clubCalDate);
    document.getElementById('dailySessionModalTitle').textContent = _editCalSessionDate + ' 编辑安排';
    document.getElementById('dailySessionId').value = id;
    document.getElementById('dailySessionTeacher').value = teacher || '';
    document.getElementById('dailySessionCourse').value = course || '';
    document.getElementById('dailySessionType').value = type || '社团';
    document.getElementById('dailySessionLocation').value = location || '';
    document.getElementById('dailySessionStatus').value = status || '正常';
    document.getElementById('dailySessionSub').value = subTeacher || '';
    document.getElementById('dailySessionReason').value = reason || '';
    populateDailySessionSelects();
    onDailySessionStatusChange();
    openModal('dailySessionModal');
}

function deleteClubCalSession(id) {
    if (!confirm('确定删除该条安排吗？')) return;
    fetch('/api/daily-board/session/' + id, { method: 'DELETE' })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.success) {
                showToast('删除成功', 'success');
                clubDataCache = null;
                loadClubData().then(renderClubMainCal);
            } else showToast(d.message || '删除失败', 'error');
        });
}

function saveDailySession(e) {
    e.preventDefault();
    var teacher = document.getElementById('dailySessionTeacher').value;
    var dateEl = document.getElementById('clubDailyDate');
    var date = _editCalSessionDate || (dateEl && dateEl.value) || clubCalFormatDate(clubCalDate);
    var status = document.getElementById('dailySessionStatus').value;
    if (!teacher) { showToast('请选择教师', 'error'); return; }
    var body = {
        id: document.getElementById('dailySessionId').value || null,
        course_date: date,
        scheduled_teacher: teacher,
        course_name: document.getElementById('dailySessionCourse').value.trim(),
        activity_type: document.getElementById('dailySessionType').value,
        location: document.getElementById('dailySessionLocation').value.trim(),
        status: status,
        substitute_teacher: status === '请假' ? document.getElementById('dailySessionSub').value : '',
        reason: status === '请假' ? document.getElementById('dailySessionReason').value.trim() : ''
    };
    fetch('/api/daily-board/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if (d.success) {
            showToast('保存成功', 'success');
            closeModal('dailySessionModal');
            _editCalSessionDate = null;
            clubDataCache = null;
            loadClubData().then(renderClubMainCal);
            // 如果日弹窗开着，刷新日弹窗
            if (clubDayModalDate) openClubDayModal(clubDayModalDate);
        } else showToast(d.message || '保存失败', 'error');
    });
}

function renderClubSubstitute(d) {
    if (!d) return;
    document.getElementById('clubSubstituteCount').textContent = d.totals.substitute_count || 0;
    // 代课明细
    var recordsBody = document.getElementById('clubRecordsTable');
    if (!d.records || !d.records.length) {
        recordsBody.innerHTML = '<tr><td colspan="7" class="empty-cell">暂无代课记录</td></tr>';
    } else {
        recordsBody.innerHTML = d.records.map(function(r) {
            return '<tr>' +
                '<td>' + escHtml(r.course_date) + '</td>' +
                '<td>' + escHtml(r.activity_type) + '</td>' +
                '<td>' + escHtml(r.course_name) + '</td>' +
                '<td>' + escHtml(r.original_teacher) + '</td>' +
                '<td>' + escHtml(r.substitute_teacher) + '</td>' +
                '<td>' + escHtml(r.reason) + '</td>' +
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
            return '<tr><td>' + escHtml(r.substitute_teacher) + '</td><td>' + (r.substitute_count || 0) + '</td><td class="subtle-cell">' + escHtml(r.details) + '</td></tr>';
        }).join('');
    }
}

function renderClubTeachers(d) {
    if (!d) return;
    var grid = document.getElementById('clubTeacherRosterGrid');
    if (!grid) return;
    if (!d.teacherRoster || !d.teacherRoster.length) {
        grid.innerHTML = '<div class="empty-cell" style="grid-column:1/-1;text-align:center;padding:40px;">暂无数据，请导入Excel</div>';
    } else {
        grid.innerHTML = d.teacherRoster.map(function(r) {
            var canSub = Number(r.can_substitute) === 1;
            var statusLabel = canSub ? '可代课' : '不可代课';
            var statusColor = canSub ? '#166534' : '#991B1B';
            var statusBg = canSub ? '#DCFCE7' : '#FEE2E2';
            var dotColor = canSub ? '#22C55E' : '#EF4444';
            var subCount = r.substitute_count || 0;
            var leaveCount = r.leave_count || 0;
            var assign = r.current_assignments || '';
            return '<div class="teacher-card" data-teacher-id="' + r.id + '" onclick="openTeacherDetail(event)" title="点击查看/编辑">' +
                '<button class="teacher-card-del" onclick="event.stopPropagation();deleteTeacherFromRoster(' + r.id + ',\'' + escJs(r.teacher_name) + '\')" title="删除">' +
                    '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
                '</button>' +
                '<div class="teacher-card-name">' + escHtml(r.teacher_name) + '</div>' +
                '<div class="teacher-card-status" style="background:' + statusBg + ';color:' + statusColor + ';">' +
                    '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + dotColor + ';margin-right:6px;"></span>' +
                    statusLabel +
                '</div>' +
                (assign ? '<div class="teacher-card-assign" title="' + escHtml(assign) + '">' + escHtml(assign) + '</div>' : '') +
                '<div class="teacher-card-stats">' +
                    '<span class="teacher-card-stat"><strong>' + subCount + '</strong> 代课</span>' +
                    '<span class="teacher-card-stat"><strong>' + leaveCount + '</strong> 请假</span>' +
                '</div>' +
                '</div>';
        }).join('');
    }
}

function openAddTeacherModal() {
    document.getElementById('newTeacherName').value = '';
    document.getElementById('newTeacherCanSub').value = '1';
    document.getElementById('newTeacherAssign').value = '';
    openModal('addTeacherModal');
}

async function saveNewTeacher(e) {
    e.preventDefault();
    var name = document.getElementById('newTeacherName').value.trim();
    if (!name) { showToast('请输入教师姓名', 'error'); return false; }
    try {
        var res = await fetch('/api/substitute-teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacher_name: name,
                can_substitute: parseInt(document.getElementById('newTeacherCanSub').value),
                current_assignments: document.getElementById('newTeacherAssign').value.trim()
            })
        });
        var data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            closeModal('addTeacherModal');
            clubDataCache = null;
            cachedTeachers = [];
            cachedCourses = [];
            loadClubData().then(renderClubTeachers);
        } else {
            showToast(data.message || '添加失败', 'error');
        }
    } catch (err) { showToast('添加失败', 'error'); }
    return false;
}

var _tdTeacher = null; // 当前查看的教师信息

function openTeacherDetail(e) {
    var id = parseInt(e.currentTarget.dataset.teacherId);
    window.location.href = '/teacher-detail?id=' + id;
}

async function queryTeacherDetail() {
    if (!_tdTeacher) return;
    var startDate = document.getElementById('tdStartDate').value;
    var endDate = document.getElementById('tdEndDate').value;
    var params = new URLSearchParams({ teacher_name: _tdTeacher.teacher_name });
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

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
    var typeLabel = { '上课': '上课', '代课': '代课', '请假': '请假' };
    var typeCls = { '上课': 'td-type-class', '代课': 'td-type-sub', '请假': 'td-type-leave' };
    list.innerHTML = data.details.map(function(r) {
        var cls = typeCls[r.type] || '';
        var extra = '';
        if (r.type === '上课' && r.hours) extra = '<span class="td-item-hours">' + r.hours + ' 课时</span>';
        return '<div class="td-item">' +
            '<div class="td-item-top"><span class="td-item-date">' + escHtml(r.course_date) + '</span><span class="td-type-tag ' + cls + '">' + (typeLabel[r.type] || r.type) + '</span>' + (extra || '') + '</div>' +
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
            // 更新 _tdTeacher 缓存
            _tdTeacher.teacher_name = body.teacher_name;
            _tdTeacher.can_substitute = body.can_substitute;
            _tdTeacher.current_assignments = body.current_assignments;
            document.getElementById('tdInfoName').textContent = body.teacher_name;
            document.getElementById('tdInfoCanSub').textContent = body.can_substitute === 1 ? '可代课' : '不可代课';
            document.getElementById('tdInfoAssign').textContent = body.current_assignments || '无';
            document.getElementById('teacherDetailTitle').textContent = body.teacher_name;
            clubDataCache = null;
            cachedTeachers = [];
            cachedCourses = [];
            loadClubData().then(renderClubTeachers);
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
            closeModal('teacherDetailModal');
            clubDataCache = null;
            cachedTeachers = [];
            cachedCourses = [];
            loadClubData().then(renderClubTeachers);
        } else {
            showToast(data.message || '删除失败', 'error');
        }
    } catch (err) { showToast('删除失败', 'error'); }
}

function clearClubFilters() {
    document.getElementById('clubStartDate').value = '';
    document.getElementById('clubEndDate').value = '';
    document.getElementById('clubTeacher').value = '';
    document.getElementById('clubCourse').value = '';
    clubDataCache = null;
    loadClubData().then(renderClubSubstitute);
}

async function clearAllClubData() {
    if (!confirm('确定要清空全部社团/代课数据吗？\n\n这将删除：\n- 教师名单\n- 所有代课记录\n- 所有活动记录\n\n此操作不可恢复！')) return;
    try {
        var res = await fetch('/api/club-data/clear-all', { method: 'DELETE' });
        if (!res.ok) { showToast('请求失败 (' + res.status + ')，请确认已用课程管理员账号登录', 'error'); return; }
        var data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            clubDataCache = null;
            cachedTeachers = [];
            cachedCourses = [];
            loadClubData().then(renderClubTeachers);
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
        if (data.success) { showToast('删除成功', 'success'); clubDataCache = null; loadClubData().then(renderClubSubstitute); }
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
            clubDataCache = null;
            loadClubData().then(renderClubTeachers);
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
    document.getElementById('subLocation').value = '';
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
        location: document.getElementById('subLocation').value,
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
            clubDataCache = null;
            loadClubData().then(renderClubSubstitute);
        } else {
            showToast(data.message || '添加失败', 'error');
        }
    } catch (err) { showToast('添加失败', 'error'); }
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

// ===== 每日查看（社团统计面板内） =====
function loadClubDailyView() {
    var date = document.getElementById('clubDailyDate').value;
    var body = document.getElementById('clubDailyTableBody');
    if (!date) {
        body.innerHTML = '<tr><td colspan="8" class="empty-cell">请选择日期查看</td></tr>';
        document.getElementById('clubDailyNormal').textContent = '0';
        document.getElementById('clubDailySubstitute').textContent = '0';
        document.getElementById('clubDailyLeave').textContent = '0';
        return;
    }

    fetch('/api/daily-board?date=' + encodeURIComponent(date))
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) { showToast(data.message, 'error'); return; }
            var d = data.data;

            document.getElementById('clubDailyNormal').textContent = d.stats.normal;
            document.getElementById('clubDailySubstitute').textContent = d.stats.substitute;
            document.getElementById('clubDailyLeave').textContent = d.stats.leave;

            if (!d.teacherSessions || !d.teacherSessions.length) {
                body.innerHTML = '<tr><td colspan="8" class="empty-cell">当天暂无安排，点击「+ 添加安排」录入</td></tr>';
                return;
            }
            body.innerHTML = d.teacherSessions.map(function(s) {
                var statusTag = s.status === '请假'
                    ? '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:0.82rem;font-weight:600;background:#FEE2E2;color:#991B1B;">请假</span>'
                    : '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:0.82rem;font-weight:600;background:#DCFCE7;color:#166534;">正常</span>';
                var rowStyle = s.status === '请假' ? ' style="background:#FFF7ED;"' : '';
                return '<tr' + rowStyle + '>' +
                    '<td>' + escHtml(s.scheduled_teacher) + '</td>' +
                    '<td>' + escHtml(s.course_name) + '</td>' +
                    '<td>' + escHtml(s.activity_type) + '</td>' +
                    '<td>' + escHtml(s.location) + '</td>' +
                    '<td>' + statusTag + '</td>' +
                    '<td>' + escHtml(s.substitute_teacher) + '</td>' +
                    '<td>' + escHtml(s.reason) + '</td>' +
                    '<td style="white-space:nowrap;">' +
                        '<button class="btn btn-sm" style="background:#E0F2FE;color:#0369A1;padding:4px 10px;margin-right:4px;" onclick="editDailySession(' + s.id + ',\'' + escJs(s.scheduled_teacher) + '\',\'' + escJs(s.course_name) + '\',\'' + escJs(s.activity_type) + '\',\'' + escJs(s.location) + '\',\'' + escJs(s.status) + '\',\'' + escJs(s.substitute_teacher) + '\',\'' + escJs(s.reason || '') + '\')">编辑</button>' +
                        '<button class="btn btn-sm" style="background:#FEE2E2;color:#EF4444;padding:4px 10px;" onclick="deleteDailySession(' + s.id + ')">删除</button>' +
                    '</td></tr>';
            }).join('');
        })
        .catch(function(err) { console.error('loadClubDailyView:', err); });
}

function openDailySessionModal() {
    var date = document.getElementById('clubDailyDate').value;
    if (!date) { showToast('请先选择日期', 'error'); return; }
    document.getElementById('dailySessionModalTitle').textContent = date + ' 添加安排';
    document.getElementById('dailySessionId').value = '';
    document.getElementById('dailySessionTeacher').value = '';
    document.getElementById('dailySessionCourse').value = '';
    document.getElementById('dailySessionType').value = '社团';
    document.getElementById('dailySessionLocation').value = '';
    document.getElementById('dailySessionStatus').value = '正常';
    document.getElementById('dailySessionSub').value = '';
    document.getElementById('dailySessionReason').value = '';
    onDailySessionStatusChange();
    populateDailySessionSelects();
    openModal('dailySessionModal');
}

function editDailySession(id, teacher, course, type, location, status, subTeacher, reason) {
    _editCalSessionDate = null;
    var date = document.getElementById('clubDailyDate').value || dayDetailDate;
    document.getElementById('dailySessionModalTitle').textContent = (date || '') + ' 编辑安排';
    document.getElementById('dailySessionId').value = id;
    document.getElementById('dailySessionTeacher').value = teacher || '';
    document.getElementById('dailySessionCourse').value = course || '';
    document.getElementById('dailySessionType').value = type || '社团';
    document.getElementById('dailySessionLocation').value = location || '';
    document.getElementById('dailySessionStatus').value = status || '正常';
    document.getElementById('dailySessionSub').value = subTeacher || '';
    document.getElementById('dailySessionReason').value = reason || '';
    populateDailySessionSelects();
    onDailySessionStatusChange();
    openModal('dailySessionModal');
}

function onDailySessionStatusChange() {
    var status = document.getElementById('dailySessionStatus').value;
    document.getElementById('dailySessionLeaveFields').style.display = (status === '请假') ? '' : 'none';
}

function populateDailySessionSelects() {
    var teacherSel = document.getElementById('dailySessionTeacher');
    var subSel = document.getElementById('dailySessionSub');
    var datalist = document.getElementById('dailySessionCourseList');

    // 使用缓存的教师名单
    var teacherHtml = '<option value="">请选择教师</option>';
    var subHtml = '<option value="">请选择代课老师</option>';
    if (cachedTeachers.length) {
        cachedTeachers.forEach(function(t) {
            teacherHtml += '<option value="' + escHtml(t.teacher_name) + '">' + escHtml(t.teacher_name) + '</option>';
            subHtml += '<option value="' + escHtml(t.teacher_name) + '">' + escHtml(t.teacher_name) + '</option>';
        });
    }
    teacherSel.innerHTML = teacherHtml;
    subSel.innerHTML = subHtml;

    // 课程名datalist
    if (cachedCourses.length) {
        datalist.innerHTML = cachedCourses.map(function(c) { return '<option value="' + escHtml(c) + '">'; }).join('');
    }
}

function deleteDailySession(id) {
    if (!confirm('确定删除该条安排吗？')) return;
    fetch('/api/daily-board/session/' + id, { method: 'DELETE' })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.success) { showToast('删除成功', 'success'); loadClubDailyView(); }
            else showToast(d.message || '删除失败', 'error');
        });
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    // 所有日期默认设置为当天
    var todayStr = new Date().toISOString().slice(0, 10);
    ['clubDailyDate', 'clubStartDate', 'clubEndDate', 'subDate', 'tdStartDate', 'tdEndDate'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = todayStr;
    });

    checkAuth().then(function(user) {
        if (!user) return;
        loadClubData().then(renderClubOverview);
    });

    // 文件上传拖拽
    initFileUpload('clubFileUploadArea', 'clubFileInput', handleClubFileSelect);

    // 社团日历视图切换
    var tbMonth = document.getElementById('clubTbMonth');
    var tbWeek = document.getElementById('clubTbWeek');
    var tbSchedule = document.getElementById('clubTbSchedule');
    var tbToday = document.getElementById('clubTbToday');
    if (tbMonth) tbMonth.onclick = function() { switchClubCalView('month'); };
    if (tbWeek) tbWeek.onclick = function() { switchClubCalView('week'); };
    if (tbSchedule) tbSchedule.onclick = function() { switchClubCalView('schedule'); };
    if (tbToday) tbToday.onclick = function() { clubCalGoToday(); };
});
