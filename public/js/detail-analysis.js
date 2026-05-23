const EXAM_ORDER = [
    '高一上期中', '高一上期末',
    '高一下期中', '高一下期末',
    '高二上期中', '高二上期末',
    '高二下期中', '高二下期末',
    '高三上期中', '高三上期末',
    '高三下期中', '高三下期末'
];

let chartInstances = [];
let homeworkChartInstances = [];
let chartsRendering = false;
let currentDetail = null;
let currentUser = null;

// 检查登录
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (!data.loggedIn) { window.location.href = '/login'; return null; }
        currentUser = data.user;
        window.currentUser = data.user; // 暴露给 collab.js
        const userRole = data.user.role || 'teacher';
        const roleMap = { admin: '系统管理员', teacher: '班主任', student: '学生' };
        const roleText = roleMap[userRole] || '班主任';
        document.getElementById('userName').textContent = data.user.name + ' ' + roleText;
        document.getElementById('userAvatar').textContent = data.user.name.charAt(0);
        localStorage.setItem('sidebarUserAvatar', data.user.name.charAt(0));
        localStorage.setItem('sidebarUserName', data.user.name + ' ' + roleText);
        return data.user;
    } catch (e) { window.location.href = '/login'; return null; }
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
}

function printDetail() {
    if (!currentDetail) { alert('请先选择班级和学生'); return; }
    if (chartInstances.length === 0 && homeworkChartInstances.length === 0) { alert('图表加载中，请稍后重试'); return; }
    if (chartsRendering) { alert('数据正在加载，请稍后重试'); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('请允许弹出窗口'); return; }

    // 确定是教师端还是学生端
    const isStudentView = document.getElementById('studentViewTab') && 
                         document.getElementById('studentViewTab').style.display === 'flex';
    const homeworkSectionId = isStudentView ? 'studentHomeworkSection' : 'homeworkSection';
    const homeworkContainerId = isStudentView ? 'studentHomeworkContainer' : 'homeworkContainer';

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>详细汇总打印 - ${currentDetail.student_name}</title>`;
    html += `<style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 20px; background: #fff; }
        .print-header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #4F46E5; }
        .print-title { font-size: 24px; color: #1E1B4B; margin-bottom: 8px; }
        .print-subtitle { font-size: 14px; color: #666; }
        .print-info { display: flex; justify-content: center; gap: 30px; margin: 15px 0; font-size: 14px; color: #333; }
        .print-info span { background: #f5f5f5; padding: 5px 15px; border-radius: 4px; }
        .chart-section { margin-bottom: 30px; page-break-inside: avoid; }
        .chart-title { font-size: 16px; color: #4F46E5; margin-bottom: 10px; padding-left: 10px; border-left: 4px solid #4F46E5; }
        .chart-img { width: 100%; max-width: 800px; height: auto; display: block; margin: 0 auto; }
        .print-footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        .homework-section { margin-bottom: 30px; page-break-inside: avoid; }
        .homework-list { border-collapse: collapse; width: 100%; font-size: 14px; }
        .homework-list th, .homework-list td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .homework-list th { background: #f5f5f5; font-weight: 600; }
        .homework-list .status-unsubmitted { color: #EF4444; font-weight: 600; }
        .homework-list .status-late { color: #F59E0B; font-weight: 600; }
        .homework-empty { color: #666; font-size: 14px; padding: 15px; text-align: center; background: #f9f9f9; border-radius: 8px; }
        @media print { body { padding: 10px; } .chart-section, .homework-section { page-break-inside: avoid; } }
    </style></head><body>`;

    html += `<div class="print-header">
        <div class="print-title">学生成绩详细汇总</div>
        <div class="print-subtitle">上海市经济管理学校 成绩分析系统</div>
        <div class="print-info">
            <span>学生：${currentDetail.student_name || '-'}</span>
            <span>班级：${currentDetail.class_name || '-'}</span>
        </div>
    </div>`;

    // 打印作业部分（放在最前面）
    // 1. 作业统计折线图
    homeworkChartInstances.forEach((chart, idx) => {
        const imgData = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' });
        html += `<div class="chart-section">
            <div class="chart-title">未交作业统计（高一上 - 高三下）</div>
            <img class="chart-img" src="${imgData}" alt="作业统计">
        </div>`;
    });

    // 2. 作业提交情况
    const homeworkSection = document.getElementById(homeworkSectionId);
    const homeworkContainer = document.getElementById(homeworkContainerId);
    if (homeworkSection && homeworkContainer && homeworkSection.style.display !== 'none') {
        html += `<div class="homework-section">
            <div class="chart-title">作业提交情况</div>`;
        
        const homeworkItems = homeworkContainer.querySelectorAll('.homework-item');
        const emptyDiv = homeworkContainer.querySelector('.homework-empty');
        
        if (emptyDiv) {
            html += `<div class="homework-empty">${emptyDiv.textContent}</div>`;
        } else if (homeworkItems.length > 0) {
            html += `<table class="homework-list">
                <thead>
                    <tr><th>学科</th><th>日期</th><th>学期</th><th>状态</th></tr>
                </thead>
                <tbody>`;
            homeworkItems.forEach(item => {
                const subject = item.querySelector('.homework-subject')?.textContent || '';
                const dateSemester = item.querySelector('.homework-date')?.textContent || '';
                const [date, semester] = dateSemester.split(' · ');
                const statusBadge = item.querySelector('.status-badge');
                let status = statusBadge?.textContent || '';
                let statusClass = '';
                if (statusBadge?.classList.contains('status-unsubmitted')) statusClass = 'status-unsubmitted';
                if (statusBadge?.classList.contains('status-late')) statusClass = 'status-late';
                
                html += `<tr>
                    <td>${subject}</td>
                    <td>${date || ''}</td>
                    <td>${semester || ''}</td>
                    <td class="${statusClass}">${status}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }
        
        html += `</div>`;
    }

    // 打印成绩图表
    chartInstances.forEach((chart, idx) => {
        const imgData = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' });
        const domId = chart._dom.id;
        const titleEl = document.querySelector('#' + domId + '.detail-chart-body');
        let title = '图表';
        if (titleEl) {
            const parent = titleEl.closest('.detail-chart-card');
            if (parent) {
                const h3 = parent.querySelector('.detail-chart-title');
                if (h3) title = h3.textContent;
            }
        }
        html += `<div class="chart-section">
            <div class="chart-title">${title}</div>
            <img class="chart-img" src="${imgData}" alt="${title}">
        </div>`;
    });

    html += `<div class="print-footer">打印时间：${new Date().toLocaleString('zh-CN')}</div>`;
    html += `</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
}

function clearCharts() {
    chartInstances.forEach(ch => ch.dispose());
    chartInstances = [];
}

// ===== 教师视角 =====
async function loadClasses() {
    const res = await fetch('/api/classes');
    const data = await res.json();
    const select = document.getElementById('classSelect');
    if (!data.success || !data.data || data.data.length === 0) {
        select.innerHTML = '<option value="">暂无班级</option>'; return;
    }
    data.data.sort((a, b) => b.id - a.id);
    select.innerHTML = '<option value="">请选择班级</option>' +
        data.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadStudents(classId) {
    const res = await fetch(`/api/students?class_id=${classId}`);
    const data = await res.json();
    const select = document.getElementById('studentSelect');
    if (!data.success || !data.data || data.data.length === 0) {
        select.innerHTML = '<option value="">暂无学生</option>'; return;
    }
    select.innerHTML = '<option value="">请选择学生</option>' +
        data.data.map(s => `<option value="${s.id}">${s.student_id} - ${s.name}</option>`).join('');
}

document.getElementById('classSelect').addEventListener('change', function() {
    const classId = this.value;
    window.currentClassId = classId; // 设置全局变量
    window.currentStudentId = null; // 清空学生ID
    const studentSelect = document.getElementById('studentSelect');
    const container = document.getElementById('chartContainer');
    studentSelect.innerHTML = '<option value="">请选择学生</option>';
    studentSelect.disabled = !classId;
    document.getElementById('studentInfo').style.display = 'none';
    document.getElementById('subjectSelect').style.display = 'none';
    document.getElementById('subjectSelect').disabled = true;
    currentDetail = null;
    clearCharts();
    
    // 清空作业部分
    homeworkChartInstances.forEach(ch => ch.dispose());
    homeworkChartInstances = [];
    document.getElementById('homeworkChartSection').style.display = 'none';
    document.getElementById('homeworkSection').style.display = 'none';
    
    if (!classId) {
        container.innerHTML = '<div class="da-empty">请选择班级和学生后查看详细汇总</div>';
        return;
    }
    container.innerHTML = '<div class="da-empty">请选择学生</div>';
    loadStudents(classId);
});

document.getElementById('studentSelect').addEventListener('change', function() {
    const studentId = this.value;
    window.currentStudentId = studentId; // 设置全局变量
    if (!studentId) {
        document.getElementById('studentInfo').style.display = 'none';
        document.getElementById('subjectSelect').style.display = 'none';
        document.getElementById('subjectSelect').disabled = true;
        document.getElementById('chartContainer').innerHTML = '<div class="da-empty">请选择学生</div>';
        currentDetail = null; clearCharts();
        
        // 清空作业部分
        homeworkChartInstances.forEach(ch => ch.dispose());
        homeworkChartInstances = [];
        document.getElementById('homeworkChartSection').style.display = 'none';
        document.getElementById('homeworkSection').style.display = 'none';
        
        return;
    }
    loadStudentDetail(studentId);
});

document.getElementById('subjectSelect').addEventListener('change', function() {
    renderCharts();
});

async function loadStudentDetail(studentId) {
    try {
        // 清空旧的作业图表
        homeworkChartInstances.forEach(ch => ch.dispose());
        homeworkChartInstances = [];
        
        const res = await fetch(`/api/analysis/student-detail?student_id=${studentId}`);
        const data = await res.json();
        if (!data.success || !data.data) {
            document.getElementById('chartContainer').innerHTML = '<div class="da-empty">暂无数据</div>';
            return;
        }
        currentDetail = data.data;
        document.getElementById('infoStudentName').textContent = currentDetail.student_name || '-';
        document.getElementById('infoClassName').textContent = currentDetail.class_name || '-';
        document.getElementById('studentInfo').style.display = 'flex';

        // 加载作业数据（无论有没有成绩都要显示）
        loadHomeworkHistory(studentId);
        loadHomeworkSemesterStats(studentId);

        if ((!currentDetail.subjects || currentDetail.subjects.length === 0) && (!currentDetail.total_chart || currentDetail.total_chart.exams.length === 0)) {
            document.getElementById('chartContainer').innerHTML = '<div class="da-empty">该学生暂无成绩数据</div>';
        } else {
            const subjectSelect = document.getElementById('subjectSelect');
            let subjectOpts = '<option value="">全部学科</option>';
            if (currentDetail.subjects) {
                currentDetail.subjects.forEach(s => { subjectOpts += `<option value="${s}">${s}</option>`; });
            }
            subjectSelect.innerHTML = subjectOpts;
            subjectSelect.value = '';
            subjectSelect.disabled = false;
            subjectSelect.style.display = 'inline-block';

            renderCharts();
        }
    } catch (err) {
        console.error('加载详细汇总失败', err);
        document.getElementById('chartContainer').innerHTML = '<div class="da-empty">加载失败</div>';
    }
}

async function loadHomeworkHistory(studentId, isStudentView = false) {
    console.log('加载作业历史，学生ID:', studentId, '学生视角:', isStudentView);
    try {
        const res = await fetch(`/api/homework-data/student-history?student_id=${studentId}`);
        const data = await res.json();
        console.log('作业数据返回:', data);
        
        const sectionId = isStudentView ? 'studentHomeworkSection' : 'homeworkSection';
        const containerId = isStudentView ? 'studentHomeworkContainer' : 'homeworkContainer';
        const homeworkSection = document.getElementById(sectionId);
        const homeworkContainer = document.getElementById(containerId);
        
        if (!data.success || !data.data || data.data.length === 0) {
            homeworkSection.style.display = 'block';
            homeworkContainer.innerHTML = '<div class="homework-empty">暂无作业数据</div>';
            return;
        }
        
        // 只显示未提交的作业（未提交 或 补交）
        const unsubmittedOnly = data.data.filter(item => item.submitted === 0 || item.late === 1);
        
        homeworkSection.style.display = 'block';
        
        if (unsubmittedOnly.length === 0) {
            homeworkContainer.innerHTML = '<div class="homework-empty">全部已提交</div>';
            return;
        }
        
        let html = '';
        unsubmittedOnly.forEach(item => {
            let statusClass = 'status-unsubmitted';
            let statusText = '未提交';
            
            if (item.late === 1) {
                statusClass = 'status-late';
                statusText = '补交';
            }
            
            html += `
                <div class="homework-item">
                    <div class="homework-left">
                        <div class="homework-subject">${item.subject}</div>
                        <div class="homework-date">${item.date} · ${item.semester}</div>
                    </div>
                    <div class="homework-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
        });
        
        homeworkContainer.innerHTML = html;
    } catch (err) {
        console.error('加载作业历史失败', err);
        const sectionId = isStudentView ? 'studentHomeworkSection' : 'homeworkSection';
        const containerId = isStudentView ? 'studentHomeworkContainer' : 'homeworkContainer';
        const homeworkSection = document.getElementById(sectionId);
        homeworkSection.style.display = 'block';
        document.getElementById(containerId).innerHTML = '<div class="homework-empty">加载失败: ' + err.message + '</div>';
    }
}

async function loadHomeworkSemesterStats(studentId, isStudentView = false) {
    console.log('=== 加载学期未交统计 ===');
    console.log('学生ID:', studentId, '学生视角:', isStudentView);
    try {
        const res = await fetch(`/api/homework-data/student-semester-stats?student_id=${studentId}`);
        const data = await res.json();
        console.log('API返回数据:', data);
        
        const sectionId = isStudentView ? 'studentHomeworkChartSection' : 'homeworkChartSection';
        const containerId = isStudentView ? 'studentHomeworkChartContainer' : 'homeworkChartContainer';
        const homeworkChartSection = document.getElementById(sectionId);
        const homeworkChartContainer = document.getElementById(containerId);
        
        console.log('section 元素:', homeworkChartSection);
        console.log('container 元素:', homeworkChartContainer);
        
        homeworkChartSection.style.display = 'block';
        
        if (!data.success || !data.data || data.data.length === 0) {
            homeworkChartContainer.innerHTML = '<div class="homework-empty">暂无作业统计数据</div>';
            return;
        }
        
        homeworkChartContainer.innerHTML = '';
        
        const labels = data.data.map(item => item.semester);
        const unsubmittedData = data.data.map(item => item.unsubmitted_count);
        console.log('标签:', labels);
        console.log('未交数据:', unsubmittedData);
        
        const options = {
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: labels
            },
            yAxis: { type: 'value' },
            series: [
                {
                    name: '未交次数',
                    type: 'line',
                    data: unsubmittedData,
                    smooth: true,
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
                                { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
                            ]
                        }
                    },
                    itemStyle: { color: '#ef4444' },
                    lineStyle: { color: '#ef4444', width: 3 }
                }
            ]
        };
        
        const chart = echarts.init(homeworkChartContainer);
        chart.setOption(options);
        homeworkChartInstances.push(chart);
    } catch (err) {
        console.error('加载学期未交统计失败', err);
        const sectionId = isStudentView ? 'studentHomeworkChartSection' : 'homeworkChartSection';
        const containerId = isStudentView ? 'studentHomeworkChartContainer' : 'homeworkChartContainer';
        const homeworkChartSection = document.getElementById(sectionId);
        homeworkChartSection.style.display = 'block';
        document.getElementById(containerId).innerHTML = '<div class="homework-empty">加载失败: ' + err.message + '</div>';
    }
}

function renderCharts() {
    if (!currentDetail) return;
    clearCharts();
    const selectedSubject = document.getElementById('subjectSelect').value;
    const container = document.getElementById('chartContainer');
    const printBtn = document.getElementById('printBtn');

    chartsRendering = true;
    // 勿使用 disabled：禁用后 onclick 不会触发，用户看不到「加载中」提示
    if (printBtn) printBtn.classList.add('print-btn-busy');

    let html = '<div class="chart-grid">';
    if (currentDetail.total_chart && currentDetail.total_chart.exams.length > 0) {
        html += `<div class="detail-chart-card full-width"><div class="detail-chart-header"><h3 class="detail-chart-title">总分排名</h3></div><div class="detail-chart-body" id="chart_total"></div></div>`;
    }
    (currentDetail.subjects || []).forEach(subject => {
        if (selectedSubject && subject !== selectedSubject) return;
        const chartData = currentDetail.charts[subject];
        if (!chartData || chartData.exams.length === 0) return;
        html += `<div class="detail-chart-card" data-subject="${subject}"><div class="detail-chart-header"><h3 class="detail-chart-title">${subject}</h3></div><div class="detail-chart-body" id="chart_${subject.replace(/\s+/g, '_')}"></div></div>`;
    });
    html += '</div>';
    container.innerHTML = html;

    const totalStudents = currentDetail.total_students || 60;
    let totalCharts = 0;
    let renderedCharts = 0;

    if (currentDetail.total_chart && currentDetail.total_chart.exams.length > 0) {
        totalCharts++;
    }
    (currentDetail.subjects || []).forEach(subject => {
        if (selectedSubject && subject !== selectedSubject) return;
        const chartData = currentDetail.charts[subject];
        if (!chartData || chartData.exams.length === 0) return;
        totalCharts++;
    });

    if (totalCharts === 0) {
        chartsRendering = false;
        if (printBtn) printBtn.classList.remove('print-btn-busy');
        return;
    }

    const checkDone = () => {
        renderedCharts++;
        if (renderedCharts >= totalCharts) {
            const waitTime = totalCharts * 800 + 200;
            setTimeout(() => {
                chartsRendering = false;
                if (printBtn) printBtn.classList.remove('print-btn-busy');
            }, waitTime);
        }
    };

    if (currentDetail.total_chart && currentDetail.total_chart.exams.length > 0) {
        const fullScoreMax = Math.max(...(currentDetail.full_scores || [0]));
        setTimeout(() => {
            renderSubjectChart('chart_total', '总分', currentDetail.total_chart, currentDetail.full_scores, fullScoreMax, totalStudents);
            checkDone();
        }, 0);
    }
    let idx = 0;
    (currentDetail.subjects || []).forEach(subject => {
        if (selectedSubject && subject !== selectedSubject) return;
        const chartData = currentDetail.charts[subject];
        if (!chartData || chartData.exams.length === 0) return;
        const domId = 'chart_' + subject.replace(/\s+/g, '_');
        setTimeout(() => {
            renderSubjectChart(domId, subject, chartData, currentDetail.full_scores, 100, totalStudents);
            checkDone();
        }, (idx + 1) * 100);
        idx++;
    });
}

function renderSubjectChart(domId, subject, chartData, fullScores, maxScore, totalStudents) {
    const dom = document.getElementById(domId);
    if (!dom) return;
    const chart = echarts.init(dom);
    chartInstances.push(chart);

    const activeExams = [];
    const scores = [];
    const ranks = [];
    EXAM_ORDER.forEach(exam => {
        const idx = chartData.exams.indexOf(exam);
        if (idx !== -1) {
            activeExams.push(exam);
            scores.push(chartData.scores[idx]);
            ranks.push(chartData.ranks[idx]);
        }
    });

    const maxRank = totalStudents || 60;

    chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, formatter: function(params) {
            let html = `<b>${params[0].axisValue}</b><br/>`;
            params.forEach(p => {
                if (p.value !== null && p.value !== undefined) {
                    let val = p.value;
                    if (p.seriesName === '排名') val = '第' + val + '名';
                    html += `${p.marker} ${p.seriesName}: <b>${val}</b><br/>`;
                }
            });
            return html;
        }},
        legend: { data: ['分数', '排名'], bottom: 0 },
        grid: { left: '8%', right: '8%', bottom: '22%', top: '12%', containLabel: true },
        xAxis: { type: 'category', data: activeExams, boundaryGap: false, axisLabel: { rotate: 15, fontSize: 11 } },
        yAxis: [
            { type: 'value', name: '分数', min: 0, max: Math.max(maxScore || 100, ...scores.filter(s => s !== null).map(s => Math.ceil(s / 10) * 10 + 10)), position: 'left', axisLabel: { formatter: '{value}' } },
            { type: 'value', name: '排名', min: 0, max: maxRank + 1, position: 'right', inverse: true, axisLabel: { formatter: '{value}名' }, splitLine: { show: false } }
        ],
        series: [
            { name: '分数', type: 'line', yAxisIndex: 0, data: scores, smooth: true, symbol: 'circle', symbolSize: 10, lineStyle: { width: 3, color: '#4F46E5' }, itemStyle: { color: '#4F46E5' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(79, 70, 229, 0.3)' }, { offset: 1, color: 'rgba(79, 70, 229, 0.05)' }]) }, label: { show: true, position: 'top', formatter: '{c}', fontSize: 11, fontWeight: 'bold' } },
            { name: '排名', type: 'line', yAxisIndex: 1, data: ranks, smooth: true, symbol: 'diamond', symbolSize: 10, lineStyle: { width: 3, color: '#10B981' }, itemStyle: { color: '#10B981' }, label: { show: true, position: 'bottom', formatter: '第{c}名', fontSize: 10, color: '#059669' } }
        ],
        animationDuration: 800, animationEasing: 'cubicOut'
    }, true);
}

// ===== 学生视角 =====
function setupStudentView() {
    document.getElementById('teacherDAView').style.display = 'none';
    document.getElementById('studentDAView').style.display = 'block';
    const navManage = document.getElementById('navDataManage');
    if (navManage) navManage.style.display = 'none';
    const navMlxf = document.getElementById('navMeiliXuefen');
    if (navMlxf) navMlxf.style.display = 'none';
    const navAttendance = document.getElementById('navAttendance');
    if (navAttendance) navAttendance.style.display = 'none';
    loadStudentSelfDetail();
}

async function loadStudentSelfDetail() {
    // 清空旧的作业图表
    homeworkChartInstances.forEach(ch => ch.dispose());
    homeworkChartInstances = [];
    
    const container = document.getElementById('studentDAChartContainer');
    container.innerHTML = '<div class="da-empty">加载中...</div>';
    
    try {
        const studentRes = await fetch(`/api/students?student_id=${encodeURIComponent(currentUser.employee_id)}`);
        const studentData = await studentRes.json();
        if (!studentData.success || !studentData.data || studentData.data.length === 0) {
            container.innerHTML = '<div class="da-empty">暂未查询到您的成绩</div>';
            return;
        }
        const studentId = studentData.data[0].id;
        window.currentStudentId = studentId; // 设置全局变量
        window.currentClassId = studentData.data[0].class_id; // 设置班级ID

        const res = await fetch(`/api/analysis/student-detail?student_id=${studentId}`);
        const data = await res.json();
        if (!data.success || !data.data) {
            container.innerHTML = '<div class="da-empty">暂无成绩数据</div>';
            // 即使无成绩也加载作业
            loadHomeworkHistory(studentId, true);
            loadHomeworkSemesterStats(studentId, true);
            return;
        }

        currentDetail = data.data;
        document.getElementById('studentDAName').textContent = currentDetail.student_name || '-';
        document.getElementById('studentDAClass').textContent = currentDetail.class_name || '-';

        renderStudentDetailCharts();
        
        // 加载作业数据
        loadHomeworkHistory(studentId, true);
        loadHomeworkSemesterStats(studentId, true);
    } catch (err) {
        console.error('加载学生详细汇总失败', err);
        container.innerHTML = '<div class="da-empty">加载失败</div>';
    }
}

function renderStudentDetailCharts() {
    if (!currentDetail) return;
    clearCharts();

    const container = document.getElementById('studentDAChartContainer');
    let html = '<div class="chart-grid">';

    if (currentDetail.total_chart && currentDetail.total_chart.exams.length > 0) {
        html += `<div class="detail-chart-card full-width"><div class="detail-chart-header"><h3 class="detail-chart-title">总分排名</h3></div><div class="detail-chart-body" id="stu_chart_total"></div></div>`;
    }
    (currentDetail.subjects || []).forEach(subject => {
        const chartData = currentDetail.charts[subject];
        if (!chartData || chartData.exams.length === 0) return;
        html += `<div class="detail-chart-card" data-subject="${subject}"><div class="detail-chart-header"><h3 class="detail-chart-title">${subject}</h3></div><div class="detail-chart-body" id="stu_chart_${subject.replace(/\s+/g, '_')}"></div></div>`;
    });
    html += '</div>';
    container.innerHTML = html;

    const totalStudents = currentDetail.total_students || 60;
    if (currentDetail.total_chart && currentDetail.total_chart.exams.length > 0) {
        const fullScoreMax = Math.max(...(currentDetail.full_scores || [0]));
        renderSubjectChart('stu_chart_total', '总分', currentDetail.total_chart, currentDetail.full_scores, fullScoreMax, totalStudents);
    }
    let idx = 0;
    (currentDetail.subjects || []).forEach(subject => {
        const chartData = currentDetail.charts[subject];
        if (!chartData || chartData.exams.length === 0) return;
        const domId = 'stu_chart_' + subject.replace(/\s+/g, '_');
        setTimeout(() => renderSubjectChart(domId, subject, chartData, currentDetail.full_scores, 100, totalStudents), idx * 100);
        idx++;
    });
}

// 初始化
(async function init() {
    const user = await checkAuth();
    if (window.Collab) Collab.connect();
    if (user && user.role === 'student') {
        setupStudentView();
    } else {
        await loadClasses();
    }
    window.addEventListener('resize', () => { chartInstances.forEach(ch => ch.resize()); });
})();
