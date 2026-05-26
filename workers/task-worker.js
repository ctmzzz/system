const mysql = require('mysql2/promise');
const ExcelJS = require('exceljs');

const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Saodiseng1',
    database: 'score_analysis',
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
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };
    const totalFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
    const totalBorder = { top: { style: 'medium', color: { argb: 'FF93C5FD' } }, left: thinBorder, bottom: thinBorder, right: thinBorder };

    const wb = new ExcelJS.Workbook();

    for (const month of months) {
        const ws = wb.addWorksheet(month);

        // 固定 5 列 + 学生列
        const FIXED_COLS = 5;

        let rowNum = 1;

        // ===== 表头行 =====
        const headerRow = ws.getRow(rowNum);
        const headers = ['行规目标', '一级指标', '二级指标', '观察点', '评分标准'];
        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.font = { bold: true, size: 10 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = allBorders;
            cell.fill = headerFill;
        });
        students.forEach((s, si) => {
            const cell = headerRow.getCell(FIXED_COLS + 1 + si);
            const shortId = String(s.student_id).slice(-2);
            cell.value = shortId + '\n' + s.name;
            cell.font = { bold: true, size: 9 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = allBorders;
            cell.fill = headerFill;
        });
        headerRow.height = 32;
        rowNum++;

        // ===== 先统计连续分组的 span =====
        const l0Spans = [];
        const l1Spans = [];
        const l2Spans = [];

        let lastL0 = null, lastL1 = null, lastL2 = null;
        let start0 = 0, start1 = 0, start2 = 0;
        for (let i = 0; i <= tree.length; i++) {
            const cur = i < tree.length ? tree[i] : null;

            // l0
            if (!cur || cur.l0 !== lastL0) {
                if (lastL0 !== null) {
                    for (let j = start0; j < i; j++) l0Spans[j] = i - start0;
                }
                if (cur) { lastL0 = cur.l0; start0 = i; }
            }

            // l1（需要同时检查 l0 也一致）
            if (!cur || cur.l1 !== lastL1 || cur.l0 !== tree[start1].l0) {
                if (lastL1 !== null) {
                    for (let j = start1; j < i; j++) l1Spans[j] = i - start1;
                }
                if (cur) { lastL1 = cur.l1; start1 = i; }
            }

            // l2（需要同时检查 l1 和 l0 都一致）
            if (!cur || cur.l2 !== lastL2 || cur.l1 !== tree[start2].l1 || cur.l0 !== tree[start2].l0) {
                if (lastL2 !== null) {
                    for (let j = start2; j < i; j++) l2Spans[j] = i - start2;
                }
                if (cur) { lastL2 = cur.l2; start2 = i; }
            }
        }

        // ===== 填充所有数据行 =====
        const dataStartRow = rowNum;
        let prevL0 = '', prevL1 = '', prevL2 = '';
        for (let i = 0; i < tree.length; i++) {
            const item = tree[i];
            const r = ws.getRow(rowNum);

            // 左侧 5 列
            r.getCell(1).value = item.l0;
            r.getCell(2).value = item.l1;
            r.getCell(3).value = item.l2;
            r.getCell(4).value = item.point;
            r.getCell(5).value = item.score;

            for (let ci = 1; ci <= FIXED_COLS; ci++) {
                const cell = r.getCell(ci);
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.font = { size: 9 };
                cell.border = allBorders;
            }

            // 评分标准列着色
            const scoreCell = r.getCell(5);
            const scoreStr = String(item.score || '');
            if (scoreStr.startsWith('+')) {
                scoreCell.font = { size: 9, color: { argb: 'FF166534' }, bold: true };
            } else if (scoreStr.startsWith('-')) {
                scoreCell.font = { size: 9, color: { argb: 'FF991B1B' }, bold: true };
            } else {
                scoreCell.font = { size: 9, bold: true };
            }

            // 学生列
            students.forEach((s, si) => {
                const key = s.student_id + '_' + (i + 1);
                const data = allData[month][key];
                const val = data ? (parseFloat(data.score) || 0) : 0;
                const cell = r.getCell(FIXED_COLS + 1 + si);
                cell.value = val;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = allBorders;
                cell.font = { size: 9 };
                if (val > 0) {
                    cell.font = { size: 9, color: { argb: 'FF166534' } };
                } else if (val < 0) {
                    cell.font = { size: 9, color: { argb: 'FF991B1B' } };
                }
            });

            r.height = 22;
            rowNum++;
            prevL0 = item.l0;
            prevL1 = item.l1;
            prevL2 = item.l2;
        }

        // ===== 执行合并 =====
        prevL0 = ''; prevL1 = ''; prevL2 = '';
        for (let i = 0; i < tree.length; i++) {
            const item = tree[i];
            const isNewL0 = item.l0 !== prevL0;
            const isNewL1 = isNewL0 || item.l1 !== prevL1;
            const isNewL2 = isNewL1 || item.l2 !== prevL2;

            const excelRow = dataStartRow + i;

            if (isNewL0 && l0Spans[i] > 1) {
                ws.mergeCells(excelRow, 1, excelRow + l0Spans[i] - 1, 1);
            }
            if (isNewL1 && l1Spans[i] > 1) {
                ws.mergeCells(excelRow, 2, excelRow + l1Spans[i] - 1, 2);
            }
            if (isNewL2 && l2Spans[i] > 1) {
                ws.mergeCells(excelRow, 3, excelRow + l2Spans[i] - 1, 3);
            }

            prevL0 = item.l0;
            prevL1 = item.l1;
            prevL2 = item.l2;
        }

        // ===== 总分行 =====
        const totalRow = ws.getRow(rowNum);
        const totalLabelCell = totalRow.getCell(1);
        totalLabelCell.value = '总分';
        totalLabelCell.font = { bold: true, size: 10 };
        totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
        totalLabelCell.fill = totalFill;
        totalLabelCell.border = totalBorder;
        ws.mergeCells(rowNum, 1, rowNum, FIXED_COLS);

        for (let ci = 2; ci <= FIXED_COLS; ci++) {
            const cell = totalRow.getCell(ci);
            cell.border = totalBorder;
            cell.fill = totalFill;
        }

        students.forEach((s, si) => {
            let total = 0;
            for (let i = 0; i < tree.length; i++) {
                const key = s.student_id + '_' + (i + 1);
                const data = allData[month][key];
                if (data) total += parseFloat(data.score) || 0;
            }
            const cell = totalRow.getCell(FIXED_COLS + 1 + si);
            cell.value = total;
            cell.font = { bold: true, size: 9 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = totalBorder;
            cell.fill = totalFill;
            if (total > 0) {
                cell.font = { bold: true, size: 9, color: { argb: 'FF166534' } };
            } else if (total < 0) {
                cell.font = { bold: true, size: 9, color: { argb: 'FF991B1B' } };
            }
        });
        totalRow.height = 26;

        // ===== 列宽 =====
        ws.getColumn(1).width = 12;
        ws.getColumn(2).width = 12;
        ws.getColumn(3).width = 12;
        ws.getColumn(4).width = 28;
        ws.getColumn(5).width = 10;
        for (let si = 0; si < students.length; si++) {
            ws.getColumn(FIXED_COLS + 1 + si).width = 8;
        }

        // 冻结表头
        ws.views = [{ state: 'frozen', ySplit: 1 }];
    }

    const buf = await wb.xlsx.writeBuffer();
    return buf;
}

// 辅助函数：把时间字符串转换为相对于7:50的分钟数
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    // 解析 HH:MM 格式
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const totalMinutes = h * 60 + m;
    // 7:50是 7*60+50 = 470 分钟
    const base = 7 * 60 + 50;
    return totalMinutes - base;
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

    // 1. 先整理日期数据，按月份分组
    const dates = [];
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    // 获取今天的日期（只取日期部分，不考虑时间）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
        const dateOnly = new Date(d);
        dateOnly.setHours(0, 0, 0, 0);
        if (dateOnly <= today) { // 只添加不超过今天的日期
            dates.push(new Date(d));
        }
    }

    // 按月份分组
    const months = [];
    let currentMonth = null;
    dates.forEach((d) => {
        const yearMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const monthName = (d.getMonth() + 1) + '月';
        if (!currentMonth || currentMonth.yearMonth !== yearMonth) {
            currentMonth = { yearMonth, name: monthName, days: [] };
            months.push(currentMonth);
        }
        currentMonth.days.push(new Date(d));
    });

    // 2. 计算最大行数（所有月份中天数最多的那个的天数）
    let maxDays = 0;
    months.forEach((m) => {
        if (m.days.length > maxDays) maxDays = m.days.length;
    });

    // 3. 构建考勤数据映射
    const attMap = {};
    for (const a of (attendanceData || [])) {
        const key = a.student_id + '_' + a.date;
        attMap[key] = a;
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('请假表');

    const thinBorder = { style: 'thin', color: { argb: 'FF000000' } };
    const allBorders = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };

    const weekDayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const monthCols = 8; // 每个月占据8列：月份、日期、星期、迟到时间、旷课时间、请假原因、请假时长、请假单

    // ===== 4. 填充每个学生的数据 =====
    students.forEach((s, studentIndex) => {
        const startRow = 1 + studentIndex * (maxDays + 2); // 每个学生占 (maxDays+2) 行：标题行、列标题行、maxDays个数据行
        const totalCols = months.length * monthCols;

        // 第1行：A1显示“姓名”，B1到...合并显示学生姓名
        const titleRow = ws.getRow(startRow);
        // A1：姓名
        const a1Cell = titleRow.getCell(1);
        a1Cell.value = '姓名';
        a1Cell.font = { bold: true, size: 10 };
        a1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
        a1Cell.border = allBorders;
        a1Cell.fill = headerFill;

        // B1到最后：学生姓名（合并）
        const b1Cell = titleRow.getCell(2);
        b1Cell.value = s.name;
        b1Cell.font = { size: 10 };
        b1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
        b1Cell.border = allBorders;
        for (let c = 2; c <= totalCols; c++) {
            const cell = titleRow.getCell(c);
            cell.border = allBorders;
        }
        ws.mergeCells(startRow, 2, startRow, totalCols);
        titleRow.height = 30;

        // 第2行：列标题行，每个月重复8列
        const headerRow = ws.getRow(startRow + 1);
        // 每个月的列标题
        const monthHeaders = ['月份', '日期', '星期', '迟到时间', '旷课时间', '请假原因', '请假时长', '请假单'];
        let colIndex = 1;
        months.forEach((m) => {
            monthHeaders.forEach((h, hi) => {
                const cell = headerRow.getCell(colIndex + hi);
                cell.value = h;
                cell.font = { bold: true, size: 10 };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = allBorders;
                cell.fill = headerFill;
            });
            colIndex += monthCols;
        });
        headerRow.height = 30;

        // 第3行到第 maxDays+2 行：数据行
        for (let dayIndex = 0; dayIndex < maxDays; dayIndex++) {
            const rowNum = startRow + 2 + dayIndex;
            const row = ws.getRow(rowNum);

            // 每个月的数据列
            let cIndex = 1;
            months.forEach((m) => {
                const day = m.days[dayIndex]; // 取这个月第 dayIndex 天，如果没有就是 undefined

                // 月份列
                const monthCell = row.getCell(cIndex);
                monthCell.alignment = { horizontal: 'center', vertical: 'middle' };
                monthCell.border = allBorders;
                monthCell.font = { size: 10 };

                // 日期列
                const dateCell = row.getCell(cIndex + 1);
                if (day) {
                    dateCell.value = (day.getMonth() + 1) + '月' + day.getDate() + '日';
                }
                dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
                dateCell.border = allBorders;
                dateCell.font = { size: 10 };

                // 星期列
                const weekCell = row.getCell(cIndex + 2);
                if (day) {
                    weekCell.value = weekDayNames[day.getDay()];
                }
                weekCell.alignment = { horizontal: 'center', vertical: 'middle' };
                weekCell.border = allBorders;
                weekCell.font = { size: 10 };

                // 查找这一天的考勤数据
                let att = null;
                if (day) {
                    const dateStr = day.toISOString().slice(0, 10);
                    const key = s.id + '_' + dateStr;
                    att = attMap[key];
                }

                // 迟到时间
                const lateCell = row.getCell(cIndex + 3);
                if (att && att.late_time) {
                    const minutes = timeToMinutes(att.late_time);
                    if (minutes !== null) {
                        lateCell.value = `${minutes}分钟`;
                    } else {
                        lateCell.value = att.late_time;
                    }
                }
                lateCell.alignment = { horizontal: 'center', vertical: 'middle' };
                lateCell.border = allBorders;
                lateCell.font = { size: 10 };

                // 旷课时间
                const absentCell = row.getCell(cIndex + 4);
                if (att && att.absent_time) {
                    const minutes = timeToMinutes(att.absent_time);
                    if (minutes !== null) {
                        absentCell.value = `${minutes}分钟`;
                    } else {
                        absentCell.value = att.absent_time;
                    }
                }
                absentCell.alignment = { horizontal: 'center', vertical: 'middle' };
                absentCell.border = allBorders;
                absentCell.font = { size: 10 };

                // 请假原因
                const reasonCell = row.getCell(cIndex + 5);
                if (att && (att.leave_type || att.remark)) {
                    reasonCell.value = att.leave_type || att.remark || '';
                }
                reasonCell.alignment = { horizontal: 'center', vertical: 'middle' };
                reasonCell.border = allBorders;
                reasonCell.font = { size: 10 };

                // 请假时长
                const durationCell = row.getCell(cIndex + 6);
                if (att && att.leave_duration) {
                    durationCell.value = att.leave_duration;
                }
                durationCell.alignment = { horizontal: 'center', vertical: 'middle' };
                durationCell.border = allBorders;
                durationCell.font = { size: 10 };

                // 请假单
                const noteCell = row.getCell(cIndex + 7);
                if (att && att.leave_with_note === '1') {
                    noteCell.value = '✓';
                }
                noteCell.alignment = { horizontal: 'center', vertical: 'middle' };
                noteCell.border = allBorders;
                noteCell.font = { size: 10 };

                cIndex += monthCols; // 每个月8列
            });

            row.height = 22;
        }

        // 填充每个月的月份列并合并单元格
        months.forEach((m, monthIndex) => {
            let currentStart = startRow + 2;
            const monthCol = 1 + monthIndex * monthCols; // 每个月的第一列
            // 第一个数据行写入月份
            if (m.days.length > 0) {
                ws.getCell(currentStart, monthCol).value = m.name;
            }
            // 合并月份单元格
            if (m.days.length > 1) {
                ws.mergeCells(currentStart, monthCol, currentStart + m.days.length - 1, monthCol);
            }
        });
    });

    // ===== 5. 设置列宽 =====
    let colIdx = 1;
    months.forEach(() => {
        ws.getColumn(colIdx).width = 8;      // 月份
        ws.getColumn(colIdx + 1).width = 10; // 日期
        ws.getColumn(colIdx + 2).width = 8;  // 星期
        ws.getColumn(colIdx + 3).width = 10; // 迟到时间
        ws.getColumn(colIdx + 4).width = 10; // 旷课时间
        ws.getColumn(colIdx + 5).width = 12; // 请假原因
        ws.getColumn(colIdx + 6).width = 10; // 请假时长
        ws.getColumn(colIdx + 7).width = 8;  // 请假单
        colIdx += 8; // 每个月8列
    });

    const buf = await wb.xlsx.writeBuffer();
    return buf;
}// ============ 学生详细分析（多考试多学科） ============
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

const { parentPort } = require('worker_threads');

// ============ 主入口：任务分发 ============
async function processTask(task) {
    const { type, data } = task;
    try {
        let result;
        switch (type) {
            case 'analyze_percentile':
                result = { success: true, data: await analyzePercentile(data) };
                break;

            case 'analyze_trend':
                result = { success: true, data: await analyzeTrend(data) };
                break;

            case 'analyze_student_detail':
                result = { success: true, data: await analyzeStudentDetail(data) };
                break;

            case 'analyze_student_dashboard':
                result = { success: true, data: await analyzeStudentDashboard(data) };
                break;

            case 'export_beauty_scores': {
                const buf = await exportBeautyScores(data);
                result = { success: true, buffer: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
                break;
            }

            case 'export_attendance': {
                const buf = await exportAttendance(data);
                result = { success: true, buffer: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
                break;
            }

            default:
                result = { success: false, message: '未知任务类型: ' + type };
        }
        return result;
    } catch (err) {
        return { success: false, message: err.message };
    }
}

// 监听消息
parentPort.on('message', async (task) => {
    const result = await processTask(task);
    parentPort.postMessage(result);
});

