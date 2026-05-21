const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');

const DB_CONFIG = {
    host: process.env.DB_HOST || '192.168.3.6',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'score_analysis',
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0,
    decimalNumbers: true
};

let pool = null;

function getPool() {
    if (!pool) {
        pool = mysql.createPool(DB_CONFIG);
    }
    return pool;
}

function normalizeSQL(sql) {
    return sql
        .replace(/CAST\s*\(\s*(\S[^)]*?)\s+AS\s+INTEGER\s*\)/gi, 'CAST($1 AS SIGNED)')
        .replace(/CAST\s*\(\s*(\S[^)]*?)\s+AS\s+REAL\s*\)/gi, 'CAST($1 AS DECIMAL(10,2))')
        .replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
        .replace(/last_insert_rowid\(\)/gi, 'LAST_INSERT_ID()')
        .replace(/\bas\s+rank\b/gi, 'as `rank`');
}

async function dbAll(sql, params = []) {
    const p = getPool();
    const [rows] = await p.execute(normalizeSQL(sql), params);
    return rows;
}

async function dbGet(sql, params = []) {
    const [rows] = await getPool().execute(normalizeSQL(sql), params);
    return rows.length > 0 ? rows[0] : null;
}

// ============ 百分位分析 ============
async function analyzePercentile({ examId, classId, userId, userRole }) {
    const isTeacher = userRole === 'teacher';

    let studentTotals;
    if (classId) {
        if (isTeacher) {
            studentTotals = await dbAll(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ? AND s.class_id = ? AND sc.user_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId, classId, userId]);
        } else {
            studentTotals = await dbAll(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ? AND s.class_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId, classId]);
        }
    } else {
        if (isTeacher) {
            studentTotals = await dbAll(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ? AND sc.user_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId, userId]);
        } else {
            studentTotals = await dbAll(`
                SELECT s.student_id, s.name, SUM(CAST(sc.total_score AS REAL)) as total
                FROM scores sc
                JOIN students s ON sc.student_id = s.id
                WHERE sc.exam_id = ?
                  AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                GROUP BY sc.student_id
                HAVING total > 0
                ORDER BY total DESC
            `, [examId]);
        }
    }

    const totals = studentTotals.map(s => s.total);
    const totalStudents = totals.length;

    let top30 = null, top60 = null, remainder = null;

    if (totalStudents > 0) {
        const top30Count = Math.ceil(totalStudents * 0.3);
        const top60Count = Math.ceil(totalStudents * 0.6);

        const top30Values = totals.slice(0, top30Count);
        const top60Values = totals.slice(0, top60Count);
        const remainderValues = totals.slice(top60Count);

        top30 = top30Values.length > 0 ? top30Values.reduce((sum, v) => sum + v, 0) / top30Values.length : null;
        top60 = top60Values.length > 0 ? top60Values.reduce((sum, v) => sum + v, 0) / top60Values.length : null;
        remainder = remainderValues.length > 0 ? remainderValues.reduce((sum, v) => sum + v, 0) / remainderValues.length : null;
    }

    return { top30, top60, remainder, totalStudents, studentTotals };
}

// ============ 趋势分析（多场考试分段趋势） ============
async function analyzeTrend({ classId, userId, userRole }) {
    const isTeacher = userRole === 'teacher';
    const exams = await dbAll('SELECT * FROM exams ORDER BY date');
    const trendData = [];

    for (const exam of exams) {
        let studentTotals;
        if (classId) {
            if (isTeacher) {
                studentTotals = await dbAll(`
                    SELECT SUM(CAST(sc.total_score AS REAL)) as total
                    FROM scores sc
                    JOIN students s ON sc.student_id = s.id
                    WHERE sc.exam_id = ? AND s.class_id = ? AND sc.user_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                    GROUP BY sc.student_id HAVING total > 0 ORDER BY total DESC
                `, [exam.id, classId, userId]);
            } else {
                studentTotals = await dbAll(`
                    SELECT SUM(CAST(sc.total_score AS REAL)) as total
                    FROM scores sc
                    JOIN students s ON sc.student_id = s.id
                    WHERE sc.exam_id = ? AND s.class_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                    GROUP BY sc.student_id HAVING total > 0 ORDER BY total DESC
                `, [exam.id, classId]);
            }
        } else {
            if (isTeacher) {
                studentTotals = await dbAll(`
                    SELECT SUM(CAST(sc.total_score AS REAL)) as total
                    FROM scores sc
                    WHERE sc.exam_id = ? AND sc.user_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                    GROUP BY sc.student_id HAVING total > 0 ORDER BY total DESC
                `, [exam.id, userId]);
            } else {
                studentTotals = await dbAll(`
                    SELECT SUM(CAST(sc.total_score AS REAL)) as total
                    FROM scores sc
                    WHERE sc.exam_id = ?
                      AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
                    GROUP BY sc.student_id HAVING total > 0 ORDER BY total DESC
                `, [exam.id]);
            }
        }

        let subjCount = 0;
        if (classId) {
            if (isTeacher) {
                const r = await dbGet(`SELECT COUNT(DISTINCT sc.subject) as count FROM scores sc JOIN students s ON sc.student_id = s.id WHERE sc.exam_id = ? AND s.class_id = ? AND sc.subject IS NOT NULL AND sc.subject != '' AND sc.user_id = ?`, [exam.id, classId, userId]);
                subjCount = r?.count || 0;
            } else {
                const r = await dbGet(`SELECT COUNT(DISTINCT sc.subject) as count FROM scores sc JOIN students s ON sc.student_id = s.id WHERE sc.exam_id = ? AND s.class_id = ? AND sc.subject IS NOT NULL AND sc.subject != ''`, [exam.id, classId]);
                subjCount = r?.count || 0;
            }
        } else {
            if (isTeacher) {
                const r = await dbGet(`SELECT COUNT(DISTINCT subject) as count FROM scores WHERE exam_id = ? AND subject IS NOT NULL AND subject != '' AND user_id = ?`, [exam.id, userId]);
                subjCount = r?.count || 0;
            } else {
                const r = await dbGet(`SELECT COUNT(DISTINCT subject) as count FROM scores WHERE exam_id = ? AND subject IS NOT NULL AND subject != ''`, [exam.id]);
                subjCount = r?.count || 0;
            }
        }

        const fullScore = subjCount * 100;
        const totals = studentTotals.map(s => s.total);
        const totalCount = totals.length;

        let top30_avg = null, top60_avg = null, remainder_avg = null;
        if (totalCount > 0) {
            const top30Count = Math.ceil(totalCount * 0.3);
            const top60Count = Math.ceil(totalCount * 0.6);
            top30_avg = totals.slice(0, top30Count).reduce((s, v) => s + v, 0) / top30Count;
            top60_avg = totals.slice(0, top60Count).reduce((s, v) => s + v, 0) / top60Count;
            const remArr = totals.slice(top60Count);
            remainder_avg = remArr.length > 0 ? remArr.reduce((s, v) => s + v, 0) / remArr.length : null;
        }

        trendData.push({
            exam_id: exam.id, exam_name: exam.name, exam_date: exam.date,
            full_score: fullScore, top30_avg, top60_avg, remainder_avg
        });
    }

    return trendData;
}

// ============ 美丽学分 Excel 导出 ============
async function exportBeautyScores({ classId, startMonth, endMonth, studentIds, indicatorTree }) {
    let students = await dbAll('SELECT * FROM students WHERE class_id = ? ORDER BY student_id', [classId]);
    if (studentIds && studentIds.length > 0) {
        students = students.filter(s => studentIds.includes(String(s.id)));
    }

    if (students.length === 0) {
        throw new Error('该班级没有学生');
    }

    const [startY, startM] = startMonth.split('-').map(Number);
    const [endY, endM] = endMonth.split('-').map(Number);

    const months = [];
    let cy = startY, cm = startM;
    while (cy < endY || (cy === endY && cm <= endM)) {
        months.push(cy + '-' + String(cm).padStart(2, '0'));
        cm++;
        if (cm > 12) { cm = 1; cy++; }
    }

    const allData = {};
    for (const m of months) {
        const rows = await dbAll(
            'SELECT student_id, row_index, score, events FROM beauty_scores WHERE class_id = ? AND month = ?',
            [classId, m]
        );
        allData[m] = {};
        for (const r of rows) {
            allData[m][r.student_id + '_' + r.row_index] = r;
        }
    }

    const tree = indicatorTree || [];
    const thinBorder = { style: 'thin', color: { argb: 'FF000000' } };
    const allBorders = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };

    const wb = new ExcelJS.Workbook();

    function calcRowspan(arr, key) {
        const map = {};
        let last = null, cnt = 0;
        for (let i = 0; i <= arr.length; i++) {
            const cur = i < arr.length ? arr[i][key] : null;
            if (cur === last) { cnt++; }
            else {
                if (last !== null) map[last] = cnt;
                last = cur;
                cnt = 1;
            }
        }
        return map;
    }

    for (const month of months) {
        const ws = wb.addWorksheet(month);
        const positions = ['', 'Lv1', 'Lv2', 'Lv3', '指标点描述', '分值'];
        students.forEach((s, si) => { positions.push(s.name + (si + 1)); });

        const l0Span = calcRowspan(tree, 'l0');
        const l1Span = calcRowspan(tree, 'l1');
        const l2Span = calcRowspan(tree, 'l2');

        let rowNum = 1;

        // 标题行
        const titleRow = ws.getRow(rowNum);
        titleRow.getCell(1).value = month + ' 美丽学分评价表';
        ws.mergeCells(rowNum, 1, rowNum, positions.length);
        titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        titleRow.getCell(1).font = { bold: true, size: 14 };
        titleRow.height = 30;
        rowNum++;

        // 表头
        const headerRow = ws.getRow(rowNum);
        positions.forEach((p, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = p;
            cell.font = { bold: true, size: 10 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = allBorders;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };
        });
        headerRow.height = 25;
        rowNum++;

        // 指标行
        let l0Start = {};
        let l1Start = {};
        let l2Start = {};

        for (let i = 0; i < tree.length; i++) {
            const item = tree[i];
            const r = ws.getRow(rowNum);

            if (i === 0 || tree[i - 1].l0 !== item.l0) l0Start[item.l0] = rowNum;
            if (i === 0 || tree[i - 1].l1 !== item.l1 || tree[i - 1].l0 !== item.l0) l1Start[item.l1] = rowNum;
            if (i === 0 || tree[i - 1].l2 !== item.l2 || tree[i - 1].l1 !== item.l1 || tree[i - 1].l0 !== item.l0) l2Start[item.l2] = rowNum;

            r.getCell(1).value = item.l0;
            r.getCell(2).value = item.l1;
            r.getCell(3).value = item.l2;
            r.getCell(4).value = item.point;
            r.getCell(5).value = item.score;

            students.forEach((s, si) => {
                const key = s.student_id + '_' + (i + 1);
                const data = allData[month][key];
                const cell = r.getCell(6 + si);
                cell.value = data ? (parseFloat(data.score) || 0) : 0;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = allBorders;
            });

            for (let ci = 1; ci <= 5; ci++) {
                r.getCell(ci).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                r.getCell(ci).font = { size: 9 };
                r.getCell(ci).border = allBorders;
            }
            r.height = 22;
            rowNum++;
        }

        // 合并 L0
        for (const [name, span] of Object.entries(l0Span)) {
            const start = l0Start[name];
            if (start && span > 1) ws.mergeCells(start, 1, start + span - 1, 1);
        }
        // 合并 L1
        for (const [name, span] of Object.entries(l1Span)) {
            const start = l1Start[name];
            if (start && span > 1) ws.mergeCells(start, 2, start + span - 1, 2);
        }
        // 合并 L2
        for (const [name, span] of Object.entries(l2Span)) {
            const start = l2Start[name];
            if (start && span > 1) ws.mergeCells(start, 3, start + span - 1, 3);
        }

        // 列宽
        ws.getColumn(1).width = 12;
        ws.getColumn(2).width = 10;
        ws.getColumn(3).width = 12;
        ws.getColumn(4).width = 28;
        ws.getColumn(5).width = 8;
        for (let si = 0; si < students.length; si++) {
            ws.getColumn(6 + si).width = 8;
        }
    }

    const buf = await wb.xlsx.writeBuffer();
    return buf;
}

// ============ 考勤导出 ============
async function exportAttendance({ classId, startDate, endDate, studentIds, attendanceData }) {
    let students = await dbAll('SELECT * FROM students WHERE class_id = ? ORDER BY CAST(student_id AS UNSIGNED)', [classId]);
    if (studentIds && studentIds.length > 0) {
        students = students.filter(s => studentIds.includes(String(s.id)));
    }

    if (students.length === 0) {
        throw new Error('该班级没有学生');
    }

    const dates = [];
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().slice(0, 10));
    }

    const attMap = {};
    for (const a of (attendanceData || [])) {
        const key = a.student_id + '_' + a.date;
        attMap[key] = a;
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('考勤表');

    const thinBorder = { style: 'thin', color: { argb: 'FF000000' } };
    const allBorders = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };

    // 表头
    ws.getCell(1, 1).value = '序号';
    ws.getCell(1, 2).value = '学号';
    ws.getCell(1, 3).value = '姓名';
    dates.forEach((d, i) => {
        ws.getCell(1, 4 + i).value = d;
    });

    const headerRow = ws.getRow(1);
    for (let ci = 1; ci <= 3 + dates.length; ci++) {
        const cell = headerRow.getCell(ci);
        cell.font = { bold: true, size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = allBorders;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };
    }
    headerRow.height = 30;

    students.forEach((s, si) => {
        const r = ws.getRow(si + 2);
        r.getCell(1).value = si + 1;
        r.getCell(2).value = s.student_id;
        r.getCell(3).value = s.name;

        dates.forEach((d, di) => {
            const key = s.id + '_' + d;
            const att = attMap[key];
            const cell = r.getCell(4 + di);
            let display = '';
            if (att) {
                switch (att.status) {
                    case 'present': display = '✓'; break;
                    case 'absent': display = '✗'; break;
                    case 'late': display = '迟到(' + (att.late_time || '') + ')'; break;
                    case 'leave': display = '请假(' + (att.leave_type || '') + ')'; break;
                    default: display = att.status;
                }
            }
            cell.value = display;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = allBorders;
            if (att && att.status === 'absent') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
            }
        });

        for (let ci = 1; ci <= 3; ci++) {
            r.getCell(ci).alignment = { horizontal: 'center', vertical: 'middle' };
            r.getCell(ci).border = allBorders;
        }
        r.height = 22;
    });

    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 14;
    ws.getColumn(3).width = 10;
    dates.forEach((d, di) => {
        ws.getColumn(4 + di).width = 12;
    });

    const buf = await wb.xlsx.writeBuffer();
    return buf;
}

// ============ 学生详细分析（多考试多学科） ============
async function analyzeStudentDetail({ studentId, classId }) {
    const student = await dbGet('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) throw new Error('学生不存在');

    const classInfo = await dbGet('SELECT name FROM classes WHERE id = ?', [classId || student.class_id]);
    const className = classInfo ? classInfo.name : '';

    const countRow = await dbGet('SELECT COUNT(*) as count FROM students WHERE class_id = ?', [student.class_id]);
    const totalStudents = countRow ? countRow.count : 0;

    const subjects = await dbAll(`
        SELECT DISTINCT sc.subject
        FROM scores sc WHERE sc.student_id = ? AND sc.subject IS NOT NULL AND sc.subject != ''
        ORDER BY sc.subject
    `, [studentId]);

    if (subjects.length === 0) {
        return { student_name: student.name, class_name: className, total_students: totalStudents, subjects: [], charts: {}, total_chart: { exams: [], scores: [], ranks: [] }, full_scores: [] };
    }

    const allExams = await dbAll('SELECT * FROM exams ORDER BY date');
    const charts = {};
    const fullScores = [];

    for (const subj of subjects) {
        const chartData = { exams: [], scores: [], ranks: [] };
        for (const exam of allExams) {
            const scoreRow = await dbGet(`
                SELECT sc.total_score FROM scores sc
                WHERE sc.student_id = ? AND sc.exam_id = ? AND sc.subject = ?
                  AND sc.total_score NOT IN ('缺考', '免修')
            `, [studentId, exam.id, subj.subject]);

            if (scoreRow) {
                const scoreVal = parseFloat(scoreRow.total_score);
                const rankRow = await dbGet(`
                    SELECT COUNT(*) + 1 as rank FROM scores sc2
                    JOIN students s2 ON sc2.student_id = s2.id
                    WHERE sc2.exam_id = ? AND sc2.subject = ? AND s2.class_id = ?
                      AND sc2.total_score NOT IN ('缺考', '免修')
                      AND CAST(sc2.total_score AS REAL) > CAST(? AS REAL)
                `, [exam.id, subj.subject, student.class_id, scoreRow.total_score]);

                chartData.exams.push(exam.name);
                chartData.scores.push(scoreVal);
                chartData.ranks.push(rankRow ? rankRow.rank : 1);
            }
        }
        if (chartData.exams.length > 0) charts[subj.subject] = chartData;
    }

    const totalChart = { exams: [], scores: [], ranks: [] };
    for (const exam of allExams) {
        const totalRow = await dbGet(`
            SELECT SUM(CAST(sc.total_score AS REAL)) as total FROM scores sc
            WHERE sc.student_id = ? AND sc.exam_id = ?
              AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
        `, [studentId, exam.id]);

        if (totalRow && totalRow.total !== null) {
            const totalVal = totalRow.total;
            const rankRow = await dbGet(`
                SELECT COUNT(*) + 1 as rank FROM (
                    SELECT sc2.student_id, SUM(CAST(sc2.total_score AS REAL)) as s_total
                    FROM scores sc2 JOIN students s2 ON sc2.student_id = s2.id
                    WHERE sc2.exam_id = ? AND s2.class_id = ?
                      AND sc2.total_score NOT IN ('缺考', '免修') AND CAST(sc2.total_score AS REAL) >= 0
                    GROUP BY sc2.student_id HAVING s_total > ?
                ) AS t
            `, [exam.id, student.class_id, totalVal]);

            totalChart.exams.push(exam.name);
            totalChart.scores.push(totalVal);
            totalChart.ranks.push(rankRow ? rankRow.rank : 1);
        }
    }

    for (const exam of allExams) {
        const cnt = await dbGet(`SELECT COUNT(DISTINCT subject) as count FROM scores WHERE exam_id = ? AND subject IS NOT NULL AND subject != ''`, [exam.id]);
        fullScores.push((cnt?.count || 0) * 100);
    }

    return {
        student_name: student.name, class_name: className, total_students: totalStudents,
        subjects: Object.keys(charts), charts, total_chart: totalChart, full_scores: fullScores
    };
}

// ============ 学生仪表盘分析 ============
async function analyzeStudentDashboard({ studentId, examId }) {
    const student = await dbGet('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) throw new Error('学生不存在');

    const classInfo = await dbGet('SELECT name FROM classes WHERE id = ?', [student.class_id]);
    const className = classInfo ? classInfo.name : '';

    const allSubjects = await dbAll(`
        SELECT DISTINCT sc.subject FROM scores sc
        WHERE sc.exam_id = ? AND sc.subject IS NOT NULL AND sc.subject != ''
        ORDER BY sc.subject
    `, [examId]);

    const studentScores = await dbAll(`
        SELECT sc.subject, sc.total_score FROM scores sc
        WHERE sc.student_id = ? AND sc.exam_id = ?
        ORDER BY sc.subject
    `, [student.id, examId]);

    const subjectScores = allSubjects.map(subj => {
        const found = studentScores.find(s => s.subject === subj.subject);
        if (found) {
            const raw = found.total_score;
            if (raw === '缺考' || raw === '免修') return { subject: subj.subject, score: 0, status: raw };
            return { subject: subj.subject, score: parseFloat(raw), status: 'normal' };
        }
        return { subject: subj.subject, score: 0, status: '无成绩' };
    });

    const totalRow = await dbGet(`
        SELECT SUM(CAST(sc.total_score AS REAL)) as total FROM scores sc
        WHERE sc.student_id = ? AND sc.exam_id = ?
          AND sc.total_score NOT IN ('缺考', '免修') AND CAST(sc.total_score AS REAL) >= 0
    `, [student.id, examId]);

    const totalScore = totalRow && totalRow.total ? totalRow.total : 0;

    const fullScoreRow = await dbGet(`
        SELECT COUNT(DISTINCT subject) as count FROM scores
        WHERE exam_id = ? AND subject IS NOT NULL AND subject != ''
    `, [examId]);
    const fullScore = (fullScoreRow?.count || 0) * 100;

    const classRankRow = await dbGet(`
        SELECT COUNT(*) + 1 as rank FROM (
            SELECT sc2.student_id, SUM(CAST(sc2.total_score AS REAL)) as s_total
            FROM scores sc2 JOIN students s2 ON sc2.student_id = s2.id
            WHERE sc2.exam_id = ? AND s2.class_id = ?
              AND sc2.total_score NOT IN ('缺考', '免修') AND CAST(sc2.total_score AS REAL) >= 0
            GROUP BY sc2.student_id HAVING s_total > ?
        ) AS t
    `, [examId, student.class_id, totalScore]);

    const classRank = classRankRow ? classRankRow.rank : 1;
    const totalCountRow = await dbGet('SELECT COUNT(*) as count FROM students WHERE class_id = ?', [student.class_id]);
    const totalStudents = totalCountRow ? totalCountRow.count : 0;

    return {
        student_name: student.name, class_name: className, exam_id: parseInt(examId),
        total_score: totalScore, full_score: fullScore, class_rank: classRank,
        total_students: totalStudents, subjects: subjectScores
    };
}

// ============ 主入口：任务分发 ============
module.exports = async (task) => {
    const { type, data } = task;
    try {
        switch (type) {
            case 'analyze_percentile':
                return { success: true, data: await analyzePercentile(data) };

            case 'analyze_trend':
                return { success: true, data: await analyzeTrend(data) };

            case 'analyze_student_detail':
                return { success: true, data: await analyzeStudentDetail(data) };

            case 'analyze_student_dashboard':
                return { success: true, data: await analyzeStudentDashboard(data) };

            case 'export_beauty_scores': {
                const buf = await exportBeautyScores(data);
                // 返回 ArrayBuffer 的 transfer list 形式
                return { success: true, buffer: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
            }

            case 'export_attendance': {
                const buf = await exportAttendance(data);
                return { success: true, buffer: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
            }

            default:
                return { success: false, message: '未知任务类型: ' + type };
        }
    } catch (err) {
        return { success: false, message: err.message };
    }
};
