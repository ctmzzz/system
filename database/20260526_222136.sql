-- 备份时间: 2026/5/26 22:21:36
-- 数据库: score_analysis
-- 主机: 192.168.3.6:3306

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `score_analysis` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `score_analysis`;

-- 表: abnormal_accounts
DROP TABLE IF EXISTS `abnormal_accounts`;
CREATE TABLE `abnormal_accounts` (
  `employee_id` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: announcements
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `start_date` varchar(20) DEFAULT '',
  `end_date` varchar(20) DEFAULT '',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `announcements` WRITE;
INSERT INTO `announcements` VALUES (1, '维护公告', '13：00开始维护', '2026-05-12', '2026-05-16', 1, '管理员', 'Tue May 12 2026 23:42:26 GMT+0800 (中国标准时间)', 'Tue May 12 2026 23:42:26 GMT+0800 (中国标准时间)');
UNLOCK TABLES;

-- 表: attendance
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `date` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT 'present',
  `remark` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `late_time` varchar(50) DEFAULT '',
  `leave_time` varchar(50) DEFAULT '',
  `leave_type` varchar(50) DEFAULT '',
  `leave_with_note` varchar(10) DEFAULT '0',
  `leave_duration` varchar(50) DEFAULT '',
  `absent_time` varchar(50) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance` (`class_id`,`student_id`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=414 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `attendance` WRITE;
INSERT INTO `attendance` VALUES (161, 4, 213, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (162, 4, 214, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (163, 4, 215, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (164, 4, 216, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (165, 4, 217, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (166, 4, 218, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (167, 4, 219, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (168, 4, 220, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (169, 4, 221, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (170, 4, 222, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (171, 4, 223, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (172, 4, 224, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (173, 4, 225, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (174, 4, 226, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (175, 4, 227, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (176, 4, 228, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (177, 4, 229, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (178, 4, 230, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (179, 4, 231, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (180, 4, 232, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (181, 4, 233, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (182, 4, 234, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (183, 4, 235, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (184, 4, 236, '2026-05-11', 'present', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)', '', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (291, 11, 520, '2026-03-04', 'leave', '', 'Thu May 14 2026 11:17:30 GMT+0800 (中国标准时间)', '', '2026-03-04', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (292, 11, 539, '2026-03-09', 'leave', '', 'Thu May 14 2026 11:18:36 GMT+0800 (中国标准时间)', '', '2026-03-09', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (293, 11, 539, '2026-03-11', 'leave', '', 'Thu May 14 2026 11:13:03 GMT+0800 (中国标准时间)', '', '2026-03-11', '病假', '0', '12：45离校', '');
INSERT INTO `attendance` VALUES (294, 11, 520, '2026-03-12', 'leave', '', 'Thu May 14 2026 11:16:17 GMT+0800 (中国标准时间)', '', '2026-03-12', '病假', '0', '14：00离校', '');
INSERT INTO `attendance` VALUES (295, 11, 535, '2026-03-12', 'leave', '', 'Thu May 14 2026 11:16:17 GMT+0800 (中国标准时间)', '', '2026-03-12', '病假', '0', '12：45离校', '');
INSERT INTO `attendance` VALUES (296, 11, 536, '2026-03-12', 'leave', '', 'Thu May 14 2026 11:16:17 GMT+0800 (中国标准时间)', '', '2026-03-12', '事假', '0', '一天', '');
INSERT INTO `attendance` VALUES (297, 11, 539, '2026-03-12', 'leave', '', 'Thu May 14 2026 11:16:17 GMT+0800 (中国标准时间)', '', '2026-03-12', '事假', '0', '一天', '');
INSERT INTO `attendance` VALUES (298, 11, 515, '2026-03-04', 'late', '', 'Thu May 14 2026 11:17:30 GMT+0800 (中国标准时间)', '08:35', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (299, 11, 526, '2026-03-04', 'late', '', 'Thu May 14 2026 11:17:30 GMT+0800 (中国标准时间)', '08:35', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (300, 11, 534, '2026-03-09', 'late', '', 'Thu May 14 2026 11:18:36 GMT+0800 (中国标准时间)', '07:51', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (301, 11, 537, '2026-03-10', 'late', '', 'Thu May 14 2026 11:19:54 GMT+0800 (中国标准时间)', '08:00', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (302, 11, 520, '2026-03-10', 'leave', '', 'Thu May 14 2026 11:19:54 GMT+0800 (中国标准时间)', '', '2026-03-10', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (303, 11, 536, '2026-03-13', 'leave', '', 'Thu May 14 2026 11:21:01 GMT+0800 (中国标准时间)', '', '2026-03-13', '事假', '0', '一天', '');
INSERT INTO `attendance` VALUES (304, 11, 539, '2026-03-13', 'leave', '', 'Thu May 14 2026 11:21:01 GMT+0800 (中国标准时间)', '', '2026-03-13', '事假', '0', '一天', '');
INSERT INTO `attendance` VALUES (305, 11, 509, '2026-03-17', 'leave', '', 'Thu May 14 2026 11:22:43 GMT+0800 (中国标准时间)', '', '2026-03-17', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (306, 11, 510, '2026-03-17', 'late', '', 'Thu May 14 2026 11:22:43 GMT+0800 (中国标准时间)', '07:52', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (307, 11, 520, '2026-03-17', 'leave', '', 'Thu May 14 2026 11:22:43 GMT+0800 (中国标准时间)', '', '2026-03-17', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (308, 11, 534, '2026-03-17', 'leave', '', 'Thu May 14 2026 11:22:43 GMT+0800 (中国标准时间)', '', '2026-03-17', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (309, 11, 539, '2026-03-17', 'leave', '', 'Thu May 14 2026 11:22:43 GMT+0800 (中国标准时间)', '', '2026-03-17', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (310, 11, 520, '2026-03-18', 'leave', '', 'Thu May 14 2026 11:24:33 GMT+0800 (中国标准时间)', '', '2026-03-18', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (311, 11, 534, '2026-03-18', 'late', '', 'Thu May 14 2026 11:24:33 GMT+0800 (中国标准时间)', '08:21', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (312, 11, 539, '2026-03-18', 'leave', '', 'Thu May 14 2026 11:24:33 GMT+0800 (中国标准时间)', '', '2026-03-18', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (313, 11, 541, '2026-03-18', 'late', '', 'Thu May 14 2026 11:24:33 GMT+0800 (中国标准时间)', '07:57', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (314, 11, 509, '2026-03-19', 'leave', '', 'Thu May 14 2026 12:03:44 GMT+0800 (中国标准时间)', '', '2026-03-19', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (315, 11, 520, '2026-03-19', 'leave', '', 'Thu May 14 2026 12:03:44 GMT+0800 (中国标准时间)', '', '2026-03-19', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (316, 11, 539, '2026-03-19', 'leave', '', 'Thu May 14 2026 12:03:44 GMT+0800 (中国标准时间)', '', '2026-03-19', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (317, 11, 509, '2026-03-20', 'leave', '', 'Thu May 14 2026 12:04:53 GMT+0800 (中国标准时间)', '', '2026-03-20', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (318, 11, 520, '2026-03-20', 'leave', '', 'Thu May 14 2026 12:04:53 GMT+0800 (中国标准时间)', '', '2026-03-20', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (319, 11, 534, '2026-03-20', 'late', '', 'Thu May 14 2026 12:04:53 GMT+0800 (中国标准时间)', '08:11', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (320, 11, 535, '2026-03-20', 'late', '', 'Thu May 14 2026 12:04:53 GMT+0800 (中国标准时间)', '07:57', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (321, 11, 509, '2026-03-23', 'leave', '', 'Thu May 14 2026 12:12:01 GMT+0800 (中国标准时间)', '', '2026-03-23', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (322, 11, 520, '2026-03-23', 'leave', '', 'Thu May 14 2026 12:12:01 GMT+0800 (中国标准时间)', '', '2026-03-23', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (323, 11, 539, '2026-03-23', 'late', '', 'Thu May 14 2026 12:12:01 GMT+0800 (中国标准时间)', '09:53', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (324, 11, 509, '2026-03-24', 'leave', '', 'Thu May 14 2026 12:14:15 GMT+0800 (中国标准时间)', '', '2026-03-24', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (325, 11, 517, '2026-03-24', 'leave', '', 'Thu May 14 2026 12:14:15 GMT+0800 (中国标准时间)', '', '2026-03-24', '病假', '0', '看牙（10：05到）', '');
INSERT INTO `attendance` VALUES (326, 11, 534, '2026-03-24', 'late', '', 'Thu May 14 2026 12:14:15 GMT+0800 (中国标准时间)', '08:00', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (327, 11, 539, '2026-03-24', 'late', '', 'Thu May 14 2026 12:14:15 GMT+0800 (中国标准时间)', '10:12', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (328, 11, 509, '2026-03-25', 'leave', '', 'Thu May 14 2026 12:15:46 GMT+0800 (中国标准时间)', '', '2026-03-25', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (329, 11, 520, '2026-03-25', 'leave', '', 'Thu May 14 2026 12:15:46 GMT+0800 (中国标准时间)', '', '2026-03-25', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (330, 11, 534, '2026-03-25', 'late', '', 'Thu May 14 2026 12:15:46 GMT+0800 (中国标准时间)', '08:05', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (331, 11, 539, '2026-03-25', 'late', '', 'Thu May 14 2026 12:15:46 GMT+0800 (中国标准时间)', '07:56', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (332, 11, 509, '2026-03-26', 'leave', '', 'Thu May 14 2026 12:16:06 GMT+0800 (中国标准时间)', '', '2026-03-26', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (333, 11, 520, '2026-03-26', 'leave', '', 'Thu May 14 2026 12:16:06 GMT+0800 (中国标准时间)', '', '2026-03-26', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (334, 11, 509, '2026-03-27', 'leave', '', 'Thu May 14 2026 12:17:04 GMT+0800 (中国标准时间)', '', '2026-03-27', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (335, 11, 520, '2026-03-27', 'leave', '', 'Thu May 14 2026 12:17:04 GMT+0800 (中国标准时间)', '', '2026-03-27', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (336, 11, 534, '2026-03-27', 'late', '', 'Thu May 14 2026 12:17:04 GMT+0800 (中国标准时间)', '08:08', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (337, 11, 539, '2026-03-27', 'late', '', 'Thu May 14 2026 12:17:04 GMT+0800 (中国标准时间)', '07:51', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (338, 11, 509, '2026-03-30', 'leave', '', 'Thu May 14 2026 12:18:19 GMT+0800 (中国标准时间)', '', '2026-03-30', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (339, 11, 520, '2026-03-30', 'leave', '', 'Thu May 14 2026 12:18:19 GMT+0800 (中国标准时间)', '', '2026-03-30', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (340, 11, 524, '2026-03-30', 'leave', '', 'Thu May 14 2026 12:18:19 GMT+0800 (中国标准时间)', '', '2026-03-30', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (341, 11, 539, '2026-03-30', 'leave', '', 'Thu May 14 2026 12:18:19 GMT+0800 (中国标准时间)', '', '2026-03-30', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (342, 11, 509, '2026-03-31', 'leave', '', 'Thu May 14 2026 12:19:31 GMT+0800 (中国标准时间)', '', '2026-03-31', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (343, 11, 524, '2026-03-31', 'leave', '', 'Thu May 14 2026 12:19:31 GMT+0800 (中国标准时间)', '', '2026-03-31', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (344, 11, 539, '2026-03-31', 'leave', '', 'Thu May 14 2026 12:19:31 GMT+0800 (中国标准时间)', '', '2026-03-31', '病假', '0', '看牙（11：00到）', '');
INSERT INTO `attendance` VALUES (345, 11, 520, '2026-04-01', 'leave', '', 'Thu May 14 2026 12:29:02 GMT+0800 (中国标准时间)', '', '2026-04-01', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (346, 11, 539, '2026-04-01', 'late', '', 'Thu May 14 2026 12:29:02 GMT+0800 (中国标准时间)', '07:59', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (347, 11, 509, '2026-04-02', 'leave', '', 'Thu May 14 2026 12:24:17 GMT+0800 (中国标准时间)', '', '2026-04-02', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (348, 11, 520, '2026-04-02', 'leave', '', 'Thu May 14 2026 12:24:17 GMT+0800 (中国标准时间)', '', '2026-04-02', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (349, 11, 534, '2026-04-02', 'late', '', 'Thu May 14 2026 12:24:17 GMT+0800 (中国标准时间)', '07:52', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (350, 11, 539, '2026-04-02', 'late', '', 'Thu May 14 2026 12:24:17 GMT+0800 (中国标准时间)', '10:10', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (351, 11, 509, '2026-04-03', 'leave', '', 'Thu May 14 2026 12:25:46 GMT+0800 (中国标准时间)', '', '2026-04-03', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (352, 11, 534, '2026-04-03', 'late', '', 'Thu May 14 2026 12:25:46 GMT+0800 (中国标准时间)', '07:54', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (353, 11, 539, '2026-04-03', 'late', '', 'Thu May 14 2026 12:25:46 GMT+0800 (中国标准时间)', '08:02', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (354, 11, 541, '2026-04-03', 'late', '', 'Thu May 14 2026 12:25:46 GMT+0800 (中国标准时间)', '07:53', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (355, 11, 509, '2026-04-07', 'leave', '', 'Thu May 14 2026 12:26:39 GMT+0800 (中国标准时间)', '', '2026-04-07', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (356, 11, 536, '2026-04-07', 'leave', '', 'Thu May 14 2026 12:26:39 GMT+0800 (中国标准时间)', '', '2026-04-07', '事假', '0', '一天', '');
INSERT INTO `attendance` VALUES (357, 11, 539, '2026-04-07', 'late', '', 'Thu May 14 2026 12:26:39 GMT+0800 (中国标准时间)', '10:00', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (358, 11, 534, '2026-04-08', 'leave', '', 'Thu May 14 2026 12:27:22 GMT+0800 (中国标准时间)', '', '2026-04-08', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (359, 11, 539, '2026-04-08', 'late', '', 'Thu May 14 2026 12:27:22 GMT+0800 (中国标准时间)', '07:57', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (360, 11, 541, '2026-04-01', 'absent', '', 'Thu May 14 2026 12:29:02 GMT+0800 (中国标准时间)', '', '', '', '0', '', '10:10');
INSERT INTO `attendance` VALUES (361, 11, 509, '2026-04-09', 'leave', '', 'Thu May 14 2026 12:30:43 GMT+0800 (中国标准时间)', '', '2026-04-09', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (362, 11, 520, '2026-04-09', 'leave', '', 'Thu May 14 2026 12:30:43 GMT+0800 (中国标准时间)', '', '2026-04-09', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (363, 11, 527, '2026-04-09', 'leave', '', 'Thu May 14 2026 12:30:43 GMT+0800 (中国标准时间)', '', '2026-04-09', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (364, 11, 532, '2026-04-09', 'leave', '', 'Thu May 14 2026 12:30:43 GMT+0800 (中国标准时间)', '', '2026-04-09', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (365, 11, 541, '2026-04-09', 'leave', '', 'Thu May 14 2026 12:30:43 GMT+0800 (中国标准时间)', '', '2026-04-09', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (366, 11, 509, '2026-04-10', 'leave', '', 'Thu May 14 2026 12:32:40 GMT+0800 (中国标准时间)', '', '2026-04-10', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (367, 11, 518, '2026-04-10', 'leave', '', 'Thu May 14 2026 12:32:40 GMT+0800 (中国标准时间)', '', '2026-04-10', '事假', '0', '12：00离校配眼镜', '');
INSERT INTO `attendance` VALUES (368, 11, 533, '2026-04-10', 'late', '', 'Thu May 14 2026 12:32:40 GMT+0800 (中国标准时间)', '07:56', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (369, 11, 509, '2026-04-13', 'leave', '', 'Thu May 14 2026 12:33:19 GMT+0800 (中国标准时间)', '', '2026-04-13', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (370, 11, 520, '2026-04-13', 'leave', '', 'Thu May 14 2026 12:33:19 GMT+0800 (中国标准时间)', '', '2026-04-13', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (371, 11, 539, '2026-04-13', 'late', '', 'Thu May 14 2026 12:33:19 GMT+0800 (中国标准时间)', '08:01', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (372, 11, 509, '2026-04-14', 'leave', '', 'Thu May 14 2026 12:34:23 GMT+0800 (中国标准时间)', '', '2026-04-14', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (373, 11, 520, '2026-04-14', 'leave', '', 'Thu May 14 2026 12:34:23 GMT+0800 (中国标准时间)', '', '2026-04-14', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (374, 11, 533, '2026-04-14', 'late', '', 'Thu May 14 2026 12:34:23 GMT+0800 (中国标准时间)', '07:51', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (375, 11, 534, '2026-04-14', 'late', '', 'Thu May 14 2026 12:34:23 GMT+0800 (中国标准时间)', '08:02', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (376, 11, 539, '2026-04-14', 'late', '', 'Thu May 14 2026 12:34:23 GMT+0800 (中国标准时间)', '08:04', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (377, 11, 509, '2026-04-15', 'leave', '', 'Thu May 14 2026 12:34:50 GMT+0800 (中国标准时间)', '', '2026-04-15', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (378, 11, 520, '2026-04-15', 'leave', '', 'Thu May 14 2026 12:34:50 GMT+0800 (中国标准时间)', '', '2026-04-15', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (379, 11, 509, '2026-04-16', 'leave', '', 'Thu May 14 2026 12:35:05 GMT+0800 (中国标准时间)', '', '2026-04-16', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (380, 11, 520, '2026-04-16', 'leave', '', 'Thu May 14 2026 12:35:05 GMT+0800 (中国标准时间)', '', '2026-04-16', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (382, 11, 520, '2026-04-20', 'leave', '', 'Fri May 22 2026 23:30:15 GMT+0800 (中国标准时间)', '', '2026-04-20', '个人原因', '0', '一天', '');
INSERT INTO `attendance` VALUES (383, 11, 522, '2026-04-20', 'leave', '', 'Fri May 22 2026 23:30:15 GMT+0800 (中国标准时间)', '', '2026-04-20', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (388, 11, 517, '2026-04-21', 'leave', '', 'Fri May 22 2026 23:29:56 GMT+0800 (中国标准时间)', '', '2026-04-21', '病假', '0', '看牙（9：17到）', '');
INSERT INTO `attendance` VALUES (389, 11, 522, '2026-04-21', 'leave', '', 'Fri May 22 2026 23:29:56 GMT+0800 (中国标准时间)', '', '2026-04-21', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (390, 11, 533, '2026-04-21', 'late', '', 'Fri May 22 2026 23:29:56 GMT+0800 (中国标准时间)', '08:01', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (392, 11, 520, '2026-04-22', 'leave', '', 'Fri May 22 2026 23:29:50 GMT+0800 (中国标准时间)', '', '2026-04-22', '病假', '0', '10：05离校', '');
INSERT INTO `attendance` VALUES (393, 11, 522, '2026-04-22', 'leave', '', 'Fri May 22 2026 23:29:50 GMT+0800 (中国标准时间)', '', '2026-04-22', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (394, 11, 539, '2026-04-22', 'late', '', 'Fri May 22 2026 23:29:50 GMT+0800 (中国标准时间)', '08:15', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (395, 11, 541, '2026-04-22', 'late', '', 'Fri May 22 2026 23:29:50 GMT+0800 (中国标准时间)', '08:02', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (396, 11, 509, '2026-04-23', 'leave', '', 'Thu May 14 2026 12:51:48 GMT+0800 (中国标准时间)', '', '2026-04-23', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (397, 11, 520, '2026-04-23', 'leave', '', 'Thu May 14 2026 12:51:48 GMT+0800 (中国标准时间)', '', '2026-04-23', '病假', '0', '10：05离校', '');
INSERT INTO `attendance` VALUES (398, 11, 533, '2026-04-23', 'late', '', 'Thu May 14 2026 12:51:48 GMT+0800 (中国标准时间)', '08:08', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (399, 11, 539, '2026-04-23', 'late', '', 'Thu May 14 2026 12:51:48 GMT+0800 (中国标准时间)', '07:58', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (400, 11, 509, '2026-04-24', 'leave', '', 'Thu May 14 2026 12:52:41 GMT+0800 (中国标准时间)', '', '2026-04-24', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (401, 11, 533, '2026-04-24', 'late', '', 'Thu May 14 2026 12:52:41 GMT+0800 (中国标准时间)', '07:59', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (402, 11, 541, '2026-04-24', 'late', '', 'Thu May 14 2026 12:52:41 GMT+0800 (中国标准时间)', '08:01', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (403, 11, 509, '2026-04-27', 'leave', '', 'Thu May 14 2026 12:54:29 GMT+0800 (中国标准时间)', '', '2026-04-27', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (404, 11, 520, '2026-04-27', 'leave', '', 'Thu May 14 2026 12:54:29 GMT+0800 (中国标准时间)', '', '2026-04-27', '病假', '0', '11：50离校', '');
INSERT INTO `attendance` VALUES (405, 11, 522, '2026-04-27', 'late', '', 'Thu May 14 2026 12:54:29 GMT+0800 (中国标准时间)', '07:57', '', '', '0', '', '');
INSERT INTO `attendance` VALUES (406, 11, 531, '2026-04-27', 'leave', '', 'Thu May 14 2026 12:54:29 GMT+0800 (中国标准时间)', '', '2026-04-27', '病假', '0', '一天', '');
INSERT INTO `attendance` VALUES (412, 11, 509, '2026-05-22', 'late', '', 'Fri May 22 2026 23:07:00 GMT+0800 (中国标准时间)', '14:07', '', '', '0', '', '');
UNLOCK TABLES;

-- 表: audit_log
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE `audit_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event` varchar(255) NOT NULL,
  `user_name` varchar(100) DEFAULT '',
  `user_id` varchar(50) DEFAULT '',
  `user_role` varchar(20) DEFAULT '',
  `ip` varchar(45) DEFAULT '',
  `detail` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `audit_log` WRITE;
INSERT INTO `audit_log` VALUES (1, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:07:09 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (2, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:07:10 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (3, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:07:12 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (4, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:07:14 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (5, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:07:15 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (6, '登录成功 [admin] [记住我:undefined]', '管理员', 'admin', 'admin', '127.0.0.1', '', 'Tue May 19 2026 19:17:03 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (7, '登录成功 [admin] [记住我:undefined]', '管理员', 'admin', 'admin', '127.0.0.1', '', 'Tue May 19 2026 19:18:43 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (8, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:21:12 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (9, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:21:12 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (10, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:21:13 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (11, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:21:13 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (12, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:21:13 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (13, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:22:13 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (14, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:22:14 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (15, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:22:15 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (16, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:22:16 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (17, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:22:16 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (18, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:22:16 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (19, '登录成功 [admin] [记住我:undefined]', '管理员', 'admin', 'admin', '127.0.0.1', '', 'Tue May 19 2026 19:35:17 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (20, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:45:38 GMT+0800 (中国标准时间)');
INSERT INTO `audit_log` VALUES (21, '登录成功 [teacher] [记住我:undefined]', '柯宇', '0187', 'teacher', '192.168.3.5', '', 'Tue May 19 2026 19:46:27 GMT+0800 (中国标准时间)');
UNLOCK TABLES;

-- 表: beauty_events
DROP TABLE IF EXISTS `beauty_events`;
CREATE TABLE `beauty_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `type` varchar(20) DEFAULT '扣学分',
  `default_score` decimal(10,2) DEFAULT '1.00',
  `category_index` int DEFAULT NULL,
  `item_index` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: beauty_score_events
DROP TABLE IF EXISTS `beauty_score_events`;
CREATE TABLE `beauty_score_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `row_index` int NOT NULL,
  `month` varchar(20) NOT NULL,
  `score` decimal(10,2) DEFAULT '0.00',
  `event_name` varchar(200) DEFAULT '',
  `entry_date` varchar(20) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=340 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `beauty_score_events` WRITE;
INSERT INTO `beauty_score_events` VALUES (4, 4, '2302180301', 42, '2026-05', 5, '参加学校劳动周全勤', '2026-05-11', 'Mon May 11 2026 14:13:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (37, 11, '2502290807', 24, '2026-03', -5, '迟到45分钟（迟到）', '2026-03-04', 'Tue May 12 2026 23:00:32 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (38, 11, '2502290817', 24, '2026-03', -5, '迟到45分钟（迟到）', '2026-03-04', 'Tue May 12 2026 23:00:57 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (39, 11, '2502290806', 38, '2026-03', 5, '参与黑板报活动（3.4）', '2026-03-04', 'Tue May 12 2026 23:01:45 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (40, 11, '2502290817', 38, '2026-03', 5, '参与黑板报活动（3.4）', '2026-03-04', 'Tue May 12 2026 23:02:23 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (41, 11, '2502290820', 38, '2026-03', 5, '参与黑板报活动（3.4）', '2026-03-04', 'Tue May 12 2026 23:02:56 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (42, 11, '2502290827', 6, '2026-03', 2, '乐于助人（擦黑板）', '2026-03-04', 'Tue May 12 2026 23:08:47 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (43, 11, '2502290826', 6, '2026-03', 2, '乐于助人（擦黑板）', '2026-03-04', 'Tue May 12 2026 23:09:13 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (44, 11, '2502290825', 6, '2026-03', 2, '乐于助人（擦黑板）', '2026-03-04', 'Tue May 12 2026 23:09:57 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (45, 11, '2502290819', 39, '2026-03', 5, '参与班级活动+5分（布置教室）', '2026-03-04', 'Tue May 12 2026 23:12:04 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (46, 11, '2502290820', 39, '2026-03', 5, '参与班级活动+5分（布置教室）', '2026-03-04', 'Tue May 12 2026 23:13:07 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (47, 11, '2502290807', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:19:20 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (48, 11, '2502290815', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:19:57 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (49, 11, '2502290819', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:20:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (50, 11, '2502290818', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:20:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (51, 11, '2502290814', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:21:18 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (52, 11, '2502290806', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:21:31 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (53, 11, '2502290805', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:21:49 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (54, 11, '2502290817', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:22:06 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (55, 11, '2502290809', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', '2026-03-05', 'Tue May 12 2026 23:22:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (56, 11, '2502290806', 38, '2026-03', 5, '参与黑板报活动（3.5）', '2026-03-05', 'Tue May 12 2026 23:23:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (57, 11, '2502290820', 38, '2026-03', 5, '参与黑板报活动（3.5）', '2026-03-05', 'Tue May 12 2026 23:23:54 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (58, 11, '2502290825', 49, '2026-03', -5, '未参加重大活动（未参加升旗仪式）', '2026-03-05', 'Tue May 12 2026 23:25:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (59, 11, '2502290831', 49, '2026-03', -5, '未参加重大活动（未参加升旗仪式）', '2026-03-05', 'Tue May 12 2026 23:26:17 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (60, 11, '2502290821', 46, '2026-03', 1, '办公室劳动一次+1分（整理电脑）', '2026-03-06', 'Tue May 12 2026 23:27:31 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (61, 11, '2502290825', 46, '2026-03', 1, '办公室劳动一次+1分（3.6）', '2026-03-06', 'Tue May 12 2026 23:27:50 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (62, 11, '2502290814', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛）', '2026-03-06', 'Tue May 12 2026 23:31:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (63, 11, '2502290815', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛）', '2026-03-06', 'Tue May 12 2026 23:31:44 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (64, 11, '2502290807', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛）', '2026-03-06', 'Tue May 12 2026 23:31:57 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (65, 11, '2502290806', 39, '2026-03', 5, '参与班级活动+5分（帮比赛画画）', '2026-03-06', 'Tue May 12 2026 23:34:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (66, 11, '2502290829', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:36:36 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (67, 11, '2502290821', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:37:05 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (68, 11, '2502290830', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:37:20 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (69, 11, '2502290816', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:37:42 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (70, 11, '2502290808', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:37:57 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (71, 11, '2502290809', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:39:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (72, 11, '2502290824', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:39:52 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (73, 11, '2502290833', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:40:06 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (74, 11, '2502290805', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:40:22 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (75, 11, '2502290804', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:40:51 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (76, 11, '2502290813', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:41:04 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (77, 11, '2502290801', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:41:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (78, 11, '2502290817', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:41:42 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (79, 11, '2502290803', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:42:03 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (80, 11, '2502290820', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:42:25 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (81, 11, '2502290825', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:42:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (82, 11, '2502290834', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-06', 'Tue May 12 2026 23:43:04 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (83, 11, '2502290826', 24, '2026-03', -5, '迟到1分钟（迟到）', '2026-03-09', 'Tue May 12 2026 23:45:06 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (84, 11, '2502290814', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）', '2026-03-09', 'Tue May 12 2026 23:46:51 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (85, 11, '2502290818', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）', '2026-03-09', 'Tue May 12 2026 23:47:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (86, 11, '2502290819', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）', '2026-03-09', 'Tue May 12 2026 23:47:25 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (87, 11, '2502290809', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）', '2026-03-09', 'Tue May 12 2026 23:47:46 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (88, 11, '2502290829', 24, '2026-03', -5, '迟到10分钟（迟到）', '2026-03-10', 'Tue May 12 2026 23:48:22 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (89, 11, '2502290815', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（印象馆培训）', '2026-03-10', 'Tue May 12 2026 23:49:28 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (90, 11, '2502290830', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）', '2026-03-10', 'Tue May 12 2026 23:51:12 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (91, 11, '2502290809', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）', '2026-03-10', 'Tue May 12 2026 23:51:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (92, 11, '2502290814', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）', '2026-03-10', 'Tue May 12 2026 23:52:00 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (93, 11, '2502290832', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）', '2026-03-10', 'Tue May 12 2026 23:52:19 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (94, 11, '2502290834', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）', '2026-03-10', 'Tue May 12 2026 23:52:33 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (95, 11, '2502290814', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-10', 'Tue May 12 2026 23:55:31 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (96, 11, '2502290818', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-10', 'Tue May 12 2026 23:56:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (97, 11, '2502290830', 32, '2026-03', 3, '班级英语单词默写（批默写）', '2026-03-10', 'Tue May 12 2026 23:57:08 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (98, 11, '2502290831', 33, '2026-03', -5, '不交作业，或抄袭作业（英语未交）', '2026-03-11', 'Wed May 13 2026 00:00:38 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (99, 11, '2502290828', 33, '2026-03', -5, '不交作业，或抄袭作业（英语未交）', '2026-03-11', 'Wed May 13 2026 00:01:14 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (100, 11, '2502290831', 33, '2026-03', -5, '不交作业，或抄袭作业（语文未交）', '2026-03-11', 'Wed May 13 2026 00:01:48 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (101, 11, '2502290828', 33, '2026-03', -5, '不交作业，或抄袭作业（语文未交）', '2026-03-11', 'Wed May 13 2026 00:01:59 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (102, 11, '2502290831', 33, '2026-03', -5, '不交作业，或抄袭作业（数学未交）', '2026-03-11', 'Wed May 13 2026 00:02:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (103, 11, '2502290833', 33, '2026-03', -5, '不交作业，或抄袭作业（数学未交）', '2026-03-11', 'Wed May 13 2026 00:02:47 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (104, 11, '2502290832', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-12', 'Wed May 13 2026 00:08:48 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (105, 11, '2502290826', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-12', 'Wed May 13 2026 00:09:15 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (106, 11, '2502290807', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-12', 'Wed May 13 2026 00:09:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (107, 11, '2502290806', 32, '2026-03', 3, '班级英语单词默写（默写全对）', '2026-03-12', 'Wed May 13 2026 00:12:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (108, 11, '2502290807', 52, '2026-03', 20, '省市级竞赛中获奖（创新创意 市级）', '2026-03-06', 'Wed May 13 2026 00:16:56 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (109, 11, '2502290819', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:13:34 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (110, 11, '2502290833', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:13:53 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (111, 11, '2502290832', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:14:08 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (112, 11, '2502290824', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:14:28 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (113, 11, '2502290827', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:14:54 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (114, 11, '2502290834', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:15:17 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (115, 11, '2502290823', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:15:37 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (116, 11, '2502290820', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:16:01 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (117, 11, '2502290821', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:16:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (118, 11, '2502290801', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:16:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (119, 11, '2502290804', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:16:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (120, 11, '2502290808', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:17:13 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (121, 11, '2502290805', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:17:36 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (122, 11, '2502290803', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:17:58 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (123, 11, '2502290809', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:18:37 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (124, 11, '2502290807', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:19:07 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (125, 11, '2502290816', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', '2026-03-16', 'Wed May 13 2026 11:19:28 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (126, 11, '2502290821', 17, '2026-03', -5, '仪容仪表扣分（戴手链）', '2026-03-16', 'Wed May 13 2026 11:20:40 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (127, 11, '2502290828', 46, '2026-03', 1, '办公室劳动一次+1分（浇水）', '2026-03-17', 'Wed May 13 2026 11:25:25 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (128, 11, '2502290803', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政）', '2026-03-17', 'Wed May 13 2026 11:33:46 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (129, 11, '2502290834', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政）', '2026-03-17', 'Wed May 13 2026 11:35:01 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (130, 11, '2502290809', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政）', '2026-03-17', 'Wed May 13 2026 11:35:28 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (131, 11, '2502290818', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政）', '2026-03-17', 'Wed May 13 2026 11:35:43 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (132, 11, '2502290814', 17, '2026-03', -5, '仪容仪表扣分（校服没拉）', '2026-03-17', 'Wed May 13 2026 11:37:49 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (133, 11, '2502290815', 6, '2026-03', 2, '乐于助人（帮老师打饭）', '2026-03-17', 'Wed May 13 2026 11:38:51 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (134, 11, '2502290813', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:08:42 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (135, 11, '2502290811', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:08:58 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (136, 11, '2502290807', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:09:19 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (137, 11, '2502290808', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:09:43 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (138, 11, '2502290804', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:10:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (139, 11, '2502290829', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:10:22 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (140, 11, '2502290825', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:10:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (141, 11, '2502290805', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:11:03 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (142, 11, '2502290820', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:11:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (143, 11, '2502290823', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-17', 'Wed May 13 2026 12:11:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (144, 11, '2502290818', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-18', 'Wed May 13 2026 12:12:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (145, 11, '2502290814', 39, '2026-03', 5, '参与班级活动+5分（做海报）', '2026-03-18', 'Wed May 13 2026 16:07:24 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (146, 11, '2502290830', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', '2026-03-18', 'Wed May 13 2026 16:10:02 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (147, 11, '2502290818', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', '2026-03-18', 'Wed May 13 2026 16:10:52 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (148, 11, '2502290820', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', '2026-03-18', 'Wed May 13 2026 16:11:23 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (149, 11, '2502290833', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', '2026-03-18', 'Wed May 13 2026 16:11:42 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (150, 11, '2502290814', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', '2026-03-18', 'Wed May 13 2026 16:12:03 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (151, 11, '2502290815', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', '2026-03-18', 'Wed May 13 2026 16:12:15 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (152, 11, '2502290822', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-18', 'Wed May 13 2026 16:14:11 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (153, 11, '2502290834', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-18', 'Wed May 13 2026 16:16:03 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (154, 11, '2502290817', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-18', 'Wed May 13 2026 16:16:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (155, 11, '2502290832', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-18', 'Wed May 13 2026 16:17:20 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (156, 11, '2502290825', 6, '2026-03', 2, '乐于助人（搬手机箱）', '2026-03-19', 'Wed May 13 2026 16:19:19 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (157, 11, '2502290818', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-03-19', 'Wed May 13 2026 16:21:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (158, 11, '2502290834', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-03-19', 'Wed May 13 2026 16:21:20 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (159, 11, '2502290809', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-03-19', 'Wed May 13 2026 16:21:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (160, 11, '2502290803', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-03-19', 'Wed May 13 2026 16:21:53 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (161, 11, '2502290833', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-19', 'Wed May 13 2026 16:23:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (162, 11, '2502290806', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-19', 'Wed May 13 2026 16:24:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (163, 11, '2502290824', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-19', 'Wed May 13 2026 16:24:45 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (164, 11, '2502290818', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:27:41 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (165, 11, '2502290814', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:28:08 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (166, 11, '2502290806', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:28:30 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (167, 11, '2502290807', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:28:44 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (168, 11, '2502290832', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:29:04 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (169, 11, '2502290821', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:29:23 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (170, 11, '2502290824', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:29:41 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (171, 11, '2502290823', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:29:52 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (172, 11, '2502290834', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:30:49 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (173, 11, '2502290825', 35, '2026-03', 1, '作为领读员每次加1分（领读）', '2026-03-20', 'Wed May 13 2026 16:33:01 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (174, 11, '2502290817', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:33:23 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (175, 11, '2502290833', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', '2026-03-20', 'Wed May 13 2026 16:35:12 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (176, 11, '2502290809', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-20', 'Wed May 13 2026 16:38:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (177, 11, '2502290821', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', '2026-03-20', 'Wed May 13 2026 16:39:08 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (178, 11, '2502290819', 35, '2026-03', 1, '作为领读员每次加1分（领读）', '2026-03-23', 'Wed May 13 2026 16:43:37 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (179, 11, '2502290832', 17, '2026-03', -5, '仪容仪表扣分（没穿校裤）', '2026-03-23', 'Wed May 13 2026 16:45:30 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (180, 11, '2502290818', 17, '2026-03', -5, '仪容仪表扣分（烫头发）', '2026-03-24', 'Wed May 13 2026 16:48:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (181, 11, '2502290818', 29, '2026-03', -5, '睡觉、说话、吃东西等（吃早饭）', '2026-03-24', 'Wed May 13 2026 16:48:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (182, 11, '2502290820', 39, '2026-03', 5, '参与班级活动+5分（做表）', '2026-03-25', 'Wed May 13 2026 16:52:09 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (183, 11, '2502290831', 24, '2026-03', -5, '迟到6分钟（3.25）', '2026-03-25', 'Wed May 13 2026 16:52:37 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (184, 11, '2502290826', 24, '2026-03', -5, '迟到15分钟（3.25）', '2026-03-25', 'Wed May 13 2026 16:53:08 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (185, 11, '2502290829', 29, '2026-03', -5, '睡觉、说话、吃东西等（上课睡觉）', '2026-03-25', 'Wed May 13 2026 16:53:46 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (186, 11, '2502290832', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（广播操培训）', '2026-03-26', 'Wed May 13 2026 16:55:53 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (187, 11, '2502290818', 35, '2026-03', 1, '作为领读员每次加1分（领读）', '2026-03-27', 'Wed May 13 2026 16:57:53 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (188, 11, '2502290824', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（志愿者）', '2026-03-27', 'Wed May 13 2026 16:58:43 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (189, 11, '2502290834', 46, '2026-03', 1, '办公室劳动一次+1分（志愿者）', '2026-03-27', 'Wed May 13 2026 16:58:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (190, 11, '2502290805', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', '2026-03-27', 'Wed May 13 2026 17:00:25 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (191, 11, '2502290810', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', '2026-03-27', 'Wed May 13 2026 17:00:47 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (192, 11, '2502290811', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', '2026-03-27', 'Wed May 13 2026 17:01:05 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (193, 11, '2502290816', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', '2026-03-27', 'Wed May 13 2026 17:01:15 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (194, 11, '2502290803', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', '2026-03-27', 'Wed May 13 2026 17:01:30 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (195, 11, '2502290804', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', '2026-03-27', 'Wed May 13 2026 17:01:46 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (196, 11, '2502290806', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', '2026-03-27', 'Wed May 13 2026 17:01:59 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (197, 11, '2502290831', 24, '2026-03', -5, '迟到1分钟（迟到）', '2026-03-27', 'Wed May 13 2026 17:02:38 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (198, 11, '2502290826', 24, '2026-03', -5, '迟到18分钟（迟到）', '2026-03-27', 'Wed May 13 2026 17:03:03 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (199, 11, '2502290834', 17, '2026-03', -5, '仪容仪表扣分（校服拉链没拉）', '2026-03-27', 'Wed May 13 2026 17:03:41 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (200, 11, '2502290827', 33, '2026-03', -5, '不交作业，或抄袭作业（英语没交）', '2026-03-30', 'Wed May 13 2026 17:11:47 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (201, 11, '2502290833', 33, '2026-03', -5, '不交作业，或抄袭作业（英语没交）', '2026-03-30', 'Wed May 13 2026 17:12:07 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (202, 11, '2502290828', 33, '2026-03', -5, '不交作业，或抄袭作业（英语没交）', '2026-03-30', 'Wed May 13 2026 17:13:18 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (203, 11, '2502290819', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:14:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (204, 11, '2502290833', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:15:07 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (205, 11, '2502290825', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:15:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (206, 11, '2502290807', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:15:53 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (207, 11, '2502290829', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:16:06 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (208, 11, '2502290820', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:16:20 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (209, 11, '2502290827', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:16:34 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (210, 11, '2502290818', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:16:46 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (211, 11, '2502290810', 28, '2026-03', -5, '玩手机、玩游戏等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:17:01 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (212, 11, '2502290811', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', '2026-03-30', 'Wed May 13 2026 17:17:13 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (213, 11, '2502290824', 17, '2026-03', -5, '仪容仪表扣分（戴手链）', '2026-03-31', 'Wed May 13 2026 17:20:02 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (214, 11, '2502290819', 35, '2026-04', 1, '作为领读员每次加1分（领读）', '2026-04-01', 'Wed May 13 2026 17:23:04 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (215, 11, '2502290821', 35, '2026-04', 1, '作为领读员每次加1分（领读）', '2026-04-01', 'Wed May 13 2026 17:23:24 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (216, 11, '2502290812', 6, '2026-04', 2, '乐于助人（批默写）', '2026-04-01', 'Wed May 13 2026 17:24:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (217, 11, '2502290822', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:25:51 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (218, 11, '2502290808', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:26:08 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (219, 11, '2502290813', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:26:27 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (220, 11, '2502290805', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:26:45 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (221, 11, '2502290825', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:27:00 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (222, 11, '2502290824', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:27:14 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (223, 11, '2502290820', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:27:25 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (224, 11, '2502290806', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:27:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (225, 11, '2502290804', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-01', 'Wed May 13 2026 17:28:07 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (226, 11, '2502290818', 35, '2026-04', 1, '作为领读员每次加1分（领读）', '2026-04-02', 'Wed May 13 2026 18:09:00 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (227, 11, '2502290806', 38, '2026-04', 5, '参与黑板报活动（黑板报）', '2026-04-02', 'Wed May 13 2026 18:09:30 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (228, 11, '2502290817', 38, '2026-04', 5, '参与黑板报活动（黑板报）', '2026-04-02', 'Wed May 13 2026 18:09:43 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (229, 11, '2502290809', 38, '2026-04', 5, '参与黑板报活动（黑板报）', '2026-04-02', 'Wed May 13 2026 18:10:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (230, 11, '2502290832', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（广播操）', '2026-04-02', 'Wed May 13 2026 18:10:35 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (231, 11, '2502290818', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-04-02', 'Wed May 13 2026 18:26:05 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (232, 11, '2502290803', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-04-02', 'Wed May 13 2026 18:26:42 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (233, 11, '2502290809', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-04-02', 'Wed May 13 2026 18:26:57 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (234, 11, '2502290833', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-04-02', 'Wed May 13 2026 18:27:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (236, 11, '2502290821', 46, '2026-04', 1, '办公室劳动一次+1分（4.2）', '2026-04-02', 'Wed May 13 2026 18:27:33 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (237, 11, '2502290823', 31, '0042-04', 5, '作业好，受到教师表扬', '0042-04-02', 'Wed May 13 2026 18:27:49 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (238, 11, '2502290824', 31, '2026-04', 5, '作业好，受到教师表扬', '2026-04-02', 'Wed May 13 2026 18:28:01 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (239, 11, '2502290832', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（英语默写全对）', '2026-04-02', 'Wed May 13 2026 18:29:12 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (240, 11, '2502290826', 24, '2026-04', -5, '迟到2分钟（4.2）', '2026-04-02', 'Wed May 13 2026 18:30:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (241, 11, '2502290831', 24, '2026-04', -5, '迟到145分钟（4.2）', '2026-04-02', 'Wed May 13 2026 18:31:23 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (242, 11, '2502290820', 39, '2026-04', 5, '参与班级活动+5分（做表）', '2026-04-03', 'Wed May 13 2026 18:37:01 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (243, 11, '2502290833', 24, '2026-04', -5, '迟到3分钟（4.3）', '2026-04-03', 'Wed May 13 2026 18:37:50 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (244, 11, '2502290826', 24, '2026-04', -5, '迟到4分钟（4.3）', '2026-04-03', 'Wed May 13 2026 18:38:24 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (245, 11, '2502290831', 24, '2026-04', -5, '迟到12分钟（4.3）', '2026-04-03', 'Wed May 13 2026 18:41:45 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (246, 11, '2502290831', 24, '2026-04', -5, '迟到130分钟（4.7）', '2026-04-07', 'Wed May 13 2026 18:58:12 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (247, 11, '2502290809', 38, '2026-04', 5, '参与黑板报活动（4.7）', '2026-04-07', 'Wed May 13 2026 19:06:38 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (248, 11, '2502290806', 38, '2026-04', 5, '参与黑板报活动（4.7）', '2026-04-07', 'Wed May 13 2026 19:06:57 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (249, 11, '2502290817', 38, '2026-04', 5, '参与黑板报活动（4.7）', '2026-04-07', 'Wed May 13 2026 19:07:28 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (250, 11, '2502290834', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', '2026-04-07', 'Wed May 13 2026 19:09:13 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (251, 11, '2502290816', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-07', 'Wed May 13 2026 19:14:15 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (252, 11, '2502290817', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-07', 'Wed May 13 2026 19:14:35 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (253, 11, '2502290811', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-07', 'Wed May 13 2026 19:15:07 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (254, 11, '2502290829', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-07', 'Wed May 13 2026 19:15:27 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (255, 11, '2502290807', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-07', 'Wed May 13 2026 19:17:36 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (256, 11, '2502290831', 24, '2026-04', -5, '迟到7分钟（4.8）', '2026-04-08', 'Wed May 13 2026 19:19:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (257, 11, '2502290822', 31, '2026-04', 5, '作业好，受到教师表扬（英语默写全对）', '2026-04-08', 'Wed May 13 2026 19:20:05 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (258, 11, '2502290821', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-08', 'Wed May 13 2026 19:20:44 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (259, 11, '2502290811', 31, '2026-04', 5, '作业好，受到教师表扬（英语默写全对）', '2026-04-08', 'Wed May 13 2026 19:21:02 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (260, 11, '2502290833', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-08', 'Wed May 13 2026 19:22:14 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (261, 11, '2502290823', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-08', 'Wed May 13 2026 19:23:24 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (262, 11, '2502290821', 4, '2026-04', 5, '拾金不昧', '2026-04-08', 'Wed May 13 2026 19:29:36 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (263, 11, '2502290807', 6, '2026-04', 2, '乐于助人（批默写）', '2026-04-08', 'Wed May 13 2026 19:30:03 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (264, 11, '2502290823', 6, '2026-04', 2, '乐于助人（批默写）', '2026-04-08', 'Wed May 13 2026 19:30:25 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (265, 11, '2502290807', 35, '2026-04', 1, '作为领读员每次加1分（领读）', '2026-04-09', 'Wed May 13 2026 19:31:03 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (266, 11, '2502290809', 46, '2026-04', 1, '办公室劳动一次+1分（时政培训）', '2026-04-09', 'Wed May 13 2026 19:32:36 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (267, 11, '2502290826', 17, '2026-04', -5, '仪容仪表扣分（没穿校服）', '2026-04-09', 'Wed May 13 2026 19:35:22 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (268, 11, '2502290818', 17, '2026-04', -5, '仪容仪表扣分（没穿校服）', '2026-04-09', 'Wed May 13 2026 19:35:34 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (269, 11, '2502290828', 29, '2026-04', -5, '睡觉、说话、吃东西等（小动作）', '2026-04-09', 'Wed May 13 2026 19:36:19 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (270, 11, '2502290825', 29, '2026-04', -5, '睡觉、说话、吃东西等（大动作）', '2026-04-09', 'Wed May 13 2026 19:38:02 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (271, 11, '2502290825', 24, '2026-04', -5, '迟到6分钟（迟到）', '2026-04-10', 'Wed May 13 2026 19:38:48 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (272, 11, '2502290818', 6, '2026-04', 2, '乐于助人', '2026-04-10', 'Wed May 13 2026 19:39:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (273, 11, '2502290831', 24, '2026-04', -5, '迟到11分钟（迟到）', '2026-04-13', 'Wed May 13 2026 19:40:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (274, 11, '2502290827', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动', '2026-04-13', 'Wed May 13 2026 19:40:37 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (275, 11, '2502290834', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-13', 'Wed May 13 2026 19:42:10 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (276, 11, '2502290825', 24, '2026-04', -5, '迟到1分钟（迟到）', '2026-04-14', 'Wed May 13 2026 19:44:19 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (277, 11, '2502290826', 24, '2026-04', -5, '迟到12分钟（迟到）', '2026-04-14', 'Wed May 13 2026 19:46:19 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (278, 11, '2502290818', 18, '2026-04', 5, '尊敬师长，受到表扬', '2026-04-14', 'Wed May 13 2026 19:50:30 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (279, 11, '2502290821', 6, '2026-04', 2, '乐于助人（批默写）', '2026-04-14', 'Wed May 13 2026 19:53:20 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (280, 11, '2502290825', 29, '2026-04', -5, '睡觉、说话、吃东西等（点外卖）', '2026-04-14', 'Wed May 13 2026 19:57:24 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (281, 11, '2502290825', 17, '2026-04', -5, '仪容仪表扣分（戴手链）', '2026-04-14', 'Wed May 13 2026 19:57:43 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (282, 11, '2502290818', 6, '2026-04', 2, '乐于助人（帮老师）', '2026-04-15', 'Wed May 13 2026 19:58:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (283, 11, '2502290832', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-15', 'Wed May 13 2026 20:00:14 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (284, 11, '2502290819', 46, '2026-04', 1, '办公室劳动一次+1分', '2026-04-16', 'Wed May 13 2026 20:23:18 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (285, 11, '2502290821', 46, '2026-04', 1, '办公室劳动一次+1分', '2026-04-16', 'Wed May 13 2026 20:24:33 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (286, 11, '2502290827', 46, '2026-04', 1, '办公室劳动一次+1分', '2026-04-16', 'Wed May 13 2026 20:26:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (287, 11, '2502290818', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（跳绳）', '2026-04-16', 'Wed May 13 2026 20:34:04 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (288, 11, '2502290821', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（跳绳）', '2026-04-17', 'Wed May 13 2026 20:34:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (292, 11, '2502290816', 24, '2026-04', -5, '迟到32分钟（迟到）', '2026-04-20', 'Thu May 14 2026 11:26:39 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (293, 11, '2502290826', 24, '2026-04', -5, '迟到60分钟（迟到）', '2026-04-20', 'Thu May 14 2026 11:27:00 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (294, 11, '2502290831', 24, '2026-04', -5, '迟到151分钟（迟到）', '2026-04-20', 'Thu May 14 2026 11:27:22 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (295, 11, '2502290818', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-20', 'Thu May 14 2026 11:29:06 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (296, 11, '2502290830', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-20', 'Thu May 14 2026 11:29:49 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (297, 11, '2502290826', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-20', 'Thu May 14 2026 11:30:31 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (298, 11, '2502290834', 6, '2026-04', 2, '乐于助人', '2026-04-20', 'Thu May 14 2026 11:32:06 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (299, 11, '2502290832', 6, '2026-04', 2, '乐于助人', '2026-04-20', 'Thu May 14 2026 11:32:18 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (300, 11, '2502290821', 6, '2026-04', 2, '乐于助人', '2026-04-20', 'Thu May 14 2026 11:32:47 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (301, 11, '2502290825', 24, '2026-04', -5, '迟到11分钟（迟到）', '2026-04-21', 'Thu May 14 2026 11:34:31 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (302, 11, '2502290809', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-21', 'Thu May 14 2026 11:40:55 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (303, 11, '2502290826', 17, '2026-04', -5, '仪容仪表扣分（没拉拉链）', '2026-04-21', 'Thu May 14 2026 11:41:28 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (304, 11, '2502290823', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（跳绳）', '2026-04-22', 'Thu May 14 2026 11:43:41 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (305, 11, '2502290815', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-22', 'Thu May 14 2026 11:46:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (306, 11, '2502290831', 24, '2026-04', -5, '迟到8分钟（迟到）', '2026-04-23', 'Thu May 14 2026 11:47:02 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (307, 11, '2502290825', 24, '2026-04', -5, '迟到18分钟（迟到）', '2026-04-22', 'Thu May 14 2026 11:47:22 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (308, 11, '2502290823', 34, '2026-04', 5, '期中考试与期末考试，进步明显。每进步5个名次，依次递加5分（跳绳）', '2026-04-23', 'Thu May 14 2026 11:47:48 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (309, 11, '2502290818', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（篮球）', '2026-04-23', 'Thu May 14 2026 11:48:14 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (310, 11, '2502290819', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-23', 'Thu May 14 2026 11:48:56 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (311, 11, '2502290825', 24, '2026-04', -5, '迟到9分钟（迟到）', '2026-04-24', 'Thu May 14 2026 11:51:41 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (312, 11, '2502290833', 24, '2026-04', -5, '迟到11分钟（迟到）', '2026-04-24', 'Thu May 14 2026 11:52:00 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (313, 11, '2502290807', 6, '2026-04', 2, '乐于助人', '2026-04-24', 'Thu May 14 2026 11:52:48 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (314, 11, '2502290818', 46, '2026-04', 1, '办公室劳动一次+1分', '2026-04-24', 'Thu May 14 2026 11:53:04 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (315, 11, '2502290803', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（红十字）', '2026-04-24', 'Thu May 14 2026 11:53:48 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (316, 11, '2502290803', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', '2026-04-24', 'Thu May 14 2026 11:54:50 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (317, 11, '2502290814', 24, '2026-04', -5, '迟到7分钟（迟到）', '2026-04-27', 'Thu May 14 2026 11:58:24 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (318, 11, '2502290809', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（领操）', '2026-04-27', 'Thu May 14 2026 11:59:49 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (339, 11, '2502290801', 25, '2026-05', -3, '1课时', '2026-05-22', 'Fri May 22 2026 23:34:55 GMT+0800 (中国标准时间)');
UNLOCK TABLES;

-- 表: beauty_scores
DROP TABLE IF EXISTS `beauty_scores`;
CREATE TABLE `beauty_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `row_index` int NOT NULL,
  `month` varchar(20) DEFAULT '',
  `score` decimal(10,2) DEFAULT '0.00',
  `events` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `entry_date` varchar(20) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_beauty` (`class_id`,`student_id`,`row_index`,`month`)
) ENGINE=InnoDB AUTO_INCREMENT=260 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `beauty_scores` WRITE;
INSERT INTO `beauty_scores` VALUES (8, 3, '2302180301', 0, '2026-05', 20, '参加党课学习班', 'Mon May 11 2026 11:12:37 GMT+0800 (中国标准时间)', NULL, '2026-05-11');
INSERT INTO `beauty_scores` VALUES (10, 4, '2302180301', 42, '2026-05', 5, '参加学校劳动周全勤', 'Mon May 11 2026 14:13:31 GMT+0800 (中国标准时间)', NULL, '2026-05-11');
INSERT INTO `beauty_scores` VALUES (41, 11, '2502290807', 24, '2026-03', -5, '迟到45分钟（迟到）', 'Tue May 12 2026 23:00:32 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (42, 11, '2502290817', 24, '2026-03', -5, '迟到45分钟（迟到）', 'Tue May 12 2026 23:00:57 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (43, 11, '2502290806', 38, '2026-03', 10, '参与黑板报活动（3.4）、参与黑板报活动（3.5）', 'Tue May 12 2026 23:23:26 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (44, 11, '2502290817', 38, '2026-03', 5, '参与黑板报活动（3.4）', 'Tue May 12 2026 23:02:23 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (45, 11, '2502290820', 38, '2026-03', 10, '参与黑板报活动（3.4）、参与黑板报活动（3.5）', 'Tue May 12 2026 23:23:54 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (46, 11, '2502290827', 6, '2026-03', 2, '乐于助人（擦黑板）', 'Tue May 12 2026 23:08:47 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (47, 11, '2502290826', 6, '2026-03', 2, '乐于助人（擦黑板）', 'Tue May 12 2026 23:09:13 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (48, 11, '2502290825', 6, '2026-03', 4, '乐于助人（擦黑板）、乐于助人（搬手机箱）', 'Wed May 13 2026 16:19:19 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (49, 11, '2502290819', 39, '2026-03', 10, '参与班级活动+5分（布置教室）、参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:13:34 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (50, 11, '2502290820', 39, '2026-03', 20, '参与班级活动+5分（布置教室）、参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（去医院看望同学）、参与班级活动+5分（做表）', 'Wed May 13 2026 16:52:09 GMT+0800 (中国标准时间)', NULL, '2026-03-04');
INSERT INTO `beauty_scores` VALUES (52, 11, '2502290815', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:19:57 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (53, 11, '2502290819', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:20:39 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (54, 11, '2502290818', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:20:55 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (55, 11, '2502290814', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:21:18 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (56, 11, '2502290806', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:21:31 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (57, 11, '2502290805', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:21:49 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (58, 11, '2502290817', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:22:06 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (59, 11, '2502290809', 52, '2026-03', 20, '省市级竞赛中获奖（新创创意 市级）', 'Tue May 12 2026 23:22:55 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (60, 11, '2502290825', 49, '2026-03', -5, '未参加重大活动（未参加升旗仪式）', 'Tue May 12 2026 23:25:55 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (61, 11, '2502290831', 49, '2026-03', -5, '未参加重大活动（未参加升旗仪式）', 'Tue May 12 2026 23:26:17 GMT+0800 (中国标准时间)', NULL, '2026-03-05');
INSERT INTO `beauty_scores` VALUES (62, 11, '2502290821', 46, '2026-03', 1, '办公室劳动一次+1分（整理电脑）', 'Tue May 12 2026 23:27:31 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (63, 11, '2502290825', 46, '2026-03', 1, '办公室劳动一次+1分（3.6）', 'Tue May 12 2026 23:27:50 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (64, 11, '2502290814', 47, '2026-03', 15, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛）、参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）、参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）', 'Tue May 12 2026 23:52:00 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (65, 11, '2502290815', 47, '2026-03', 10, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛）、参加军训、运动会、秋游、成人仪式等重大活动（印象馆培训）', 'Tue May 12 2026 23:49:28 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (66, 11, '2502290807', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛）', 'Tue May 12 2026 23:31:57 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (67, 11, '2502290806', 39, '2026-03', 10, '参与班级活动+5分（帮比赛画画）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:28:30 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (68, 11, '2502290829', 32, '2026-03', 18, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:08:03 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (69, 11, '2502290821', 32, '2026-03', 9, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 16:39:08 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (70, 11, '2502290830', 32, '2026-03', 12, '班级英语单词默写（默写全对）、班级英语单词默写（批默写）', 'Wed May 13 2026 00:03:42 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (71, 11, '2502290816', 32, '2026-03', 3, '班级英语单词默写（默写全对）', 'Tue May 12 2026 23:37:42 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (73, 11, '2502290808', 32, '2026-03', 24, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:10:02 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (74, 11, '2502290809', 32, '2026-03', 12, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:08:12 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (75, 11, '2502290824', 32, '2026-03', 12, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:09:52 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (76, 11, '2502290833', 32, '2026-03', 15, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:09:18 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (77, 11, '2502290805', 32, '2026-03', 21, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:08:57 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (78, 11, '2502290804', 32, '2026-03', 18, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 16:38:23 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (79, 11, '2502290813', 32, '2026-03', 21, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:09:38 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (80, 11, '2502290801', 32, '2026-03', 6, '班级英语单词默写（默写全对）', 'Wed May 13 2026 00:04:12 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (81, 11, '2502290817', 32, '2026-03', 15, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:06:44 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (82, 11, '2502290803', 32, '2026-03', 6, '班级英语单词默写（默写全对）', 'Wed May 13 2026 00:08:18 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (83, 11, '2502290820', 32, '2026-03', 30, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:08:40 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (84, 11, '2502290825', 32, '2026-03', 9, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 12:10:39 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (85, 11, '2502290834', 32, '2026-03', 9, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 16:16:03 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (86, 11, '2502290826', 24, '2026-03', -15, '迟到1分钟（迟到）、迟到15分钟（3.25）、迟到18分钟（迟到）', 'Wed May 13 2026 17:03:03 GMT+0800 (中国标准时间)', NULL, '2026-03-09');
INSERT INTO `beauty_scores` VALUES (87, 11, '2502290818', 47, '2026-03', 25, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）、参加军训、运动会、秋游、成人仪式等重大活动（时政）、参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', 'Wed May 13 2026 17:19:02 GMT+0800 (中国标准时间)', NULL, '2026-03-09');
INSERT INTO `beauty_scores` VALUES (88, 11, '2502290819', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）', 'Tue May 12 2026 23:47:25 GMT+0800 (中国标准时间)', NULL, '2026-03-09');
INSERT INTO `beauty_scores` VALUES (89, 11, '2502290809', 47, '2026-03', 30, '参加军训、运动会、秋游、成人仪式等重大活动（参加比赛面试）、参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）、参加军训、运动会、秋游、成人仪式等重大活动（时政）、参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', 'Wed May 13 2026 17:19:40 GMT+0800 (中国标准时间)', NULL, '2026-03-09');
INSERT INTO `beauty_scores` VALUES (90, 11, '2502290829', 24, '2026-03', -5, '迟到10分钟（迟到）', 'Tue May 12 2026 23:48:22 GMT+0800 (中国标准时间)', NULL, '2026-03-10');
INSERT INTO `beauty_scores` VALUES (91, 11, '2502290830', 47, '2026-03', 10, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）', 'Tue May 12 2026 23:51:13 GMT+0800 (中国标准时间)', NULL, '2026-03-10');
INSERT INTO `beauty_scores` VALUES (92, 11, '2502290832', 47, '2026-03', 10, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）、参加军训、运动会、秋游、成人仪式等重大活动（广播操培训）', 'Wed May 13 2026 16:55:53 GMT+0800 (中国标准时间)', NULL, '2026-03-10');
INSERT INTO `beauty_scores` VALUES (93, 11, '2502290834', 47, '2026-03', 25, '参加军训、运动会、秋游、成人仪式等重大活动（参加广播操比赛培训）、参加军训、运动会、秋游、成人仪式等重大活动（时政）、参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', 'Wed May 13 2026 17:19:14 GMT+0800 (中国标准时间)', NULL, '2026-03-10');
INSERT INTO `beauty_scores` VALUES (94, 11, '2502290814', 32, '2026-03', 3, '班级英语单词默写（默写全对）', 'Tue May 12 2026 23:55:31 GMT+0800 (中国标准时间)', NULL, '2026-03-10');
INSERT INTO `beauty_scores` VALUES (95, 11, '2502290818', 32, '2026-03', 9, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 12:12:26 GMT+0800 (中国标准时间)', NULL, '2026-03-10');
INSERT INTO `beauty_scores` VALUES (96, 11, '2502290831', 33, '2026-03', -15, '不交作业，或抄袭作业（英语未交）、不交作业，或抄袭作业（语文未交）、不交作业，或抄袭作业（数学未交）', 'Wed May 13 2026 00:02:29 GMT+0800 (中国标准时间)', NULL, '2026-03-11');
INSERT INTO `beauty_scores` VALUES (97, 11, '2502290828', 33, '2026-03', -15, '不交作业，或抄袭作业（英语未交）、不交作业，或抄袭作业（语文未交）、不交作业，或抄袭作业（英语没交）', 'Wed May 13 2026 17:13:18 GMT+0800 (中国标准时间)', NULL, '2026-03-11');
INSERT INTO `beauty_scores` VALUES (98, 11, '2502290833', 33, '2026-03', -15, '不交作业，或抄袭作业（数学未交）、不交作业，或抄袭作业（英语没交）', 'Wed May 13 2026 17:13:29 GMT+0800 (中国标准时间)', NULL, '2026-03-11');
INSERT INTO `beauty_scores` VALUES (99, 11, '2502290832', 32, '2026-03', 6, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 16:17:20 GMT+0800 (中国标准时间)', NULL, '2026-03-12');
INSERT INTO `beauty_scores` VALUES (100, 11, '2502290826', 32, '2026-03', 3, '班级英语单词默写（默写全对）', 'Wed May 13 2026 00:09:15 GMT+0800 (中国标准时间)', NULL, '2026-03-12');
INSERT INTO `beauty_scores` VALUES (101, 11, '2502290807', 32, '2026-03', 9, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 16:40:01 GMT+0800 (中国标准时间)', NULL, '2026-03-12');
INSERT INTO `beauty_scores` VALUES (102, 11, '2502290806', 32, '2026-03', 9, '班级英语单词默写（默写全对）、班级英语单词默写（英语默写全对）', 'Wed May 13 2026 16:38:38 GMT+0800 (中国标准时间)', NULL, '2026-03-12');
INSERT INTO `beauty_scores` VALUES (103, 11, '2502290807', 52, '2026-03', 20, '省市级竞赛中获奖（创新创意 市级）', 'Wed May 13 2026 00:16:56 GMT+0800 (中国标准时间)', NULL, '2026-03-06');
INSERT INTO `beauty_scores` VALUES (104, 11, '2502290833', 39, '2026-03', 15, '参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（去医院看望同学）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:35:12 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (105, 11, '2502290832', 39, '2026-03', 15, '参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:34:38 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (106, 11, '2502290824', 39, '2026-03', 10, '参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:29:41 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (107, 11, '2502290827', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:14:54 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (108, 11, '2502290834', 39, '2026-03', 15, '参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:34:57 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (109, 11, '2502290823', 39, '2026-03', 10, '参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:29:52 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (110, 11, '2502290821', 39, '2026-03', 15, '参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:34:20 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (111, 11, '2502290801', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:16:39 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (112, 11, '2502290804', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:16:55 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (113, 11, '2502290808', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:17:13 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (114, 11, '2502290805', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:17:36 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (115, 11, '2502290803', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:17:58 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (116, 11, '2502290809', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:18:37 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (117, 11, '2502290807', 39, '2026-03', 15, '参与班级活动+5分（积极快速配合完成学校工作）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:33:54 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (118, 11, '2502290816', 39, '2026-03', 5, '参与班级活动+5分（积极快速配合完成学校工作）', 'Wed May 13 2026 11:19:28 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (119, 11, '2502290821', 17, '2026-03', -20, '仪容仪表扣分（戴手链）', 'Wed May 13 2026 11:21:17 GMT+0800 (中国标准时间)', NULL, '2026-03-16');
INSERT INTO `beauty_scores` VALUES (120, 11, '2502290828', 46, '2026-03', 38, '办公室劳动一次+1分（浇水）', 'Wed May 13 2026 11:25:35 GMT+0800 (中国标准时间)', NULL, '2026-03-17');
INSERT INTO `beauty_scores` VALUES (121, 11, '2502290803', 47, '2026-03', 25, '参加军训、运动会、秋游、成人仪式等重大活动（时政）、参加军训、运动会、秋游、成人仪式等重大活动（时政培训）、参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', 'Wed May 13 2026 17:19:25 GMT+0800 (中国标准时间)', NULL, '2026-03-17');
INSERT INTO `beauty_scores` VALUES (122, 11, '2502290814', 17, '2026-03', -5, '仪容仪表扣分（校服没拉）', 'Wed May 13 2026 11:37:49 GMT+0800 (中国标准时间)', NULL, '2026-03-17');
INSERT INTO `beauty_scores` VALUES (123, 11, '2502290815', 6, '2026-03', 4, '乐于助人（帮老师打饭）', 'Wed May 13 2026 16:12:54 GMT+0800 (中国标准时间)', NULL, '2026-03-17');
INSERT INTO `beauty_scores` VALUES (124, 11, '2502290811', 32, '2026-03', 12, '班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:07:49 GMT+0800 (中国标准时间)', NULL, '2026-03-17');
INSERT INTO `beauty_scores` VALUES (125, 11, '2502290823', 32, '2026-03', 3, '班级英语单词默写（英语默写全对）', 'Wed May 13 2026 12:11:55 GMT+0800 (中国标准时间)', NULL, '2026-03-17');
INSERT INTO `beauty_scores` VALUES (126, 11, '2502290814', 39, '2026-03', 15, '参与班级活动+5分（做海报）、参与班级活动+5分（去医院看望同学）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:28:08 GMT+0800 (中国标准时间)', NULL, '2026-03-18');
INSERT INTO `beauty_scores` VALUES (127, 11, '2502290830', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', 'Wed May 13 2026 16:10:02 GMT+0800 (中国标准时间)', NULL, '2026-03-18');
INSERT INTO `beauty_scores` VALUES (128, 11, '2502290818', 39, '2026-03', 15, '参与班级活动+5分（去医院看望同学）、参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:33:39 GMT+0800 (中国标准时间)', NULL, '2026-03-18');
INSERT INTO `beauty_scores` VALUES (129, 11, '2502290815', 39, '2026-03', 5, '参与班级活动+5分（去医院看望同学）', 'Wed May 13 2026 16:12:15 GMT+0800 (中国标准时间)', NULL, '2026-03-18');
INSERT INTO `beauty_scores` VALUES (130, 11, '2502290822', 32, '2026-03', 6, '班级英语单词默写（英语默写全对）', 'Wed May 13 2026 17:08:29 GMT+0800 (中国标准时间)', NULL, '2026-03-18');
INSERT INTO `beauty_scores` VALUES (131, 11, '2502290825', 35, '2026-03', 1, '作为领读员每次加1分（领读）', 'Wed May 13 2026 16:33:01 GMT+0800 (中国标准时间)', NULL, '2026-03-20');
INSERT INTO `beauty_scores` VALUES (132, 11, '2502290817', 39, '2026-03', 5, '参与班级活动+5分（参加辩论赛）', 'Wed May 13 2026 16:33:23 GMT+0800 (中国标准时间)', NULL, '2026-03-20');
INSERT INTO `beauty_scores` VALUES (133, 11, '2502290819', 35, '2026-03', 6, '作为领读员每次加1分（领读）', 'Wed May 13 2026 17:05:56 GMT+0800 (中国标准时间)', NULL, '2026-03-23');
INSERT INTO `beauty_scores` VALUES (134, 11, '2502290832', 17, '2026-03', -5, '仪容仪表扣分（没穿校裤）', 'Wed May 13 2026 16:45:30 GMT+0800 (中国标准时间)', NULL, '2026-03-23');
INSERT INTO `beauty_scores` VALUES (135, 11, '2502290818', 17, '2026-03', -5, '仪容仪表扣分（烫头发）', 'Wed May 13 2026 16:48:10 GMT+0800 (中国标准时间)', NULL, '2026-03-24');
INSERT INTO `beauty_scores` VALUES (137, 11, '2502290831', 24, '2026-03', -10, '迟到6分钟（3.25）、迟到1分钟（迟到）', 'Wed May 13 2026 17:02:38 GMT+0800 (中国标准时间)', NULL, '2026-03-25');
INSERT INTO `beauty_scores` VALUES (138, 11, '2502290829', 29, '2026-03', -10, '睡觉、说话、吃东西等（上课睡觉）、睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:16:06 GMT+0800 (中国标准时间)', NULL, '2026-03-25');
INSERT INTO `beauty_scores` VALUES (139, 11, '2502290818', 35, '2026-03', 2, '作为领读员每次加1分（领读）', 'Wed May 13 2026 17:18:14 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (140, 11, '2502290824', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（志愿者）', 'Wed May 13 2026 16:58:43 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (141, 11, '2502290834', 46, '2026-03', 1, '办公室劳动一次+1分（志愿者）', 'Wed May 13 2026 16:58:55 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (142, 11, '2502290805', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', 'Wed May 13 2026 17:00:25 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (143, 11, '2502290810', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', 'Wed May 13 2026 17:00:47 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (144, 11, '2502290811', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', 'Wed May 13 2026 17:01:05 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (145, 11, '2502290816', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', 'Wed May 13 2026 17:01:15 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (146, 11, '2502290804', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', 'Wed May 13 2026 17:01:46 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (147, 11, '2502290806', 47, '2026-03', 5, '参加军训、运动会、秋游、成人仪式等重大活动（创新创业讲座）', 'Wed May 13 2026 17:01:59 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (148, 11, '2502290834', 17, '2026-03', -5, '仪容仪表扣分（校服拉链没拉）', 'Wed May 13 2026 17:03:41 GMT+0800 (中国标准时间)', NULL, '2026-03-27');
INSERT INTO `beauty_scores` VALUES (149, 11, '2502290827', 33, '2026-03', -10, '不交作业，或抄袭作业（英语没交）', 'Wed May 13 2026 17:13:06 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (150, 11, '2502290819', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:14:55 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (151, 11, '2502290833', 29, '2026-03', -10, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:15:39 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (152, 11, '2502290825', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:15:26 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (153, 11, '2502290807', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:15:53 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (154, 11, '2502290820', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:16:20 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (155, 11, '2502290827', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:16:34 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (156, 11, '2502290818', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:16:46 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (157, 11, '2502290810', 28, '2026-03', -5, '玩手机、玩游戏等（睡觉）', 'Wed May 13 2026 17:17:01 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (158, 11, '2502290811', 29, '2026-03', -5, '睡觉、说话、吃东西等（睡觉）', 'Wed May 13 2026 17:17:13 GMT+0800 (中国标准时间)', NULL, '2026-03-30');
INSERT INTO `beauty_scores` VALUES (159, 11, '2502290824', 17, '2026-03', -5, '仪容仪表扣分（戴手链）', 'Wed May 13 2026 17:20:02 GMT+0800 (中国标准时间)', NULL, '2026-03-31');
INSERT INTO `beauty_scores` VALUES (160, 11, '2502290819', 35, '2026-04', 7, '作为领读员每次加1分（领读）', 'Thu May 14 2026 11:52:35 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (161, 11, '2502290821', 35, '2026-04', 2, '作为领读员每次加1分（领读）', 'Wed May 13 2026 19:04:52 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (162, 11, '2502290812', 6, '2026-04', 2, '乐于助人（批默写）', 'Wed May 13 2026 17:24:26 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (163, 11, '2502290822', 32, '2026-04', 21, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:55:11 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (164, 11, '2502290808', 32, '2026-04', 36, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:56:20 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (165, 11, '2502290813', 32, '2026-04', 30, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:49:28 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (166, 11, '2502290805', 32, '2026-04', 36, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:58:00 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (167, 11, '2502290825', 32, '2026-04', 24, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:49:44 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (168, 11, '2502290824', 32, '2026-04', 9, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:56:32 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (169, 11, '2502290820', 32, '2026-04', 36, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:54:28 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (170, 11, '2502290806', 32, '2026-04', 12, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:55:34 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (171, 11, '2502290804', 32, '2026-04', 24, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:57:34 GMT+0800 (中国标准时间)', NULL, '2026-04-01');
INSERT INTO `beauty_scores` VALUES (172, 11, '2502290818', 35, '2026-04', 3, '作为领读员每次加1分（领读）', 'Wed May 13 2026 19:27:59 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (173, 11, '2502290806', 38, '2026-04', 10, '参与黑板报活动（黑板报）、参与黑板报活动（4.7）', 'Wed May 13 2026 19:06:57 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (174, 11, '2502290817', 38, '2026-04', 10, '参与黑板报活动（黑板报）、参与黑板报活动（4.7）', 'Wed May 13 2026 19:07:28 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (175, 11, '2502290809', 38, '2026-04', 10, '参与黑板报活动（黑板报）、参与黑板报活动（4.7）', 'Wed May 13 2026 19:06:38 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (176, 11, '2502290832', 47, '2026-04', 35, '参加军训、运动会、秋游、成人仪式等重大活动（广播操）、参加军训、运动会、秋游、成人仪式等重大活动（英语默写全对）', 'Wed May 13 2026 20:04:40 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (177, 11, '2502290818', 47, '2026-04', 45, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）、参加军训、运动会、秋游、成人仪式等重大活动（跳绳）、参加军训、运动会、秋游、成人仪式等重大活动（篮球）', 'Thu May 14 2026 11:48:14 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (178, 11, '2502290803', 47, '2026-04', 35, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）、参加军训、运动会、秋游、成人仪式等重大活动（红十字）', 'Thu May 14 2026 11:53:48 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (179, 11, '2502290809', 47, '2026-04', 30, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）、参加军训、运动会、秋游、成人仪式等重大活动（领操）', 'Thu May 14 2026 11:59:49 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (180, 11, '2502290833', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', 'Wed May 13 2026 18:27:10 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (182, 11, '2502290821', 46, '2026-04', 2, '办公室劳动一次+1分（4.2）', 'Wed May 13 2026 20:24:33 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (183, 11, '2502290823', 31, '0042-04', 5, '作业好，受到教师表扬', 'Wed May 13 2026 18:27:49 GMT+0800 (中国标准时间)', NULL, '0042-04-02');
INSERT INTO `beauty_scores` VALUES (184, 11, '2502290824', 31, '2026-04', 5, '作业好，受到教师表扬', 'Wed May 13 2026 18:28:01 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (185, 11, '2502290826', 24, '2026-04', -20, '迟到2分钟（4.2）、迟到4分钟（4.3）、迟到12分钟（迟到）、迟到60分钟（迟到）', 'Thu May 14 2026 11:27:00 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (186, 11, '2502290831', 24, '2026-04', -35, '迟到145分钟（4.2）、迟到12分钟（4.3）、迟到130分钟（4.7）、迟到7分钟（4.8）、迟到11分钟（迟到）、迟到151分钟（迟到）、迟到8分钟（迟到）', 'Thu May 14 2026 11:47:02 GMT+0800 (中国标准时间)', NULL, '2026-04-02');
INSERT INTO `beauty_scores` VALUES (187, 11, '2502290820', 39, '2026-04', 10, '参与班级活动+5分（做表）', 'Wed May 13 2026 19:12:20 GMT+0800 (中国标准时间)', NULL, '2026-04-03');
INSERT INTO `beauty_scores` VALUES (188, 11, '2502290833', 24, '2026-04', -10, '迟到3分钟（4.3）、迟到11分钟（迟到）', 'Thu May 14 2026 11:52:00 GMT+0800 (中国标准时间)', NULL, '2026-04-03');
INSERT INTO `beauty_scores` VALUES (190, 11, '2502290834', 47, '2026-04', 25, '参加军训、运动会、秋游、成人仪式等重大活动（时政培训）', 'Wed May 13 2026 20:21:42 GMT+0800 (中国标准时间)', NULL, '2026-04-07');
INSERT INTO `beauty_scores` VALUES (191, 11, '2502290816', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', 'Wed May 13 2026 19:14:15 GMT+0800 (中国标准时间)', NULL, '2026-04-07');
INSERT INTO `beauty_scores` VALUES (192, 11, '2502290817', 32, '2026-04', 21, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:49:13 GMT+0800 (中国标准时间)', NULL, '2026-04-07');
INSERT INTO `beauty_scores` VALUES (193, 11, '2502290811', 32, '2026-04', 21, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:54:00 GMT+0800 (中国标准时间)', NULL, '2026-04-07');
INSERT INTO `beauty_scores` VALUES (194, 11, '2502290829', 32, '2026-04', 18, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:57:09 GMT+0800 (中国标准时间)', NULL, '2026-04-07');
INSERT INTO `beauty_scores` VALUES (195, 11, '2502290807', 32, '2026-04', 9, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:56:48 GMT+0800 (中国标准时间)', NULL, '2026-04-07');
INSERT INTO `beauty_scores` VALUES (196, 11, '2502290822', 31, '2026-04', 5, '作业好，受到教师表扬（英语默写全对）', 'Wed May 13 2026 19:20:05 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (197, 11, '2502290821', 32, '2026-04', 21, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:56:02 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (198, 11, '2502290811', 31, '2026-04', 5, '作业好，受到教师表扬（英语默写全对）', 'Wed May 13 2026 19:21:02 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (199, 11, '2502290833', 32, '2026-04', 6, '班级英语单词默写（英语默写全对）', 'Wed May 13 2026 19:54:31 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (200, 11, '2502290823', 32, '2026-04', 9, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:38:51 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (201, 11, '2502290821', 4, '2026-04', 5, '拾金不昧', 'Wed May 13 2026 19:29:36 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (202, 11, '2502290807', 6, '2026-04', 4, '乐于助人（批默写）', 'Thu May 14 2026 11:52:48 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (203, 11, '2502290823', 6, '2026-04', 2, '乐于助人（批默写）', 'Wed May 13 2026 19:30:25 GMT+0800 (中国标准时间)', NULL, '2026-04-08');
INSERT INTO `beauty_scores` VALUES (204, 11, '2502290807', 35, '2026-04', 5, '作为领读员每次加1分（领读）', 'Thu May 14 2026 11:41:53 GMT+0800 (中国标准时间)', NULL, '2026-04-09');
INSERT INTO `beauty_scores` VALUES (205, 11, '2502290809', 46, '2026-04', 1, '办公室劳动一次+1分（时政培训）', 'Wed May 13 2026 19:32:36 GMT+0800 (中国标准时间)', NULL, '2026-04-09');
INSERT INTO `beauty_scores` VALUES (206, 11, '2502290826', 17, '2026-04', -10, '仪容仪表扣分（没穿校服）、仪容仪表扣分（没拉拉链）', 'Thu May 14 2026 11:41:28 GMT+0800 (中国标准时间)', NULL, '2026-04-09');
INSERT INTO `beauty_scores` VALUES (207, 11, '2502290818', 17, '2026-04', -5, '仪容仪表扣分（没穿校服）', 'Wed May 13 2026 19:35:34 GMT+0800 (中国标准时间)', NULL, '2026-04-09');
INSERT INTO `beauty_scores` VALUES (208, 11, '2502290828', 29, '2026-04', -5, '睡觉、说话、吃东西等（小动作）', 'Wed May 13 2026 19:36:19 GMT+0800 (中国标准时间)', NULL, '2026-04-09');
INSERT INTO `beauty_scores` VALUES (209, 11, '2502290825', 29, '2026-04', -10, '睡觉、说话、吃东西等（大动作）、睡觉、说话、吃东西等（点外卖）', 'Wed May 13 2026 19:57:24 GMT+0800 (中国标准时间)', NULL, '2026-04-09');
INSERT INTO `beauty_scores` VALUES (210, 11, '2502290825', 24, '2026-04', -25, '迟到6分钟（迟到）、迟到1分钟（迟到）、迟到11分钟（迟到）、迟到18分钟（迟到）、迟到9分钟（迟到）', 'Thu May 14 2026 11:51:41 GMT+0800 (中国标准时间)', NULL, '2026-04-10');
INSERT INTO `beauty_scores` VALUES (211, 11, '2502290818', 6, '2026-04', 4, '乐于助人、乐于助人（帮老师）', 'Wed May 13 2026 19:58:29 GMT+0800 (中国标准时间)', NULL, '2026-04-10');
INSERT INTO `beauty_scores` VALUES (212, 11, '2502290827', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动', 'Wed May 13 2026 19:40:37 GMT+0800 (中国标准时间)', NULL, '2026-04-13');
INSERT INTO `beauty_scores` VALUES (213, 11, '2502290834', 32, '2026-04', 15, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:54:10 GMT+0800 (中国标准时间)', NULL, '2026-04-13');
INSERT INTO `beauty_scores` VALUES (214, 11, '2502290818', 18, '2026-04', 5, '尊敬师长，受到表扬', 'Wed May 13 2026 19:50:30 GMT+0800 (中国标准时间)', NULL, '2026-04-14');
INSERT INTO `beauty_scores` VALUES (215, 11, '2502290821', 6, '2026-04', 4, '乐于助人（批默写）', 'Thu May 14 2026 11:32:47 GMT+0800 (中国标准时间)', NULL, '2026-04-14');
INSERT INTO `beauty_scores` VALUES (216, 11, '2502290825', 17, '2026-04', -5, '仪容仪表扣分（戴手链）', 'Wed May 13 2026 19:57:43 GMT+0800 (中国标准时间)', NULL, '2026-04-14');
INSERT INTO `beauty_scores` VALUES (217, 11, '2502290832', 32, '2026-04', 9, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:57:49 GMT+0800 (中国标准时间)', NULL, '2026-04-15');
INSERT INTO `beauty_scores` VALUES (218, 11, '2502290819', 46, '2026-04', 1, '办公室劳动一次+1分', 'Wed May 13 2026 20:23:18 GMT+0800 (中国标准时间)', NULL, '2026-04-16');
INSERT INTO `beauty_scores` VALUES (219, 11, '2502290827', 46, '2026-04', 1, '办公室劳动一次+1分', 'Wed May 13 2026 20:26:29 GMT+0800 (中国标准时间)', NULL, '2026-04-16');
INSERT INTO `beauty_scores` VALUES (220, 11, '2502290821', 47, '2026-04', 10, '参加军训、运动会、秋游、成人仪式等重大活动（跳绳）', 'Thu May 14 2026 11:43:01 GMT+0800 (中国标准时间)', NULL, '2026-04-17');
INSERT INTO `beauty_scores` VALUES (225, 11, '2502290816', 24, '2026-04', -5, '迟到32分钟（迟到）', 'Thu May 14 2026 11:26:39 GMT+0800 (中国标准时间)', NULL, '2026-04-20');
INSERT INTO `beauty_scores` VALUES (226, 11, '2502290818', 32, '2026-04', 15, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:54:37 GMT+0800 (中国标准时间)', NULL, '2026-04-20');
INSERT INTO `beauty_scores` VALUES (227, 11, '2502290830', 32, '2026-04', 9, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:48:27 GMT+0800 (中国标准时间)', NULL, '2026-04-20');
INSERT INTO `beauty_scores` VALUES (228, 11, '2502290826', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:30:31 GMT+0800 (中国标准时间)', NULL, '2026-04-20');
INSERT INTO `beauty_scores` VALUES (229, 11, '2502290834', 6, '2026-04', 2, '乐于助人', 'Thu May 14 2026 11:32:06 GMT+0800 (中国标准时间)', NULL, '2026-04-20');
INSERT INTO `beauty_scores` VALUES (230, 11, '2502290832', 6, '2026-04', 4, '乐于助人', 'Thu May 14 2026 11:32:30 GMT+0800 (中国标准时间)', NULL, '2026-04-20');
INSERT INTO `beauty_scores` VALUES (231, 11, '2502290809', 32, '2026-04', 6, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:45:55 GMT+0800 (中国标准时间)', NULL, '2026-04-21');
INSERT INTO `beauty_scores` VALUES (232, 11, '2502290823', 47, '2026-04', 5, '参加军训、运动会、秋游、成人仪式等重大活动（跳绳）', 'Thu May 14 2026 11:43:41 GMT+0800 (中国标准时间)', NULL, '2026-04-22');
INSERT INTO `beauty_scores` VALUES (233, 11, '2502290815', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:46:21 GMT+0800 (中国标准时间)', NULL, '2026-04-22');
INSERT INTO `beauty_scores` VALUES (234, 11, '2502290823', 34, '2026-04', 5, '期中考试与期末考试，进步明显。每进步5个名次，依次递加5分（跳绳）', 'Thu May 14 2026 11:47:48 GMT+0800 (中国标准时间)', NULL, '2026-04-23');
INSERT INTO `beauty_scores` VALUES (235, 11, '2502290819', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:48:56 GMT+0800 (中国标准时间)', NULL, '2026-04-23');
INSERT INTO `beauty_scores` VALUES (236, 11, '2502290818', 46, '2026-04', 1, '办公室劳动一次+1分', 'Thu May 14 2026 11:53:04 GMT+0800 (中国标准时间)', NULL, '2026-04-24');
INSERT INTO `beauty_scores` VALUES (237, 11, '2502290803', 32, '2026-04', 3, '班级英语单词默写（英语默写全对）', 'Thu May 14 2026 11:54:50 GMT+0800 (中国标准时间)', NULL, '2026-04-24');
INSERT INTO `beauty_scores` VALUES (238, 11, '2502290814', 24, '2026-04', -5, '迟到7分钟（迟到）', 'Thu May 14 2026 11:58:24 GMT+0800 (中国标准时间)', NULL, '2026-04-27');
INSERT INTO `beauty_scores` VALUES (259, 11, '2502290801', 25, '2026-05', -3, '1课时', 'Fri May 22 2026 23:34:55 GMT+0800 (中国标准时间)', NULL, '2026-05-22');
UNLOCK TABLES;

-- 表: classes
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `grade` varchar(50) DEFAULT '',
  `user_id` int DEFAULT NULL,
  `created_by` varchar(100) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `classes` WRITE;
INSERT INTO `classes` VALUES (4, '23003', '', 41, '1111');
INSERT INTO `classes` VALUES (11, '25008', '', 40, '0187');
INSERT INTO `classes` VALUES (13, '23002班级', '23', NULL, '');
INSERT INTO `classes` VALUES (18, '12345班级', '12', NULL, '');
INSERT INTO `classes` VALUES (19, '20001班级', '20', NULL, '');
UNLOCK TABLES;

-- 表: club_activity_sessions
DROP TABLE IF EXISTS `club_activity_sessions`;
CREATE TABLE `club_activity_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_type` varchar(50) DEFAULT '社团',
  `course_name` varchar(200) DEFAULT '',
  `course_date` varchar(20) DEFAULT '',
  `scheduled_teacher` varchar(100) DEFAULT '',
  `substitute_teacher` varchar(100) DEFAULT '',
  `source_file` varchar(255) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_club_session` (`course_date`,`course_name`,`scheduled_teacher`),
  KEY `idx_club_date` (`course_date`),
  KEY `idx_club_course` (`course_name`),
  KEY `idx_club_teacher` (`scheduled_teacher`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: exams
DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `date` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `exams` WRITE;
INSERT INTO `exams` VALUES (13, '高一上期中', '2024-04-15');
INSERT INTO `exams` VALUES (14, '高一上期末', '2024-07-01');
INSERT INTO `exams` VALUES (15, '高一下期中', '2025-04-15');
INSERT INTO `exams` VALUES (16, '高一下期末', '2025-07-01');
INSERT INTO `exams` VALUES (17, '高二上期中', '2025-11-15');
INSERT INTO `exams` VALUES (18, '高二上期末', '2026-01-15');
INSERT INTO `exams` VALUES (19, '高二下期中', '2026-04-15');
INSERT INTO `exams` VALUES (20, '高二下期末', '2026-07-01');
INSERT INTO `exams` VALUES (21, '高三上期中', '2026-11-15');
INSERT INTO `exams` VALUES (22, '高三上期末', '2027-01-15');
INSERT INTO `exams` VALUES (23, '高三下期中', '2027-04-15');
INSERT INTO `exams` VALUES (24, '高三下期末', '2027-06-01');
UNLOCK TABLES;

-- 表: homework
DROP TABLE IF EXISTS `homework`;
CREATE TABLE `homework` (
  `id` int NOT NULL AUTO_INCREMENT,
  `semester` varchar(50) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `content` text,
  `created_by` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `class_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homework` (`semester`,`subject`,`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `homework` WRITE;
INSERT INTO `homework` VALUES (10, '高一下', '语文', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
INSERT INTO `homework` VALUES (11, '高一下', '物理', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
INSERT INTO `homework` VALUES (12, '高一下', '电工电子技术应用', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
INSERT INTO `homework` VALUES (13, '高一下', '数学', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
INSERT INTO `homework` VALUES (14, '高一下', '思想政治（心理健康与职业生涯）', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
INSERT INTO `homework` VALUES (15, '高一下', '历史', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
INSERT INTO `homework` VALUES (16, '高一下', '英语', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
INSERT INTO `homework` VALUES (17, '高一下', '计算机网络基础', '', '柯宇', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 'Mon May 18 2026 07:35:01 GMT+0800 (中国标准时间)', 11);
UNLOCK TABLES;

-- 表: homework_data
DROP TABLE IF EXISTS `homework_data`;
CREATE TABLE `homework_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `semester` varchar(50) NOT NULL,
  `class_id` int NOT NULL,
  `subject` varchar(100) NOT NULL,
  `date` varchar(20) NOT NULL,
  `student_id` int NOT NULL,
  `submitted` tinyint(1) DEFAULT '0',
  `created_by` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `late` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homework_data` (`semester`,`class_id`,`subject`,`date`,`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1089 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `homework_data` WRITE;
INSERT INTO `homework_data` VALUES (69, '高一下', 11, '数学', '2026-05-17', 509, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (70, '高一下', 11, '数学', '2026-05-17', 510, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (71, '高一下', 11, '数学', '2026-05-17', 511, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (72, '高一下', 11, '数学', '2026-05-17', 512, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (73, '高一下', 11, '数学', '2026-05-17', 513, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (74, '高一下', 11, '数学', '2026-05-17', 514, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (75, '高一下', 11, '数学', '2026-05-17', 515, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (76, '高一下', 11, '数学', '2026-05-17', 516, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (77, '高一下', 11, '数学', '2026-05-17', 517, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (78, '高一下', 11, '数学', '2026-05-17', 518, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (79, '高一下', 11, '数学', '2026-05-17', 519, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (80, '高一下', 11, '数学', '2026-05-17', 520, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (81, '高一下', 11, '数学', '2026-05-17', 521, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (82, '高一下', 11, '数学', '2026-05-17', 522, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (83, '高一下', 11, '数学', '2026-05-17', 523, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (84, '高一下', 11, '数学', '2026-05-17', 524, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (85, '高一下', 11, '数学', '2026-05-17', 525, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (86, '高一下', 11, '数学', '2026-05-17', 526, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (87, '高一下', 11, '数学', '2026-05-17', 527, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (88, '高一下', 11, '数学', '2026-05-17', 528, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (89, '高一下', 11, '数学', '2026-05-17', 529, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (90, '高一下', 11, '数学', '2026-05-17', 530, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (91, '高一下', 11, '数学', '2026-05-17', 531, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (92, '高一下', 11, '数学', '2026-05-17', 532, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (93, '高一下', 11, '数学', '2026-05-17', 533, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (94, '高一下', 11, '数学', '2026-05-17', 534, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (95, '高一下', 11, '数学', '2026-05-17', 535, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (96, '高一下', 11, '数学', '2026-05-17', 536, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (97, '高一下', 11, '数学', '2026-05-17', 537, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (98, '高一下', 11, '数学', '2026-05-17', 538, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (99, '高一下', 11, '数学', '2026-05-17', 539, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (100, '高一下', 11, '数学', '2026-05-17', 540, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (101, '高一下', 11, '数学', '2026-05-17', 541, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (102, '高一下', 11, '数学', '2026-05-17', 542, 1, '柯宇', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:50 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (103, '高一下', 11, '数学', '2026-05-10', 509, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (104, '高一下', 11, '数学', '2026-05-10', 510, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (105, '高一下', 11, '数学', '2026-05-10', 511, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (106, '高一下', 11, '数学', '2026-05-10', 512, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (107, '高一下', 11, '数学', '2026-05-10', 513, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (108, '高一下', 11, '数学', '2026-05-10', 514, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (109, '高一下', 11, '数学', '2026-05-10', 515, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (110, '高一下', 11, '数学', '2026-05-10', 516, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (111, '高一下', 11, '数学', '2026-05-10', 517, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (112, '高一下', 11, '数学', '2026-05-10', 518, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (113, '高一下', 11, '数学', '2026-05-10', 519, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (114, '高一下', 11, '数学', '2026-05-10', 520, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (115, '高一下', 11, '数学', '2026-05-10', 521, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (116, '高一下', 11, '数学', '2026-05-10', 522, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (117, '高一下', 11, '数学', '2026-05-10', 523, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (118, '高一下', 11, '数学', '2026-05-10', 524, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (119, '高一下', 11, '数学', '2026-05-10', 525, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (120, '高一下', 11, '数学', '2026-05-10', 526, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (121, '高一下', 11, '数学', '2026-05-10', 527, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (122, '高一下', 11, '数学', '2026-05-10', 528, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (123, '高一下', 11, '数学', '2026-05-10', 529, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (124, '高一下', 11, '数学', '2026-05-10', 530, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (125, '高一下', 11, '数学', '2026-05-10', 531, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (126, '高一下', 11, '数学', '2026-05-10', 532, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (127, '高一下', 11, '数学', '2026-05-10', 533, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (128, '高一下', 11, '数学', '2026-05-10', 534, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (129, '高一下', 11, '数学', '2026-05-10', 535, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (130, '高一下', 11, '数学', '2026-05-10', 536, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (131, '高一下', 11, '数学', '2026-05-10', 537, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (132, '高一下', 11, '数学', '2026-05-10', 538, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (133, '高一下', 11, '数学', '2026-05-10', 539, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (134, '高一下', 11, '数学', '2026-05-10', 540, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (135, '高一下', 11, '数学', '2026-05-10', 541, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (136, '高一下', 11, '数学', '2026-05-10', 542, 1, '柯宇', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 'Sun May 17 2026 13:49:52 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (205, '高一上', 11, '数学', '2026-05-17', 509, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (206, '高一上', 11, '数学', '2026-05-17', 510, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (207, '高一上', 11, '数学', '2026-05-17', 511, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (208, '高一上', 11, '数学', '2026-05-17', 512, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (209, '高一上', 11, '数学', '2026-05-17', 513, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (210, '高一上', 11, '数学', '2026-05-17', 514, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (211, '高一上', 11, '数学', '2026-05-17', 515, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (212, '高一上', 11, '数学', '2026-05-17', 516, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (213, '高一上', 11, '数学', '2026-05-17', 517, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (214, '高一上', 11, '数学', '2026-05-17', 518, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (215, '高一上', 11, '数学', '2026-05-17', 519, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (216, '高一上', 11, '数学', '2026-05-17', 520, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (217, '高一上', 11, '数学', '2026-05-17', 521, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (218, '高一上', 11, '数学', '2026-05-17', 522, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (219, '高一上', 11, '数学', '2026-05-17', 523, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (220, '高一上', 11, '数学', '2026-05-17', 524, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (221, '高一上', 11, '数学', '2026-05-17', 525, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (222, '高一上', 11, '数学', '2026-05-17', 526, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (223, '高一上', 11, '数学', '2026-05-17', 527, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (224, '高一上', 11, '数学', '2026-05-17', 528, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (225, '高一上', 11, '数学', '2026-05-17', 529, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (226, '高一上', 11, '数学', '2026-05-17', 530, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (227, '高一上', 11, '数学', '2026-05-17', 531, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (228, '高一上', 11, '数学', '2026-05-17', 532, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (229, '高一上', 11, '数学', '2026-05-17', 533, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (230, '高一上', 11, '数学', '2026-05-17', 534, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (231, '高一上', 11, '数学', '2026-05-17', 535, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (232, '高一上', 11, '数学', '2026-05-17', 536, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (233, '高一上', 11, '数学', '2026-05-17', 537, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (234, '高一上', 11, '数学', '2026-05-17', 538, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (235, '高一上', 11, '数学', '2026-05-17', 539, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (236, '高一上', 11, '数学', '2026-05-17', 540, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (237, '高一上', 11, '数学', '2026-05-17', 541, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (238, '高一上', 11, '数学', '2026-05-17', 542, 1, '柯宇', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 'Sun May 17 2026 14:46:04 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (545, '高一上', 11, '语文', '2026-05-17', 509, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (546, '高一上', 11, '语文', '2026-05-17', 510, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (547, '高一上', 11, '语文', '2026-05-17', 511, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (548, '高一上', 11, '语文', '2026-05-17', 512, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (549, '高一上', 11, '语文', '2026-05-17', 513, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (550, '高一上', 11, '语文', '2026-05-17', 514, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (551, '高一上', 11, '语文', '2026-05-17', 515, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (552, '高一上', 11, '语文', '2026-05-17', 516, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (553, '高一上', 11, '语文', '2026-05-17', 517, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (554, '高一上', 11, '语文', '2026-05-17', 518, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (555, '高一上', 11, '语文', '2026-05-17', 519, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (556, '高一上', 11, '语文', '2026-05-17', 520, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (557, '高一上', 11, '语文', '2026-05-17', 521, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (558, '高一上', 11, '语文', '2026-05-17', 522, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (559, '高一上', 11, '语文', '2026-05-17', 523, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (560, '高一上', 11, '语文', '2026-05-17', 524, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (561, '高一上', 11, '语文', '2026-05-17', 525, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (562, '高一上', 11, '语文', '2026-05-17', 526, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (563, '高一上', 11, '语文', '2026-05-17', 527, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (564, '高一上', 11, '语文', '2026-05-17', 528, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (565, '高一上', 11, '语文', '2026-05-17', 529, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (566, '高一上', 11, '语文', '2026-05-17', 530, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (567, '高一上', 11, '语文', '2026-05-17', 531, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (568, '高一上', 11, '语文', '2026-05-17', 532, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (569, '高一上', 11, '语文', '2026-05-17', 533, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (570, '高一上', 11, '语文', '2026-05-17', 534, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (571, '高一上', 11, '语文', '2026-05-17', 535, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (572, '高一上', 11, '语文', '2026-05-17', 536, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (573, '高一上', 11, '语文', '2026-05-17', 537, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (574, '高一上', 11, '语文', '2026-05-17', 538, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (575, '高一上', 11, '语文', '2026-05-17', 539, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (576, '高一上', 11, '语文', '2026-05-17', 540, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (577, '高一上', 11, '语文', '2026-05-17', 541, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (578, '高一上', 11, '语文', '2026-05-17', 542, 1, '柯宇', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 'Sun May 17 2026 20:54:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (613, '高一下', 11, '电工电子技术应用', '2026-05-18', 509, 0, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (614, '高一下', 11, '电工电子技术应用', '2026-05-18', 510, 0, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (615, '高一下', 11, '电工电子技术应用', '2026-05-18', 511, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (616, '高一下', 11, '电工电子技术应用', '2026-05-18', 512, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (617, '高一下', 11, '电工电子技术应用', '2026-05-18', 513, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (618, '高一下', 11, '电工电子技术应用', '2026-05-18', 514, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (619, '高一下', 11, '电工电子技术应用', '2026-05-18', 515, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (620, '高一下', 11, '电工电子技术应用', '2026-05-18', 516, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (621, '高一下', 11, '电工电子技术应用', '2026-05-18', 517, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (622, '高一下', 11, '电工电子技术应用', '2026-05-18', 518, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (623, '高一下', 11, '电工电子技术应用', '2026-05-18', 519, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (624, '高一下', 11, '电工电子技术应用', '2026-05-18', 520, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (625, '高一下', 11, '电工电子技术应用', '2026-05-18', 521, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (626, '高一下', 11, '电工电子技术应用', '2026-05-18', 522, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (627, '高一下', 11, '电工电子技术应用', '2026-05-18', 523, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (628, '高一下', 11, '电工电子技术应用', '2026-05-18', 524, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (629, '高一下', 11, '电工电子技术应用', '2026-05-18', 525, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (630, '高一下', 11, '电工电子技术应用', '2026-05-18', 526, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (631, '高一下', 11, '电工电子技术应用', '2026-05-18', 527, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (632, '高一下', 11, '电工电子技术应用', '2026-05-18', 528, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (633, '高一下', 11, '电工电子技术应用', '2026-05-18', 529, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (634, '高一下', 11, '电工电子技术应用', '2026-05-18', 530, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (635, '高一下', 11, '电工电子技术应用', '2026-05-18', 531, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (636, '高一下', 11, '电工电子技术应用', '2026-05-18', 532, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (637, '高一下', 11, '电工电子技术应用', '2026-05-18', 533, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (638, '高一下', 11, '电工电子技术应用', '2026-05-18', 534, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (639, '高一下', 11, '电工电子技术应用', '2026-05-18', 535, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (640, '高一下', 11, '电工电子技术应用', '2026-05-18', 536, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (641, '高一下', 11, '电工电子技术应用', '2026-05-18', 537, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (642, '高一下', 11, '电工电子技术应用', '2026-05-18', 538, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (643, '高一下', 11, '电工电子技术应用', '2026-05-18', 539, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (644, '高一下', 11, '电工电子技术应用', '2026-05-18', 540, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (645, '高一下', 11, '电工电子技术应用', '2026-05-18', 541, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (646, '高一下', 11, '电工电子技术应用', '2026-05-18', 542, 1, '柯宇', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:25 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (647, '高一下', 11, '语文', '2026-05-18', 509, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (648, '高一下', 11, '语文', '2026-05-18', 510, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (649, '高一下', 11, '语文', '2026-05-18', 511, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (650, '高一下', 11, '语文', '2026-05-18', 512, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (651, '高一下', 11, '语文', '2026-05-18', 513, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (652, '高一下', 11, '语文', '2026-05-18', 514, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (653, '高一下', 11, '语文', '2026-05-18', 515, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (654, '高一下', 11, '语文', '2026-05-18', 516, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (655, '高一下', 11, '语文', '2026-05-18', 517, 0, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (656, '高一下', 11, '语文', '2026-05-18', 518, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (657, '高一下', 11, '语文', '2026-05-18', 519, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (658, '高一下', 11, '语文', '2026-05-18', 520, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (659, '高一下', 11, '语文', '2026-05-18', 521, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (660, '高一下', 11, '语文', '2026-05-18', 522, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (661, '高一下', 11, '语文', '2026-05-18', 523, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (662, '高一下', 11, '语文', '2026-05-18', 524, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (663, '高一下', 11, '语文', '2026-05-18', 525, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (664, '高一下', 11, '语文', '2026-05-18', 526, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (665, '高一下', 11, '语文', '2026-05-18', 527, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (666, '高一下', 11, '语文', '2026-05-18', 528, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (667, '高一下', 11, '语文', '2026-05-18', 529, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (668, '高一下', 11, '语文', '2026-05-18', 530, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (669, '高一下', 11, '语文', '2026-05-18', 531, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (670, '高一下', 11, '语文', '2026-05-18', 532, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (671, '高一下', 11, '语文', '2026-05-18', 533, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (672, '高一下', 11, '语文', '2026-05-18', 534, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (673, '高一下', 11, '语文', '2026-05-18', 535, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (674, '高一下', 11, '语文', '2026-05-18', 536, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (675, '高一下', 11, '语文', '2026-05-18', 537, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (676, '高一下', 11, '语文', '2026-05-18', 538, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (677, '高一下', 11, '语文', '2026-05-18', 539, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (678, '高一下', 11, '语文', '2026-05-18', 540, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (679, '高一下', 11, '语文', '2026-05-18', 541, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (680, '高一下', 11, '语文', '2026-05-18', 542, 1, '柯宇', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 'Mon May 18 2026 08:28:43 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (749, '高一下', 11, '历史', '2026-05-19', 509, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (750, '高一下', 11, '历史', '2026-05-19', 510, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (751, '高一下', 11, '历史', '2026-05-19', 511, 0, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (752, '高一下', 11, '历史', '2026-05-19', 512, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (753, '高一下', 11, '历史', '2026-05-19', 513, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (754, '高一下', 11, '历史', '2026-05-19', 514, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (755, '高一下', 11, '历史', '2026-05-19', 515, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (756, '高一下', 11, '历史', '2026-05-19', 516, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (757, '高一下', 11, '历史', '2026-05-19', 517, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (758, '高一下', 11, '历史', '2026-05-19', 518, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (759, '高一下', 11, '历史', '2026-05-19', 519, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (760, '高一下', 11, '历史', '2026-05-19', 520, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (761, '高一下', 11, '历史', '2026-05-19', 521, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (762, '高一下', 11, '历史', '2026-05-19', 522, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (763, '高一下', 11, '历史', '2026-05-19', 523, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (764, '高一下', 11, '历史', '2026-05-19', 524, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (765, '高一下', 11, '历史', '2026-05-19', 525, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (766, '高一下', 11, '历史', '2026-05-19', 526, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (767, '高一下', 11, '历史', '2026-05-19', 527, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (768, '高一下', 11, '历史', '2026-05-19', 528, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (769, '高一下', 11, '历史', '2026-05-19', 529, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (770, '高一下', 11, '历史', '2026-05-19', 530, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (771, '高一下', 11, '历史', '2026-05-19', 531, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (772, '高一下', 11, '历史', '2026-05-19', 532, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (773, '高一下', 11, '历史', '2026-05-19', 533, 0, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (774, '高一下', 11, '历史', '2026-05-19', 534, 0, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (775, '高一下', 11, '历史', '2026-05-19', 535, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (776, '高一下', 11, '历史', '2026-05-19', 536, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (777, '高一下', 11, '历史', '2026-05-19', 537, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (778, '高一下', 11, '历史', '2026-05-19', 538, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (779, '高一下', 11, '历史', '2026-05-19', 539, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (780, '高一下', 11, '历史', '2026-05-19', 540, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (781, '高一下', 11, '历史', '2026-05-19', 541, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (782, '高一下', 11, '历史', '2026-05-19', 542, 1, '柯宇', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 'Mon May 18 2026 17:58:23 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1055, '高一下', 11, '历史', '2026-05-18', 509, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1056, '高一下', 11, '历史', '2026-05-18', 510, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1057, '高一下', 11, '历史', '2026-05-18', 511, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1058, '高一下', 11, '历史', '2026-05-18', 512, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1059, '高一下', 11, '历史', '2026-05-18', 513, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1060, '高一下', 11, '历史', '2026-05-18', 514, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1061, '高一下', 11, '历史', '2026-05-18', 515, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1062, '高一下', 11, '历史', '2026-05-18', 516, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1063, '高一下', 11, '历史', '2026-05-18', 517, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1064, '高一下', 11, '历史', '2026-05-18', 518, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1065, '高一下', 11, '历史', '2026-05-18', 519, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1066, '高一下', 11, '历史', '2026-05-18', 520, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1067, '高一下', 11, '历史', '2026-05-18', 521, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1068, '高一下', 11, '历史', '2026-05-18', 522, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1069, '高一下', 11, '历史', '2026-05-18', 523, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1070, '高一下', 11, '历史', '2026-05-18', 524, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1071, '高一下', 11, '历史', '2026-05-18', 525, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1072, '高一下', 11, '历史', '2026-05-18', 526, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1073, '高一下', 11, '历史', '2026-05-18', 527, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1074, '高一下', 11, '历史', '2026-05-18', 528, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1075, '高一下', 11, '历史', '2026-05-18', 529, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1076, '高一下', 11, '历史', '2026-05-18', 530, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1077, '高一下', 11, '历史', '2026-05-18', 531, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1078, '高一下', 11, '历史', '2026-05-18', 532, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1079, '高一下', 11, '历史', '2026-05-18', 533, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1080, '高一下', 11, '历史', '2026-05-18', 534, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1081, '高一下', 11, '历史', '2026-05-18', 535, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1082, '高一下', 11, '历史', '2026-05-18', 536, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1083, '高一下', 11, '历史', '2026-05-18', 537, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1084, '高一下', 11, '历史', '2026-05-18', 538, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1085, '高一下', 11, '历史', '2026-05-18', 539, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1086, '高一下', 11, '历史', '2026-05-18', 540, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1087, '高一下', 11, '历史', '2026-05-18', 541, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
INSERT INTO `homework_data` VALUES (1088, '高一下', 11, '历史', '2026-05-18', 542, 1, '柯宇', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 'Mon May 18 2026 18:18:11 GMT+0800 (中国标准时间)', 0);
UNLOCK TABLES;

-- 表: kick_events
DROP TABLE IF EXISTS `kick_events`;
CREATE TABLE `kick_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `message` text,
  `created_at` bigint NOT NULL,
  `processed_by` text,
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: kick_requests
DROP TABLE IF EXISTS `kick_requests`;
CREATE TABLE `kick_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `kick_requests` WRITE;
INSERT INTO `kick_requests` VALUES (1, '0187', '您的账号已在其他地方登录，您已被强制下线', 'Sun May 17 2026 11:52:27 GMT+0800 (中国标准时间)', 'Sun May 17 2026 11:52:27 GMT+0800 (中国标准时间)');
INSERT INTO `kick_requests` VALUES (2, '0187', '您的账号已在其他地方登录，您已被强制下线', 'Sun May 17 2026 11:52:29 GMT+0800 (中国标准时间)', 'Sun May 17 2026 11:52:29 GMT+0800 (中国标准时间)');
UNLOCK TABLES;

-- 表: scores
DROP TABLE IF EXISTS `scores`;
CREATE TABLE `scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `student_id` int NOT NULL,
  `subject` varchar(100) DEFAULT '',
  `total_score` decimal(10,2) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_exam_student_subject` (`exam_id`,`student_id`,`subject`)
) ENGINE=InnoDB AUTO_INCREMENT=7726 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `scores` WRITE;
INSERT INTO `scores` VALUES (4197, 13, 213, '体育与健康', 75, 41);
INSERT INTO `scores` VALUES (4198, 13, 213, '物理', 76, 41);
INSERT INTO `scores` VALUES (4199, 13, 213, '计算机系统配置', 83, 41);
INSERT INTO `scores` VALUES (4200, 13, 213, '历史', 90, 41);
INSERT INTO `scores` VALUES (4201, 13, 213, '英语', 67, 41);
INSERT INTO `scores` VALUES (4202, 13, 213, '人工智能通识', 69, 41);
INSERT INTO `scores` VALUES (4203, 13, 213, '语文', 71, 41);
INSERT INTO `scores` VALUES (4204, 13, 213, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4205, 13, 213, '数学', 97, 41);
INSERT INTO `scores` VALUES (4206, 13, 213, '思想政治（中国特色社会主义）', 91, 41);
INSERT INTO `scores` VALUES (4207, 13, 214, '体育与健康', 62, 41);
INSERT INTO `scores` VALUES (4208, 13, 214, '物理', 50, 41);
INSERT INTO `scores` VALUES (4209, 13, 214, '计算机系统配置', 75, 41);
INSERT INTO `scores` VALUES (4210, 13, 214, '历史', 87, 41);
INSERT INTO `scores` VALUES (4211, 13, 214, '英语', 60, 41);
INSERT INTO `scores` VALUES (4212, 13, 214, '人工智能通识', 78, 41);
INSERT INTO `scores` VALUES (4213, 13, 214, '语文', 70, 41);
INSERT INTO `scores` VALUES (4214, 13, 214, '习近平新时代中国特色社会主义思想', 89, 41);
INSERT INTO `scores` VALUES (4215, 13, 214, '数学', 63, 41);
INSERT INTO `scores` VALUES (4216, 13, 214, '思想政治（中国特色社会主义）', 89, 41);
INSERT INTO `scores` VALUES (4217, 13, 215, '体育与健康', 70, 41);
INSERT INTO `scores` VALUES (4218, 13, 215, '物理', 88, 41);
INSERT INTO `scores` VALUES (4219, 13, 215, '计算机系统配置', 81, 41);
INSERT INTO `scores` VALUES (4220, 13, 215, '历史', 87, 41);
INSERT INTO `scores` VALUES (4221, 13, 215, '英语', 38, 41);
INSERT INTO `scores` VALUES (4222, 13, 215, '人工智能通识', 86, 41);
INSERT INTO `scores` VALUES (4223, 13, 215, '语文', 64, 41);
INSERT INTO `scores` VALUES (4224, 13, 215, '习近平新时代中国特色社会主义思想', 92, 41);
INSERT INTO `scores` VALUES (4225, 13, 215, '数学', 60, 41);
INSERT INTO `scores` VALUES (4226, 13, 215, '思想政治（中国特色社会主义）', 91, 41);
INSERT INTO `scores` VALUES (4227, 13, 216, '体育与健康', 60, 41);
INSERT INTO `scores` VALUES (4228, 13, 216, '物理', 55, 41);
INSERT INTO `scores` VALUES (4229, 13, 216, '计算机系统配置', 87, 41);
INSERT INTO `scores` VALUES (4230, 13, 216, '历史', 85, 41);
INSERT INTO `scores` VALUES (4231, 13, 216, '英语', 60, 41);
INSERT INTO `scores` VALUES (4232, 13, 216, '人工智能通识', 75, 41);
INSERT INTO `scores` VALUES (4233, 13, 216, '语文', 64, 41);
INSERT INTO `scores` VALUES (4234, 13, 216, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4235, 13, 216, '数学', 84, 41);
INSERT INTO `scores` VALUES (4236, 13, 216, '思想政治（中国特色社会主义）', 89, 41);
INSERT INTO `scores` VALUES (4237, 13, 217, '体育与健康', 85, 41);
INSERT INTO `scores` VALUES (4238, 13, 217, '物理', 72, 41);
INSERT INTO `scores` VALUES (4239, 13, 217, '计算机系统配置', 80, 41);
INSERT INTO `scores` VALUES (4240, 13, 217, '历史', 90, 41);
INSERT INTO `scores` VALUES (4241, 13, 217, '英语', 81, 41);
INSERT INTO `scores` VALUES (4242, 13, 217, '人工智能通识', 78, 41);
INSERT INTO `scores` VALUES (4243, 13, 217, '语文', 64, 41);
INSERT INTO `scores` VALUES (4244, 13, 217, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4245, 13, 217, '数学', 49, 41);
INSERT INTO `scores` VALUES (4246, 13, 217, '思想政治（中国特色社会主义）', 88, 41);
INSERT INTO `scores` VALUES (4247, 13, 218, '体育与健康', 74, 41);
INSERT INTO `scores` VALUES (4248, 13, 218, '物理', 50, 41);
INSERT INTO `scores` VALUES (4249, 13, 218, '计算机系统配置', 78, 41);
INSERT INTO `scores` VALUES (4250, 13, 218, '历史', 71, 41);
INSERT INTO `scores` VALUES (4251, 13, 218, '英语', 60, 41);
INSERT INTO `scores` VALUES (4252, 13, 218, '人工智能通识', 78, 41);
INSERT INTO `scores` VALUES (4253, 13, 218, '语文', 60, 41);
INSERT INTO `scores` VALUES (4254, 13, 218, '习近平新时代中国特色社会主义思想', 75, 41);
INSERT INTO `scores` VALUES (4255, 13, 218, '数学', 60, 41);
INSERT INTO `scores` VALUES (4256, 13, 218, '思想政治（中国特色社会主义）', 91, 41);
INSERT INTO `scores` VALUES (4257, 13, 219, '体育与健康', 68, 41);
INSERT INTO `scores` VALUES (4258, 13, 219, '物理', 40, 41);
INSERT INTO `scores` VALUES (4259, 13, 219, '计算机系统配置', 78, 41);
INSERT INTO `scores` VALUES (4260, 13, 219, '历史', 86, 41);
INSERT INTO `scores` VALUES (4261, 13, 219, '英语', 38, 41);
INSERT INTO `scores` VALUES (4262, 13, 219, '人工智能通识', 83, 41);
INSERT INTO `scores` VALUES (4263, 13, 219, '语文', 62, 41);
INSERT INTO `scores` VALUES (4264, 13, 219, '习近平新时代中国特色社会主义思想', 92, 41);
INSERT INTO `scores` VALUES (4265, 13, 219, '数学', 66, 41);
INSERT INTO `scores` VALUES (4266, 13, 219, '思想政治（中国特色社会主义）', 85, 41);
INSERT INTO `scores` VALUES (4267, 13, 220, '体育与健康', 62, 41);
INSERT INTO `scores` VALUES (4268, 13, 220, '物理', 70, 41);
INSERT INTO `scores` VALUES (4269, 13, 220, '计算机系统配置', 81, 41);
INSERT INTO `scores` VALUES (4270, 13, 220, '历史', 93, 41);
INSERT INTO `scores` VALUES (4271, 13, 220, '英语', 47, 41);
INSERT INTO `scores` VALUES (4272, 13, 220, '人工智能通识', 77, 41);
INSERT INTO `scores` VALUES (4273, 13, 220, '语文', 66, 41);
INSERT INTO `scores` VALUES (4274, 13, 220, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4275, 13, 220, '数学', 48, 41);
INSERT INTO `scores` VALUES (4276, 13, 220, '思想政治（中国特色社会主义）', 80, 41);
INSERT INTO `scores` VALUES (4277, 13, 221, '体育与健康', 62, 41);
INSERT INTO `scores` VALUES (4278, 13, 221, '物理', 100, 41);
INSERT INTO `scores` VALUES (4279, 13, 221, '计算机系统配置', 76, 41);
INSERT INTO `scores` VALUES (4280, 13, 221, '历史', 83, 41);
INSERT INTO `scores` VALUES (4281, 13, 221, '英语', 61, 41);
INSERT INTO `scores` VALUES (4282, 13, 221, '人工智能通识', 68, 41);
INSERT INTO `scores` VALUES (4283, 13, 221, '语文', 61, 41);
INSERT INTO `scores` VALUES (4284, 13, 221, '习近平新时代中国特色社会主义思想', 80, 41);
INSERT INTO `scores` VALUES (4285, 13, 221, '数学', 82, 41);
INSERT INTO `scores` VALUES (4286, 13, 221, '思想政治（中国特色社会主义）', 85, 41);
INSERT INTO `scores` VALUES (4287, 13, 222, '体育与健康', 85, 41);
INSERT INTO `scores` VALUES (4288, 13, 222, '物理', 41, 41);
INSERT INTO `scores` VALUES (4289, 13, 222, '计算机系统配置', 78, 41);
INSERT INTO `scores` VALUES (4290, 13, 222, '历史', 88, 41);
INSERT INTO `scores` VALUES (4291, 13, 222, '英语', 40, 41);
INSERT INTO `scores` VALUES (4292, 13, 222, '人工智能通识', 73, 41);
INSERT INTO `scores` VALUES (4293, 13, 222, '语文', 54, 41);
INSERT INTO `scores` VALUES (4294, 13, 222, '习近平新时代中国特色社会主义思想', 89, 41);
INSERT INTO `scores` VALUES (4295, 13, 222, '数学', 60, 41);
INSERT INTO `scores` VALUES (4296, 13, 222, '思想政治（中国特色社会主义）', 88, 41);
INSERT INTO `scores` VALUES (4297, 13, 223, '体育与健康', 0, 41);
INSERT INTO `scores` VALUES (4298, 13, 223, '物理', 45, 41);
INSERT INTO `scores` VALUES (4299, 13, 223, '计算机系统配置', 78, 41);
INSERT INTO `scores` VALUES (4300, 13, 223, '历史', 90, 41);
INSERT INTO `scores` VALUES (4301, 13, 223, '英语', 60, 41);
INSERT INTO `scores` VALUES (4302, 13, 223, '人工智能通识', 79, 41);
INSERT INTO `scores` VALUES (4303, 13, 223, '语文', 73, 41);
INSERT INTO `scores` VALUES (4304, 13, 223, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4305, 13, 223, '数学', 67, 41);
INSERT INTO `scores` VALUES (4306, 13, 223, '思想政治（中国特色社会主义）', 91, 41);
INSERT INTO `scores` VALUES (4307, 13, 224, '体育与健康', 0, 41);
INSERT INTO `scores` VALUES (4308, 13, 224, '物理', 50, 41);
INSERT INTO `scores` VALUES (4309, 13, 224, '计算机系统配置', 67, 41);
INSERT INTO `scores` VALUES (4310, 13, 224, '历史', 66, 41);
INSERT INTO `scores` VALUES (4311, 13, 224, '英语', 65, 41);
INSERT INTO `scores` VALUES (4312, 13, 224, '人工智能通识', 70, 41);
INSERT INTO `scores` VALUES (4313, 13, 224, '语文', 43, 41);
INSERT INTO `scores` VALUES (4314, 13, 224, '习近平新时代中国特色社会主义思想', 80, 41);
INSERT INTO `scores` VALUES (4315, 13, 224, '数学', 44, 41);
INSERT INTO `scores` VALUES (4316, 13, 224, '思想政治（中国特色社会主义）', 83, 41);
INSERT INTO `scores` VALUES (4317, 13, 225, '体育与健康', 62, 41);
INSERT INTO `scores` VALUES (4318, 13, 225, '物理', 76, 41);
INSERT INTO `scores` VALUES (4319, 13, 225, '计算机系统配置', 81, 41);
INSERT INTO `scores` VALUES (4320, 13, 225, '历史', 83, 41);
INSERT INTO `scores` VALUES (4321, 13, 225, '英语', 60, 41);
INSERT INTO `scores` VALUES (4322, 13, 225, '人工智能通识', 80, 41);
INSERT INTO `scores` VALUES (4323, 13, 225, '语文', 64, 41);
INSERT INTO `scores` VALUES (4324, 13, 225, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4325, 13, 225, '数学', 69, 41);
INSERT INTO `scores` VALUES (4326, 13, 225, '思想政治（中国特色社会主义）', 92, 41);
INSERT INTO `scores` VALUES (4327, 13, 226, '体育与健康', 62, 41);
INSERT INTO `scores` VALUES (4328, 13, 226, '物理', 42, 41);
INSERT INTO `scores` VALUES (4329, 13, 226, '计算机系统配置', 81, 41);
INSERT INTO `scores` VALUES (4330, 13, 226, '历史', 90, 41);
INSERT INTO `scores` VALUES (4331, 13, 226, '英语', 43, 41);
INSERT INTO `scores` VALUES (4332, 13, 226, '人工智能通识', 85, 41);
INSERT INTO `scores` VALUES (4333, 13, 226, '语文', 60, 41);
INSERT INTO `scores` VALUES (4334, 13, 226, '习近平新时代中国特色社会主义思想', 95, 41);
INSERT INTO `scores` VALUES (4335, 13, 226, '数学', 60, 41);
INSERT INTO `scores` VALUES (4336, 13, 226, '思想政治（中国特色社会主义）', 92, 41);
INSERT INTO `scores` VALUES (4337, 13, 227, '体育与健康', 75, 41);
INSERT INTO `scores` VALUES (4338, 13, 227, '物理', 67, 41);
INSERT INTO `scores` VALUES (4339, 13, 227, '计算机系统配置', 83, 41);
INSERT INTO `scores` VALUES (4340, 13, 227, '历史', 90, 41);
INSERT INTO `scores` VALUES (4341, 13, 227, '英语', 60, 41);
INSERT INTO `scores` VALUES (4342, 13, 227, '人工智能通识', 80, 41);
INSERT INTO `scores` VALUES (4343, 13, 227, '语文', 60, 41);
INSERT INTO `scores` VALUES (4344, 13, 227, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4345, 13, 227, '数学', 82, 41);
INSERT INTO `scores` VALUES (4346, 13, 227, '思想政治（中国特色社会主义）', 94, 41);
INSERT INTO `scores` VALUES (4347, 13, 228, '体育与健康', 66, 41);
INSERT INTO `scores` VALUES (4348, 13, 228, '物理', 76, 41);
INSERT INTO `scores` VALUES (4349, 13, 228, '计算机系统配置', 71, 41);
INSERT INTO `scores` VALUES (4350, 13, 228, '历史', 81, 41);
INSERT INTO `scores` VALUES (4351, 13, 228, '英语', 60, 41);
INSERT INTO `scores` VALUES (4352, 13, 228, '人工智能通识', 67, 41);
INSERT INTO `scores` VALUES (4353, 13, 228, '语文', 70, 41);
INSERT INTO `scores` VALUES (4354, 13, 228, '习近平新时代中国特色社会主义思想', 80, 41);
INSERT INTO `scores` VALUES (4355, 13, 228, '数学', 78, 41);
INSERT INTO `scores` VALUES (4356, 13, 228, '思想政治（中国特色社会主义）', 72, 41);
INSERT INTO `scores` VALUES (4357, 13, 229, '体育与健康', 72, 41);
INSERT INTO `scores` VALUES (4358, 13, 229, '物理', 55, 41);
INSERT INTO `scores` VALUES (4359, 13, 229, '计算机系统配置', 76, 41);
INSERT INTO `scores` VALUES (4360, 13, 229, '历史', 83, 41);
INSERT INTO `scores` VALUES (4361, 13, 229, '英语', 42, 41);
INSERT INTO `scores` VALUES (4362, 13, 229, '人工智能通识', 74, 41);
INSERT INTO `scores` VALUES (4363, 13, 229, '语文', 70, 41);
INSERT INTO `scores` VALUES (4364, 13, 229, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4365, 13, 229, '数学', 88, 41);
INSERT INTO `scores` VALUES (4366, 13, 229, '思想政治（中国特色社会主义）', 92, 41);
INSERT INTO `scores` VALUES (4367, 13, 230, '体育与健康', 75, 41);
INSERT INTO `scores` VALUES (4368, 13, 230, '物理', 30, 41);
INSERT INTO `scores` VALUES (4369, 13, 230, '计算机系统配置', 81, 41);
INSERT INTO `scores` VALUES (4370, 13, 230, '历史', 87, 41);
INSERT INTO `scores` VALUES (4371, 13, 230, '英语', 60, 41);
INSERT INTO `scores` VALUES (4372, 13, 230, '人工智能通识', 82, 41);
INSERT INTO `scores` VALUES (4373, 13, 230, '语文', 47, 41);
INSERT INTO `scores` VALUES (4374, 13, 230, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4375, 13, 230, '数学', 47, 41);
INSERT INTO `scores` VALUES (4376, 13, 230, '思想政治（中国特色社会主义）', 88, 41);
INSERT INTO `scores` VALUES (4377, 13, 231, '体育与健康', 74, 41);
INSERT INTO `scores` VALUES (4378, 13, 231, '物理', 48, 41);
INSERT INTO `scores` VALUES (4379, 13, 231, '计算机系统配置', 76, 41);
INSERT INTO `scores` VALUES (4380, 13, 231, '历史', 89, 41);
INSERT INTO `scores` VALUES (4381, 13, 231, '英语', 63, 41);
INSERT INTO `scores` VALUES (4382, 13, 231, '人工智能通识', 70, 41);
INSERT INTO `scores` VALUES (4383, 13, 231, '语文', 64, 41);
INSERT INTO `scores` VALUES (4384, 13, 231, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4385, 13, 231, '数学', 60, 41);
INSERT INTO `scores` VALUES (4386, 13, 231, '思想政治（中国特色社会主义）', 97, 41);
INSERT INTO `scores` VALUES (4387, 13, 232, '体育与健康', 60, 41);
INSERT INTO `scores` VALUES (4388, 13, 232, '物理', 50, 41);
INSERT INTO `scores` VALUES (4389, 13, 232, '计算机系统配置', 85, 41);
INSERT INTO `scores` VALUES (4390, 13, 232, '历史', 97, 41);
INSERT INTO `scores` VALUES (4391, 13, 232, '英语', 66, 41);
INSERT INTO `scores` VALUES (4392, 13, 232, '人工智能通识', 79, 41);
INSERT INTO `scores` VALUES (4393, 13, 232, '语文', 72, 41);
INSERT INTO `scores` VALUES (4394, 13, 232, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4395, 13, 232, '数学', 40, 41);
INSERT INTO `scores` VALUES (4396, 13, 232, '思想政治（中国特色社会主义）', 94, 41);
INSERT INTO `scores` VALUES (4397, 13, 233, '体育与健康', 72, 41);
INSERT INTO `scores` VALUES (4398, 13, 233, '物理', 70, 41);
INSERT INTO `scores` VALUES (4399, 13, 233, '计算机系统配置', 74, 41);
INSERT INTO `scores` VALUES (4400, 13, 233, '历史', 75, 41);
INSERT INTO `scores` VALUES (4401, 13, 233, '英语', 43, 41);
INSERT INTO `scores` VALUES (4402, 13, 233, '人工智能通识', 85, 41);
INSERT INTO `scores` VALUES (4403, 13, 233, '语文', 60, 41);
INSERT INTO `scores` VALUES (4404, 13, 233, '习近平新时代中国特色社会主义思想', 89, 41);
INSERT INTO `scores` VALUES (4405, 13, 233, '数学', 31, 41);
INSERT INTO `scores` VALUES (4406, 13, 233, '思想政治（中国特色社会主义）', 86, 41);
INSERT INTO `scores` VALUES (4407, 13, 234, '体育与健康', 62, 41);
INSERT INTO `scores` VALUES (4408, 13, 234, '物理', 55, 41);
INSERT INTO `scores` VALUES (4409, 13, 234, '计算机系统配置', 78, 41);
INSERT INTO `scores` VALUES (4410, 13, 234, '历史', 83, 41);
INSERT INTO `scores` VALUES (4411, 13, 234, '英语', 37, 41);
INSERT INTO `scores` VALUES (4412, 13, 234, '人工智能通识', 75, 41);
INSERT INTO `scores` VALUES (4413, 13, 234, '语文', 65, 41);
INSERT INTO `scores` VALUES (4414, 13, 234, '习近平新时代中国特色社会主义思想', 73, 41);
INSERT INTO `scores` VALUES (4415, 13, 234, '数学', 60, 41);
INSERT INTO `scores` VALUES (4416, 13, 234, '思想政治（中国特色社会主义）', 87, 41);
INSERT INTO `scores` VALUES (4417, 13, 235, '体育与健康', 74, 41);
INSERT INTO `scores` VALUES (4418, 13, 235, '物理', 46, 41);
INSERT INTO `scores` VALUES (4419, 13, 235, '计算机系统配置', 81, 41);
INSERT INTO `scores` VALUES (4420, 13, 235, '历史', 82, 41);
INSERT INTO `scores` VALUES (4421, 13, 235, '英语', 37, 41);
INSERT INTO `scores` VALUES (4422, 13, 235, '人工智能通识', 72, 41);
INSERT INTO `scores` VALUES (4423, 13, 235, '语文', 51, 41);
INSERT INTO `scores` VALUES (4424, 13, 235, '习近平新时代中国特色社会主义思想', 90, 41);
INSERT INTO `scores` VALUES (4425, 13, 235, '数学', 62, 41);
INSERT INTO `scores` VALUES (4426, 13, 235, '思想政治（中国特色社会主义）', 85, 41);
INSERT INTO `scores` VALUES (4427, 13, 236, '体育与健康', 66, 41);
INSERT INTO `scores` VALUES (4428, 13, 236, '物理', 70, 41);
INSERT INTO `scores` VALUES (4429, 13, 236, '计算机系统配置', 83, 41);
INSERT INTO `scores` VALUES (4430, 13, 236, '历史', 83, 41);
INSERT INTO `scores` VALUES (4431, 13, 236, '英语', 60, 41);
INSERT INTO `scores` VALUES (4432, 13, 236, '人工智能通识', 76, 41);
INSERT INTO `scores` VALUES (4433, 13, 236, '语文', 53, 41);
INSERT INTO `scores` VALUES (4434, 13, 236, '习近平新时代中国特色社会主义思想', 91, 41);
INSERT INTO `scores` VALUES (4435, 13, 236, '数学', 60, 41);
INSERT INTO `scores` VALUES (4436, 13, 236, '思想政治（中国特色社会主义）', 87, 41);
INSERT INTO `scores` VALUES (6789, 13, 509, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (6790, 13, 509, '物理', 76, 40);
INSERT INTO `scores` VALUES (6791, 13, 509, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (6792, 13, 509, '历史', 90, 40);
INSERT INTO `scores` VALUES (6793, 13, 509, '英语', 67, 40);
INSERT INTO `scores` VALUES (6794, 13, 509, '人工智能通识', 69, 40);
INSERT INTO `scores` VALUES (6795, 13, 509, '语文', 71, 40);
INSERT INTO `scores` VALUES (6796, 13, 509, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6797, 13, 509, '数学', 97, 40);
INSERT INTO `scores` VALUES (6798, 13, 509, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (6799, 13, 510, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (6800, 13, 510, '物理', 50, 40);
INSERT INTO `scores` VALUES (6801, 13, 510, '计算机系统配置', 75, 40);
INSERT INTO `scores` VALUES (6802, 13, 510, '历史', 87, 40);
INSERT INTO `scores` VALUES (6803, 13, 510, '英语', 60, 40);
INSERT INTO `scores` VALUES (6804, 13, 510, '人工智能通识', 78, 40);
INSERT INTO `scores` VALUES (6805, 13, 510, '语文', 70, 40);
INSERT INTO `scores` VALUES (6806, 13, 510, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (6807, 13, 510, '数学', 63, 40);
INSERT INTO `scores` VALUES (6808, 13, 510, '思想政治（中国特色社会主义）', 89, 40);
INSERT INTO `scores` VALUES (6809, 13, 511, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (6810, 13, 511, '物理', 88, 40);
INSERT INTO `scores` VALUES (6811, 13, 511, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (6812, 13, 511, '历史', 87, 40);
INSERT INTO `scores` VALUES (6813, 13, 511, '英语', 38, 40);
INSERT INTO `scores` VALUES (6814, 13, 511, '人工智能通识', 86, 40);
INSERT INTO `scores` VALUES (6815, 13, 511, '语文', 64, 40);
INSERT INTO `scores` VALUES (6816, 13, 511, '习近平新时代中国特色社会主义思想', 92, 40);
INSERT INTO `scores` VALUES (6817, 13, 511, '数学', 60, 40);
INSERT INTO `scores` VALUES (6818, 13, 511, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (6819, 13, 512, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (6820, 13, 512, '物理', 55, 40);
INSERT INTO `scores` VALUES (6821, 13, 512, '计算机系统配置', 87, 40);
INSERT INTO `scores` VALUES (6822, 13, 512, '历史', 85, 40);
INSERT INTO `scores` VALUES (6823, 13, 512, '英语', 60, 40);
INSERT INTO `scores` VALUES (6824, 13, 512, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (6825, 13, 512, '语文', 64, 40);
INSERT INTO `scores` VALUES (6826, 13, 512, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6827, 13, 512, '数学', 84, 40);
INSERT INTO `scores` VALUES (6828, 13, 512, '思想政治（中国特色社会主义）', 89, 40);
INSERT INTO `scores` VALUES (6829, 13, 513, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (6830, 13, 513, '物理', 72, 40);
INSERT INTO `scores` VALUES (6831, 13, 513, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (6832, 13, 513, '历史', 90, 40);
INSERT INTO `scores` VALUES (6833, 13, 513, '英语', 81, 40);
INSERT INTO `scores` VALUES (6834, 13, 513, '人工智能通识', 78, 40);
INSERT INTO `scores` VALUES (6835, 13, 513, '语文', 64, 40);
INSERT INTO `scores` VALUES (6836, 13, 513, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6837, 13, 513, '数学', 49, 40);
INSERT INTO `scores` VALUES (6838, 13, 513, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (6839, 13, 514, '体育与健康', 74, 40);
INSERT INTO `scores` VALUES (6840, 13, 514, '物理', 50, 40);
INSERT INTO `scores` VALUES (6841, 13, 514, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (6842, 13, 514, '历史', 71, 40);
INSERT INTO `scores` VALUES (6843, 13, 514, '英语', 60, 40);
INSERT INTO `scores` VALUES (6844, 13, 514, '人工智能通识', 78, 40);
INSERT INTO `scores` VALUES (6845, 13, 514, '语文', 60, 40);
INSERT INTO `scores` VALUES (6846, 13, 514, '习近平新时代中国特色社会主义思想', 75, 40);
INSERT INTO `scores` VALUES (6847, 13, 514, '数学', 60, 40);
INSERT INTO `scores` VALUES (6848, 13, 514, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (6849, 13, 515, '体育与健康', 68, 40);
INSERT INTO `scores` VALUES (6850, 13, 515, '物理', 40, 40);
INSERT INTO `scores` VALUES (6851, 13, 515, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (6852, 13, 515, '历史', 86, 40);
INSERT INTO `scores` VALUES (6853, 13, 515, '英语', 38, 40);
INSERT INTO `scores` VALUES (6854, 13, 515, '人工智能通识', 83, 40);
INSERT INTO `scores` VALUES (6855, 13, 515, '语文', 62, 40);
INSERT INTO `scores` VALUES (6856, 13, 515, '习近平新时代中国特色社会主义思想', 92, 40);
INSERT INTO `scores` VALUES (6857, 13, 515, '数学', 66, 40);
INSERT INTO `scores` VALUES (6858, 13, 515, '思想政治（中国特色社会主义）', 85, 40);
INSERT INTO `scores` VALUES (6859, 13, 516, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (6860, 13, 516, '物理', 70, 40);
INSERT INTO `scores` VALUES (6861, 13, 516, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (6862, 13, 516, '历史', 93, 40);
INSERT INTO `scores` VALUES (6863, 13, 516, '英语', 47, 40);
INSERT INTO `scores` VALUES (6864, 13, 516, '人工智能通识', 77, 40);
INSERT INTO `scores` VALUES (6865, 13, 516, '语文', 66, 40);
INSERT INTO `scores` VALUES (6866, 13, 516, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6867, 13, 516, '数学', 48, 40);
INSERT INTO `scores` VALUES (6868, 13, 516, '思想政治（中国特色社会主义）', 80, 40);
INSERT INTO `scores` VALUES (6869, 13, 517, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (6870, 13, 517, '物理', 100, 40);
INSERT INTO `scores` VALUES (6871, 13, 517, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (6872, 13, 517, '历史', 83, 40);
INSERT INTO `scores` VALUES (6873, 13, 517, '英语', 61, 40);
INSERT INTO `scores` VALUES (6874, 13, 517, '人工智能通识', 68, 40);
INSERT INTO `scores` VALUES (6875, 13, 517, '语文', 61, 40);
INSERT INTO `scores` VALUES (6876, 13, 517, '习近平新时代中国特色社会主义思想', 80, 40);
INSERT INTO `scores` VALUES (6877, 13, 517, '数学', 82, 40);
INSERT INTO `scores` VALUES (6878, 13, 517, '思想政治（中国特色社会主义）', 85, 40);
INSERT INTO `scores` VALUES (6879, 13, 518, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (6880, 13, 518, '物理', 41, 40);
INSERT INTO `scores` VALUES (6881, 13, 518, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (6882, 13, 518, '历史', 88, 40);
INSERT INTO `scores` VALUES (6883, 13, 518, '英语', 40, 40);
INSERT INTO `scores` VALUES (6884, 13, 518, '人工智能通识', 73, 40);
INSERT INTO `scores` VALUES (6885, 13, 518, '语文', 54, 40);
INSERT INTO `scores` VALUES (6886, 13, 518, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (6887, 13, 518, '数学', 60, 40);
INSERT INTO `scores` VALUES (6888, 13, 518, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (6889, 13, 519, '物理', 45, 40);
INSERT INTO `scores` VALUES (6890, 13, 519, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (6891, 13, 519, '历史', 90, 40);
INSERT INTO `scores` VALUES (6892, 13, 519, '英语', 60, 40);
INSERT INTO `scores` VALUES (6893, 13, 519, '人工智能通识', 79, 40);
INSERT INTO `scores` VALUES (6894, 13, 519, '语文', 73, 40);
INSERT INTO `scores` VALUES (6895, 13, 519, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6896, 13, 519, '数学', 67, 40);
INSERT INTO `scores` VALUES (6897, 13, 519, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (6898, 13, 520, '物理', 50, 40);
INSERT INTO `scores` VALUES (6899, 13, 520, '计算机系统配置', 67, 40);
INSERT INTO `scores` VALUES (6900, 13, 520, '历史', 66, 40);
INSERT INTO `scores` VALUES (6901, 13, 520, '英语', 65, 40);
INSERT INTO `scores` VALUES (6902, 13, 520, '人工智能通识', 70, 40);
INSERT INTO `scores` VALUES (6903, 13, 520, '语文', 43, 40);
INSERT INTO `scores` VALUES (6904, 13, 520, '习近平新时代中国特色社会主义思想', 80, 40);
INSERT INTO `scores` VALUES (6905, 13, 520, '数学', 44, 40);
INSERT INTO `scores` VALUES (6906, 13, 520, '思想政治（中国特色社会主义）', 83, 40);
INSERT INTO `scores` VALUES (6907, 13, 521, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (6908, 13, 521, '物理', 76, 40);
INSERT INTO `scores` VALUES (6909, 13, 521, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (6910, 13, 521, '历史', 83, 40);
INSERT INTO `scores` VALUES (6911, 13, 521, '英语', 60, 40);
INSERT INTO `scores` VALUES (6912, 13, 521, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (6913, 13, 521, '语文', 64, 40);
INSERT INTO `scores` VALUES (6914, 13, 521, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6915, 13, 521, '数学', 69, 40);
INSERT INTO `scores` VALUES (6916, 13, 521, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (6917, 13, 522, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (6918, 13, 522, '物理', 42, 40);
INSERT INTO `scores` VALUES (6919, 13, 522, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (6920, 13, 522, '历史', 90, 40);
INSERT INTO `scores` VALUES (6921, 13, 522, '英语', 43, 40);
INSERT INTO `scores` VALUES (6922, 13, 522, '人工智能通识', 85, 40);
INSERT INTO `scores` VALUES (6923, 13, 522, '语文', 60, 40);
INSERT INTO `scores` VALUES (6924, 13, 522, '习近平新时代中国特色社会主义思想', 95, 40);
INSERT INTO `scores` VALUES (6925, 13, 522, '数学', 60, 40);
INSERT INTO `scores` VALUES (6926, 13, 522, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (6927, 13, 523, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (6928, 13, 523, '物理', 67, 40);
INSERT INTO `scores` VALUES (6929, 13, 523, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (6930, 13, 523, '历史', 90, 40);
INSERT INTO `scores` VALUES (6931, 13, 523, '英语', 60, 40);
INSERT INTO `scores` VALUES (6932, 13, 523, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (6933, 13, 523, '语文', 60, 40);
INSERT INTO `scores` VALUES (6934, 13, 523, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6935, 13, 523, '数学', 82, 40);
INSERT INTO `scores` VALUES (6936, 13, 523, '思想政治（中国特色社会主义）', 94, 40);
INSERT INTO `scores` VALUES (6937, 13, 524, '体育与健康', 66, 40);
INSERT INTO `scores` VALUES (6938, 13, 524, '物理', 76, 40);
INSERT INTO `scores` VALUES (6939, 13, 524, '计算机系统配置', 71, 40);
INSERT INTO `scores` VALUES (6940, 13, 524, '历史', 81, 40);
INSERT INTO `scores` VALUES (6941, 13, 524, '英语', 60, 40);
INSERT INTO `scores` VALUES (6942, 13, 524, '人工智能通识', 67, 40);
INSERT INTO `scores` VALUES (6943, 13, 524, '语文', 70, 40);
INSERT INTO `scores` VALUES (6944, 13, 524, '习近平新时代中国特色社会主义思想', 80, 40);
INSERT INTO `scores` VALUES (6945, 13, 524, '数学', 78, 40);
INSERT INTO `scores` VALUES (6946, 13, 524, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (6947, 13, 525, '体育与健康', 72, 40);
INSERT INTO `scores` VALUES (6948, 13, 525, '物理', 55, 40);
INSERT INTO `scores` VALUES (6949, 13, 525, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (6950, 13, 525, '历史', 83, 40);
INSERT INTO `scores` VALUES (6951, 13, 525, '英语', 42, 40);
INSERT INTO `scores` VALUES (6952, 13, 525, '人工智能通识', 74, 40);
INSERT INTO `scores` VALUES (6953, 13, 525, '语文', 70, 40);
INSERT INTO `scores` VALUES (6954, 13, 525, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6955, 13, 525, '数学', 88, 40);
INSERT INTO `scores` VALUES (6956, 13, 525, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (6957, 13, 526, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (6958, 13, 526, '物理', 30, 40);
INSERT INTO `scores` VALUES (6959, 13, 526, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (6960, 13, 526, '历史', 87, 40);
INSERT INTO `scores` VALUES (6961, 13, 526, '英语', 60, 40);
INSERT INTO `scores` VALUES (6962, 13, 526, '人工智能通识', 82, 40);
INSERT INTO `scores` VALUES (6963, 13, 526, '语文', 47, 40);
INSERT INTO `scores` VALUES (6964, 13, 526, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6965, 13, 526, '数学', 47, 40);
INSERT INTO `scores` VALUES (6966, 13, 526, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (6967, 13, 527, '体育与健康', 74, 40);
INSERT INTO `scores` VALUES (6968, 13, 527, '物理', 48, 40);
INSERT INTO `scores` VALUES (6969, 13, 527, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (6970, 13, 527, '历史', 89, 40);
INSERT INTO `scores` VALUES (6971, 13, 527, '英语', 63, 40);
INSERT INTO `scores` VALUES (6972, 13, 527, '人工智能通识', 70, 40);
INSERT INTO `scores` VALUES (6973, 13, 527, '语文', 64, 40);
INSERT INTO `scores` VALUES (6974, 13, 527, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6975, 13, 527, '数学', 60, 40);
INSERT INTO `scores` VALUES (6976, 13, 527, '思想政治（中国特色社会主义）', 97, 40);
INSERT INTO `scores` VALUES (6977, 13, 528, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (6978, 13, 528, '物理', 50, 40);
INSERT INTO `scores` VALUES (6979, 13, 528, '计算机系统配置', 85, 40);
INSERT INTO `scores` VALUES (6980, 13, 528, '历史', 97, 40);
INSERT INTO `scores` VALUES (6981, 13, 528, '英语', 66, 40);
INSERT INTO `scores` VALUES (6982, 13, 528, '人工智能通识', 79, 40);
INSERT INTO `scores` VALUES (6983, 13, 528, '语文', 72, 40);
INSERT INTO `scores` VALUES (6984, 13, 528, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (6985, 13, 528, '数学', 40, 40);
INSERT INTO `scores` VALUES (6986, 13, 528, '思想政治（中国特色社会主义）', 94, 40);
INSERT INTO `scores` VALUES (6987, 13, 529, '体育与健康', 72, 40);
INSERT INTO `scores` VALUES (6988, 13, 529, '物理', 70, 40);
INSERT INTO `scores` VALUES (6989, 13, 529, '计算机系统配置', 74, 40);
INSERT INTO `scores` VALUES (6990, 13, 529, '历史', 75, 40);
INSERT INTO `scores` VALUES (6991, 13, 529, '英语', 43, 40);
INSERT INTO `scores` VALUES (6992, 13, 529, '人工智能通识', 85, 40);
INSERT INTO `scores` VALUES (6993, 13, 529, '语文', 60, 40);
INSERT INTO `scores` VALUES (6994, 13, 529, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (6995, 13, 529, '数学', 31, 40);
INSERT INTO `scores` VALUES (6996, 13, 529, '思想政治（中国特色社会主义）', 86, 40);
INSERT INTO `scores` VALUES (6997, 13, 530, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (6998, 13, 530, '物理', 55, 40);
INSERT INTO `scores` VALUES (6999, 13, 530, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (7000, 13, 530, '历史', 83, 40);
INSERT INTO `scores` VALUES (7001, 13, 530, '英语', 37, 40);
INSERT INTO `scores` VALUES (7002, 13, 530, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (7003, 13, 530, '语文', 65, 40);
INSERT INTO `scores` VALUES (7004, 13, 530, '习近平新时代中国特色社会主义思想', 73, 40);
INSERT INTO `scores` VALUES (7005, 13, 530, '数学', 60, 40);
INSERT INTO `scores` VALUES (7006, 13, 530, '思想政治（中国特色社会主义）', 87, 40);
INSERT INTO `scores` VALUES (7007, 13, 531, '体育与健康', 74, 40);
INSERT INTO `scores` VALUES (7008, 13, 531, '物理', 46, 40);
INSERT INTO `scores` VALUES (7009, 13, 531, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (7010, 13, 531, '历史', 82, 40);
INSERT INTO `scores` VALUES (7011, 13, 531, '英语', 37, 40);
INSERT INTO `scores` VALUES (7012, 13, 531, '人工智能通识', 72, 40);
INSERT INTO `scores` VALUES (7013, 13, 531, '语文', 51, 40);
INSERT INTO `scores` VALUES (7014, 13, 531, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (7015, 13, 531, '数学', 62, 40);
INSERT INTO `scores` VALUES (7016, 13, 531, '思想政治（中国特色社会主义）', 85, 40);
INSERT INTO `scores` VALUES (7017, 13, 532, '体育与健康', 66, 40);
INSERT INTO `scores` VALUES (7018, 13, 532, '物理', 70, 40);
INSERT INTO `scores` VALUES (7019, 13, 532, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (7020, 13, 532, '历史', 83, 40);
INSERT INTO `scores` VALUES (7021, 13, 532, '英语', 60, 40);
INSERT INTO `scores` VALUES (7022, 13, 532, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (7023, 13, 532, '语文', 53, 40);
INSERT INTO `scores` VALUES (7024, 13, 532, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (7025, 13, 532, '数学', 60, 40);
INSERT INTO `scores` VALUES (7026, 13, 532, '思想政治（中国特色社会主义）', 87, 40);
INSERT INTO `scores` VALUES (7027, 13, 533, '物理', 60, 40);
INSERT INTO `scores` VALUES (7028, 13, 533, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (7029, 13, 533, '历史', 82, 40);
INSERT INTO `scores` VALUES (7030, 13, 533, '英语', 60, 40);
INSERT INTO `scores` VALUES (7031, 13, 533, '人工智能通识', 69, 40);
INSERT INTO `scores` VALUES (7032, 13, 533, '语文', 60, 40);
INSERT INTO `scores` VALUES (7033, 13, 533, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (7034, 13, 533, '数学', 45, 40);
INSERT INTO `scores` VALUES (7035, 13, 533, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (7036, 13, 534, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (7037, 13, 534, '物理', 61, 40);
INSERT INTO `scores` VALUES (7038, 13, 534, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (7039, 13, 534, '历史', 57, 40);
INSERT INTO `scores` VALUES (7040, 13, 534, '英语', 37, 40);
INSERT INTO `scores` VALUES (7041, 13, 534, '人工智能通识', 68, 40);
INSERT INTO `scores` VALUES (7042, 13, 534, '语文', 45, 40);
INSERT INTO `scores` VALUES (7043, 13, 534, '习近平新时代中国特色社会主义思想', 75, 40);
INSERT INTO `scores` VALUES (7044, 13, 534, '数学', 83, 40);
INSERT INTO `scores` VALUES (7045, 13, 534, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (7046, 13, 535, '体育与健康', 64, 40);
INSERT INTO `scores` VALUES (7047, 13, 535, '物理', 83, 40);
INSERT INTO `scores` VALUES (7048, 13, 535, '计算机系统配置', 74, 40);
INSERT INTO `scores` VALUES (7049, 13, 535, '历史', 70, 40);
INSERT INTO `scores` VALUES (7050, 13, 535, '英语', 49, 40);
INSERT INTO `scores` VALUES (7051, 13, 535, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (7052, 13, 535, '语文', 54, 40);
INSERT INTO `scores` VALUES (7053, 13, 535, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (7054, 13, 535, '数学', 60, 40);
INSERT INTO `scores` VALUES (7055, 13, 535, '思想政治（中国特色社会主义）', 86, 40);
INSERT INTO `scores` VALUES (7056, 13, 536, '体育与健康', 55, 40);
INSERT INTO `scores` VALUES (7057, 13, 536, '物理', 42, 40);
INSERT INTO `scores` VALUES (7058, 13, 536, '计算机系统配置', 79, 40);
INSERT INTO `scores` VALUES (7059, 13, 536, '历史', 73, 40);
INSERT INTO `scores` VALUES (7060, 13, 536, '英语', 40, 40);
INSERT INTO `scores` VALUES (7061, 13, 536, '人工智能通识', 82, 40);
INSERT INTO `scores` VALUES (7062, 13, 536, '语文', 54, 40);
INSERT INTO `scores` VALUES (7063, 13, 536, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (7064, 13, 536, '数学', 82, 40);
INSERT INTO `scores` VALUES (7065, 13, 536, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (7066, 13, 537, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (7067, 13, 537, '物理', 61, 40);
INSERT INTO `scores` VALUES (7068, 13, 537, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (7069, 13, 537, '历史', 83, 40);
INSERT INTO `scores` VALUES (7070, 13, 537, '英语', 49, 40);
INSERT INTO `scores` VALUES (7071, 13, 537, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (7072, 13, 537, '语文', 60, 40);
INSERT INTO `scores` VALUES (7073, 13, 537, '习近平新时代中国特色社会主义思想', 88, 40);
INSERT INTO `scores` VALUES (7074, 13, 537, '数学', 93, 40);
INSERT INTO `scores` VALUES (7075, 13, 537, '思想政治（中国特色社会主义）', 86, 40);
INSERT INTO `scores` VALUES (7076, 13, 538, '体育与健康', 68, 40);
INSERT INTO `scores` VALUES (7077, 13, 538, '物理', 86, 40);
INSERT INTO `scores` VALUES (7078, 13, 538, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (7079, 13, 538, '历史', 85, 40);
INSERT INTO `scores` VALUES (7080, 13, 538, '英语', 49, 40);
INSERT INTO `scores` VALUES (7081, 13, 538, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (7082, 13, 538, '语文', 53, 40);
INSERT INTO `scores` VALUES (7083, 13, 538, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (7084, 13, 538, '数学', 72, 40);
INSERT INTO `scores` VALUES (7085, 13, 538, '思想政治（中国特色社会主义）', 95, 40);
INSERT INTO `scores` VALUES (7086, 13, 539, '物理', 52, 40);
INSERT INTO `scores` VALUES (7087, 13, 539, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (7088, 13, 539, '历史', 61, 40);
INSERT INTO `scores` VALUES (7089, 13, 539, '英语', 35, 40);
INSERT INTO `scores` VALUES (7090, 13, 539, '人工智能通识', 72, 40);
INSERT INTO `scores` VALUES (7091, 13, 539, '语文', 61, 40);
INSERT INTO `scores` VALUES (7092, 13, 539, '习近平新时代中国特色社会主义思想', 76, 40);
INSERT INTO `scores` VALUES (7093, 13, 539, '数学', 14, 40);
INSERT INTO `scores` VALUES (7094, 13, 539, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (7095, 13, 540, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (7096, 13, 540, '物理', 85, 40);
INSERT INTO `scores` VALUES (7097, 13, 540, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (7098, 13, 540, '历史', 89, 40);
INSERT INTO `scores` VALUES (7099, 13, 540, '英语', 39, 40);
INSERT INTO `scores` VALUES (7100, 13, 540, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (7101, 13, 540, '语文', 61, 40);
INSERT INTO `scores` VALUES (7102, 13, 540, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (7103, 13, 540, '数学', 69, 40);
INSERT INTO `scores` VALUES (7104, 13, 540, '思想政治（中国特色社会主义）', 90, 40);
INSERT INTO `scores` VALUES (7105, 13, 541, '体育与健康', 55, 40);
INSERT INTO `scores` VALUES (7106, 13, 541, '物理', 55, 40);
INSERT INTO `scores` VALUES (7107, 13, 541, '计算机系统配置', 71, 40);
INSERT INTO `scores` VALUES (7108, 13, 541, '历史', 59, 40);
INSERT INTO `scores` VALUES (7109, 13, 541, '英语', 44, 40);
INSERT INTO `scores` VALUES (7110, 13, 541, '人工智能通识', 82, 40);
INSERT INTO `scores` VALUES (7111, 13, 541, '语文', 60, 40);
INSERT INTO `scores` VALUES (7112, 13, 541, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (7113, 13, 541, '数学', 60, 40);
INSERT INTO `scores` VALUES (7114, 13, 541, '思想政治（中国特色社会主义）', 83, 40);
INSERT INTO `scores` VALUES (7115, 13, 542, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (7116, 13, 542, '物理', 61, 40);
INSERT INTO `scores` VALUES (7117, 13, 542, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (7118, 13, 542, '历史', 85, 40);
INSERT INTO `scores` VALUES (7119, 13, 542, '英语', 60, 40);
INSERT INTO `scores` VALUES (7120, 13, 542, '人工智能通识', 79, 40);
INSERT INTO `scores` VALUES (7121, 13, 542, '语文', 66, 40);
INSERT INTO `scores` VALUES (7122, 13, 542, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (7123, 13, 542, '数学', 84, 40);
INSERT INTO `scores` VALUES (7124, 13, 542, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (7125, 14, 509, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (7126, 14, 509, '物理', 45, 40);
INSERT INTO `scores` VALUES (7127, 14, 509, '计算机系统配置', 73, 40);
INSERT INTO `scores` VALUES (7128, 14, 509, '历史', 86, 40);
INSERT INTO `scores` VALUES (7129, 14, 509, '英语', 71, 40);
INSERT INTO `scores` VALUES (7130, 14, 509, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (7131, 14, 509, '语文', 85, 40);
INSERT INTO `scores` VALUES (7132, 14, 509, '习近平新时代中国特色社会主义思想', 94, 40);
INSERT INTO `scores` VALUES (7133, 14, 509, '数学', 96, 40);
INSERT INTO `scores` VALUES (7134, 14, 509, '思想政治（中国特色社会主义）', 93, 40);
INSERT INTO `scores` VALUES (7135, 14, 510, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7136, 14, 510, '物理', 63, 40);
INSERT INTO `scores` VALUES (7137, 14, 510, '计算机系统配置', 70, 40);
INSERT INTO `scores` VALUES (7138, 14, 510, '历史', 78, 40);
INSERT INTO `scores` VALUES (7139, 14, 510, '英语', 75, 40);
INSERT INTO `scores` VALUES (7140, 14, 510, '人工智能通识', 67, 40);
INSERT INTO `scores` VALUES (7141, 14, 510, '语文', 72, 40);
INSERT INTO `scores` VALUES (7142, 14, 510, '习近平新时代中国特色社会主义思想', 79, 40);
INSERT INTO `scores` VALUES (7143, 14, 510, '数学', 78, 40);
INSERT INTO `scores` VALUES (7144, 14, 510, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (7145, 14, 511, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7146, 14, 511, '物理', 56, 40);
INSERT INTO `scores` VALUES (7147, 14, 511, '计算机系统配置', 68, 40);
INSERT INTO `scores` VALUES (7148, 14, 511, '历史', 86, 40);
INSERT INTO `scores` VALUES (7149, 14, 511, '英语', 60, 40);
INSERT INTO `scores` VALUES (7150, 14, 511, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (7151, 14, 511, '语文', 77, 40);
INSERT INTO `scores` VALUES (7152, 14, 511, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (7153, 14, 511, '数学', 65, 40);
INSERT INTO `scores` VALUES (7154, 14, 511, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (7155, 14, 512, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (7156, 14, 512, '物理', 71, 40);
INSERT INTO `scores` VALUES (7157, 14, 512, '计算机系统配置', 82, 40);
INSERT INTO `scores` VALUES (7158, 14, 512, '历史', 77, 40);
INSERT INTO `scores` VALUES (7159, 14, 512, '英语', 63, 40);
INSERT INTO `scores` VALUES (7160, 14, 512, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (7161, 14, 512, '语文', 79, 40);
INSERT INTO `scores` VALUES (7162, 14, 512, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (7163, 14, 512, '数学', 70, 40);
INSERT INTO `scores` VALUES (7164, 14, 512, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (7165, 14, 513, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (7166, 14, 513, '物理', 81, 40);
INSERT INTO `scores` VALUES (7167, 14, 513, '计算机系统配置', 73, 40);
INSERT INTO `scores` VALUES (7168, 14, 513, '历史', 90, 40);
INSERT INTO `scores` VALUES (7169, 14, 513, '英语', 83, 40);
INSERT INTO `scores` VALUES (7170, 14, 513, '人工智能通识', 90, 40);
INSERT INTO `scores` VALUES (7171, 14, 513, '语文', 84, 40);
INSERT INTO `scores` VALUES (7172, 14, 513, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (7173, 14, 513, '数学', 88, 40);
INSERT INTO `scores` VALUES (7174, 14, 513, '思想政治（中国特色社会主义）', 71, 40);
INSERT INTO `scores` VALUES (7175, 14, 514, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (7176, 14, 514, '物理', 62, 40);
INSERT INTO `scores` VALUES (7177, 14, 514, '计算机系统配置', 65, 40);
INSERT INTO `scores` VALUES (7178, 14, 514, '历史', 73, 40);
INSERT INTO `scores` VALUES (7179, 14, 514, '英语', 69, 40);
INSERT INTO `scores` VALUES (7180, 14, 514, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (7181, 14, 514, '语文', 76, 40);
INSERT INTO `scores` VALUES (7182, 14, 514, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (7183, 14, 514, '数学', 55, 40);
INSERT INTO `scores` VALUES (7184, 14, 514, '思想政治（中国特色社会主义）', 78, 40);
INSERT INTO `scores` VALUES (7185, 14, 515, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (7186, 14, 515, '物理', 55, 40);
INSERT INTO `scores` VALUES (7187, 14, 515, '计算机系统配置', 67, 40);
INSERT INTO `scores` VALUES (7188, 14, 515, '历史', 79, 40);
INSERT INTO `scores` VALUES (7189, 14, 515, '英语', 68, 40);
INSERT INTO `scores` VALUES (7190, 14, 515, '人工智能通识', 77, 40);
INSERT INTO `scores` VALUES (7191, 14, 515, '语文', 57, 40);
INSERT INTO `scores` VALUES (7192, 14, 515, '习近平新时代中国特色社会主义思想', 95, 40);
INSERT INTO `scores` VALUES (7193, 14, 515, '数学', 62, 40);
INSERT INTO `scores` VALUES (7194, 14, 515, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (7195, 14, 516, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (7196, 14, 516, '物理', 60, 40);
INSERT INTO `scores` VALUES (7197, 14, 516, '计算机系统配置', 62, 40);
INSERT INTO `scores` VALUES (7198, 14, 516, '历史', 77, 40);
INSERT INTO `scores` VALUES (7199, 14, 516, '英语', 60, 40);
INSERT INTO `scores` VALUES (7200, 14, 516, '人工智能通识', 71, 40);
INSERT INTO `scores` VALUES (7201, 14, 516, '语文', 73, 40);
INSERT INTO `scores` VALUES (7202, 14, 516, '习近平新时代中国特色社会主义思想', 82, 40);
INSERT INTO `scores` VALUES (7203, 14, 516, '数学', 60, 40);
INSERT INTO `scores` VALUES (7204, 14, 516, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (7205, 14, 517, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (7206, 14, 517, '物理', 70, 40);
INSERT INTO `scores` VALUES (7207, 14, 517, '计算机系统配置', 62, 40);
INSERT INTO `scores` VALUES (7208, 14, 517, '历史', 81, 40);
INSERT INTO `scores` VALUES (7209, 14, 517, '英语', 66, 40);
INSERT INTO `scores` VALUES (7210, 14, 517, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (7211, 14, 517, '语文', 73, 40);
INSERT INTO `scores` VALUES (7212, 14, 517, '习近平新时代中国特色社会主义思想', 85, 40);
INSERT INTO `scores` VALUES (7213, 14, 517, '数学', 80, 40);
INSERT INTO `scores` VALUES (7214, 14, 517, '思想政治（中国特色社会主义）', 64, 40);
INSERT INTO `scores` VALUES (7215, 14, 518, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (7216, 14, 518, '物理', 56, 40);
INSERT INTO `scores` VALUES (7217, 14, 518, '计算机系统配置', 75, 40);
INSERT INTO `scores` VALUES (7218, 14, 518, '历史', 76, 40);
INSERT INTO `scores` VALUES (7219, 14, 518, '英语', 52, 40);
INSERT INTO `scores` VALUES (7220, 14, 518, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (7221, 14, 518, '语文', 69, 40);
INSERT INTO `scores` VALUES (7222, 14, 518, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (7223, 14, 518, '数学', 69, 40);
INSERT INTO `scores` VALUES (7224, 14, 518, '思想政治（中国特色社会主义）', 60, 40);
INSERT INTO `scores` VALUES (7225, 14, 519, '物理', 78, 40);
INSERT INTO `scores` VALUES (7226, 14, 519, '计算机系统配置', 61, 40);
INSERT INTO `scores` VALUES (7227, 14, 519, '历史', 94, 40);
INSERT INTO `scores` VALUES (7228, 14, 519, '英语', 68, 40);
INSERT INTO `scores` VALUES (7229, 14, 519, '人工智能通识', 83, 40);
INSERT INTO `scores` VALUES (7230, 14, 519, '语文', 85, 40);
INSERT INTO `scores` VALUES (7231, 14, 519, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (7232, 14, 519, '数学', 88, 40);
INSERT INTO `scores` VALUES (7233, 14, 519, '思想政治（中国特色社会主义）', 94, 40);
INSERT INTO `scores` VALUES (7234, 14, 520, '物理', 48, 40);
INSERT INTO `scores` VALUES (7235, 14, 520, '计算机系统配置', 63, 40);
INSERT INTO `scores` VALUES (7236, 14, 520, '历史', 52, 40);
INSERT INTO `scores` VALUES (7237, 14, 520, '英语', 82, 40);
INSERT INTO `scores` VALUES (7238, 14, 520, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (7239, 14, 520, '语文', 62, 40);
INSERT INTO `scores` VALUES (7240, 14, 520, '习近平新时代中国特色社会主义思想', 78, 40);
INSERT INTO `scores` VALUES (7241, 14, 520, '数学', 24, 40);
INSERT INTO `scores` VALUES (7242, 14, 520, '思想政治（中国特色社会主义）', 50, 40);
INSERT INTO `scores` VALUES (7243, 14, 521, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (7244, 14, 521, '物理', 88, 40);
INSERT INTO `scores` VALUES (7245, 14, 521, '计算机系统配置', 64, 40);
INSERT INTO `scores` VALUES (7246, 14, 521, '历史', 82, 40);
INSERT INTO `scores` VALUES (7247, 14, 521, '英语', 64, 40);
INSERT INTO `scores` VALUES (7248, 14, 521, '人工智能通识', 81, 40);
INSERT INTO `scores` VALUES (7249, 14, 521, '语文', 79, 40);
INSERT INTO `scores` VALUES (7250, 14, 521, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (7251, 14, 521, '数学', 76, 40);
INSERT INTO `scores` VALUES (7252, 14, 521, '思想政治（中国特色社会主义）', 84, 40);
INSERT INTO `scores` VALUES (7253, 14, 522, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (7254, 14, 522, '物理', 60, 40);
INSERT INTO `scores` VALUES (7255, 14, 522, '计算机系统配置', 75, 40);
INSERT INTO `scores` VALUES (7256, 14, 522, '历史', 90, 40);
INSERT INTO `scores` VALUES (7257, 14, 522, '英语', 68, 40);
INSERT INTO `scores` VALUES (7258, 14, 522, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (7259, 14, 522, '语文', 85, 40);
INSERT INTO `scores` VALUES (7260, 14, 522, '习近平新时代中国特色社会主义思想', 92, 40);
INSERT INTO `scores` VALUES (7261, 14, 522, '数学', 74, 40);
INSERT INTO `scores` VALUES (7262, 14, 522, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (7263, 14, 523, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7264, 14, 523, '物理', 75, 40);
INSERT INTO `scores` VALUES (7265, 14, 523, '计算机系统配置', 68, 40);
INSERT INTO `scores` VALUES (7266, 14, 523, '历史', 93, 40);
INSERT INTO `scores` VALUES (7267, 14, 523, '英语', 73, 40);
INSERT INTO `scores` VALUES (7268, 14, 523, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (7269, 14, 523, '语文', 85, 40);
INSERT INTO `scores` VALUES (7270, 14, 523, '习近平新时代中国特色社会主义思想', 97, 40);
INSERT INTO `scores` VALUES (7271, 14, 523, '数学', 87, 40);
INSERT INTO `scores` VALUES (7272, 14, 523, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (7273, 14, 524, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7274, 14, 524, '物理', 72, 40);
INSERT INTO `scores` VALUES (7275, 14, 524, '计算机系统配置', 63, 40);
INSERT INTO `scores` VALUES (7276, 14, 524, '历史', 81, 40);
INSERT INTO `scores` VALUES (7277, 14, 524, '英语', 74, 40);
INSERT INTO `scores` VALUES (7278, 14, 524, '人工智能通识', 73, 40);
INSERT INTO `scores` VALUES (7279, 14, 524, '语文', 81, 40);
INSERT INTO `scores` VALUES (7280, 14, 524, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (7281, 14, 524, '数学', 81, 40);
INSERT INTO `scores` VALUES (7282, 14, 524, '思想政治（中国特色社会主义）', 53, 40);
INSERT INTO `scores` VALUES (7283, 14, 525, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (7284, 14, 525, '物理', 79, 40);
INSERT INTO `scores` VALUES (7285, 14, 525, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (7286, 14, 525, '历史', 87, 40);
INSERT INTO `scores` VALUES (7287, 14, 525, '英语', 67, 40);
INSERT INTO `scores` VALUES (7288, 14, 525, '人工智能通识', 74, 40);
INSERT INTO `scores` VALUES (7289, 14, 525, '语文', 75, 40);
INSERT INTO `scores` VALUES (7290, 14, 525, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (7291, 14, 525, '数学', 73, 40);
INSERT INTO `scores` VALUES (7292, 14, 525, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (7293, 14, 526, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (7294, 14, 526, '物理', 64, 40);
INSERT INTO `scores` VALUES (7295, 14, 526, '计算机系统配置', 72, 40);
INSERT INTO `scores` VALUES (7296, 14, 526, '历史', 75, 40);
INSERT INTO `scores` VALUES (7297, 14, 526, '英语', 70, 40);
INSERT INTO `scores` VALUES (7298, 14, 526, '人工智能通识', 70, 40);
INSERT INTO `scores` VALUES (7299, 14, 526, '语文', 74, 40);
INSERT INTO `scores` VALUES (7300, 14, 526, '习近平新时代中国特色社会主义思想', 97, 40);
INSERT INTO `scores` VALUES (7301, 14, 526, '数学', 58, 40);
INSERT INTO `scores` VALUES (7302, 14, 526, '思想政治（中国特色社会主义）', 76, 40);
INSERT INTO `scores` VALUES (7303, 14, 527, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7304, 14, 527, '物理', 72, 40);
INSERT INTO `scores` VALUES (7305, 14, 527, '计算机系统配置', 69, 40);
INSERT INTO `scores` VALUES (7306, 14, 527, '历史', 75, 40);
INSERT INTO `scores` VALUES (7307, 14, 527, '英语', 69, 40);
INSERT INTO `scores` VALUES (7308, 14, 527, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (7309, 14, 527, '语文', 71, 40);
INSERT INTO `scores` VALUES (7310, 14, 527, '习近平新时代中国特色社会主义思想', 97, 40);
INSERT INTO `scores` VALUES (7311, 14, 527, '数学', 68, 40);
INSERT INTO `scores` VALUES (7312, 14, 527, '思想政治（中国特色社会主义）', 76, 40);
INSERT INTO `scores` VALUES (7313, 14, 528, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7314, 14, 528, '物理', 50, 40);
INSERT INTO `scores` VALUES (7315, 14, 528, '计算机系统配置', 62, 40);
INSERT INTO `scores` VALUES (7316, 14, 528, '历史', 86, 40);
INSERT INTO `scores` VALUES (7317, 14, 528, '英语', 75, 40);
INSERT INTO `scores` VALUES (7318, 14, 528, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (7319, 14, 528, '语文', 83, 40);
INSERT INTO `scores` VALUES (7320, 14, 528, '习近平新时代中国特色社会主义思想', 98, 40);
INSERT INTO `scores` VALUES (7321, 14, 528, '数学', 64, 40);
INSERT INTO `scores` VALUES (7322, 14, 528, '思想政治（中国特色社会主义）', 90, 40);
INSERT INTO `scores` VALUES (7323, 14, 529, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (7324, 14, 529, '物理', 71, 40);
INSERT INTO `scores` VALUES (7325, 14, 529, '计算机系统配置', 67, 40);
INSERT INTO `scores` VALUES (7326, 14, 529, '历史', 81, 40);
INSERT INTO `scores` VALUES (7327, 14, 529, '英语', 74, 40);
INSERT INTO `scores` VALUES (7328, 14, 529, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (7329, 14, 529, '语文', 69, 40);
INSERT INTO `scores` VALUES (7330, 14, 529, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (7331, 14, 529, '数学', 96, 40);
INSERT INTO `scores` VALUES (7332, 14, 529, '思想政治（中国特色社会主义）', 62, 40);
INSERT INTO `scores` VALUES (7333, 14, 530, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (7334, 14, 530, '物理', 60, 40);
INSERT INTO `scores` VALUES (7335, 14, 530, '计算机系统配置', 60, 40);
INSERT INTO `scores` VALUES (7336, 14, 530, '历史', 84, 40);
INSERT INTO `scores` VALUES (7337, 14, 530, '英语', 60, 40);
INSERT INTO `scores` VALUES (7338, 14, 530, '人工智能通识', 68, 40);
INSERT INTO `scores` VALUES (7339, 14, 530, '语文', 72, 40);
INSERT INTO `scores` VALUES (7340, 14, 530, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (7341, 14, 530, '数学', 66, 40);
INSERT INTO `scores` VALUES (7342, 14, 530, '思想政治（中国特色社会主义）', 67, 40);
INSERT INTO `scores` VALUES (7343, 14, 531, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (7344, 14, 531, '物理', 61, 40);
INSERT INTO `scores` VALUES (7345, 14, 531, '计算机系统配置', 73, 40);
INSERT INTO `scores` VALUES (7346, 14, 531, '历史', 81, 40);
INSERT INTO `scores` VALUES (7347, 14, 531, '英语', 70, 40);
INSERT INTO `scores` VALUES (7348, 14, 531, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (7349, 14, 531, '语文', 72, 40);
INSERT INTO `scores` VALUES (7350, 14, 531, '习近平新时代中国特色社会主义思想', 88, 40);
INSERT INTO `scores` VALUES (7351, 14, 531, '数学', 73, 40);
INSERT INTO `scores` VALUES (7352, 14, 531, '思想政治（中国特色社会主义）', 68, 40);
INSERT INTO `scores` VALUES (7353, 14, 532, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (7354, 14, 532, '物理', 77, 40);
INSERT INTO `scores` VALUES (7355, 14, 532, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (7356, 14, 532, '历史', 78, 40);
INSERT INTO `scores` VALUES (7357, 14, 532, '英语', 75, 40);
INSERT INTO `scores` VALUES (7358, 14, 532, '人工智能通识', 66, 40);
INSERT INTO `scores` VALUES (7359, 14, 532, '语文', 75, 40);
INSERT INTO `scores` VALUES (7360, 14, 532, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (7361, 14, 532, '数学', 81, 40);
INSERT INTO `scores` VALUES (7362, 14, 532, '思想政治（中国特色社会主义）', 61, 40);
INSERT INTO `scores` VALUES (7363, 14, 533, '物理', 45, 40);
INSERT INTO `scores` VALUES (7364, 14, 533, '计算机系统配置', 60, 40);
INSERT INTO `scores` VALUES (7365, 14, 533, '历史', 73, 40);
INSERT INTO `scores` VALUES (7366, 14, 533, '英语', 71, 40);
INSERT INTO `scores` VALUES (7367, 14, 533, '人工智能通识', 61, 40);
INSERT INTO `scores` VALUES (7368, 14, 533, '语文', 66, 40);
INSERT INTO `scores` VALUES (7369, 14, 533, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (7370, 14, 533, '数学', 79, 40);
INSERT INTO `scores` VALUES (7371, 14, 533, '思想政治（中国特色社会主义）', 65, 40);
INSERT INTO `scores` VALUES (7372, 14, 534, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (7373, 14, 534, '物理', 68, 40);
INSERT INTO `scores` VALUES (7374, 14, 534, '计算机系统配置', 60, 40);
INSERT INTO `scores` VALUES (7375, 14, 534, '历史', 83, 40);
INSERT INTO `scores` VALUES (7376, 14, 534, '英语', 16, 40);
INSERT INTO `scores` VALUES (7377, 14, 534, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (7378, 14, 534, '语文', 52, 40);
INSERT INTO `scores` VALUES (7379, 14, 534, '习近平新时代中国特色社会主义思想', 95, 40);
INSERT INTO `scores` VALUES (7380, 14, 534, '数学', 100, 40);
INSERT INTO `scores` VALUES (7381, 14, 534, '思想政治（中国特色社会主义）', 57, 40);
INSERT INTO `scores` VALUES (7382, 14, 535, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (7383, 14, 535, '物理', 67, 40);
INSERT INTO `scores` VALUES (7384, 14, 535, '计算机系统配置', 71, 40);
INSERT INTO `scores` VALUES (7385, 14, 535, '历史', 75, 40);
INSERT INTO `scores` VALUES (7386, 14, 535, '英语', 68, 40);
INSERT INTO `scores` VALUES (7387, 14, 535, '人工智能通识', 62, 40);
INSERT INTO `scores` VALUES (7388, 14, 535, '语文', 67, 40);
INSERT INTO `scores` VALUES (7389, 14, 535, '习近平新时代中国特色社会主义思想', 94, 40);
INSERT INTO `scores` VALUES (7390, 14, 535, '数学', 88, 40);
INSERT INTO `scores` VALUES (7391, 14, 535, '思想政治（中国特色社会主义）', 78, 40);
INSERT INTO `scores` VALUES (7392, 14, 536, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7393, 14, 536, '物理', 60, 40);
INSERT INTO `scores` VALUES (7394, 14, 536, '计算机系统配置', 72, 40);
INSERT INTO `scores` VALUES (7395, 14, 536, '历史', 76, 40);
INSERT INTO `scores` VALUES (7396, 14, 536, '英语', 60, 40);
INSERT INTO `scores` VALUES (7397, 14, 536, '人工智能通识', 67, 40);
INSERT INTO `scores` VALUES (7398, 14, 536, '语文', 68, 40);
INSERT INTO `scores` VALUES (7399, 14, 536, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (7400, 14, 536, '数学', 75, 40);
INSERT INTO `scores` VALUES (7401, 14, 536, '思想政治（中国特色社会主义）', 73, 40);
INSERT INTO `scores` VALUES (7402, 14, 537, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (7403, 14, 537, '物理', 61, 40);
INSERT INTO `scores` VALUES (7404, 14, 537, '计算机系统配置', 69, 40);
INSERT INTO `scores` VALUES (7405, 14, 537, '历史', 72, 40);
INSERT INTO `scores` VALUES (7406, 14, 537, '英语', 70, 40);
INSERT INTO `scores` VALUES (7407, 14, 537, '人工智能通识', 62, 40);
INSERT INTO `scores` VALUES (7408, 14, 537, '语文', 74, 40);
INSERT INTO `scores` VALUES (7409, 14, 537, '习近平新时代中国特色社会主义思想', 96, 40);
INSERT INTO `scores` VALUES (7410, 14, 537, '数学', 87, 40);
INSERT INTO `scores` VALUES (7411, 14, 537, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (7412, 14, 538, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (7413, 14, 538, '物理', 73, 40);
INSERT INTO `scores` VALUES (7414, 14, 538, '计算机系统配置', 72, 40);
INSERT INTO `scores` VALUES (7415, 14, 538, '历史', 81, 40);
INSERT INTO `scores` VALUES (7416, 14, 538, '英语', 53, 40);
INSERT INTO `scores` VALUES (7417, 14, 538, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (7418, 14, 538, '语文', 77, 40);
INSERT INTO `scores` VALUES (7419, 14, 538, '习近平新时代中国特色社会主义思想', 100, 40);
INSERT INTO `scores` VALUES (7420, 14, 538, '数学', 77, 40);
INSERT INTO `scores` VALUES (7421, 14, 538, '思想政治（中国特色社会主义）', 77, 40);
INSERT INTO `scores` VALUES (7422, 14, 539, '物理', 46, 40);
INSERT INTO `scores` VALUES (7423, 14, 539, '计算机系统配置', 70, 40);
INSERT INTO `scores` VALUES (7424, 14, 539, '历史', 55, 40);
INSERT INTO `scores` VALUES (7425, 14, 539, '英语', 44, 40);
INSERT INTO `scores` VALUES (7426, 14, 539, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (7427, 14, 539, '语文', 55, 40);
INSERT INTO `scores` VALUES (7428, 14, 539, '习近平新时代中国特色社会主义思想', 84, 40);
INSERT INTO `scores` VALUES (7429, 14, 539, '数学', 75, 40);
INSERT INTO `scores` VALUES (7430, 14, 539, '思想政治（中国特色社会主义）', 48, 40);
INSERT INTO `scores` VALUES (7431, 14, 540, '体育与健康', 100, 40);
INSERT INTO `scores` VALUES (7432, 14, 540, '物理', 77, 40);
INSERT INTO `scores` VALUES (7433, 14, 540, '计算机系统配置', 63, 40);
INSERT INTO `scores` VALUES (7434, 14, 540, '历史', 86, 40);
INSERT INTO `scores` VALUES (7435, 14, 540, '英语', 65, 40);
INSERT INTO `scores` VALUES (7436, 14, 540, '人工智能通识', 73, 40);
INSERT INTO `scores` VALUES (7437, 14, 540, '语文', 72, 40);
INSERT INTO `scores` VALUES (7438, 14, 540, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (7439, 14, 540, '数学', 81, 40);
INSERT INTO `scores` VALUES (7440, 14, 540, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (7441, 14, 541, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (7442, 14, 541, '物理', 60, 40);
INSERT INTO `scores` VALUES (7443, 14, 541, '计算机系统配置', 64, 40);
INSERT INTO `scores` VALUES (7444, 14, 541, '历史', 83, 40);
INSERT INTO `scores` VALUES (7445, 14, 541, '英语', 75, 40);
INSERT INTO `scores` VALUES (7446, 14, 541, '人工智能通识', 72, 40);
INSERT INTO `scores` VALUES (7447, 14, 541, '语文', 64, 40);
INSERT INTO `scores` VALUES (7448, 14, 541, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (7449, 14, 541, '数学', 66, 40);
INSERT INTO `scores` VALUES (7450, 14, 541, '思想政治（中国特色社会主义）', 80, 40);
INSERT INTO `scores` VALUES (7451, 14, 542, '体育与健康', 100, 40);
INSERT INTO `scores` VALUES (7452, 14, 542, '物理', 67, 40);
INSERT INTO `scores` VALUES (7453, 14, 542, '计算机系统配置', 65, 40);
INSERT INTO `scores` VALUES (7454, 14, 542, '历史', 88, 40);
INSERT INTO `scores` VALUES (7455, 14, 542, '英语', 74, 40);
INSERT INTO `scores` VALUES (7456, 14, 542, '人工智能通识', 87, 40);
INSERT INTO `scores` VALUES (7457, 14, 542, '语文', 69, 40);
INSERT INTO `scores` VALUES (7458, 14, 542, '习近平新时代中国特色社会主义思想', 98, 40);
INSERT INTO `scores` VALUES (7459, 14, 542, '数学', 75, 40);
INSERT INTO `scores` VALUES (7460, 14, 542, '思想政治（中国特色社会主义）', 74, 40);
INSERT INTO `scores` VALUES (7461, 15, 509, '语文', 80, 40);
INSERT INTO `scores` VALUES (7462, 15, 509, '数学', 27, 40);
INSERT INTO `scores` VALUES (7463, 15, 509, '英语', 42, 40);
INSERT INTO `scores` VALUES (7464, 15, 509, '思想政治（心理健康与职业生涯）', 76, 40);
INSERT INTO `scores` VALUES (7465, 15, 510, '语文', 75, 40);
INSERT INTO `scores` VALUES (7466, 15, 510, '数学', 38, 40);
INSERT INTO `scores` VALUES (7467, 15, 510, '英语', 51, 40);
INSERT INTO `scores` VALUES (7468, 15, 510, '物理', 41, 40);
INSERT INTO `scores` VALUES (7469, 15, 510, '电工电子技术应用', 68, 40);
INSERT INTO `scores` VALUES (7470, 15, 510, '思想政治（心理健康与职业生涯）', 82, 40);
INSERT INTO `scores` VALUES (7471, 15, 510, '历史', 65, 40);
INSERT INTO `scores` VALUES (7472, 15, 510, '计算机网络基础', 43, 40);
INSERT INTO `scores` VALUES (7473, 15, 511, '语文', 74, 40);
INSERT INTO `scores` VALUES (7474, 15, 511, '数学', 60, 40);
INSERT INTO `scores` VALUES (7475, 15, 511, '英语', 45, 40);
INSERT INTO `scores` VALUES (7476, 15, 511, '物理', 60, 40);
INSERT INTO `scores` VALUES (7477, 15, 511, '电工电子技术应用', 61, 40);
INSERT INTO `scores` VALUES (7478, 15, 511, '思想政治（心理健康与职业生涯）', 87, 40);
INSERT INTO `scores` VALUES (7479, 15, 511, '历史', 65, 40);
INSERT INTO `scores` VALUES (7480, 15, 511, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (7481, 15, 512, '语文', 81, 40);
INSERT INTO `scores` VALUES (7482, 15, 512, '数学', 65, 40);
INSERT INTO `scores` VALUES (7483, 15, 512, '英语', 60, 40);
INSERT INTO `scores` VALUES (7484, 15, 512, '物理', 78, 40);
INSERT INTO `scores` VALUES (7485, 15, 512, '电工电子技术应用', 73, 40);
INSERT INTO `scores` VALUES (7486, 15, 512, '思想政治（心理健康与职业生涯）', 85, 40);
INSERT INTO `scores` VALUES (7487, 15, 512, '历史', 72.5, 40);
INSERT INTO `scores` VALUES (7488, 15, 512, '计算机网络基础', 66, 40);
INSERT INTO `scores` VALUES (7489, 15, 513, '语文', 79, 40);
INSERT INTO `scores` VALUES (7490, 15, 513, '数学', 60, 40);
INSERT INTO `scores` VALUES (7491, 15, 513, '英语', 81, 40);
INSERT INTO `scores` VALUES (7492, 15, 513, '物理', 78, 40);
INSERT INTO `scores` VALUES (7493, 15, 513, '电工电子技术应用', 84, 40);
INSERT INTO `scores` VALUES (7494, 15, 513, '思想政治（心理健康与职业生涯）', 86, 40);
INSERT INTO `scores` VALUES (7495, 15, 513, '历史', 85, 40);
INSERT INTO `scores` VALUES (7496, 15, 513, '计算机网络基础', 69, 40);
INSERT INTO `scores` VALUES (7497, 15, 514, '语文', 60, 40);
INSERT INTO `scores` VALUES (7498, 15, 514, '数学', 60, 40);
INSERT INTO `scores` VALUES (7499, 15, 514, '英语', 62, 40);
INSERT INTO `scores` VALUES (7500, 15, 514, '物理', 63, 40);
INSERT INTO `scores` VALUES (7501, 15, 514, '电工电子技术应用', 67, 40);
INSERT INTO `scores` VALUES (7502, 15, 514, '思想政治（心理健康与职业生涯）', 90, 40);
INSERT INTO `scores` VALUES (7503, 15, 514, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (7504, 15, 514, '计算机网络基础', 47, 40);
INSERT INTO `scores` VALUES (7505, 15, 515, '语文', 73, 40);
INSERT INTO `scores` VALUES (7506, 15, 515, '数学', 60, 40);
INSERT INTO `scores` VALUES (7507, 15, 515, '英语', 72, 40);
INSERT INTO `scores` VALUES (7508, 15, 515, '物理', 75, 40);
INSERT INTO `scores` VALUES (7509, 15, 515, '电工电子技术应用', 81, 40);
INSERT INTO `scores` VALUES (7510, 15, 515, '思想政治（心理健康与职业生涯）', 82, 40);
INSERT INTO `scores` VALUES (7511, 15, 515, '历史', 67.5, 40);
INSERT INTO `scores` VALUES (7512, 15, 515, '计算机网络基础', 73, 40);
INSERT INTO `scores` VALUES (7513, 15, 516, '语文', 83, 40);
INSERT INTO `scores` VALUES (7514, 15, 516, '数学', 25, 40);
INSERT INTO `scores` VALUES (7515, 15, 516, '英语', 60, 40);
INSERT INTO `scores` VALUES (7516, 15, 516, '物理', 79, 40);
INSERT INTO `scores` VALUES (7517, 15, 516, '电工电子技术应用', 56, 40);
INSERT INTO `scores` VALUES (7518, 15, 516, '思想政治（心理健康与职业生涯）', 84, 40);
INSERT INTO `scores` VALUES (7519, 15, 516, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (7520, 15, 516, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (7521, 15, 517, '语文', 77, 40);
INSERT INTO `scores` VALUES (7522, 15, 517, '数学', 78, 40);
INSERT INTO `scores` VALUES (7523, 15, 517, '英语', 50, 40);
INSERT INTO `scores` VALUES (7524, 15, 517, '物理', 66, 40);
INSERT INTO `scores` VALUES (7525, 15, 517, '电工电子技术应用', 71, 40);
INSERT INTO `scores` VALUES (7526, 15, 517, '思想政治（心理健康与职业生涯）', 88, 40);
INSERT INTO `scores` VALUES (7527, 15, 517, '历史', 65, 40);
INSERT INTO `scores` VALUES (7528, 15, 517, '计算机网络基础', 52, 40);
INSERT INTO `scores` VALUES (7529, 15, 518, '语文', 78, 40);
INSERT INTO `scores` VALUES (7530, 15, 518, '数学', 31, 40);
INSERT INTO `scores` VALUES (7531, 15, 518, '英语', 34, 40);
INSERT INTO `scores` VALUES (7532, 15, 518, '物理', 54, 40);
INSERT INTO `scores` VALUES (7533, 15, 518, '电工电子技术应用', 60, 40);
INSERT INTO `scores` VALUES (7534, 15, 518, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (7535, 15, 518, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (7536, 15, 518, '计算机网络基础', 63, 40);
INSERT INTO `scores` VALUES (7537, 15, 519, '语文', 77, 40);
INSERT INTO `scores` VALUES (7538, 15, 519, '数学', 63, 40);
INSERT INTO `scores` VALUES (7539, 15, 519, '英语', 71, 40);
INSERT INTO `scores` VALUES (7540, 15, 519, '物理', 86, 40);
INSERT INTO `scores` VALUES (7541, 15, 519, '电工电子技术应用', 75, 40);
INSERT INTO `scores` VALUES (7542, 15, 519, '思想政治（心理健康与职业生涯）', 89, 40);
INSERT INTO `scores` VALUES (7543, 15, 519, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (7544, 15, 519, '计算机网络基础', 75, 40);
INSERT INTO `scores` VALUES (7545, 15, 520, '语文', 70, 40);
INSERT INTO `scores` VALUES (7546, 15, 520, '数学', 10, 40);
INSERT INTO `scores` VALUES (7547, 15, 520, '英语', 47, 40);
INSERT INTO `scores` VALUES (7548, 15, 520, '物理', 20, 40);
INSERT INTO `scores` VALUES (7549, 15, 520, '电工电子技术应用', 15, 40);
INSERT INTO `scores` VALUES (7550, 15, 520, '思想政治（心理健康与职业生涯）', 60, 40);
INSERT INTO `scores` VALUES (7551, 15, 520, '历史', 27.5, 40);
INSERT INTO `scores` VALUES (7552, 15, 520, '计算机网络基础', 12, 40);
INSERT INTO `scores` VALUES (7553, 15, 521, '语文', 80, 40);
INSERT INTO `scores` VALUES (7554, 15, 521, '数学', 62, 40);
INSERT INTO `scores` VALUES (7555, 15, 521, '英语', 52, 40);
INSERT INTO `scores` VALUES (7556, 15, 521, '物理', 90, 40);
INSERT INTO `scores` VALUES (7557, 15, 521, '电工电子技术应用', 65, 40);
INSERT INTO `scores` VALUES (7558, 15, 521, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (7559, 15, 521, '历史', 80, 40);
INSERT INTO `scores` VALUES (7560, 15, 521, '计算机网络基础', 63, 40);
INSERT INTO `scores` VALUES (7561, 15, 522, '语文', 89, 40);
INSERT INTO `scores` VALUES (7562, 15, 522, '数学', 80, 40);
INSERT INTO `scores` VALUES (7563, 15, 522, '英语', 77, 40);
INSERT INTO `scores` VALUES (7564, 15, 522, '物理', 86, 40);
INSERT INTO `scores` VALUES (7565, 15, 522, '电工电子技术应用', 82, 40);
INSERT INTO `scores` VALUES (7566, 15, 522, '思想政治（心理健康与职业生涯）', 91, 40);
INSERT INTO `scores` VALUES (7567, 15, 522, '历史', 85, 40);
INSERT INTO `scores` VALUES (7568, 15, 522, '计算机网络基础', 70, 40);
INSERT INTO `scores` VALUES (7569, 15, 523, '语文', 89, 40);
INSERT INTO `scores` VALUES (7570, 15, 523, '数学', 80, 40);
INSERT INTO `scores` VALUES (7571, 15, 523, '英语', 77, 40);
INSERT INTO `scores` VALUES (7572, 15, 523, '物理', 86, 40);
INSERT INTO `scores` VALUES (7573, 15, 523, '电工电子技术应用', 82, 40);
INSERT INTO `scores` VALUES (7574, 15, 523, '思想政治（心理健康与职业生涯）', 91, 40);
INSERT INTO `scores` VALUES (7575, 15, 523, '历史', 85, 40);
INSERT INTO `scores` VALUES (7576, 15, 523, '计算机网络基础', 70, 40);
INSERT INTO `scores` VALUES (7577, 15, 524, '语文', 89, 40);
INSERT INTO `scores` VALUES (7578, 15, 524, '数学', 49, 40);
INSERT INTO `scores` VALUES (7579, 15, 524, '英语', 39, 40);
INSERT INTO `scores` VALUES (7580, 15, 524, '物理', 67, 40);
INSERT INTO `scores` VALUES (7581, 15, 524, '电工电子技术应用', 72, 40);
INSERT INTO `scores` VALUES (7582, 15, 524, '思想政治（心理健康与职业生涯）', 70, 40);
INSERT INTO `scores` VALUES (7583, 15, 524, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (7584, 15, 524, '计算机网络基础', 52, 40);
INSERT INTO `scores` VALUES (7585, 15, 525, '语文', 79, 40);
INSERT INTO `scores` VALUES (7586, 15, 525, '数学', 82, 40);
INSERT INTO `scores` VALUES (7587, 15, 525, '英语', 42, 40);
INSERT INTO `scores` VALUES (7588, 15, 525, '物理', 68, 40);
INSERT INTO `scores` VALUES (7589, 15, 525, '电工电子技术应用', 68, 40);
INSERT INTO `scores` VALUES (7590, 15, 525, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (7591, 15, 525, '历史', 85, 40);
INSERT INTO `scores` VALUES (7592, 15, 525, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (7593, 15, 526, '语文', 79, 40);
INSERT INTO `scores` VALUES (7594, 15, 526, '数学', 60, 40);
INSERT INTO `scores` VALUES (7595, 15, 526, '英语', 60, 40);
INSERT INTO `scores` VALUES (7596, 15, 526, '物理', 96, 40);
INSERT INTO `scores` VALUES (7597, 15, 526, '电工电子技术应用', 73, 40);
INSERT INTO `scores` VALUES (7598, 15, 526, '思想政治（心理健康与职业生涯）', 89, 40);
INSERT INTO `scores` VALUES (7599, 15, 526, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (7600, 15, 526, '计算机网络基础', 43, 40);
INSERT INTO `scores` VALUES (7601, 15, 527, '语文', 74, 40);
INSERT INTO `scores` VALUES (7602, 15, 527, '数学', 35, 40);
INSERT INTO `scores` VALUES (7603, 15, 527, '英语', 69, 40);
INSERT INTO `scores` VALUES (7604, 15, 527, '物理', 75, 40);
INSERT INTO `scores` VALUES (7605, 15, 527, '电工电子技术应用', 51, 40);
INSERT INTO `scores` VALUES (7606, 15, 527, '思想政治（心理健康与职业生涯）', 88, 40);
INSERT INTO `scores` VALUES (7607, 15, 527, '历史', 85, 40);
INSERT INTO `scores` VALUES (7608, 15, 527, '计算机网络基础', 49, 40);
INSERT INTO `scores` VALUES (7609, 15, 528, '语文', 79, 40);
INSERT INTO `scores` VALUES (7610, 15, 528, '数学', 17, 40);
INSERT INTO `scores` VALUES (7611, 15, 528, '英语', 73, 40);
INSERT INTO `scores` VALUES (7612, 15, 528, '物理', 74, 40);
INSERT INTO `scores` VALUES (7613, 15, 528, '电工电子技术应用', 64, 40);
INSERT INTO `scores` VALUES (7614, 15, 528, '思想政治（心理健康与职业生涯）', 81, 40);
INSERT INTO `scores` VALUES (7615, 15, 528, '历史', 90, 40);
INSERT INTO `scores` VALUES (7616, 15, 528, '计算机网络基础', 65, 40);
INSERT INTO `scores` VALUES (7617, 15, 529, '语文', 67, 40);
INSERT INTO `scores` VALUES (7618, 15, 529, '数学', 69, 40);
INSERT INTO `scores` VALUES (7619, 15, 529, '英语', 50, 40);
INSERT INTO `scores` VALUES (7620, 15, 529, '物理', 60, 40);
INSERT INTO `scores` VALUES (7621, 15, 529, '电工电子技术应用', 83, 40);
INSERT INTO `scores` VALUES (7622, 15, 529, '思想政治（心理健康与职业生涯）', 84, 40);
INSERT INTO `scores` VALUES (7623, 15, 529, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (7624, 15, 529, '计算机网络基础', 46, 40);
INSERT INTO `scores` VALUES (7625, 15, 530, '语文', 72, 40);
INSERT INTO `scores` VALUES (7626, 15, 530, '数学', 35, 40);
INSERT INTO `scores` VALUES (7627, 15, 530, '英语', 54, 40);
INSERT INTO `scores` VALUES (7628, 15, 530, '物理', 80, 40);
INSERT INTO `scores` VALUES (7629, 15, 530, '电工电子技术应用', 80, 40);
INSERT INTO `scores` VALUES (7630, 15, 530, '思想政治（心理健康与职业生涯）', 72, 40);
INSERT INTO `scores` VALUES (7631, 15, 530, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (7632, 15, 530, '计算机网络基础', 44, 40);
INSERT INTO `scores` VALUES (7633, 15, 531, '物理', 56, 40);
INSERT INTO `scores` VALUES (7634, 15, 531, '电工电子技术应用', 85, 40);
INSERT INTO `scores` VALUES (7635, 15, 531, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (7636, 15, 531, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (7637, 15, 531, '计算机网络基础', 63, 40);
INSERT INTO `scores` VALUES (7638, 15, 532, '语文', 78, 40);
INSERT INTO `scores` VALUES (7639, 15, 532, '数学', 70, 40);
INSERT INTO `scores` VALUES (7640, 15, 532, '英语', 80, 40);
INSERT INTO `scores` VALUES (7641, 15, 532, '物理', 86, 40);
INSERT INTO `scores` VALUES (7642, 15, 532, '电工电子技术应用', 87, 40);
INSERT INTO `scores` VALUES (7643, 15, 532, '思想政治（心理健康与职业生涯）', 81, 40);
INSERT INTO `scores` VALUES (7644, 15, 532, '历史', 87.5, 40);
INSERT INTO `scores` VALUES (7645, 15, 532, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (7646, 15, 533, '语文', 53, 40);
INSERT INTO `scores` VALUES (7647, 15, 533, '数学', 36, 40);
INSERT INTO `scores` VALUES (7648, 15, 533, '英语', 37, 40);
INSERT INTO `scores` VALUES (7649, 15, 533, '物理', 57, 40);
INSERT INTO `scores` VALUES (7650, 15, 533, '电工电子技术应用', 53, 40);
INSERT INTO `scores` VALUES (7651, 15, 533, '思想政治（心理健康与职业生涯）', 75, 40);
INSERT INTO `scores` VALUES (7652, 15, 533, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (7653, 15, 533, '计算机网络基础', 26, 40);
INSERT INTO `scores` VALUES (7654, 15, 534, '语文', 55, 40);
INSERT INTO `scores` VALUES (7655, 15, 534, '数学', 88, 40);
INSERT INTO `scores` VALUES (7656, 15, 534, '英语', 24, 40);
INSERT INTO `scores` VALUES (7657, 15, 534, '物理', 52, 40);
INSERT INTO `scores` VALUES (7658, 15, 534, '电工电子技术应用', 74, 40);
INSERT INTO `scores` VALUES (7659, 15, 534, '思想政治（心理健康与职业生涯）', 72, 40);
INSERT INTO `scores` VALUES (7660, 15, 534, '历史', 87.5, 40);
INSERT INTO `scores` VALUES (7661, 15, 534, '计算机网络基础', 44, 40);
INSERT INTO `scores` VALUES (7662, 15, 535, '语文', 74, 40);
INSERT INTO `scores` VALUES (7663, 15, 535, '数学', 43, 40);
INSERT INTO `scores` VALUES (7664, 15, 535, '英语', 45, 40);
INSERT INTO `scores` VALUES (7665, 15, 535, '物理', 48, 40);
INSERT INTO `scores` VALUES (7666, 15, 535, '电工电子技术应用', 78, 40);
INSERT INTO `scores` VALUES (7667, 15, 535, '思想政治（心理健康与职业生涯）', 68, 40);
INSERT INTO `scores` VALUES (7668, 15, 535, '历史', 80, 40);
INSERT INTO `scores` VALUES (7669, 15, 535, '计算机网络基础', 67, 40);
INSERT INTO `scores` VALUES (7670, 15, 536, '语文', 63, 40);
INSERT INTO `scores` VALUES (7671, 15, 536, '数学', 35, 40);
INSERT INTO `scores` VALUES (7672, 15, 536, '英语', 47, 40);
INSERT INTO `scores` VALUES (7673, 15, 536, '物理', 30, 40);
INSERT INTO `scores` VALUES (7674, 15, 536, '电工电子技术应用', 60, 40);
INSERT INTO `scores` VALUES (7675, 15, 536, '思想政治（心理健康与职业生涯）', 78, 40);
INSERT INTO `scores` VALUES (7676, 15, 536, '历史', 55, 40);
INSERT INTO `scores` VALUES (7677, 15, 536, '计算机网络基础', 49, 40);
INSERT INTO `scores` VALUES (7678, 15, 537, '语文', 76, 40);
INSERT INTO `scores` VALUES (7679, 15, 537, '数学', 76, 40);
INSERT INTO `scores` VALUES (7680, 15, 537, '英语', 64, 40);
INSERT INTO `scores` VALUES (7681, 15, 537, '物理', 77, 40);
INSERT INTO `scores` VALUES (7682, 15, 537, '电工电子技术应用', 69, 40);
INSERT INTO `scores` VALUES (7683, 15, 537, '思想政治（心理健康与职业生涯）', 85, 40);
INSERT INTO `scores` VALUES (7684, 15, 537, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (7685, 15, 537, '计算机网络基础', 38, 40);
INSERT INTO `scores` VALUES (7686, 15, 538, '语文', 89, 40);
INSERT INTO `scores` VALUES (7687, 15, 538, '数学', 80, 40);
INSERT INTO `scores` VALUES (7688, 15, 538, '英语', 77, 40);
INSERT INTO `scores` VALUES (7689, 15, 538, '物理', 86, 40);
INSERT INTO `scores` VALUES (7690, 15, 538, '电工电子技术应用', 82, 40);
INSERT INTO `scores` VALUES (7691, 15, 538, '思想政治（心理健康与职业生涯）', 91, 40);
INSERT INTO `scores` VALUES (7692, 15, 538, '历史', 85, 40);
INSERT INTO `scores` VALUES (7693, 15, 538, '计算机网络基础', 70, 40);
INSERT INTO `scores` VALUES (7694, 15, 539, '语文', 67, 40);
INSERT INTO `scores` VALUES (7695, 15, 539, '数学', 11, 40);
INSERT INTO `scores` VALUES (7696, 15, 539, '英语', 22, 40);
INSERT INTO `scores` VALUES (7697, 15, 539, '物理', 68, 40);
INSERT INTO `scores` VALUES (7698, 15, 539, '电工电子技术应用', 56, 40);
INSERT INTO `scores` VALUES (7699, 15, 539, '思想政治（心理健康与职业生涯）', 76, 40);
INSERT INTO `scores` VALUES (7700, 15, 539, '历史', 60, 40);
INSERT INTO `scores` VALUES (7701, 15, 539, '计算机网络基础', 30, 40);
INSERT INTO `scores` VALUES (7702, 15, 540, '语文', 74, 40);
INSERT INTO `scores` VALUES (7703, 15, 540, '数学', 60, 40);
INSERT INTO `scores` VALUES (7704, 15, 540, '英语', 50, 40);
INSERT INTO `scores` VALUES (7705, 15, 540, '物理', 81, 40);
INSERT INTO `scores` VALUES (7706, 15, 540, '电工电子技术应用', 93, 40);
INSERT INTO `scores` VALUES (7707, 15, 540, '思想政治（心理健康与职业生涯）', 81, 40);
INSERT INTO `scores` VALUES (7708, 15, 540, '历史', 87.5, 40);
INSERT INTO `scores` VALUES (7709, 15, 540, '计算机网络基础', 40, 40);
INSERT INTO `scores` VALUES (7710, 15, 541, '语文', 69, 40);
INSERT INTO `scores` VALUES (7711, 15, 541, '数学', 28, 40);
INSERT INTO `scores` VALUES (7712, 15, 541, '英语', 44, 40);
INSERT INTO `scores` VALUES (7713, 15, 541, '物理', 50, 40);
INSERT INTO `scores` VALUES (7714, 15, 541, '电工电子技术应用', 81, 40);
INSERT INTO `scores` VALUES (7715, 15, 541, '思想政治（心理健康与职业生涯）', 82, 40);
INSERT INTO `scores` VALUES (7716, 15, 541, '历史', 65, 40);
INSERT INTO `scores` VALUES (7717, 15, 541, '计算机网络基础', 43, 40);
INSERT INTO `scores` VALUES (7718, 15, 542, '语文', 83, 40);
INSERT INTO `scores` VALUES (7719, 15, 542, '数学', 67, 40);
INSERT INTO `scores` VALUES (7720, 15, 542, '英语', 73, 40);
INSERT INTO `scores` VALUES (7721, 15, 542, '物理', 74, 40);
INSERT INTO `scores` VALUES (7722, 15, 542, '电工电子技术应用', 79, 40);
INSERT INTO `scores` VALUES (7723, 15, 542, '思想政治（心理健康与职业生涯）', 90, 40);
INSERT INTO `scores` VALUES (7724, 15, 542, '历史', 85, 40);
INSERT INTO `scores` VALUES (7725, 15, 542, '计算机网络基础', 60, 40);
UNLOCK TABLES;

-- 表: sessions
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `sessions` WRITE;
INSERT INTO `sessions` VALUES ('CAiOBIVbq_h9FMlcxYT-s4Yxz9Xuuy95', 1779365067, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"user":{"id":40,"employee_id":"0187","name":"柯宇","role":"teacher"},"lastActivityAt":1779278667022}');
INSERT INTO `sessions` VALUES ('cLa1baTmXmVSol8XyiAIiJgwAQkdokvp', 1779364069, '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"user":{"id":40,"employee_id":"0187","name":"柯宇","role":"teacher"},"lastActivityAt":1779277669082}');
UNLOCK TABLES;

-- 表: students
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=543 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `students` WRITE;
INSERT INTO `students` VALUES (213, '2302180301', '蔡奕宸', 4, 41);
INSERT INTO `students` VALUES (214, '2302180302', '董阳', 4, 41);
INSERT INTO `students` VALUES (215, '2302180303', '兰怡轩', 4, 41);
INSERT INTO `students` VALUES (216, '2302180304', '罗艺', 4, 41);
INSERT INTO `students` VALUES (217, '2302180305', '邱恩琪', 4, 41);
INSERT INTO `students` VALUES (218, '2302180306', '汤歆语', 4, 41);
INSERT INTO `students` VALUES (219, '2302180307', '王思琪', 4, 41);
INSERT INTO `students` VALUES (220, '2302180308', '闻欣颖', 4, 41);
INSERT INTO `students` VALUES (221, '2302180309', '吴苏曼', 4, 41);
INSERT INTO `students` VALUES (222, '2302180310', '夏雪', 4, 41);
INSERT INTO `students` VALUES (223, '2302180311', '肖文娜', 4, 41);
INSERT INTO `students` VALUES (224, '2302180312', '张乐欣', 4, 41);
INSERT INTO `students` VALUES (225, '2302180313', '周颖', 4, 41);
INSERT INTO `students` VALUES (226, '2302180314', '陈建泽', 4, 41);
INSERT INTO `students` VALUES (227, '2302180315', '顾君昊', 4, 41);
INSERT INTO `students` VALUES (228, '2302180316', '鞠晓春', 4, 41);
INSERT INTO `students` VALUES (229, '2302180317', '柯泉鑫', 4, 41);
INSERT INTO `students` VALUES (230, '2302180318', '李梓诚', 4, 41);
INSERT INTO `students` VALUES (231, '2302180319', '刘栩嘉', 4, 41);
INSERT INTO `students` VALUES (232, '2302180320', '秦雨枫', 4, 41);
INSERT INTO `students` VALUES (233, '2302180321', '孙思宸', 4, 41);
INSERT INTO `students` VALUES (234, '2302180322', '卫佳宝', 4, 41);
INSERT INTO `students` VALUES (235, '2302180323', '张家源', 4, 41);
INSERT INTO `students` VALUES (236, '2302180324', '朱贺额', 4, 41);
INSERT INTO `students` VALUES (509, '2502290801', '陈蓝平', 11, 40);
INSERT INTO `students` VALUES (510, '2502290802', '程佳妮', 11, 40);
INSERT INTO `students` VALUES (511, '2502290803', '董雨含', 11, 40);
INSERT INTO `students` VALUES (512, '2502290804', '董子诺', 11, 40);
INSERT INTO `students` VALUES (513, '2502290805', '冯欣怡', 11, 40);
INSERT INTO `students` VALUES (514, '2502290806', '龚歆茹', 11, 40);
INSERT INTO `students` VALUES (515, '2502290807', '管欣怡', 11, 40);
INSERT INTO `students` VALUES (516, '2502290808', '郭润蕾', 11, 40);
INSERT INTO `students` VALUES (517, '2502290809', '胡佳晨', 11, 40);
INSERT INTO `students` VALUES (518, '2502290810', '李欣悦', 11, 40);
INSERT INTO `students` VALUES (519, '2502290811', '施杨', 11, 40);
INSERT INTO `students` VALUES (520, '2502290812', '施元菲', 11, 40);
INSERT INTO `students` VALUES (521, '2502290813', '王林倩', 11, 40);
INSERT INTO `students` VALUES (522, '2502290814', '王婉馨', 11, 40);
INSERT INTO `students` VALUES (523, '2502290815', '吴晨雨', 11, 40);
INSERT INTO `students` VALUES (524, '2502290816', '徐梓淇', 11, 40);
INSERT INTO `students` VALUES (525, '2502290817', '袁欣怡', 11, 40);
INSERT INTO `students` VALUES (526, '2502290818', '张栩卓', 11, 40);
INSERT INTO `students` VALUES (527, '2502290819', '朱欣怡', 11, 40);
INSERT INTO `students` VALUES (528, '2502290820', '庄珺彦', 11, 40);
INSERT INTO `students` VALUES (529, '2502290821', '曹一涵', 11, 40);
INSERT INTO `students` VALUES (530, '2502290822', '陈晓博', 11, 40);
INSERT INTO `students` VALUES (531, '2502290823', '郭梓涵', 11, 40);
INSERT INTO `students` VALUES (532, '2502290824', '胡峻豪', 11, 40);
INSERT INTO `students` VALUES (533, '2502290825', '胡宗阳', 11, 40);
INSERT INTO `students` VALUES (534, '2502290826', '黄逸晟', 11, 40);
INSERT INTO `students` VALUES (535, '2502290827', '黄喆昊', 11, 40);
INSERT INTO `students` VALUES (536, '2502290828', '汤孝庭', 11, 40);
INSERT INTO `students` VALUES (537, '2502290829', '王小双', 11, 40);
INSERT INTO `students` VALUES (538, '2502290830', '王子淼', 11, 40);
INSERT INTO `students` VALUES (539, '2502290831', '袁梓杰', 11, 40);
INSERT INTO `students` VALUES (540, '2502290832', '张志浩', 11, 40);
INSERT INTO `students` VALUES (541, '2502290833', '赵佳俊', 11, 40);
INSERT INTO `students` VALUES (542, '2502290834', '郑烨轩', 11, 40);
UNLOCK TABLES;

-- 表: substitute_requests
DROP TABLE IF EXISTS `substitute_requests`;
CREATE TABLE `substitute_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_type` varchar(50) DEFAULT '社团',
  `course_name` varchar(200) DEFAULT '',
  `course_date` varchar(20) DEFAULT '',
  `original_teacher` varchar(100) NOT NULL,
  `substitute_teacher` varchar(100) NOT NULL,
  `reason` varchar(255) DEFAULT '',
  `notes` text,
  `requested_by` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sub_date` (`course_date`),
  KEY `idx_sub_teacher` (`substitute_teacher`),
  KEY `idx_sub_original` (`original_teacher`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: substitute_teachers
DROP TABLE IF EXISTS `substitute_teachers`;
CREATE TABLE `substitute_teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_name` varchar(100) NOT NULL,
  `can_substitute` tinyint(1) DEFAULT '1',
  `current_assignments` text,
  `source_file` varchar(255) DEFAULT '',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_name` (`teacher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: teacher_course_hours
DROP TABLE IF EXISTS `teacher_course_hours`;
CREATE TABLE `teacher_course_hours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_employee_id` varchar(50) DEFAULT '',
  `teacher_name` varchar(100) NOT NULL,
  `subject` varchar(100) DEFAULT '',
  `class_name` varchar(100) DEFAULT '',
  `course_date` varchar(20) DEFAULT '',
  `weekday` varchar(20) DEFAULT '',
  `period_no` varchar(50) DEFAULT '',
  `hours` decimal(10,2) DEFAULT '1.00',
  `source_file` varchar(255) DEFAULT '',
  `imported_by` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tch_teacher` (`teacher_employee_id`,`teacher_name`),
  KEY `idx_tch_date` (`course_date`),
  KEY `idx_tch_subject` (`subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(20) DEFAULT 'teacher',
  `plain_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1, 'admin', '$2a$10$u8dBeclBtjSrnRD92MLbwu2YvCxP1ramQ6.x9y8of/UwUlav6ytuS', '管理员', 'admin', 'admin123');
INSERT INTO `users` VALUES (6, '2502290801', '$2a$10$P7hp1zve1YiO7MfvcSnVxOiFCt9A.g5S9Jgca2riVIwu168f4huI.', '陈蓝平', 'student', '123456');
INSERT INTO `users` VALUES (7, '2502290802', '$2a$10$.q1L1cdunz0c4dAP6xgyDegMIwqUMHfbMWwChxvkmTGOIiMZcirTK', '程佳妮', 'student', '123456');
INSERT INTO `users` VALUES (8, '2502290803', '$2a$10$6Q6QQnpGraAjptla.nIAgO/inR15Gh5U9V/RkKgmAJLf4mTRiHZb2', '董雨含', 'student', '123456');
INSERT INTO `users` VALUES (9, '2502290804', '$2a$10$pAUlvOERSbafrnXvCF.sgeLJ0UIuaMc24twWVlOr9C2r2sXl.XL2i', '董子诺', 'student', '123456');
INSERT INTO `users` VALUES (10, '2502290805', '$2a$10$piwN7Iow/JoTA6W7akFjRuKzyeB7S1mDHTshgXmviSVFZKmasTqwm', '冯欣怡', 'student', '123456');
INSERT INTO `users` VALUES (11, '2502290806', '$2a$10$Z1NBv0jYtdOmd5YnJwsf9.hQ0M4wKL41AzM5OuctM/QdgqB9ILN.O', '龚歆茹', 'student', '123456');
INSERT INTO `users` VALUES (12, '2502290807', '$2a$10$FOLjiBLX3BywKYa8wL8by.urb39M/tLK1ZLaO1i4kpi.EmfDGM3N.', '管欣怡', 'student', '123456');
INSERT INTO `users` VALUES (13, '2502290808', '$2a$10$t0HtJgsmRYmkJw.CGs4n.u6aYu884.jhX8w5W3qr9viQy4FuAIJpK', '郭润蕾', 'student', '123456');
INSERT INTO `users` VALUES (14, '2502290809', '$2a$10$5VEztzi6tPXpcWeJGCtfcuZCoXib5yx7e0FeZcz2JVTZVlQXKTjum', '胡佳晨', 'student', '123456');
INSERT INTO `users` VALUES (15, '2502290810', '$2a$10$onfEwZ0Qjt/cXoOiILk37.5mvxZYdxaswvXPcgTabnfXTeQb0E5wC', '李欣悦', 'student', '123456');
INSERT INTO `users` VALUES (16, '2502290811', '$2a$10$iUGh.kHGVOK7yXWAHcb0pui0PdhcDWzsnsVHFrJVj8x5yHw5eXC9C', '施杨', 'student', '123456');
INSERT INTO `users` VALUES (17, '2502290812', '$2a$10$DTptD2iicQBbd.6TGWXPW.qFgHKteZA1rwr.CAqBg5yIr4CrWr.GK', '施元菲', 'student', '123456');
INSERT INTO `users` VALUES (18, '2502290813', '$2a$10$pcM7AOLmwRiu3jeF4Aqn3ejeEF9eIR0efSwaEmox158p8lA5h1riq', '王林倩', 'student', '123456');
INSERT INTO `users` VALUES (19, '2502290814', '$2a$10$SMETJF0yTkKb/Te9uZ1/4.aiEK2B5zbtoKKbNOra9/zoA2aDO516O', '王婉馨', 'student', '123456');
INSERT INTO `users` VALUES (20, '2502290815', '$2a$10$dlVjTmcg5kZGk4as451Xb.cl6JH9w/T0motzd8J3Hcxb5tVo4./km', '吴晨雨', 'student', '123456');
INSERT INTO `users` VALUES (21, '2502290816', '$2a$10$5HU0l7aYe/SMxS95ppNaNep4L9mOijVICwRUpec2H4kZ3iHFF/KJG', '徐梓淇', 'student', '123456');
INSERT INTO `users` VALUES (22, '2502290817', '$2a$10$MnlZdZH7SLdcAxxAFHRq9.dbUH0DFTYX.PkQgajKR26AnNZhfit8O', '袁欣怡', 'student', '123456');
INSERT INTO `users` VALUES (23, '2502290818', '$2a$10$2Uc1Ii1vMicLytcn0NdiAu5FIpRmRtWWc07hZEeSDuWgAD1X1t7q2', '张栩卓', 'student', '123456');
INSERT INTO `users` VALUES (24, '2502290819', '$2a$10$3BJ57s9JDR5Tz2fy2fuNpesXsdMUXGzS/6oRL/zsLMpXB2IPRVMRW', '朱欣怡', 'student', '123456');
INSERT INTO `users` VALUES (25, '2502290820', '$2a$10$nNcmUBhhc9QxZBge2N/Rf.KjbcepvgninGc0FGxF264Zn4FMqQRMS', '庄珺彦', 'student', '123456');
INSERT INTO `users` VALUES (26, '2502290821', '$2a$10$5WSnulvzisRS5Runw5KGWefu/vykTCYOorWODPkm3TcpMYxjU5hYe', '曹一涵', 'student', '123456');
INSERT INTO `users` VALUES (27, '2502290822', '$2a$10$WjXPVzxiUaf7TTWKFADR.u8oCV9XAMvvtmMcQpuXSvDJ1udyoIgoi', '陈晓博', 'student', '123456');
INSERT INTO `users` VALUES (28, '2502290823', '$2a$10$71tZ.muZdtm.XAc8Iiv3WurEX.KnbPN2Ux4U3gdmHVLtmUkWoJ/qi', '郭梓涵', 'student', '123456');
INSERT INTO `users` VALUES (29, '2502290824', '$2a$10$viZ6ocdn7pKjGlvR1wdoROOUuRSeyfCDKnH4NSW90g9.tp5IqENsa', '胡峻豪', 'student', '123456');
INSERT INTO `users` VALUES (30, '2502290825', '$2a$10$D1FFTyvh9m1jxqoNtMemwuaMus/wewypTcW1L/98eLp/Z5iXWOLme', '胡宗阳', 'student', '123456');
INSERT INTO `users` VALUES (31, '2502290826', '$2a$10$SIQB.vRWedpr.OVeIn5jReT1MxQt6AWDKMD0xGFbjzzTJjIwS6NX2', '黄逸晟', 'student', '123456');
INSERT INTO `users` VALUES (32, '2502290827', '$2a$10$kKvv8iMXhf8CYSUiYf5wkuUdZwnE6dJNEMc/LkplHmk4J3e0Nu/hy', '黄喆昊', 'student', '123456');
INSERT INTO `users` VALUES (33, '2502290828', '$2a$10$E.wtbWfzuDes0zNP0gmQVu4gclMmsUzrnu8LIpHGMSjo4dPMy0Daa', '汤孝庭', 'student', '123456');
INSERT INTO `users` VALUES (34, '2502290829', '$2a$10$/YdjX1qDh1Y0bx/dUj4yQ.J9tgHrccl5JOMhYnsczD8hCSm0AZIKi', '王小双', 'student', '123456');
INSERT INTO `users` VALUES (35, '2502290830', '$2a$10$jKN88zf198d/gkCAztmLAeOeVNIhm9iQsSoIrLW22QopGhYa0gSjS', '王子淼', 'student', '123456');
INSERT INTO `users` VALUES (36, '2502290831', '$2a$10$M20ZLdce197TJ4E7eM.N1unlNk9mZ2N4C8pTeYmDrcDwi50T4y/LK', '袁梓杰', 'student', '123456');
INSERT INTO `users` VALUES (37, '2502290832', '$2a$10$7Ln3sTol8lnkW/H5swVfguRbIRSLz3yB0o1GSYwZxgk1qiiNR90jm', '张志浩', 'student', '123456');
INSERT INTO `users` VALUES (38, '2502290833', '$2a$10$1cL6/AY2H4Xod0V8jb/m.OGGgmCLXUJ0Dtn/JBdUA6MI2B1emxXmi', '赵佳俊', 'student', '123456');
INSERT INTO `users` VALUES (39, '2502290834', '$2a$10$GtMyabHHrfvIzTySJFEbveomRdvH2n4WbePmgOMyaZTkwHZjRcGmC', '郑烨轩', 'student', '123456');
INSERT INTO `users` VALUES (40, '0187', '$2a$10$cFs83j4Mo.agGR07C/5f1O7DCdXDqVVLdYvYvUG.bVYM6Rge6lhWi', '柯宇', 'teacher', '123456');
INSERT INTO `users` VALUES (41, '1111', '$2a$10$RaJ0gWFy1/xcFrE9qhVBS.xqMmNNLjWhxW3hBSAmpSVVBLvoAPe/6', '1111', 'teacher', '123456');
INSERT INTO `users` VALUES (42, '25008', '$2a$10$45AKyvKqCfc4HnYWLryEA.46R105TEgmBamnVoixUViWfUce2tt.a', '25008', 'class', '123456');
INSERT INTO `users` VALUES (43, '1234', '$2a$10$YEZnG83.cNZjtRdZqVfeQu0XTbWaO5km7fKzeyR2RoJRMgiyl0AMe', '123456', 'teacher', '123456');
INSERT INTO `users` VALUES (44, '2302180314', '$2a$10$HBYQ/aUQfWC6WTN4iq/Xoubltd.Tj2ubP7h0n7PAl66CmI5tLGJ76', '陈建泽', 'student', '123456');
INSERT INTO `users` VALUES (45, '23003', '$2a$10$xUJJjGSMM0FqQAWAIZfsUOmHJ0E2uT6Lmh5XAOmOKz/ZHVtinJXa6', '23003', 'class', '123456');
INSERT INTO `users` VALUES (46, '23002', '$2a$10$EVwD6WNLQSrIQYNTJoxgcuIcGYUGmT6DiiNvIXd0F2uVMK0iaeiea', '23002', 'class', '123456');
INSERT INTO `users` VALUES (55, '0001', '$2a$10$599E5ShmlXdKYn3rTHFQXes0PceOC5pGvClMILSwFikqTuiYrcssy', '0001', 'teacher', '123456');
INSERT INTO `users` VALUES (56, '20001', '$2a$10$gaSc/Tjic5VpPQJzniCnh.CSL00/rHyGApM53njAHC0YeiB7YA2VC', '20001', 'class', '123456');
INSERT INTO `users` VALUES (57, '0000000001', '$2a$10$lLo2JWC.aziOIqucBdw5c.n9he3j60yEKkCcoPiwzkKO8DvmmDRfG', 'qwe', 'student', '123456');
INSERT INTO `users` VALUES (59, '12345', '$2a$10$dJJ29SDjbn0obnOgUHoBsOrEAxvNdv1xJCoIp.aek0soK6E39GIj.', '12345', 'class', '123456');
INSERT INTO `users` VALUES (60, '团委', '$2a$10$/v53Zns0DVRmaC2bFCDy..Wl3L7zqu4Pvj15l3s4OXoq3VAi4gEAy', '团委', 'course', '123456');
UNLOCK TABLES;

-- 表: websocket_sessions
DROP TABLE IF EXISTS `websocket_sessions`;
CREATE TABLE `websocket_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `socket_id` varchar(100) NOT NULL,
  `session_id` varchar(128) NOT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `connected_at` bigint NOT NULL,
  `instance_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_socket_id` (`socket_id`),
  KEY `idx_instance_id` (`instance_id`)
) ENGINE=InnoDB AUTO_INCREMENT=279 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `websocket_sessions` WRITE;
INSERT INTO `websocket_sessions` VALUES (278, 42, '25008', '6HabaDrCiE1cNLpdAAAB', 'wwvfhrjxZ1AvuJRC0BqIOiJSuFizI8X9', '::ffff:192.168.3.6', 1778902837638, '51264-1778902473069');
UNLOCK TABLES;

COMMIT;
