// 恢复侧边栏用户信息（防止刷新闪烁）
(function restoreSidebarUser() {
    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const avatar = localStorage.getItem('sidebarUserAvatar');
    const name = localStorage.getItem('sidebarUserName');

    if (avatar && avatarEl) {
        avatarEl.textContent = avatar;
    }

    if (name && nameEl) {
        nameEl.textContent = name;
    }
})();

// 检查登录状态
let currentUser = null;
let currentExamId = null;
let currentClassId = null;

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (!data.loggedIn) {
            window.location.replace('/login');
            return null;
        }
        currentUser = data.user;
        window.currentUser = data.user; // 暴露给 collab.js
        window.currentExamId = currentExamId; // 暴露给 ai-chat.js
        window.currentClassId = currentClassId; // 暴露给 ai-chat.js
        const avEl = document.getElementById('userAvatar');
        const nmEl = document.getElementById('userName');
        const userRole = data.user.role || 'teacher';
        const roleMap = { admin: '系统管理员', teacher: '班主任', student: '学生', class: '班级' };
        const roleText = roleMap[userRole] || '班主任';
        if (avEl) avEl.textContent = data.user.name.charAt(0);
        if (nmEl) nmEl.textContent = data.user.name + ' ' + roleText;
        localStorage.setItem('sidebarUserAvatar', data.user.name.charAt(0));
        localStorage.setItem('sidebarUserName', data.user.name + ' ' + roleText);

        // 班级角色：只保留美丽学分导航
        if (userRole === 'class') {
            hideNavForClassRole();
        }

        return data.user;
    } catch (err) {
        window.location.replace('/login');
        return null;
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
        /* 仍跳转登录，避免网络错误时按钮看似无反应 */
    }
    try {
        if (window.Collab && typeof Collab.disconnect === 'function') {
            Collab.disconnect();
        }
    } catch (e) {}
    // 清理所有 localStorage 相关项
    localStorage.removeItem('sidebarUserAvatar');
    localStorage.removeItem('sidebarUserName');
    localStorage.removeItem('dashboardExamId');
    localStorage.removeItem('dashboardClassId');
    window.location.replace('/login');
}

// 班级角色：隐藏除美丽学分外的所有导航项
function hideNavForClassRole() {
    document.querySelectorAll('.nav-item:not(.nav-parent)').forEach(el => {
        const href = el.getAttribute('href');
        if (href && href !== '/total-table' && href !== '/events' && !el.closest('.nav-group')) {
            el.style.display = 'none';
        }
    });
    const navDataManage = document.getElementById('navDataManage');
    if (navDataManage) navDataManage.style.display = 'none';
    const navAttendance = document.getElementById('navAttendance');
    if (navAttendance) navAttendance.style.display = 'none';
    // 班级账号隐藏作业管理中的"管理"按钮
    document.querySelectorAll('a[href="/homework-manage"]').forEach(el => {
        el.style.display = 'none';
    });
}

// ===== 教师视角（原有功能） =====

let classRankingChart, classStatsChart, percentileChart, trendChart;

function showChartNoData(chart, message = '暂无数据') {
    chart.setOption({
        title: { text: message, left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } },
        xAxis: { show: false }, yAxis: { show: false }, series: []
    }, true);
}

function hideChartNoData(chart) {
    chart.setOption({ title: { show: false } });
}

function initCharts() {
    classRankingChart = echarts.init(document.getElementById('classRankingChart'));
    classStatsChart = echarts.init(document.getElementById('classStatsChart'));
    percentileChart = echarts.init(document.getElementById('percentileChart'));
    trendChart = echarts.init(document.getElementById('trendChart'));
    window.addEventListener('resize', () => {
        classRankingChart.resize();
        classStatsChart.resize();
        percentileChart.resize();
        trendChart.resize();
    });
}

const EXAM_ORDER = [
    '高一上期中', '高一上期末',
    '高一下期中', '高一下期末',
    '高二上期中', '高二上期末',
    '高二下期中', '高二下期末',
    '高三上期中', '高三上期末',
    '高三下期中', '高三下期末'
];

async function loadClasses() {
    try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        const select = document.getElementById('classSelect');
        if (!data.success || !data.data || data.data.length === 0) {
            select.innerHTML = '<option value="" disabled>暂无班级</option>';
            return;
        }
        const sortedClasses = [...data.data].sort((a, b) => b.id - a.id);
        select.innerHTML = '<option value="" disabled>请选择班级</option>' +
            sortedClasses.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('');
        const savedClassId = localStorage.getItem('dashboardClassId');
        const classId = savedClassId && sortedClasses.some(c => c.id == savedClassId)
            ? savedClassId
            : sortedClasses[0].id;
        select.value = classId;
        currentClassId = classId;
        window.currentClassId = classId; // 暴露给 ai-chat.js
        
        // 设置班级切换事件
        select.onchange = async function() {
            await loadExams(); // 班级切换时重新加载考试，选择该班级有数据的考试
            await loadDashboardData();
        };
    } catch (err) {
        console.error('加载班级列表失败', err);
    }
}

async function loadExams() {
    try {
        const classId = document.getElementById('classSelect').value;
        currentClassId = classId;
        window.currentClassId = classId; // 暴露给 ai-chat.js
        const [examsRes, latestRes] = await Promise.all([
            fetch('/api/exams'),
            classId ? fetch(`/api/teacher/latest-exam-for-class?class_id=${classId}`) : Promise.resolve(null)
        ]);
        
        const data = await examsRes.json();
        const latestData = latestRes ? await latestRes.json() : null;
        
        const select = document.getElementById('examSelectTeacher');
        if (data.data.length === 0) {
            select.innerHTML = '<option value="">暂无考试数据</option>';
            showNoData();
            return;
        }
        const sortedExams = [...data.data].sort((a, b) => {
            const idxA = EXAM_ORDER.indexOf(a.name);
            const idxB = EXAM_ORDER.indexOf(b.name);
            if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
        select.innerHTML = '<option value="" disabled>请选择考试场次</option>' +
            sortedExams.map(exam => `<option value="${exam.id}">${exam.name}</option>`).join('');
        
        const savedExamId = localStorage.getItem('dashboardExamId');
        let examId;
        
        if (savedExamId && sortedExams.some(e => e.id == savedExamId)) {
            examId = savedExamId;
        } else if (latestData && latestData.success && latestData.data && sortedExams.some(e => e.id == latestData.data.id)) {
            examId = latestData.data.id;
        } else {
            examId = sortedExams[0].id;
        }
        
        select.value = examId;
        currentExamId = examId;
        window.currentExamId = examId; // 暴露给 ai-chat.js
        
        // 设置考试切换事件
        select.onchange = loadDashboardData;
    } catch (err) {
        console.error('加载考试列表失败', err);
        showNoData();
    }
}

function showNoData() {
    document.getElementById('classRankingChart').innerHTML = '<div class="ranking-empty">暂无数据</div>';
    showChartNoData(classStatsChart);
    showChartNoData(percentileChart);
    showChartNoData(trendChart);
    document.getElementById('totalStudents').textContent = '-';
    document.getElementById('totalClasses').textContent = '-';
    document.getElementById('avgScore').textContent = '-';
    document.getElementById('maxScore').textContent = '-';
}

async function loadStatsOverview() {
    const classId = document.getElementById('classSelect').value;
    if (!classId) {
        document.getElementById('totalStudents').textContent = '-';
        document.getElementById('totalClasses').textContent = '-';
        return;
    }
    try {
        const [studentsRes, classesRes] = await Promise.all([
            fetch(`/api/students?class_id=${classId}`),
            fetch('/api/classes')
        ]);
        const studentsData = await studentsRes.json();
        const classesData = await classesRes.json();
        const studentIds = new Set();
        if (studentsData.success && studentsData.data) {
            studentsData.data.forEach(s => studentIds.add(s.student_id));
        }
        document.getElementById('totalStudents').textContent = studentIds.size;
        const classCount = classesData.success && classesData.data ? classesData.data.length : 0;
        document.getElementById('totalClasses').textContent = classCount;
    } catch (err) {
        console.error('加载统计概览失败', err);
    }
}

async function loadExamAnalysis() {
    const examId = document.getElementById('examSelectTeacher').value;
    const classId = document.getElementById('classSelect').value;
    if (!examId) { showNoData(); return; }
    try {
        const res = await fetch(`/api/analysis/exam/${examId}${classId ? '?class_id=' + classId : ''}`);
        const data = await res.json();
        if (!data.success || !data.data) { showNoData(); return; }
        const analysis = data.data;
        renderPercentileChart(analysis.percentileAnalysis);
        if (classId) {
            await loadStudentRankings(examId, classId);
        } else {
            document.getElementById('classRankingChart').innerHTML = '<div class="ranking-empty">请选择班级</div>';
            document.getElementById('avgScore').textContent = '-';
            document.getElementById('maxScore').textContent = '-';
        }
        if (classId) {
            await loadSubjectAvgChart(examId, classId);
        } else {
            showChartNoData(classStatsChart);
        }
    } catch (err) {
        console.error('加载分析数据失败', err);
        showNoData();
    }
}

async function loadStudentRankings(examId, classId) {
    try {
        const badge = document.getElementById('rankingChartBadge');
        const className = document.getElementById('classSelect').selectedOptions[0]?.text || '';
        if (badge) badge.textContent = className + ' 总分排名';
        const res = await fetch(`/api/scores?exam_id=${examId}&class_id=${classId}`);
        const data = await res.json();
        const container = document.getElementById('classRankingChart');
        if (!data.success || !data.data || data.data.length === 0) {
            container.innerHTML = '<div class="ranking-empty">暂无排名数据</div>';
            document.getElementById('avgScore').textContent = '-';
            document.getElementById('maxScore').textContent = '-';
            return;
        }
        const studentMap = {};
        data.data.forEach(row => {
            const score = parseFloat(row.total_score);
            if (isNaN(score) || score < 0) return;
            const key = row.stu_no;
            if (!studentMap[key]) {
                studentMap[key] = { stu_no: key, name: row.stu_name, total: 0, count: 0 };
            }
            studentMap[key].total += score;
            studentMap[key].count++;
        });
        const students = Object.values(studentMap);
        if (students.length === 0) {
            container.innerHTML = '<div class="ranking-empty">暂无排名数据</div>';
            document.getElementById('avgScore').textContent = '-';
            document.getElementById('maxScore').textContent = '-';
            return;
        }
        students.sort((a, b) => b.total - a.total);
        const totalSum = students.reduce((sum, s) => sum + s.total, 0);
        document.getElementById('avgScore').textContent = (totalSum / students.length).toFixed(1);
        document.getElementById('maxScore').textContent = students[0].total.toFixed(1);
        let html = '<div class="ranking-list"><table class="ranking-table"><thead><tr><th>排名</th><th>学号</th><th>姓名</th><th>总分</th></tr></thead><tbody>';
        students.forEach((s, i) => {
            const rank = i + 1;
            let cls = '';
            if (rank === 1) cls = 'rank-gold';
            else if (rank === 2) cls = 'rank-silver';
            else if (rank === 3) cls = 'rank-bronze';
            html += `<tr class="${cls}"><td>${rank}</td><td>${s.stu_no}</td><td>${s.name}</td><td>${s.total.toFixed(1)}</td></tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('加载学生排名失败', err);
        document.getElementById('classRankingChart').innerHTML = '<div class="ranking-empty">加载失败</div>';
        document.getElementById('avgScore').textContent = '-';
        document.getElementById('maxScore').textContent = '-';
    }
}

async function loadSubjectAvgChart(examId, classId) {
    try {
        const res = await fetch(`/api/analysis/class-subject-avg?exam_id=${examId}&class_id=${classId}`);
        const data = await res.json();
        const badge = document.getElementById('subjectChartBadge');
        const className = document.getElementById('classSelect').selectedOptions[0]?.text || '';
        if (badge) badge.textContent = className + ' 各学科平均分';
        if (!data.success || !data.data || data.data.length === 0) {
            showChartNoData(classStatsChart, '暂无学科成绩数据');
            return;
        }
        renderClassStatsChart(data.data);
    } catch (err) {
        console.error('加载各科平均分失败', err);
        showChartNoData(classStatsChart, '加载失败');
    }
}

function renderClassRankingChart(data) { }

function renderClassStatsChart(data) {
    if (!data || data.length === 0) { showChartNoData(classStatsChart); return; }
    hideChartNoData(classStatsChart);
    classStatsChart.clear();
    const subjects = data.map(d => d.subject || '未知');
    const avgScores = data.map(d => d.avg_score ? parseFloat(d.avg_score.toFixed(1)) : 0);
    const colors = [
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#818CF8' }, { offset: 1, color: '#4F46E5' }]),
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#34D399' }, { offset: 1, color: '#059669' }]),
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#FBBF24' }, { offset: 1, color: '#D97706' }]),
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#F87171' }, { offset: 1, color: '#DC2626' }]),
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#A78BFA' }, { offset: 1, color: '#7C3AED' }]),
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#67E8F9' }, { offset: 1, color: '#0891B2' }]),
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#FCA5A5' }, { offset: 1, color: '#EF4444' }]),
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#6EE7B7' }, { offset: 1, color: '#10B981' }]),
    ];
    classStatsChart.setOption({
        tooltip: {
            trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function (params) {
                const idx = params[0].dataIndex; const item = data[idx];
                return `${item.subject}<br/>平均分: <b>${item.avg_score ? item.avg_score.toFixed(1) : '-'}</b><br/>参考人数: ${item.student_count || 0}`;
            }
        },
        grid: { left: '3%', right: '4%', bottom: subjects.length > 6 ? '15%' : '8%', top: '8%', containLabel: true },
        xAxis: { type: 'category', data: subjects, axisLabel: { rotate: subjects.length > 5 ? 30 : 0, fontSize: 12 }, axisTick: { alignWithLabel: true } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}' } },
        series: [{ name: '平均分', type: 'bar', barWidth: '45%', data: avgScores.map((score, i) => ({ value: score, itemStyle: { color: colors[i % colors.length], borderRadius: [6, 6, 0, 0] } })), label: { show: true, position: 'top', formatter: '{c}', fontSize: 12, fontWeight: 'bold', color: '#374151' }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(79, 70, 229, 0.3)' } } }],
        animationDuration: 1000, animationEasing: 'cubicOut'
    }, true);
}

function renderPercentileChart(data) {
    if (!data || data.totalStudents === 0) { showChartNoData(percentileChart); return; }
    hideChartNoData(percentileChart);
    percentileChart.clear();
    const percentiles = [];
    const values = [];
    if (data.top30 !== null) { percentiles.push('前30%学生'); values.push(parseFloat(data.top30.toFixed(1))); }
    if (data.top60 !== null) { percentiles.push('前60%学生'); values.push(parseFloat(data.top60.toFixed(1))); }
    if (data.remainder !== null) { percentiles.push('剩余学生'); values.push(parseFloat(data.remainder.toFixed(1))); }
    if (percentiles.length === 0) { showChartNoData(percentileChart); return; }
    percentileChart.setOption({
        tooltip: { trigger: 'axis', formatter: function (params) { return `${params[0].name}<br/>平均分: ${params[0].value}`; } },
        grid: { left: '3%', right: '4%', bottom: '12%', top: '12%', containLabel: true },
        xAxis: { type: 'category', data: percentiles, axisLabel: { fontSize: 14 } },
        yAxis: { type: 'value', min: function (value) { return Math.floor(value.min - 20); }, axisLabel: { fontSize: 12 } },
        series: [{ name: '平均分', type: 'line', data: values, smooth: true, symbol: 'circle', symbolSize: 12, lineStyle: { width: 4, color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#EF4444' }, { offset: 0.5, color: '#F59E0B' }, { offset: 1, color: '#10B981' }]) }, itemStyle: { color: '#4F46E5' }, label: { show: true, position: 'top', formatter: '{c}', fontSize: 16, fontWeight: 'bold', color: '#333' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16, 185, 129, 0.4)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }]) } }],
        animationDuration: 1500, animationEasing: 'cubicOut'
    }, true);
}

async function loadTrendData() {
    try {
        const classId = document.getElementById('classSelect').value;
        const url = classId ? '/api/analysis/trend?class_id=' + classId : '/api/analysis/trend';
        const res = await fetch(url);
        const data = await res.json();
        if (!data.success || !data.data || data.data.length === 0) { showChartNoData(trendChart); return; }
        data.data.sort((a, b) => {
            const idxA = EXAM_ORDER.indexOf(a.exam_name);
            const idxB = EXAM_ORDER.indexOf(b.exam_name);
            return (idxA >= 0 ? idxA : Infinity) - (idxB >= 0 ? idxB : Infinity);
        });
        const validTrendData = data.data.filter(d => d.top30_avg !== null || d.top60_avg !== null || d.remainder_avg !== null);
        if (!classId || validTrendData.length === 0) {
            showChartNoData(trendChart, classId ? '该班级暂无趋势数据' : '请选择班级后查看趋势');
            return;
        }
        renderTrendChart(validTrendData);
    } catch (err) { console.error('加载趋势数据失败', err); }
}

function renderTrendChart(trendData) {
    if (!trendData || trendData.length === 0) { showChartNoData(trendChart); return; }
    hideChartNoData(trendChart);
    trendChart.clear();
    const examNames = trendData.map(d => d.exam_name);
    const fullScoreData = trendData.map(d => d.full_score || null);
    const top30Data = trendData.map(d => d.top30_avg !== null ? parseFloat(d.top30_avg.toFixed(1)) : null);
    const top60Data = trendData.map(d => d.top60_avg !== null ? parseFloat(d.top60_avg.toFixed(1)) : null);
    const remainderData = trendData.map(d => d.remainder_avg !== null ? parseFloat(d.remainder_avg.toFixed(1)) : null);
    trendChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, formatter: function (params) { let html = `<b>${params[0].axisValue}</b><br/>`; params.forEach(p => { if (p.value !== null && p.value !== undefined) { html += `${p.marker} ${p.seriesName}: <b>${p.value}</b><br/>`; } }); return html; } },
        legend: { data: ['满分总分', '前30%学生', '前60%学生', '剩余学生'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '8%', containLabel: true },
        xAxis: { type: 'category', data: examNames, boundaryGap: false, axisLabel: { rotate: 15 } },
        yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
        series: [
            { name: '满分总分', type: 'line', data: fullScoreData, smooth: true, symbol: 'none', lineStyle: { width: 2, type: 'dashed', color: '#D1D5DB' }, itemStyle: { color: '#D1D5DB' } },
            { name: '前30%学生', type: 'line', data: top30Data, smooth: true, symbol: 'diamond', symbolSize: 10, lineStyle: { width: 3, color: '#EF4444' }, itemStyle: { color: '#EF4444' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(239, 68, 68, 0.25)' }, { offset: 1, color: 'rgba(239, 68, 68, 0.03)' }]) } },
            { name: '前60%学生', type: 'line', data: top60Data, smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3, color: '#F59E0B' }, itemStyle: { color: '#F59E0B' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(245, 158, 11, 0.2)' }, { offset: 1, color: 'rgba(245, 158, 11, 0.02)' }]) } },
            { name: '剩余学生', type: 'line', data: remainderData, smooth: true, symbol: 'triangle', symbolSize: 8, lineStyle: { width: 3, color: '#10B981' }, itemStyle: { color: '#10B981' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16, 185, 129, 0.2)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }]) } }
        ],
        animationDuration: 1500, animationEasing: 'cubicOut'
    }, true);
}

async function loadDashboardData() {
    const examId = document.getElementById('examSelectTeacher').value;
    const classId = document.getElementById('classSelect').value;
    currentExamId = examId;
    currentClassId = classId;
    window.currentExamId = examId; // 暴露给 ai-chat.js
    window.currentClassId = classId; // 暴露给 ai-chat.js
    localStorage.setItem('dashboardExamId', examId);
    localStorage.setItem('dashboardClassId', classId);
    await loadStatsOverview();
    await loadExamAnalysis();
    loadTrendData();
}

// ===== 学生视角功能 =====

let radarChart = null;

function onExamChange() {
    if (currentUser && currentUser.role === 'student') {
        loadStudentDashboardData();
    }
}

function setupStudentView() {
    document.getElementById('teacherView').style.display = 'none';
    document.getElementById('studentView').style.display = 'block';
    const navManage = document.getElementById('navDataManage');
    if (navManage) navManage.style.display = 'none';
    const navMlxf = document.getElementById('navMeiliXuefen');
    if (navMlxf) navMlxf.style.display = 'none';

    radarChart = echarts.init(document.getElementById('radarChart'));
    window.addEventListener('resize', () => { if (radarChart) radarChart.resize(); });

    loadStudentExams();
}

async function loadStudentExams() {
    try {
        const [examsRes, latestRes] = await Promise.all([
            fetch('/api/exams'),
            fetch('/api/student/latest-exam-with-data')
        ]);
        const examsData = await examsRes.json();
        const latestData = await latestRes.json();

        const select = document.getElementById('examSelect');
        if (examsData.data.length === 0) {
            select.innerHTML = '<option value="">暂无考试数据</option>';
            return;
        }
        examsData.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        select.innerHTML = examsData.data.map(exam => `<option value="${exam.id}">${exam.name}</option>`).join('');

        let examId;
        if (latestData.success && latestData.data) {
            examId = latestData.data.id;
            select.value = examId;
        } else {
            examId = examsData.data[0].id;
            select.value = examId;
        }
        currentExamId = examId;
        window.currentExamId = examId; // 暴露给 ai-chat.js
        await loadStudentDashboardData();
    } catch (err) {
        console.error('加载考试列表失败', err);
    }
}

async function loadStudentDashboardData() {
    const examId = document.getElementById('examSelect').value;
    currentExamId = examId;
    window.currentExamId = examId; // 暴露给 ai-chat.js
    if (!examId) {
        document.getElementById('studentTotalScore').textContent = '-';
        document.getElementById('studentClassRank').textContent = '-';
        document.getElementById('studentClassName').textContent = '-';
        document.getElementById('studentFullScore').textContent = '-';
        if (radarChart) radarChart.clear();
        return;
    }
    try {
        const res = await fetch(`/api/analysis/student-dashboard?exam_id=${examId}`);
        const result = await res.json();
        if (!result.success || !result.data) {
            document.getElementById('studentTotalScore').textContent = '-';
            document.getElementById('studentClassRank').textContent = '-';
            document.getElementById('studentClassName').textContent = '-';
            document.getElementById('studentFullScore').textContent = '-';
            return;
        }
        const d = result.data;
        document.getElementById('studentTotalScore').textContent = d.total_score !== null ? d.total_score.toFixed(1) : '-';
        document.getElementById('studentClassRank').textContent = d.class_rank !== null ? d.class_rank + '/' + d.total_students : '-';
        document.getElementById('studentClassName').textContent = d.class_name || '-';
        document.getElementById('studentFullScore').textContent = d.full_score || '-';
        renderRadarChart(d.subjects);
    } catch (err) {
        console.error('加载学生成绩失败', err);
    }
}

function renderRadarChart(subjects) {
    if (!radarChart) return;

    if (!subjects || subjects.length === 0) {
        radarChart.clear();
        radarChart.setOption({
            title: { text: '暂无成绩数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } },
            series: []
        }, true);
        return;
    }

    // 雷达图指标
    const indicator = subjects.map(s => ({ name: s.subject, max: 100 }));

    // 分数数组
    const values = subjects.map(s => {
        if (s.status !== 'normal') {
            return null;
        }
        return s.score;
    });

    radarChart.setOption({
        tooltip: { trigger: 'item', formatter: function () { let html = ''; subjects.forEach(s => { let text = ''; if (s.status === '缺考') { text = '<span style="color:#EF4444">缺考</span>'; } else if (s.status === '免修') { text = '<span style="color:#F59E0B">免修</span>'; } else if (s.status === '无成绩') { text = '<span style="color:#9CA3AF">无成绩</span>'; } else { text = `<b>${s.score.toFixed(1)} 分</b>`; } html += `<div style="margin:4px 0;">${s.subject}：${text}</div>`; }); return html; } },
        radar: {
            indicator, shape: 'polygon', splitNumber: 5,
            axisName: {
                formatter: function (name) {
                    const s = subjects.find(x => x.subject === name);
                    if (!s) return name;
                    if (s.status === '缺考') { return `${name}\n{absent|缺考}`; }
                    if (s.status === '免修') { return `${name}\n{exempt|免修}`; }
                    if (s.status === '无成绩') { return `${name}\n{none|无成绩}`; }
                    return name;
                },
                rich: {
                    absent: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
                    exempt: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold' },
                    none: { color: '#9CA3AF', fontSize: 12 }
                },
                color: '#333', fontSize: 14, fontWeight: 600
            },
            splitLine: { lineStyle: { color: 'rgba(0,0,0,0.1)' } },
            splitArea: { areaStyle: { color: ['rgba(79,70,229,0.02)', 'rgba(79,70,229,0.05)'] } },
            axisLine: { lineStyle: { color: 'rgba(0,0,0,0.1)' } }
        },
        series: [{
            type: 'radar',
            data: [{ value: values, name: '各科成绩' }],
            symbol: 'circle', symbolSize: 8,
            itemStyle: { color: '#4F46E5' },
            lineStyle: { width: 3, color: '#4F46E5' },
            areaStyle: { color: 'rgba(79,70,229,0.2)' },
            label: {
                show: true,
                formatter: function (params) { const idx = params.dimensionIndex; const s = subjects[idx]; if (!s) return ''; if (s.status !== 'normal') { return ''; } if (s.status === '免修') return '免修'; if (s.status === '无成绩') return '无成绩'; return s.score.toFixed(1); },
                fontSize: 12, fontWeight: 'bold',
                color: function (params) { const idx = params.dimensionIndex; const s = subjects[idx]; if (!s) return '#4F46E5'; if (s.status === '缺考') return '#EF4444'; if (s.status === '免修') return '#F59E0B'; if (s.status === '无成绩') return '#9CA3AF'; return '#4F46E5'; }
            }
        }]
    }, true);
}

// 初始化
(async function init() {
    const user = await checkAuth();
    if (!user) {
        return; // checkAuth 失败会重定向,直接返回
    }
    if (window.Collab) Collab.connect();
    if (user.role === 'student') {
        setupStudentView();
    } else {
        initCharts();
        await loadClasses();
        await loadExams();
        await loadDashboardData();
        loadTrendData();
    }
})();
