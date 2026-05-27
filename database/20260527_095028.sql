-- 备份时间: 2026/5/27 09:50:28
-- 数据库: score_analysis
-- 主机: localhost:3306

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `score_analysis` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `score_analysis`;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 表: attendance
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `date` varchar(20) NOT NULL,
  `status` varchar(20) DEFAULT 'present',
  `remark` text,
  `late_time` varchar(50) DEFAULT '',
  `leave_time` varchar(50) DEFAULT '',
  `leave_type` varchar(50) DEFAULT '',
  `leave_with_note` varchar(10) DEFAULT '0',
  `leave_duration` varchar(50) DEFAULT '',
  `absent_time` varchar(50) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance` (`class_id`,`student_id`,`date`)
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `attendance` WRITE;
INSERT INTO `attendance` VALUES (127, 2, 35, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (128, 2, 36, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (129, 2, 37, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (130, 2, 38, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (131, 2, 39, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (132, 2, 40, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (133, 2, 41, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (134, 2, 42, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (135, 2, 43, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (136, 2, 44, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (137, 2, 45, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (138, 2, 46, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (139, 2, 47, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (140, 2, 48, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (141, 2, 49, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (142, 2, 50, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (143, 2, 51, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (144, 2, 52, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (145, 2, 53, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (146, 2, 54, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (147, 2, 55, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (148, 2, 56, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (149, 2, 57, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (150, 2, 58, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (151, 2, 59, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (152, 2, 60, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (153, 2, 61, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (154, 2, 62, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (155, 2, 63, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (156, 2, 64, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (157, 2, 65, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (158, 2, 66, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (159, 2, 67, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (160, 2, 68, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:41:54 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (161, 4, 213, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (162, 4, 214, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (163, 4, 215, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (164, 4, 216, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (165, 4, 217, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (166, 4, 218, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (167, 4, 219, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (168, 4, 220, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (169, 4, 221, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (170, 4, 222, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (171, 4, 223, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (172, 4, 224, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (173, 4, 225, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (174, 4, 226, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (175, 4, 227, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (176, 4, 228, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (177, 4, 229, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (178, 4, 230, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (179, 4, 231, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (180, 4, 232, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (181, 4, 233, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (182, 4, 234, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (183, 4, 235, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (184, 4, 236, '2026-05-11', 'present', '', '', '', '', '0', '', '', 'Mon May 11 2026 15:08:08 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (185, 2, 35, '2026-05-13', 'leave', '', '', '2026-05-13', '事假', '0', '10点离校', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (186, 2, 36, '2026-05-13', 'late', '', '14:53', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (187, 2, 37, '2026-05-13', 'absent', '', '', '', '', '0', '', '16:53', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (188, 2, 38, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (189, 2, 39, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (190, 2, 40, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (191, 2, 41, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (192, 2, 42, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (193, 2, 43, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (194, 2, 44, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (195, 2, 45, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (196, 2, 46, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (197, 2, 47, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (198, 2, 48, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (199, 2, 49, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (200, 2, 50, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (201, 2, 51, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (202, 2, 52, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (203, 2, 53, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (204, 2, 54, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (205, 2, 55, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (206, 2, 56, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (207, 2, 57, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (208, 2, 58, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (209, 2, 59, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (210, 2, 60, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (211, 2, 61, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (212, 2, 62, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (213, 2, 63, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (214, 2, 64, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (215, 2, 65, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (216, 2, 66, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (217, 2, 67, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
INSERT INTO `attendance` VALUES (218, 2, 68, '2026-05-13', 'present', '', '', '', '', '0', '', '', 'Wed May 13 2026 13:53:18 GMT+0800 (中国标准时间)');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `beauty_score_events` WRITE;
INSERT INTO `beauty_score_events` VALUES (4, 4, '2302180301', 42, '2026-05', 5, '参加学校劳动周全勤', '2026-05-11', 'Mon May 11 2026 14:13:29 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (5, 2, '2502290801', 0, '2026-05', 10, '参加党课学习班', '2026-05-11', 'Mon May 11 2026 14:24:21 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (6, 2, '2502290801', 0, '2026-05', 20, '参加党课学习班', '2026-05-11', 'Mon May 11 2026 14:24:26 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (7, 2, '2502290801', 0, '2026-04', 10, '参加党课学习班', '2026-04-30', 'Mon May 11 2026 14:26:06 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (8, 2, '2502290801', 11, '2026-05', 15, '得到社会表扬', '2026-05-13', 'Wed May 13 2026 14:56:11 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (9, 2, '2502290802', 0, '2026-05', 10, '参加党课学习班', '2026-05-13', 'Wed May 13 2026 14:56:42 GMT+0800 (中国标准时间)');
INSERT INTO `beauty_score_events` VALUES (10, 2, '2502290806', 0, '2026-05', 10, '参加党课学习班', '2026-05-13', 'Wed May 13 2026 15:05:06 GMT+0800 (中国标准时间)');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `beauty_scores` WRITE;
INSERT INTO `beauty_scores` VALUES (8, 3, '2302180301', 0, '2026-05', 20, '参加党课学习班', 'Mon May 11 2026 11:12:37 GMT+0800 (中国标准时间)', NULL, '2026-05-11');
INSERT INTO `beauty_scores` VALUES (10, 4, '2302180301', 42, '2026-05', 5, '参加学校劳动周全勤', 'Mon May 11 2026 14:13:31 GMT+0800 (中国标准时间)', NULL, '2026-05-11');
INSERT INTO `beauty_scores` VALUES (11, 2, '2502290801', 0, '2026-05', 20, '参加党课学习班', 'Mon May 11 2026 14:24:27 GMT+0800 (中国标准时间)', NULL, '2026-05-11');
INSERT INTO `beauty_scores` VALUES (12, 2, '2502290801', 0, '2026-04', 10, '参加党课学习班', 'Mon May 11 2026 14:26:07 GMT+0800 (中国标准时间)', NULL, '2026-05-11');
INSERT INTO `beauty_scores` VALUES (13, 2, '2502290801', 11, '2026-05', 15, '得到社会表扬', 'Wed May 13 2026 14:56:11 GMT+0800 (中国标准时间)', NULL, '2026-05-13');
INSERT INTO `beauty_scores` VALUES (14, 2, '2502290802', 0, '2026-05', 10, '参加党课学习班', 'Wed May 13 2026 14:56:42 GMT+0800 (中国标准时间)', NULL, '2026-05-13');
INSERT INTO `beauty_scores` VALUES (15, 2, '2502290806', 0, '2026-05', 20, '参加党课学习班', 'Wed May 13 2026 15:05:19 GMT+0800 (中国标准时间)', NULL, '2026-05-13');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `classes` WRITE;
INSERT INTO `classes` VALUES (2, '25008', '', 40, '0187');
INSERT INTO `classes` VALUES (4, '23003', '', 41, '1111');
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
  `class_id` int DEFAULT NULL,
  `created_by` varchar(100) DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homework` (`semester`,`subject`,`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `homework` WRITE;
INSERT INTO `homework` VALUES (1, '高一上', '语文', '', 2, '柯宇', 'Mon May 18 2026 11:00:20 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:00:20 GMT+0800 (中国标准时间)');
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
  `is_late_submit` tinyint(1) DEFAULT '0',
  `late` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homework_data` (`semester`,`class_id`,`subject`,`date`,`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `homework_data` WRITE;
INSERT INTO `homework_data` VALUES (171, '高一上', 2, '语文', '2026-05-18', 35, 0, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (172, '高一上', 2, '语文', '2026-05-18', 36, 0, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 1, 0);
INSERT INTO `homework_data` VALUES (173, '高一上', 2, '语文', '2026-05-18', 37, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (174, '高一上', 2, '语文', '2026-05-18', 38, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (175, '高一上', 2, '语文', '2026-05-18', 39, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (176, '高一上', 2, '语文', '2026-05-18', 40, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (177, '高一上', 2, '语文', '2026-05-18', 41, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (178, '高一上', 2, '语文', '2026-05-18', 42, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (179, '高一上', 2, '语文', '2026-05-18', 43, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (180, '高一上', 2, '语文', '2026-05-18', 44, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (181, '高一上', 2, '语文', '2026-05-18', 45, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (182, '高一上', 2, '语文', '2026-05-18', 46, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (183, '高一上', 2, '语文', '2026-05-18', 47, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (184, '高一上', 2, '语文', '2026-05-18', 48, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (185, '高一上', 2, '语文', '2026-05-18', 49, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (186, '高一上', 2, '语文', '2026-05-18', 50, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (187, '高一上', 2, '语文', '2026-05-18', 51, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (188, '高一上', 2, '语文', '2026-05-18', 52, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (189, '高一上', 2, '语文', '2026-05-18', 53, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (190, '高一上', 2, '语文', '2026-05-18', 54, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (191, '高一上', 2, '语文', '2026-05-18', 55, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (192, '高一上', 2, '语文', '2026-05-18', 56, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (193, '高一上', 2, '语文', '2026-05-18', 57, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (194, '高一上', 2, '语文', '2026-05-18', 58, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (195, '高一上', 2, '语文', '2026-05-18', 59, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (196, '高一上', 2, '语文', '2026-05-18', 60, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (197, '高一上', 2, '语文', '2026-05-18', 61, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (198, '高一上', 2, '语文', '2026-05-18', 62, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (199, '高一上', 2, '语文', '2026-05-18', 63, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (200, '高一上', 2, '语文', '2026-05-18', 64, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (201, '高一上', 2, '语文', '2026-05-18', 65, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (202, '高一上', 2, '语文', '2026-05-18', 66, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (203, '高一上', 2, '语文', '2026-05-18', 67, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
INSERT INTO `homework_data` VALUES (204, '高一上', 2, '语文', '2026-05-18', 68, 1, '柯宇', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 'Mon May 18 2026 11:23:28 GMT+0800 (中国标准时间)', 0, 0);
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
) ENGINE=InnoDB AUTO_INCREMENT=4437 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `scores` WRITE;
INSERT INTO `scores` VALUES (953, 13, 35, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (954, 13, 35, '物理', 76, 40);
INSERT INTO `scores` VALUES (955, 13, 35, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (956, 13, 35, '历史', 90, 40);
INSERT INTO `scores` VALUES (957, 13, 35, '英语', 67, 40);
INSERT INTO `scores` VALUES (958, 13, 35, '人工智能通识', 69, 40);
INSERT INTO `scores` VALUES (959, 13, 35, '语文', 71, 40);
INSERT INTO `scores` VALUES (960, 13, 35, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (961, 13, 35, '数学', 97, 40);
INSERT INTO `scores` VALUES (962, 13, 35, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (963, 13, 36, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (964, 13, 36, '物理', 50, 40);
INSERT INTO `scores` VALUES (965, 13, 36, '计算机系统配置', 75, 40);
INSERT INTO `scores` VALUES (966, 13, 36, '历史', 87, 40);
INSERT INTO `scores` VALUES (967, 13, 36, '英语', 60, 40);
INSERT INTO `scores` VALUES (968, 13, 36, '人工智能通识', 78, 40);
INSERT INTO `scores` VALUES (969, 13, 36, '语文', 70, 40);
INSERT INTO `scores` VALUES (970, 13, 36, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (971, 13, 36, '数学', 63, 40);
INSERT INTO `scores` VALUES (972, 13, 36, '思想政治（中国特色社会主义）', 89, 40);
INSERT INTO `scores` VALUES (973, 13, 37, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (974, 13, 37, '物理', 88, 40);
INSERT INTO `scores` VALUES (975, 13, 37, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (976, 13, 37, '历史', 87, 40);
INSERT INTO `scores` VALUES (977, 13, 37, '英语', 38, 40);
INSERT INTO `scores` VALUES (978, 13, 37, '人工智能通识', 86, 40);
INSERT INTO `scores` VALUES (979, 13, 37, '语文', 64, 40);
INSERT INTO `scores` VALUES (980, 13, 37, '习近平新时代中国特色社会主义思想', 92, 40);
INSERT INTO `scores` VALUES (981, 13, 37, '数学', 60, 40);
INSERT INTO `scores` VALUES (982, 13, 37, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (983, 13, 38, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (984, 13, 38, '物理', 55, 40);
INSERT INTO `scores` VALUES (985, 13, 38, '计算机系统配置', 87, 40);
INSERT INTO `scores` VALUES (986, 13, 38, '历史', 85, 40);
INSERT INTO `scores` VALUES (987, 13, 38, '英语', 60, 40);
INSERT INTO `scores` VALUES (988, 13, 38, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (989, 13, 38, '语文', 64, 40);
INSERT INTO `scores` VALUES (990, 13, 38, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (991, 13, 38, '数学', 84, 40);
INSERT INTO `scores` VALUES (992, 13, 38, '思想政治（中国特色社会主义）', 89, 40);
INSERT INTO `scores` VALUES (993, 13, 39, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (994, 13, 39, '物理', 72, 40);
INSERT INTO `scores` VALUES (995, 13, 39, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (996, 13, 39, '历史', 90, 40);
INSERT INTO `scores` VALUES (997, 13, 39, '英语', 81, 40);
INSERT INTO `scores` VALUES (998, 13, 39, '人工智能通识', 78, 40);
INSERT INTO `scores` VALUES (999, 13, 39, '语文', 64, 40);
INSERT INTO `scores` VALUES (1000, 13, 39, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1001, 13, 39, '数学', 49, 40);
INSERT INTO `scores` VALUES (1002, 13, 39, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (1003, 13, 40, '体育与健康', 74, 40);
INSERT INTO `scores` VALUES (1004, 13, 40, '物理', 50, 40);
INSERT INTO `scores` VALUES (1005, 13, 40, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (1006, 13, 40, '历史', 71, 40);
INSERT INTO `scores` VALUES (1007, 13, 40, '英语', 60, 40);
INSERT INTO `scores` VALUES (1008, 13, 40, '人工智能通识', 78, 40);
INSERT INTO `scores` VALUES (1009, 13, 40, '语文', 60, 40);
INSERT INTO `scores` VALUES (1010, 13, 40, '习近平新时代中国特色社会主义思想', 75, 40);
INSERT INTO `scores` VALUES (1011, 13, 40, '数学', 60, 40);
INSERT INTO `scores` VALUES (1012, 13, 40, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (1013, 13, 41, '体育与健康', 68, 40);
INSERT INTO `scores` VALUES (1014, 13, 41, '物理', 40, 40);
INSERT INTO `scores` VALUES (1015, 13, 41, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (1016, 13, 41, '历史', 86, 40);
INSERT INTO `scores` VALUES (1017, 13, 41, '英语', 38, 40);
INSERT INTO `scores` VALUES (1018, 13, 41, '人工智能通识', 83, 40);
INSERT INTO `scores` VALUES (1019, 13, 41, '语文', 62, 40);
INSERT INTO `scores` VALUES (1020, 13, 41, '习近平新时代中国特色社会主义思想', 92, 40);
INSERT INTO `scores` VALUES (1021, 13, 41, '数学', 66, 40);
INSERT INTO `scores` VALUES (1022, 13, 41, '思想政治（中国特色社会主义）', 85, 40);
INSERT INTO `scores` VALUES (1023, 13, 42, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (1024, 13, 42, '物理', 70, 40);
INSERT INTO `scores` VALUES (1025, 13, 42, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (1026, 13, 42, '历史', 93, 40);
INSERT INTO `scores` VALUES (1027, 13, 42, '英语', 47, 40);
INSERT INTO `scores` VALUES (1028, 13, 42, '人工智能通识', 77, 40);
INSERT INTO `scores` VALUES (1029, 13, 42, '语文', 66, 40);
INSERT INTO `scores` VALUES (1030, 13, 42, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1031, 13, 42, '数学', 48, 40);
INSERT INTO `scores` VALUES (1032, 13, 42, '思想政治（中国特色社会主义）', 80, 40);
INSERT INTO `scores` VALUES (1033, 13, 43, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (1034, 13, 43, '物理', 100, 40);
INSERT INTO `scores` VALUES (1035, 13, 43, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (1036, 13, 43, '历史', 83, 40);
INSERT INTO `scores` VALUES (1037, 13, 43, '英语', 61, 40);
INSERT INTO `scores` VALUES (1038, 13, 43, '人工智能通识', 68, 40);
INSERT INTO `scores` VALUES (1039, 13, 43, '语文', 61, 40);
INSERT INTO `scores` VALUES (1040, 13, 43, '习近平新时代中国特色社会主义思想', 80, 40);
INSERT INTO `scores` VALUES (1041, 13, 43, '数学', 82, 40);
INSERT INTO `scores` VALUES (1042, 13, 43, '思想政治（中国特色社会主义）', 85, 40);
INSERT INTO `scores` VALUES (1043, 13, 44, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (1044, 13, 44, '物理', 41, 40);
INSERT INTO `scores` VALUES (1045, 13, 44, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (1046, 13, 44, '历史', 88, 40);
INSERT INTO `scores` VALUES (1047, 13, 44, '英语', 40, 40);
INSERT INTO `scores` VALUES (1048, 13, 44, '人工智能通识', 73, 40);
INSERT INTO `scores` VALUES (1049, 13, 44, '语文', 54, 40);
INSERT INTO `scores` VALUES (1050, 13, 44, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1051, 13, 44, '数学', 60, 40);
INSERT INTO `scores` VALUES (1052, 13, 44, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (1053, 13, 45, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1054, 13, 45, '物理', 45, 40);
INSERT INTO `scores` VALUES (1055, 13, 45, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (1056, 13, 45, '历史', 90, 40);
INSERT INTO `scores` VALUES (1057, 13, 45, '英语', 60, 40);
INSERT INTO `scores` VALUES (1058, 13, 45, '人工智能通识', 79, 40);
INSERT INTO `scores` VALUES (1059, 13, 45, '语文', 73, 40);
INSERT INTO `scores` VALUES (1060, 13, 45, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1061, 13, 45, '数学', 67, 40);
INSERT INTO `scores` VALUES (1062, 13, 45, '思想政治（中国特色社会主义）', 91, 40);
INSERT INTO `scores` VALUES (1063, 13, 46, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1064, 13, 46, '物理', 50, 40);
INSERT INTO `scores` VALUES (1065, 13, 46, '计算机系统配置', 67, 40);
INSERT INTO `scores` VALUES (1066, 13, 46, '历史', 66, 40);
INSERT INTO `scores` VALUES (1067, 13, 46, '英语', 65, 40);
INSERT INTO `scores` VALUES (1068, 13, 46, '人工智能通识', 70, 40);
INSERT INTO `scores` VALUES (1069, 13, 46, '语文', 43, 40);
INSERT INTO `scores` VALUES (1070, 13, 46, '习近平新时代中国特色社会主义思想', 80, 40);
INSERT INTO `scores` VALUES (1071, 13, 46, '数学', 44, 40);
INSERT INTO `scores` VALUES (1072, 13, 46, '思想政治（中国特色社会主义）', 83, 40);
INSERT INTO `scores` VALUES (1073, 13, 47, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (1074, 13, 47, '物理', 76, 40);
INSERT INTO `scores` VALUES (1075, 13, 47, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (1076, 13, 47, '历史', 83, 40);
INSERT INTO `scores` VALUES (1077, 13, 47, '英语', 60, 40);
INSERT INTO `scores` VALUES (1078, 13, 47, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (1079, 13, 47, '语文', 64, 40);
INSERT INTO `scores` VALUES (1080, 13, 47, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1081, 13, 47, '数学', 69, 40);
INSERT INTO `scores` VALUES (1082, 13, 47, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (1083, 13, 48, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (1084, 13, 48, '物理', 42, 40);
INSERT INTO `scores` VALUES (1085, 13, 48, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (1086, 13, 48, '历史', 90, 40);
INSERT INTO `scores` VALUES (1087, 13, 48, '英语', 43, 40);
INSERT INTO `scores` VALUES (1088, 13, 48, '人工智能通识', 85, 40);
INSERT INTO `scores` VALUES (1089, 13, 48, '语文', 60, 40);
INSERT INTO `scores` VALUES (1090, 13, 48, '习近平新时代中国特色社会主义思想', 95, 40);
INSERT INTO `scores` VALUES (1091, 13, 48, '数学', 60, 40);
INSERT INTO `scores` VALUES (1092, 13, 48, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (1093, 13, 49, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1094, 13, 49, '物理', 67, 40);
INSERT INTO `scores` VALUES (1095, 13, 49, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (1096, 13, 49, '历史', 90, 40);
INSERT INTO `scores` VALUES (1097, 13, 49, '英语', 60, 40);
INSERT INTO `scores` VALUES (1098, 13, 49, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (1099, 13, 49, '语文', 60, 40);
INSERT INTO `scores` VALUES (1100, 13, 49, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1101, 13, 49, '数学', 82, 40);
INSERT INTO `scores` VALUES (1102, 13, 49, '思想政治（中国特色社会主义）', 94, 40);
INSERT INTO `scores` VALUES (1103, 13, 50, '体育与健康', 66, 40);
INSERT INTO `scores` VALUES (1104, 13, 50, '物理', 76, 40);
INSERT INTO `scores` VALUES (1105, 13, 50, '计算机系统配置', 71, 40);
INSERT INTO `scores` VALUES (1106, 13, 50, '历史', 81, 40);
INSERT INTO `scores` VALUES (1107, 13, 50, '英语', 60, 40);
INSERT INTO `scores` VALUES (1108, 13, 50, '人工智能通识', 67, 40);
INSERT INTO `scores` VALUES (1109, 13, 50, '语文', 70, 40);
INSERT INTO `scores` VALUES (1110, 13, 50, '习近平新时代中国特色社会主义思想', 80, 40);
INSERT INTO `scores` VALUES (1111, 13, 50, '数学', 78, 40);
INSERT INTO `scores` VALUES (1112, 13, 50, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (1113, 13, 51, '体育与健康', 72, 40);
INSERT INTO `scores` VALUES (1114, 13, 51, '物理', 55, 40);
INSERT INTO `scores` VALUES (1115, 13, 51, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (1116, 13, 51, '历史', 83, 40);
INSERT INTO `scores` VALUES (1117, 13, 51, '英语', 42, 40);
INSERT INTO `scores` VALUES (1118, 13, 51, '人工智能通识', 74, 40);
INSERT INTO `scores` VALUES (1119, 13, 51, '语文', 70, 40);
INSERT INTO `scores` VALUES (1120, 13, 51, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1121, 13, 51, '数学', 88, 40);
INSERT INTO `scores` VALUES (1122, 13, 51, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (1123, 13, 52, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1124, 13, 52, '物理', 30, 40);
INSERT INTO `scores` VALUES (1125, 13, 52, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (1126, 13, 52, '历史', 87, 40);
INSERT INTO `scores` VALUES (1127, 13, 52, '英语', 60, 40);
INSERT INTO `scores` VALUES (1128, 13, 52, '人工智能通识', 82, 40);
INSERT INTO `scores` VALUES (1129, 13, 52, '语文', 47, 40);
INSERT INTO `scores` VALUES (1130, 13, 52, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1131, 13, 52, '数学', 47, 40);
INSERT INTO `scores` VALUES (1132, 13, 52, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (1133, 13, 53, '体育与健康', 74, 40);
INSERT INTO `scores` VALUES (1134, 13, 53, '物理', 48, 40);
INSERT INTO `scores` VALUES (1135, 13, 53, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (1136, 13, 53, '历史', 89, 40);
INSERT INTO `scores` VALUES (1137, 13, 53, '英语', 63, 40);
INSERT INTO `scores` VALUES (1138, 13, 53, '人工智能通识', 70, 40);
INSERT INTO `scores` VALUES (1139, 13, 53, '语文', 64, 40);
INSERT INTO `scores` VALUES (1140, 13, 53, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1141, 13, 53, '数学', 60, 40);
INSERT INTO `scores` VALUES (1142, 13, 53, '思想政治（中国特色社会主义）', 97, 40);
INSERT INTO `scores` VALUES (1143, 13, 54, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (1144, 13, 54, '物理', 50, 40);
INSERT INTO `scores` VALUES (1145, 13, 54, '计算机系统配置', 85, 40);
INSERT INTO `scores` VALUES (1146, 13, 54, '历史', 97, 40);
INSERT INTO `scores` VALUES (1147, 13, 54, '英语', 66, 40);
INSERT INTO `scores` VALUES (1148, 13, 54, '人工智能通识', 79, 40);
INSERT INTO `scores` VALUES (1149, 13, 54, '语文', 72, 40);
INSERT INTO `scores` VALUES (1150, 13, 54, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1151, 13, 54, '数学', 40, 40);
INSERT INTO `scores` VALUES (1152, 13, 54, '思想政治（中国特色社会主义）', 94, 40);
INSERT INTO `scores` VALUES (1153, 13, 55, '体育与健康', 72, 40);
INSERT INTO `scores` VALUES (1154, 13, 55, '物理', 70, 40);
INSERT INTO `scores` VALUES (1155, 13, 55, '计算机系统配置', 74, 40);
INSERT INTO `scores` VALUES (1156, 13, 55, '历史', 75, 40);
INSERT INTO `scores` VALUES (1157, 13, 55, '英语', 43, 40);
INSERT INTO `scores` VALUES (1158, 13, 55, '人工智能通识', 85, 40);
INSERT INTO `scores` VALUES (1159, 13, 55, '语文', 60, 40);
INSERT INTO `scores` VALUES (1160, 13, 55, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1161, 13, 55, '数学', 31, 40);
INSERT INTO `scores` VALUES (1162, 13, 55, '思想政治（中国特色社会主义）', 86, 40);
INSERT INTO `scores` VALUES (1163, 13, 56, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (1164, 13, 56, '物理', 55, 40);
INSERT INTO `scores` VALUES (1165, 13, 56, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (1166, 13, 56, '历史', 83, 40);
INSERT INTO `scores` VALUES (1167, 13, 56, '英语', 37, 40);
INSERT INTO `scores` VALUES (1168, 13, 56, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (1169, 13, 56, '语文', 65, 40);
INSERT INTO `scores` VALUES (1170, 13, 56, '习近平新时代中国特色社会主义思想', 73, 40);
INSERT INTO `scores` VALUES (1171, 13, 56, '数学', 60, 40);
INSERT INTO `scores` VALUES (1172, 13, 56, '思想政治（中国特色社会主义）', 87, 40);
INSERT INTO `scores` VALUES (1173, 13, 57, '体育与健康', 74, 40);
INSERT INTO `scores` VALUES (1174, 13, 57, '物理', 46, 40);
INSERT INTO `scores` VALUES (1175, 13, 57, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (1176, 13, 57, '历史', 82, 40);
INSERT INTO `scores` VALUES (1177, 13, 57, '英语', 37, 40);
INSERT INTO `scores` VALUES (1178, 13, 57, '人工智能通识', 72, 40);
INSERT INTO `scores` VALUES (1179, 13, 57, '语文', 51, 40);
INSERT INTO `scores` VALUES (1180, 13, 57, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1181, 13, 57, '数学', 62, 40);
INSERT INTO `scores` VALUES (1182, 13, 57, '思想政治（中国特色社会主义）', 85, 40);
INSERT INTO `scores` VALUES (1183, 13, 58, '体育与健康', 66, 40);
INSERT INTO `scores` VALUES (1184, 13, 58, '物理', 70, 40);
INSERT INTO `scores` VALUES (1185, 13, 58, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (1186, 13, 58, '历史', 83, 40);
INSERT INTO `scores` VALUES (1187, 13, 58, '英语', 60, 40);
INSERT INTO `scores` VALUES (1188, 13, 58, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (1189, 13, 58, '语文', 53, 40);
INSERT INTO `scores` VALUES (1190, 13, 58, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (1191, 13, 58, '数学', 60, 40);
INSERT INTO `scores` VALUES (1192, 13, 58, '思想政治（中国特色社会主义）', 87, 40);
INSERT INTO `scores` VALUES (1193, 13, 59, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1194, 13, 59, '物理', 60, 40);
INSERT INTO `scores` VALUES (1195, 13, 59, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (1196, 13, 59, '历史', 82, 40);
INSERT INTO `scores` VALUES (1197, 13, 59, '英语', 60, 40);
INSERT INTO `scores` VALUES (1198, 13, 59, '人工智能通识', 69, 40);
INSERT INTO `scores` VALUES (1199, 13, 59, '语文', 60, 40);
INSERT INTO `scores` VALUES (1200, 13, 59, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1201, 13, 59, '数学', 45, 40);
INSERT INTO `scores` VALUES (1202, 13, 59, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (1203, 13, 60, '体育与健康', 62, 40);
INSERT INTO `scores` VALUES (1204, 13, 60, '物理', 61, 40);
INSERT INTO `scores` VALUES (1205, 13, 60, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (1206, 13, 60, '历史', 57, 40);
INSERT INTO `scores` VALUES (1207, 13, 60, '英语', 37, 40);
INSERT INTO `scores` VALUES (1208, 13, 60, '人工智能通识', 68, 40);
INSERT INTO `scores` VALUES (1209, 13, 60, '语文', 45, 40);
INSERT INTO `scores` VALUES (1210, 13, 60, '习近平新时代中国特色社会主义思想', 75, 40);
INSERT INTO `scores` VALUES (1211, 13, 60, '数学', 83, 40);
INSERT INTO `scores` VALUES (1212, 13, 60, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (1213, 13, 61, '体育与健康', 64, 40);
INSERT INTO `scores` VALUES (1214, 13, 61, '物理', 83, 40);
INSERT INTO `scores` VALUES (1215, 13, 61, '计算机系统配置', 74, 40);
INSERT INTO `scores` VALUES (1216, 13, 61, '历史', 70, 40);
INSERT INTO `scores` VALUES (1217, 13, 61, '英语', 49, 40);
INSERT INTO `scores` VALUES (1218, 13, 61, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (1219, 13, 61, '语文', 54, 40);
INSERT INTO `scores` VALUES (1220, 13, 61, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1221, 13, 61, '数学', 60, 40);
INSERT INTO `scores` VALUES (1222, 13, 61, '思想政治（中国特色社会主义）', 86, 40);
INSERT INTO `scores` VALUES (1223, 13, 62, '体育与健康', 55, 40);
INSERT INTO `scores` VALUES (1224, 13, 62, '物理', 42, 40);
INSERT INTO `scores` VALUES (1225, 13, 62, '计算机系统配置', 79, 40);
INSERT INTO `scores` VALUES (1226, 13, 62, '历史', 73, 40);
INSERT INTO `scores` VALUES (1227, 13, 62, '英语', 40, 40);
INSERT INTO `scores` VALUES (1228, 13, 62, '人工智能通识', 82, 40);
INSERT INTO `scores` VALUES (1229, 13, 62, '语文', 54, 40);
INSERT INTO `scores` VALUES (1230, 13, 62, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1231, 13, 62, '数学', 82, 40);
INSERT INTO `scores` VALUES (1232, 13, 62, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (1233, 13, 63, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (1234, 13, 63, '物理', 61, 40);
INSERT INTO `scores` VALUES (1235, 13, 63, '计算机系统配置', 76, 40);
INSERT INTO `scores` VALUES (1236, 13, 63, '历史', 83, 40);
INSERT INTO `scores` VALUES (1237, 13, 63, '英语', 49, 40);
INSERT INTO `scores` VALUES (1238, 13, 63, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (1239, 13, 63, '语文', 60, 40);
INSERT INTO `scores` VALUES (1240, 13, 63, '习近平新时代中国特色社会主义思想', 88, 40);
INSERT INTO `scores` VALUES (1241, 13, 63, '数学', 93, 40);
INSERT INTO `scores` VALUES (1242, 13, 63, '思想政治（中国特色社会主义）', 86, 40);
INSERT INTO `scores` VALUES (1243, 13, 64, '体育与健康', 68, 40);
INSERT INTO `scores` VALUES (1244, 13, 64, '物理', 86, 40);
INSERT INTO `scores` VALUES (1245, 13, 64, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (1246, 13, 64, '历史', 85, 40);
INSERT INTO `scores` VALUES (1247, 13, 64, '英语', 49, 40);
INSERT INTO `scores` VALUES (1248, 13, 64, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (1249, 13, 64, '语文', 53, 40);
INSERT INTO `scores` VALUES (1250, 13, 64, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1251, 13, 64, '数学', 72, 40);
INSERT INTO `scores` VALUES (1252, 13, 64, '思想政治（中国特色社会主义）', 95, 40);
INSERT INTO `scores` VALUES (1253, 13, 65, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1254, 13, 65, '物理', 52, 40);
INSERT INTO `scores` VALUES (1255, 13, 65, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (1256, 13, 65, '历史', 61, 40);
INSERT INTO `scores` VALUES (1257, 13, 65, '英语', 35, 40);
INSERT INTO `scores` VALUES (1258, 13, 65, '人工智能通识', 72, 40);
INSERT INTO `scores` VALUES (1259, 13, 65, '语文', 61, 40);
INSERT INTO `scores` VALUES (1260, 13, 65, '习近平新时代中国特色社会主义思想', 76, 40);
INSERT INTO `scores` VALUES (1261, 13, 65, '数学', 14, 40);
INSERT INTO `scores` VALUES (1262, 13, 65, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (1263, 13, 66, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (1264, 13, 66, '物理', 85, 40);
INSERT INTO `scores` VALUES (1265, 13, 66, '计算机系统配置', 83, 40);
INSERT INTO `scores` VALUES (1266, 13, 66, '历史', 89, 40);
INSERT INTO `scores` VALUES (1267, 13, 66, '英语', 39, 40);
INSERT INTO `scores` VALUES (1268, 13, 66, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (1269, 13, 66, '语文', 61, 40);
INSERT INTO `scores` VALUES (1270, 13, 66, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1271, 13, 66, '数学', 69, 40);
INSERT INTO `scores` VALUES (1272, 13, 66, '思想政治（中国特色社会主义）', 90, 40);
INSERT INTO `scores` VALUES (1273, 13, 67, '体育与健康', 55, 40);
INSERT INTO `scores` VALUES (1274, 13, 67, '物理', 55, 40);
INSERT INTO `scores` VALUES (1275, 13, 67, '计算机系统配置', 71, 40);
INSERT INTO `scores` VALUES (1276, 13, 67, '历史', 59, 40);
INSERT INTO `scores` VALUES (1277, 13, 67, '英语', 44, 40);
INSERT INTO `scores` VALUES (1278, 13, 67, '人工智能通识', 82, 40);
INSERT INTO `scores` VALUES (1279, 13, 67, '语文', 60, 40);
INSERT INTO `scores` VALUES (1280, 13, 67, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1281, 13, 67, '数学', 60, 40);
INSERT INTO `scores` VALUES (1282, 13, 67, '思想政治（中国特色社会主义）', 83, 40);
INSERT INTO `scores` VALUES (1283, 13, 68, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (1284, 13, 68, '物理', 61, 40);
INSERT INTO `scores` VALUES (1285, 13, 68, '计算机系统配置', 81, 40);
INSERT INTO `scores` VALUES (1286, 13, 68, '历史', 85, 40);
INSERT INTO `scores` VALUES (1287, 13, 68, '英语', 60, 40);
INSERT INTO `scores` VALUES (1288, 13, 68, '人工智能通识', 79, 40);
INSERT INTO `scores` VALUES (1289, 13, 68, '语文', 66, 40);
INSERT INTO `scores` VALUES (1290, 13, 68, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1291, 13, 68, '数学', 84, 40);
INSERT INTO `scores` VALUES (1292, 13, 68, '思想政治（中国特色社会主义）', 92, 40);
INSERT INTO `scores` VALUES (1293, 14, 35, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (1294, 14, 35, '物理', 45, 40);
INSERT INTO `scores` VALUES (1295, 14, 35, '计算机系统配置', 73, 40);
INSERT INTO `scores` VALUES (1296, 14, 35, '历史', 86, 40);
INSERT INTO `scores` VALUES (1297, 14, 35, '英语', 71, 40);
INSERT INTO `scores` VALUES (1298, 14, 35, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (1299, 14, 35, '语文', 85, 40);
INSERT INTO `scores` VALUES (1300, 14, 35, '习近平新时代中国特色社会主义思想', 94, 40);
INSERT INTO `scores` VALUES (1301, 14, 35, '数学', 96, 40);
INSERT INTO `scores` VALUES (1302, 14, 35, '思想政治（中国特色社会主义）', 93, 40);
INSERT INTO `scores` VALUES (1303, 14, 36, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1304, 14, 36, '物理', 63, 40);
INSERT INTO `scores` VALUES (1305, 14, 36, '计算机系统配置', 70, 40);
INSERT INTO `scores` VALUES (1306, 14, 36, '历史', 78, 40);
INSERT INTO `scores` VALUES (1307, 14, 36, '英语', 75, 40);
INSERT INTO `scores` VALUES (1308, 14, 36, '人工智能通识', 67, 40);
INSERT INTO `scores` VALUES (1309, 14, 36, '语文', 72, 40);
INSERT INTO `scores` VALUES (1310, 14, 36, '习近平新时代中国特色社会主义思想', 79, 40);
INSERT INTO `scores` VALUES (1311, 14, 36, '数学', 78, 40);
INSERT INTO `scores` VALUES (1312, 14, 36, '思想政治（中国特色社会主义）', 88, 40);
INSERT INTO `scores` VALUES (1313, 14, 37, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1314, 14, 37, '物理', 56, 40);
INSERT INTO `scores` VALUES (1315, 14, 37, '计算机系统配置', 68, 40);
INSERT INTO `scores` VALUES (1316, 14, 37, '历史', 86, 40);
INSERT INTO `scores` VALUES (1317, 14, 37, '英语', 60, 40);
INSERT INTO `scores` VALUES (1318, 14, 37, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (1319, 14, 37, '语文', 77, 40);
INSERT INTO `scores` VALUES (1320, 14, 37, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (1321, 14, 37, '数学', 65, 40);
INSERT INTO `scores` VALUES (1322, 14, 37, '思想政治（中国特色社会主义）', 72, 40);
INSERT INTO `scores` VALUES (1323, 14, 38, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1324, 14, 38, '物理', 71, 40);
INSERT INTO `scores` VALUES (1325, 14, 38, '计算机系统配置', 82, 40);
INSERT INTO `scores` VALUES (1326, 14, 38, '历史', 77, 40);
INSERT INTO `scores` VALUES (1327, 14, 38, '英语', 63, 40);
INSERT INTO `scores` VALUES (1328, 14, 38, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (1329, 14, 38, '语文', 79, 40);
INSERT INTO `scores` VALUES (1330, 14, 38, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (1331, 14, 38, '数学', 70, 40);
INSERT INTO `scores` VALUES (1332, 14, 38, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (1333, 14, 39, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (1334, 14, 39, '物理', 81, 40);
INSERT INTO `scores` VALUES (1335, 14, 39, '计算机系统配置', 73, 40);
INSERT INTO `scores` VALUES (1336, 14, 39, '历史', 90, 40);
INSERT INTO `scores` VALUES (1337, 14, 39, '英语', 83, 40);
INSERT INTO `scores` VALUES (1338, 14, 39, '人工智能通识', 90, 40);
INSERT INTO `scores` VALUES (1339, 14, 39, '语文', 84, 40);
INSERT INTO `scores` VALUES (1340, 14, 39, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (1341, 14, 39, '数学', 88, 40);
INSERT INTO `scores` VALUES (1342, 14, 39, '思想政治（中国特色社会主义）', 71, 40);
INSERT INTO `scores` VALUES (1343, 14, 40, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1344, 14, 40, '物理', 62, 40);
INSERT INTO `scores` VALUES (1345, 14, 40, '计算机系统配置', 65, 40);
INSERT INTO `scores` VALUES (1346, 14, 40, '历史', 73, 40);
INSERT INTO `scores` VALUES (1347, 14, 40, '英语', 69, 40);
INSERT INTO `scores` VALUES (1348, 14, 40, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (1349, 14, 40, '语文', 76, 40);
INSERT INTO `scores` VALUES (1350, 14, 40, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (1351, 14, 40, '数学', 55, 40);
INSERT INTO `scores` VALUES (1352, 14, 40, '思想政治（中国特色社会主义）', 78, 40);
INSERT INTO `scores` VALUES (1353, 14, 41, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (1354, 14, 41, '物理', 55, 40);
INSERT INTO `scores` VALUES (1355, 14, 41, '计算机系统配置', 67, 40);
INSERT INTO `scores` VALUES (1356, 14, 41, '历史', 79, 40);
INSERT INTO `scores` VALUES (1357, 14, 41, '英语', 68, 40);
INSERT INTO `scores` VALUES (1358, 14, 41, '人工智能通识', 77, 40);
INSERT INTO `scores` VALUES (1359, 14, 41, '语文', 57, 40);
INSERT INTO `scores` VALUES (1360, 14, 41, '习近平新时代中国特色社会主义思想', 95, 40);
INSERT INTO `scores` VALUES (1361, 14, 41, '数学', 62, 40);
INSERT INTO `scores` VALUES (1362, 14, 41, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (1363, 14, 42, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (1364, 14, 42, '物理', 60, 40);
INSERT INTO `scores` VALUES (1365, 14, 42, '计算机系统配置', 62, 40);
INSERT INTO `scores` VALUES (1366, 14, 42, '历史', 77, 40);
INSERT INTO `scores` VALUES (1367, 14, 42, '英语', 60, 40);
INSERT INTO `scores` VALUES (1368, 14, 42, '人工智能通识', 71, 40);
INSERT INTO `scores` VALUES (1369, 14, 42, '语文', 73, 40);
INSERT INTO `scores` VALUES (1370, 14, 42, '习近平新时代中国特色社会主义思想', 82, 40);
INSERT INTO `scores` VALUES (1371, 14, 42, '数学', 60, 40);
INSERT INTO `scores` VALUES (1372, 14, 42, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (1373, 14, 43, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (1374, 14, 43, '物理', 70, 40);
INSERT INTO `scores` VALUES (1375, 14, 43, '计算机系统配置', 62, 40);
INSERT INTO `scores` VALUES (1376, 14, 43, '历史', 81, 40);
INSERT INTO `scores` VALUES (1377, 14, 43, '英语', 66, 40);
INSERT INTO `scores` VALUES (1378, 14, 43, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (1379, 14, 43, '语文', 73, 40);
INSERT INTO `scores` VALUES (1380, 14, 43, '习近平新时代中国特色社会主义思想', 85, 40);
INSERT INTO `scores` VALUES (1381, 14, 43, '数学', 80, 40);
INSERT INTO `scores` VALUES (1382, 14, 43, '思想政治（中国特色社会主义）', 64, 40);
INSERT INTO `scores` VALUES (1383, 14, 44, '体育与健康', 70, 40);
INSERT INTO `scores` VALUES (1384, 14, 44, '物理', 56, 40);
INSERT INTO `scores` VALUES (1385, 14, 44, '计算机系统配置', 75, 40);
INSERT INTO `scores` VALUES (1386, 14, 44, '历史', 76, 40);
INSERT INTO `scores` VALUES (1387, 14, 44, '英语', 52, 40);
INSERT INTO `scores` VALUES (1388, 14, 44, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (1389, 14, 44, '语文', 69, 40);
INSERT INTO `scores` VALUES (1390, 14, 44, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1391, 14, 44, '数学', 69, 40);
INSERT INTO `scores` VALUES (1392, 14, 44, '思想政治（中国特色社会主义）', 60, 40);
INSERT INTO `scores` VALUES (1393, 14, 45, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1394, 14, 45, '物理', 78, 40);
INSERT INTO `scores` VALUES (1395, 14, 45, '计算机系统配置', 61, 40);
INSERT INTO `scores` VALUES (1396, 14, 45, '历史', 94, 40);
INSERT INTO `scores` VALUES (1397, 14, 45, '英语', 68, 40);
INSERT INTO `scores` VALUES (1398, 14, 45, '人工智能通识', 83, 40);
INSERT INTO `scores` VALUES (1399, 14, 45, '语文', 85, 40);
INSERT INTO `scores` VALUES (1400, 14, 45, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1401, 14, 45, '数学', 88, 40);
INSERT INTO `scores` VALUES (1402, 14, 45, '思想政治（中国特色社会主义）', 94, 40);
INSERT INTO `scores` VALUES (1403, 14, 46, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1404, 14, 46, '物理', 48, 40);
INSERT INTO `scores` VALUES (1405, 14, 46, '计算机系统配置', 63, 40);
INSERT INTO `scores` VALUES (1406, 14, 46, '历史', 52, 40);
INSERT INTO `scores` VALUES (1407, 14, 46, '英语', 82, 40);
INSERT INTO `scores` VALUES (1408, 14, 46, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (1409, 14, 46, '语文', 62, 40);
INSERT INTO `scores` VALUES (1410, 14, 46, '习近平新时代中国特色社会主义思想', 78, 40);
INSERT INTO `scores` VALUES (1411, 14, 46, '数学', 24, 40);
INSERT INTO `scores` VALUES (1412, 14, 46, '思想政治（中国特色社会主义）', 50, 40);
INSERT INTO `scores` VALUES (1413, 14, 47, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (1414, 14, 47, '物理', 88, 40);
INSERT INTO `scores` VALUES (1415, 14, 47, '计算机系统配置', 64, 40);
INSERT INTO `scores` VALUES (1416, 14, 47, '历史', 82, 40);
INSERT INTO `scores` VALUES (1417, 14, 47, '英语', 64, 40);
INSERT INTO `scores` VALUES (1418, 14, 47, '人工智能通识', 81, 40);
INSERT INTO `scores` VALUES (1419, 14, 47, '语文', 79, 40);
INSERT INTO `scores` VALUES (1420, 14, 47, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (1421, 14, 47, '数学', 76, 40);
INSERT INTO `scores` VALUES (1422, 14, 47, '思想政治（中国特色社会主义）', 84, 40);
INSERT INTO `scores` VALUES (1423, 14, 48, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (1424, 14, 48, '物理', 60, 40);
INSERT INTO `scores` VALUES (1425, 14, 48, '计算机系统配置', 75, 40);
INSERT INTO `scores` VALUES (1426, 14, 48, '历史', 90, 40);
INSERT INTO `scores` VALUES (1427, 14, 48, '英语', 68, 40);
INSERT INTO `scores` VALUES (1428, 14, 48, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (1429, 14, 48, '语文', 85, 40);
INSERT INTO `scores` VALUES (1430, 14, 48, '习近平新时代中国特色社会主义思想', 92, 40);
INSERT INTO `scores` VALUES (1431, 14, 48, '数学', 74, 40);
INSERT INTO `scores` VALUES (1432, 14, 48, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (1433, 14, 49, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1434, 14, 49, '物理', 75, 40);
INSERT INTO `scores` VALUES (1435, 14, 49, '计算机系统配置', 68, 40);
INSERT INTO `scores` VALUES (1436, 14, 49, '历史', 93, 40);
INSERT INTO `scores` VALUES (1437, 14, 49, '英语', 73, 40);
INSERT INTO `scores` VALUES (1438, 14, 49, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (1439, 14, 49, '语文', 85, 40);
INSERT INTO `scores` VALUES (1440, 14, 49, '习近平新时代中国特色社会主义思想', 97, 40);
INSERT INTO `scores` VALUES (1441, 14, 49, '数学', 87, 40);
INSERT INTO `scores` VALUES (1442, 14, 49, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (1443, 14, 50, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1444, 14, 50, '物理', 72, 40);
INSERT INTO `scores` VALUES (1445, 14, 50, '计算机系统配置', 63, 40);
INSERT INTO `scores` VALUES (1446, 14, 50, '历史', 81, 40);
INSERT INTO `scores` VALUES (1447, 14, 50, '英语', 74, 40);
INSERT INTO `scores` VALUES (1448, 14, 50, '人工智能通识', 73, 40);
INSERT INTO `scores` VALUES (1449, 14, 50, '语文', 81, 40);
INSERT INTO `scores` VALUES (1450, 14, 50, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1451, 14, 50, '数学', 81, 40);
INSERT INTO `scores` VALUES (1452, 14, 50, '思想政治（中国特色社会主义）', 53, 40);
INSERT INTO `scores` VALUES (1453, 14, 51, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1454, 14, 51, '物理', 79, 40);
INSERT INTO `scores` VALUES (1455, 14, 51, '计算机系统配置', 78, 40);
INSERT INTO `scores` VALUES (1456, 14, 51, '历史', 87, 40);
INSERT INTO `scores` VALUES (1457, 14, 51, '英语', 67, 40);
INSERT INTO `scores` VALUES (1458, 14, 51, '人工智能通识', 74, 40);
INSERT INTO `scores` VALUES (1459, 14, 51, '语文', 75, 40);
INSERT INTO `scores` VALUES (1460, 14, 51, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1461, 14, 51, '数学', 73, 40);
INSERT INTO `scores` VALUES (1462, 14, 51, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (1463, 14, 52, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1464, 14, 52, '物理', 64, 40);
INSERT INTO `scores` VALUES (1465, 14, 52, '计算机系统配置', 72, 40);
INSERT INTO `scores` VALUES (1466, 14, 52, '历史', 75, 40);
INSERT INTO `scores` VALUES (1467, 14, 52, '英语', 70, 40);
INSERT INTO `scores` VALUES (1468, 14, 52, '人工智能通识', 70, 40);
INSERT INTO `scores` VALUES (1469, 14, 52, '语文', 74, 40);
INSERT INTO `scores` VALUES (1470, 14, 52, '习近平新时代中国特色社会主义思想', 97, 40);
INSERT INTO `scores` VALUES (1471, 14, 52, '数学', 58, 40);
INSERT INTO `scores` VALUES (1472, 14, 52, '思想政治（中国特色社会主义）', 76, 40);
INSERT INTO `scores` VALUES (1473, 14, 53, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1474, 14, 53, '物理', 72, 40);
INSERT INTO `scores` VALUES (1475, 14, 53, '计算机系统配置', 69, 40);
INSERT INTO `scores` VALUES (1476, 14, 53, '历史', 75, 40);
INSERT INTO `scores` VALUES (1477, 14, 53, '英语', 69, 40);
INSERT INTO `scores` VALUES (1478, 14, 53, '人工智能通识', 75, 40);
INSERT INTO `scores` VALUES (1479, 14, 53, '语文', 71, 40);
INSERT INTO `scores` VALUES (1480, 14, 53, '习近平新时代中国特色社会主义思想', 97, 40);
INSERT INTO `scores` VALUES (1481, 14, 53, '数学', 68, 40);
INSERT INTO `scores` VALUES (1482, 14, 53, '思想政治（中国特色社会主义）', 76, 40);
INSERT INTO `scores` VALUES (1483, 14, 54, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1484, 14, 54, '物理', 50, 40);
INSERT INTO `scores` VALUES (1485, 14, 54, '计算机系统配置', 62, 40);
INSERT INTO `scores` VALUES (1486, 14, 54, '历史', 86, 40);
INSERT INTO `scores` VALUES (1487, 14, 54, '英语', 75, 40);
INSERT INTO `scores` VALUES (1488, 14, 54, '人工智能通识', 80, 40);
INSERT INTO `scores` VALUES (1489, 14, 54, '语文', 83, 40);
INSERT INTO `scores` VALUES (1490, 14, 54, '习近平新时代中国特色社会主义思想', 98, 40);
INSERT INTO `scores` VALUES (1491, 14, 54, '数学', 64, 40);
INSERT INTO `scores` VALUES (1492, 14, 54, '思想政治（中国特色社会主义）', 90, 40);
INSERT INTO `scores` VALUES (1493, 14, 55, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (1494, 14, 55, '物理', 71, 40);
INSERT INTO `scores` VALUES (1495, 14, 55, '计算机系统配置', 67, 40);
INSERT INTO `scores` VALUES (1496, 14, 55, '历史', 81, 40);
INSERT INTO `scores` VALUES (1497, 14, 55, '英语', 74, 40);
INSERT INTO `scores` VALUES (1498, 14, 55, '人工智能通识', 76, 40);
INSERT INTO `scores` VALUES (1499, 14, 55, '语文', 69, 40);
INSERT INTO `scores` VALUES (1500, 14, 55, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (1501, 14, 55, '数学', 96, 40);
INSERT INTO `scores` VALUES (1502, 14, 55, '思想政治（中国特色社会主义）', 62, 40);
INSERT INTO `scores` VALUES (1503, 14, 56, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (1504, 14, 56, '物理', 60, 40);
INSERT INTO `scores` VALUES (1505, 14, 56, '计算机系统配置', 60, 40);
INSERT INTO `scores` VALUES (1506, 14, 56, '历史', 84, 40);
INSERT INTO `scores` VALUES (1507, 14, 56, '英语', 60, 40);
INSERT INTO `scores` VALUES (1508, 14, 56, '人工智能通识', 68, 40);
INSERT INTO `scores` VALUES (1509, 14, 56, '语文', 72, 40);
INSERT INTO `scores` VALUES (1510, 14, 56, '习近平新时代中国特色社会主义思想', 90, 40);
INSERT INTO `scores` VALUES (1511, 14, 56, '数学', 66, 40);
INSERT INTO `scores` VALUES (1512, 14, 56, '思想政治（中国特色社会主义）', 67, 40);
INSERT INTO `scores` VALUES (1513, 14, 57, '体育与健康', 90, 40);
INSERT INTO `scores` VALUES (1514, 14, 57, '物理', 61, 40);
INSERT INTO `scores` VALUES (1515, 14, 57, '计算机系统配置', 73, 40);
INSERT INTO `scores` VALUES (1516, 14, 57, '历史', 81, 40);
INSERT INTO `scores` VALUES (1517, 14, 57, '英语', 70, 40);
INSERT INTO `scores` VALUES (1518, 14, 57, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (1519, 14, 57, '语文', 72, 40);
INSERT INTO `scores` VALUES (1520, 14, 57, '习近平新时代中国特色社会主义思想', 88, 40);
INSERT INTO `scores` VALUES (1521, 14, 57, '数学', 73, 40);
INSERT INTO `scores` VALUES (1522, 14, 57, '思想政治（中国特色社会主义）', 68, 40);
INSERT INTO `scores` VALUES (1523, 14, 58, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1524, 14, 58, '物理', 77, 40);
INSERT INTO `scores` VALUES (1525, 14, 58, '计算机系统配置', 80, 40);
INSERT INTO `scores` VALUES (1526, 14, 58, '历史', 78, 40);
INSERT INTO `scores` VALUES (1527, 14, 58, '英语', 75, 40);
INSERT INTO `scores` VALUES (1528, 14, 58, '人工智能通识', 66, 40);
INSERT INTO `scores` VALUES (1529, 14, 58, '语文', 75, 40);
INSERT INTO `scores` VALUES (1530, 14, 58, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (1531, 14, 58, '数学', 81, 40);
INSERT INTO `scores` VALUES (1532, 14, 58, '思想政治（中国特色社会主义）', 61, 40);
INSERT INTO `scores` VALUES (1533, 14, 59, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1534, 14, 59, '物理', 45, 40);
INSERT INTO `scores` VALUES (1535, 14, 59, '计算机系统配置', 60, 40);
INSERT INTO `scores` VALUES (1536, 14, 59, '历史', 73, 40);
INSERT INTO `scores` VALUES (1537, 14, 59, '英语', 71, 40);
INSERT INTO `scores` VALUES (1538, 14, 59, '人工智能通识', 61, 40);
INSERT INTO `scores` VALUES (1539, 14, 59, '语文', 66, 40);
INSERT INTO `scores` VALUES (1540, 14, 59, '习近平新时代中国特色社会主义思想', 89, 40);
INSERT INTO `scores` VALUES (1541, 14, 59, '数学', 79, 40);
INSERT INTO `scores` VALUES (1542, 14, 59, '思想政治（中国特色社会主义）', 65, 40);
INSERT INTO `scores` VALUES (1543, 14, 60, '体育与健康', 75, 40);
INSERT INTO `scores` VALUES (1544, 14, 60, '物理', 68, 40);
INSERT INTO `scores` VALUES (1545, 14, 60, '计算机系统配置', 60, 40);
INSERT INTO `scores` VALUES (1546, 14, 60, '历史', 83, 40);
INSERT INTO `scores` VALUES (1547, 14, 60, '英语', 16, 40);
INSERT INTO `scores` VALUES (1548, 14, 60, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (1549, 14, 60, '语文', 52, 40);
INSERT INTO `scores` VALUES (1550, 14, 60, '习近平新时代中国特色社会主义思想', 95, 40);
INSERT INTO `scores` VALUES (1551, 14, 60, '数学', 100, 40);
INSERT INTO `scores` VALUES (1552, 14, 60, '思想政治（中国特色社会主义）', 57, 40);
INSERT INTO `scores` VALUES (1553, 14, 61, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (1554, 14, 61, '物理', 67, 40);
INSERT INTO `scores` VALUES (1555, 14, 61, '计算机系统配置', 71, 40);
INSERT INTO `scores` VALUES (1556, 14, 61, '历史', 75, 40);
INSERT INTO `scores` VALUES (1557, 14, 61, '英语', 68, 40);
INSERT INTO `scores` VALUES (1558, 14, 61, '人工智能通识', 62, 40);
INSERT INTO `scores` VALUES (1559, 14, 61, '语文', 67, 40);
INSERT INTO `scores` VALUES (1560, 14, 61, '习近平新时代中国特色社会主义思想', 94, 40);
INSERT INTO `scores` VALUES (1561, 14, 61, '数学', 88, 40);
INSERT INTO `scores` VALUES (1562, 14, 61, '思想政治（中国特色社会主义）', 78, 40);
INSERT INTO `scores` VALUES (1563, 14, 62, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1564, 14, 62, '物理', 60, 40);
INSERT INTO `scores` VALUES (1565, 14, 62, '计算机系统配置', 72, 40);
INSERT INTO `scores` VALUES (1566, 14, 62, '历史', 76, 40);
INSERT INTO `scores` VALUES (1567, 14, 62, '英语', 60, 40);
INSERT INTO `scores` VALUES (1568, 14, 62, '人工智能通识', 67, 40);
INSERT INTO `scores` VALUES (1569, 14, 62, '语文', 68, 40);
INSERT INTO `scores` VALUES (1570, 14, 62, '习近平新时代中国特色社会主义思想', 93, 40);
INSERT INTO `scores` VALUES (1571, 14, 62, '数学', 75, 40);
INSERT INTO `scores` VALUES (1572, 14, 62, '思想政治（中国特色社会主义）', 73, 40);
INSERT INTO `scores` VALUES (1573, 14, 63, '体育与健康', 80, 40);
INSERT INTO `scores` VALUES (1574, 14, 63, '物理', 61, 40);
INSERT INTO `scores` VALUES (1575, 14, 63, '计算机系统配置', 69, 40);
INSERT INTO `scores` VALUES (1576, 14, 63, '历史', 72, 40);
INSERT INTO `scores` VALUES (1577, 14, 63, '英语', 70, 40);
INSERT INTO `scores` VALUES (1578, 14, 63, '人工智能通识', 62, 40);
INSERT INTO `scores` VALUES (1579, 14, 63, '语文', 74, 40);
INSERT INTO `scores` VALUES (1580, 14, 63, '习近平新时代中国特色社会主义思想', 96, 40);
INSERT INTO `scores` VALUES (1581, 14, 63, '数学', 87, 40);
INSERT INTO `scores` VALUES (1582, 14, 63, '思想政治（中国特色社会主义）', 82, 40);
INSERT INTO `scores` VALUES (1583, 14, 64, '体育与健康', 85, 40);
INSERT INTO `scores` VALUES (1584, 14, 64, '物理', 73, 40);
INSERT INTO `scores` VALUES (1585, 14, 64, '计算机系统配置', 72, 40);
INSERT INTO `scores` VALUES (1586, 14, 64, '历史', 81, 40);
INSERT INTO `scores` VALUES (1587, 14, 64, '英语', 53, 40);
INSERT INTO `scores` VALUES (1588, 14, 64, '人工智能通识', 65, 40);
INSERT INTO `scores` VALUES (1589, 14, 64, '语文', 77, 40);
INSERT INTO `scores` VALUES (1590, 14, 64, '习近平新时代中国特色社会主义思想', 100, 40);
INSERT INTO `scores` VALUES (1591, 14, 64, '数学', 77, 40);
INSERT INTO `scores` VALUES (1592, 14, 64, '思想政治（中国特色社会主义）', 77, 40);
INSERT INTO `scores` VALUES (1593, 14, 65, '体育与健康', 0, 40);
INSERT INTO `scores` VALUES (1594, 14, 65, '物理', 46, 40);
INSERT INTO `scores` VALUES (1595, 14, 65, '计算机系统配置', 70, 40);
INSERT INTO `scores` VALUES (1596, 14, 65, '历史', 55, 40);
INSERT INTO `scores` VALUES (1597, 14, 65, '英语', 44, 40);
INSERT INTO `scores` VALUES (1598, 14, 65, '人工智能通识', 60, 40);
INSERT INTO `scores` VALUES (1599, 14, 65, '语文', 55, 40);
INSERT INTO `scores` VALUES (1600, 14, 65, '习近平新时代中国特色社会主义思想', 84, 40);
INSERT INTO `scores` VALUES (1601, 14, 65, '数学', 75, 40);
INSERT INTO `scores` VALUES (1602, 14, 65, '思想政治（中国特色社会主义）', 48, 40);
INSERT INTO `scores` VALUES (1603, 14, 66, '体育与健康', 100, 40);
INSERT INTO `scores` VALUES (1604, 14, 66, '物理', 77, 40);
INSERT INTO `scores` VALUES (1605, 14, 66, '计算机系统配置', 63, 40);
INSERT INTO `scores` VALUES (1606, 14, 66, '历史', 86, 40);
INSERT INTO `scores` VALUES (1607, 14, 66, '英语', 65, 40);
INSERT INTO `scores` VALUES (1608, 14, 66, '人工智能通识', 73, 40);
INSERT INTO `scores` VALUES (1609, 14, 66, '语文', 72, 40);
INSERT INTO `scores` VALUES (1610, 14, 66, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (1611, 14, 66, '数学', 81, 40);
INSERT INTO `scores` VALUES (1612, 14, 66, '思想政治（中国特色社会主义）', 81, 40);
INSERT INTO `scores` VALUES (1613, 14, 67, '体育与健康', 60, 40);
INSERT INTO `scores` VALUES (1614, 14, 67, '物理', 60, 40);
INSERT INTO `scores` VALUES (1615, 14, 67, '计算机系统配置', 64, 40);
INSERT INTO `scores` VALUES (1616, 14, 67, '历史', 83, 40);
INSERT INTO `scores` VALUES (1617, 14, 67, '英语', 75, 40);
INSERT INTO `scores` VALUES (1618, 14, 67, '人工智能通识', 72, 40);
INSERT INTO `scores` VALUES (1619, 14, 67, '语文', 64, 40);
INSERT INTO `scores` VALUES (1620, 14, 67, '习近平新时代中国特色社会主义思想', 91, 40);
INSERT INTO `scores` VALUES (1621, 14, 67, '数学', 66, 40);
INSERT INTO `scores` VALUES (1622, 14, 67, '思想政治（中国特色社会主义）', 80, 40);
INSERT INTO `scores` VALUES (1623, 14, 68, '体育与健康', 100, 40);
INSERT INTO `scores` VALUES (1624, 14, 68, '物理', 67, 40);
INSERT INTO `scores` VALUES (1625, 14, 68, '计算机系统配置', 65, 40);
INSERT INTO `scores` VALUES (1626, 14, 68, '历史', 88, 40);
INSERT INTO `scores` VALUES (1627, 14, 68, '英语', 74, 40);
INSERT INTO `scores` VALUES (1628, 14, 68, '人工智能通识', 87, 40);
INSERT INTO `scores` VALUES (1629, 14, 68, '语文', 69, 40);
INSERT INTO `scores` VALUES (1630, 14, 68, '习近平新时代中国特色社会主义思想', 98, 40);
INSERT INTO `scores` VALUES (1631, 14, 68, '数学', 75, 40);
INSERT INTO `scores` VALUES (1632, 14, 68, '思想政治（中国特色社会主义）', 74, 40);
INSERT INTO `scores` VALUES (1633, 15, 35, '语文', 80, 40);
INSERT INTO `scores` VALUES (1634, 15, 35, '数学', 27, 40);
INSERT INTO `scores` VALUES (1635, 15, 35, '英语', 42, 40);
INSERT INTO `scores` VALUES (1636, 15, 35, '物理', 0, 40);
INSERT INTO `scores` VALUES (1637, 15, 35, '电工电子技术应用', 0, 40);
INSERT INTO `scores` VALUES (1638, 15, 35, '思想政治（心理健康与职业生涯）', 76, 40);
INSERT INTO `scores` VALUES (1639, 15, 35, '历史', 0, 40);
INSERT INTO `scores` VALUES (1640, 15, 35, '计算机网络基础', 0, 40);
INSERT INTO `scores` VALUES (1641, 15, 36, '语文', 75, 40);
INSERT INTO `scores` VALUES (1642, 15, 36, '数学', 38, 40);
INSERT INTO `scores` VALUES (1643, 15, 36, '英语', 51, 40);
INSERT INTO `scores` VALUES (1644, 15, 36, '物理', 41, 40);
INSERT INTO `scores` VALUES (1645, 15, 36, '电工电子技术应用', 68, 40);
INSERT INTO `scores` VALUES (1646, 15, 36, '思想政治（心理健康与职业生涯）', 82, 40);
INSERT INTO `scores` VALUES (1647, 15, 36, '历史', 65, 40);
INSERT INTO `scores` VALUES (1648, 15, 36, '计算机网络基础', 43, 40);
INSERT INTO `scores` VALUES (1649, 15, 37, '语文', 74, 40);
INSERT INTO `scores` VALUES (1650, 15, 37, '数学', 60, 40);
INSERT INTO `scores` VALUES (1651, 15, 37, '英语', 45, 40);
INSERT INTO `scores` VALUES (1652, 15, 37, '物理', 60, 40);
INSERT INTO `scores` VALUES (1653, 15, 37, '电工电子技术应用', 61, 40);
INSERT INTO `scores` VALUES (1654, 15, 37, '思想政治（心理健康与职业生涯）', 87, 40);
INSERT INTO `scores` VALUES (1655, 15, 37, '历史', 65, 40);
INSERT INTO `scores` VALUES (1656, 15, 37, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (1657, 15, 38, '语文', 60, 40);
INSERT INTO `scores` VALUES (1658, 15, 38, '数学', 65, 40);
INSERT INTO `scores` VALUES (1659, 15, 38, '英语', 60, 40);
INSERT INTO `scores` VALUES (1660, 15, 38, '物理', 78, 40);
INSERT INTO `scores` VALUES (1661, 15, 38, '电工电子技术应用', 73, 40);
INSERT INTO `scores` VALUES (1662, 15, 38, '思想政治（心理健康与职业生涯）', 85, 40);
INSERT INTO `scores` VALUES (1663, 15, 38, '历史', 72.5, 40);
INSERT INTO `scores` VALUES (1664, 15, 38, '计算机网络基础', 66, 40);
INSERT INTO `scores` VALUES (1665, 15, 39, '语文', 79, 40);
INSERT INTO `scores` VALUES (1666, 15, 39, '数学', 60, 40);
INSERT INTO `scores` VALUES (1667, 15, 39, '英语', 81, 40);
INSERT INTO `scores` VALUES (1668, 15, 39, '物理', 78, 40);
INSERT INTO `scores` VALUES (1669, 15, 39, '电工电子技术应用', 84, 40);
INSERT INTO `scores` VALUES (1670, 15, 39, '思想政治（心理健康与职业生涯）', 86, 40);
INSERT INTO `scores` VALUES (1671, 15, 39, '历史', 85, 40);
INSERT INTO `scores` VALUES (1672, 15, 39, '计算机网络基础', 69, 40);
INSERT INTO `scores` VALUES (1673, 15, 40, '语文', 60, 40);
INSERT INTO `scores` VALUES (1674, 15, 40, '数学', 60, 40);
INSERT INTO `scores` VALUES (1675, 15, 40, '英语', 62, 40);
INSERT INTO `scores` VALUES (1676, 15, 40, '物理', 63, 40);
INSERT INTO `scores` VALUES (1677, 15, 40, '电工电子技术应用', 67, 40);
INSERT INTO `scores` VALUES (1678, 15, 40, '思想政治（心理健康与职业生涯）', 90, 40);
INSERT INTO `scores` VALUES (1679, 15, 40, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (1680, 15, 40, '计算机网络基础', 47, 40);
INSERT INTO `scores` VALUES (1681, 15, 41, '语文', 73, 40);
INSERT INTO `scores` VALUES (1682, 15, 41, '数学', 60, 40);
INSERT INTO `scores` VALUES (1683, 15, 41, '英语', 72, 40);
INSERT INTO `scores` VALUES (1684, 15, 41, '物理', 75, 40);
INSERT INTO `scores` VALUES (1685, 15, 41, '电工电子技术应用', 81, 40);
INSERT INTO `scores` VALUES (1686, 15, 41, '思想政治（心理健康与职业生涯）', 82, 40);
INSERT INTO `scores` VALUES (1687, 15, 41, '历史', 67.5, 40);
INSERT INTO `scores` VALUES (1688, 15, 41, '计算机网络基础', 73, 40);
INSERT INTO `scores` VALUES (1689, 15, 42, '语文', 83, 40);
INSERT INTO `scores` VALUES (1690, 15, 42, '数学', 25, 40);
INSERT INTO `scores` VALUES (1691, 15, 42, '英语', 60, 40);
INSERT INTO `scores` VALUES (1692, 15, 42, '物理', 79, 40);
INSERT INTO `scores` VALUES (1693, 15, 42, '电工电子技术应用', 56, 40);
INSERT INTO `scores` VALUES (1694, 15, 42, '思想政治（心理健康与职业生涯）', 84, 40);
INSERT INTO `scores` VALUES (1695, 15, 42, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (1696, 15, 42, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (1697, 15, 43, '语文', 77, 40);
INSERT INTO `scores` VALUES (1698, 15, 43, '数学', 78, 40);
INSERT INTO `scores` VALUES (1699, 15, 43, '英语', 50, 40);
INSERT INTO `scores` VALUES (1700, 15, 43, '物理', 66, 40);
INSERT INTO `scores` VALUES (1701, 15, 43, '电工电子技术应用', 71, 40);
INSERT INTO `scores` VALUES (1702, 15, 43, '思想政治（心理健康与职业生涯）', 88, 40);
INSERT INTO `scores` VALUES (1703, 15, 43, '历史', 65, 40);
INSERT INTO `scores` VALUES (1704, 15, 43, '计算机网络基础', 52, 40);
INSERT INTO `scores` VALUES (1705, 15, 44, '语文', 78, 40);
INSERT INTO `scores` VALUES (1706, 15, 44, '数学', 31, 40);
INSERT INTO `scores` VALUES (1707, 15, 44, '英语', 34, 40);
INSERT INTO `scores` VALUES (1708, 15, 44, '物理', 54, 40);
INSERT INTO `scores` VALUES (1709, 15, 44, '电工电子技术应用', 60, 40);
INSERT INTO `scores` VALUES (1710, 15, 44, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (1711, 15, 44, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (1712, 15, 44, '计算机网络基础', 63, 40);
INSERT INTO `scores` VALUES (1713, 15, 45, '语文', 77, 40);
INSERT INTO `scores` VALUES (1714, 15, 45, '数学', 63, 40);
INSERT INTO `scores` VALUES (1715, 15, 45, '英语', 71, 40);
INSERT INTO `scores` VALUES (1716, 15, 45, '物理', 86, 40);
INSERT INTO `scores` VALUES (1717, 15, 45, '电工电子技术应用', 75, 40);
INSERT INTO `scores` VALUES (1718, 15, 45, '思想政治（心理健康与职业生涯）', 89, 40);
INSERT INTO `scores` VALUES (1719, 15, 45, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (1720, 15, 45, '计算机网络基础', 75, 40);
INSERT INTO `scores` VALUES (1721, 15, 46, '语文', 70, 40);
INSERT INTO `scores` VALUES (1722, 15, 46, '数学', 10, 40);
INSERT INTO `scores` VALUES (1723, 15, 46, '英语', 47, 40);
INSERT INTO `scores` VALUES (1724, 15, 46, '物理', 20, 40);
INSERT INTO `scores` VALUES (1725, 15, 46, '电工电子技术应用', 15, 40);
INSERT INTO `scores` VALUES (1726, 15, 46, '思想政治（心理健康与职业生涯）', 60, 40);
INSERT INTO `scores` VALUES (1727, 15, 46, '历史', 27.5, 40);
INSERT INTO `scores` VALUES (1728, 15, 46, '计算机网络基础', 12, 40);
INSERT INTO `scores` VALUES (1729, 15, 47, '语文', 80, 40);
INSERT INTO `scores` VALUES (1730, 15, 47, '数学', 62, 40);
INSERT INTO `scores` VALUES (1731, 15, 47, '英语', 52, 40);
INSERT INTO `scores` VALUES (1732, 15, 47, '物理', 90, 40);
INSERT INTO `scores` VALUES (1733, 15, 47, '电工电子技术应用', 65, 40);
INSERT INTO `scores` VALUES (1734, 15, 47, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (1735, 15, 47, '历史', 80, 40);
INSERT INTO `scores` VALUES (1736, 15, 47, '计算机网络基础', 63, 40);
INSERT INTO `scores` VALUES (1737, 15, 48, '语文', 89, 40);
INSERT INTO `scores` VALUES (1738, 15, 48, '数学', 80, 40);
INSERT INTO `scores` VALUES (1739, 15, 48, '英语', 77, 40);
INSERT INTO `scores` VALUES (1740, 15, 48, '物理', 86, 40);
INSERT INTO `scores` VALUES (1741, 15, 48, '电工电子技术应用', 82, 40);
INSERT INTO `scores` VALUES (1742, 15, 48, '思想政治（心理健康与职业生涯）', 91, 40);
INSERT INTO `scores` VALUES (1743, 15, 48, '历史', 85, 40);
INSERT INTO `scores` VALUES (1744, 15, 48, '计算机网络基础', 70, 40);
INSERT INTO `scores` VALUES (1745, 15, 49, '语文', 89, 40);
INSERT INTO `scores` VALUES (1746, 15, 49, '数学', 80, 40);
INSERT INTO `scores` VALUES (1747, 15, 49, '英语', 77, 40);
INSERT INTO `scores` VALUES (1748, 15, 49, '物理', 86, 40);
INSERT INTO `scores` VALUES (1749, 15, 49, '电工电子技术应用', 82, 40);
INSERT INTO `scores` VALUES (1750, 15, 49, '思想政治（心理健康与职业生涯）', 91, 40);
INSERT INTO `scores` VALUES (1751, 15, 49, '历史', 85, 40);
INSERT INTO `scores` VALUES (1752, 15, 49, '计算机网络基础', 70, 40);
INSERT INTO `scores` VALUES (1753, 15, 50, '语文', 89, 40);
INSERT INTO `scores` VALUES (1754, 15, 50, '数学', 49, 40);
INSERT INTO `scores` VALUES (1755, 15, 50, '英语', 39, 40);
INSERT INTO `scores` VALUES (1756, 15, 50, '物理', 67, 40);
INSERT INTO `scores` VALUES (1757, 15, 50, '电工电子技术应用', 72, 40);
INSERT INTO `scores` VALUES (1758, 15, 50, '思想政治（心理健康与职业生涯）', 70, 40);
INSERT INTO `scores` VALUES (1759, 15, 50, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (1760, 15, 50, '计算机网络基础', 52, 40);
INSERT INTO `scores` VALUES (1761, 15, 51, '语文', 79, 40);
INSERT INTO `scores` VALUES (1762, 15, 51, '数学', 82, 40);
INSERT INTO `scores` VALUES (1763, 15, 51, '英语', 42, 40);
INSERT INTO `scores` VALUES (1764, 15, 51, '物理', 68, 40);
INSERT INTO `scores` VALUES (1765, 15, 51, '电工电子技术应用', 68, 40);
INSERT INTO `scores` VALUES (1766, 15, 51, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (1767, 15, 51, '历史', 85, 40);
INSERT INTO `scores` VALUES (1768, 15, 51, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (1769, 15, 52, '语文', 79, 40);
INSERT INTO `scores` VALUES (1770, 15, 52, '数学', 60, 40);
INSERT INTO `scores` VALUES (1771, 15, 52, '英语', 60, 40);
INSERT INTO `scores` VALUES (1772, 15, 52, '物理', 96, 40);
INSERT INTO `scores` VALUES (1773, 15, 52, '电工电子技术应用', 73, 40);
INSERT INTO `scores` VALUES (1774, 15, 52, '思想政治（心理健康与职业生涯）', 89, 40);
INSERT INTO `scores` VALUES (1775, 15, 52, '历史', 82.5, 40);
INSERT INTO `scores` VALUES (1776, 15, 52, '计算机网络基础', 43, 40);
INSERT INTO `scores` VALUES (1777, 15, 53, '语文', 74, 40);
INSERT INTO `scores` VALUES (1778, 15, 53, '数学', 35, 40);
INSERT INTO `scores` VALUES (1779, 15, 53, '英语', 69, 40);
INSERT INTO `scores` VALUES (1780, 15, 53, '物理', 75, 40);
INSERT INTO `scores` VALUES (1781, 15, 53, '电工电子技术应用', 51, 40);
INSERT INTO `scores` VALUES (1782, 15, 53, '思想政治（心理健康与职业生涯）', 88, 40);
INSERT INTO `scores` VALUES (1783, 15, 53, '历史', 85, 40);
INSERT INTO `scores` VALUES (1784, 15, 53, '计算机网络基础', 49, 40);
INSERT INTO `scores` VALUES (1785, 15, 54, '语文', 79, 40);
INSERT INTO `scores` VALUES (1786, 15, 54, '数学', 17, 40);
INSERT INTO `scores` VALUES (1787, 15, 54, '英语', 73, 40);
INSERT INTO `scores` VALUES (1788, 15, 54, '物理', 74, 40);
INSERT INTO `scores` VALUES (1789, 15, 54, '电工电子技术应用', 64, 40);
INSERT INTO `scores` VALUES (1790, 15, 54, '思想政治（心理健康与职业生涯）', 81, 40);
INSERT INTO `scores` VALUES (1791, 15, 54, '历史', 90, 40);
INSERT INTO `scores` VALUES (1792, 15, 54, '计算机网络基础', 65, 40);
INSERT INTO `scores` VALUES (1793, 15, 55, '语文', 57, 40);
INSERT INTO `scores` VALUES (1794, 15, 55, '数学', 69, 40);
INSERT INTO `scores` VALUES (1795, 15, 55, '英语', 50, 40);
INSERT INTO `scores` VALUES (1796, 15, 55, '物理', 60, 40);
INSERT INTO `scores` VALUES (1797, 15, 55, '电工电子技术应用', 83, 40);
INSERT INTO `scores` VALUES (1798, 15, 55, '思想政治（心理健康与职业生涯）', 84, 40);
INSERT INTO `scores` VALUES (1799, 15, 55, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (1800, 15, 55, '计算机网络基础', 46, 40);
INSERT INTO `scores` VALUES (1801, 15, 56, '语文', 72, 40);
INSERT INTO `scores` VALUES (1802, 15, 56, '数学', 35, 40);
INSERT INTO `scores` VALUES (1803, 15, 56, '英语', 54, 40);
INSERT INTO `scores` VALUES (1804, 15, 56, '物理', 80, 40);
INSERT INTO `scores` VALUES (1805, 15, 56, '电工电子技术应用', 80, 40);
INSERT INTO `scores` VALUES (1806, 15, 56, '思想政治（心理健康与职业生涯）', 72, 40);
INSERT INTO `scores` VALUES (1807, 15, 56, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (1808, 15, 56, '计算机网络基础', 44, 40);
INSERT INTO `scores` VALUES (1809, 15, 57, '语文', 0, 40);
INSERT INTO `scores` VALUES (1810, 15, 57, '数学', 0, 40);
INSERT INTO `scores` VALUES (1811, 15, 57, '英语', 0, 40);
INSERT INTO `scores` VALUES (1812, 15, 57, '物理', 56, 40);
INSERT INTO `scores` VALUES (1813, 15, 57, '电工电子技术应用', 85, 40);
INSERT INTO `scores` VALUES (1814, 15, 57, '思想政治（心理健康与职业生涯）', 77, 40);
INSERT INTO `scores` VALUES (1815, 15, 57, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (1816, 15, 57, '计算机网络基础', 63, 40);
INSERT INTO `scores` VALUES (1817, 15, 58, '语文', 78, 40);
INSERT INTO `scores` VALUES (1818, 15, 58, '数学', 70, 40);
INSERT INTO `scores` VALUES (1819, 15, 58, '英语', 80, 40);
INSERT INTO `scores` VALUES (1820, 15, 58, '物理', 86, 40);
INSERT INTO `scores` VALUES (1821, 15, 58, '电工电子技术应用', 87, 40);
INSERT INTO `scores` VALUES (1822, 15, 58, '思想政治（心理健康与职业生涯）', 81, 40);
INSERT INTO `scores` VALUES (1823, 15, 58, '历史', 87.5, 40);
INSERT INTO `scores` VALUES (1824, 15, 58, '计算机网络基础', 60, 40);
INSERT INTO `scores` VALUES (1825, 15, 59, '语文', 53, 40);
INSERT INTO `scores` VALUES (1826, 15, 59, '数学', 36, 40);
INSERT INTO `scores` VALUES (1827, 15, 59, '英语', 37, 40);
INSERT INTO `scores` VALUES (1828, 15, 59, '物理', 57, 40);
INSERT INTO `scores` VALUES (1829, 15, 59, '电工电子技术应用', 53, 40);
INSERT INTO `scores` VALUES (1830, 15, 59, '思想政治（心理健康与职业生涯）', 75, 40);
INSERT INTO `scores` VALUES (1831, 15, 59, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (1832, 15, 59, '计算机网络基础', 26, 40);
INSERT INTO `scores` VALUES (1833, 15, 60, '语文', 55, 40);
INSERT INTO `scores` VALUES (1834, 15, 60, '数学', 88, 40);
INSERT INTO `scores` VALUES (1835, 15, 60, '英语', 24, 40);
INSERT INTO `scores` VALUES (1836, 15, 60, '物理', 52, 40);
INSERT INTO `scores` VALUES (1837, 15, 60, '电工电子技术应用', 74, 40);
INSERT INTO `scores` VALUES (1838, 15, 60, '思想政治（心理健康与职业生涯）', 72, 40);
INSERT INTO `scores` VALUES (1839, 15, 60, '历史', 87.5, 40);
INSERT INTO `scores` VALUES (1840, 15, 60, '计算机网络基础', 44, 40);
INSERT INTO `scores` VALUES (1841, 15, 61, '语文', 74, 40);
INSERT INTO `scores` VALUES (1842, 15, 61, '数学', 43, 40);
INSERT INTO `scores` VALUES (1843, 15, 61, '英语', 45, 40);
INSERT INTO `scores` VALUES (1844, 15, 61, '物理', 48, 40);
INSERT INTO `scores` VALUES (1845, 15, 61, '电工电子技术应用', 78, 40);
INSERT INTO `scores` VALUES (1846, 15, 61, '思想政治（心理健康与职业生涯）', 68, 40);
INSERT INTO `scores` VALUES (1847, 15, 61, '历史', 80, 40);
INSERT INTO `scores` VALUES (1848, 15, 61, '计算机网络基础', 67, 40);
INSERT INTO `scores` VALUES (1849, 15, 62, '语文', 63, 40);
INSERT INTO `scores` VALUES (1850, 15, 62, '数学', 35, 40);
INSERT INTO `scores` VALUES (1851, 15, 62, '英语', 47, 40);
INSERT INTO `scores` VALUES (1852, 15, 62, '物理', 30, 40);
INSERT INTO `scores` VALUES (1853, 15, 62, '电工电子技术应用', 60, 40);
INSERT INTO `scores` VALUES (1854, 15, 62, '思想政治（心理健康与职业生涯）', 78, 40);
INSERT INTO `scores` VALUES (1855, 15, 62, '历史', 55, 40);
INSERT INTO `scores` VALUES (1856, 15, 62, '计算机网络基础', 49, 40);
INSERT INTO `scores` VALUES (1857, 15, 63, '语文', 76, 40);
INSERT INTO `scores` VALUES (1858, 15, 63, '数学', 76, 40);
INSERT INTO `scores` VALUES (1859, 15, 63, '英语', 64, 40);
INSERT INTO `scores` VALUES (1860, 15, 63, '物理', 77, 40);
INSERT INTO `scores` VALUES (1861, 15, 63, '电工电子技术应用', 69, 40);
INSERT INTO `scores` VALUES (1862, 15, 63, '思想政治（心理健康与职业生涯）', 85, 40);
INSERT INTO `scores` VALUES (1863, 15, 63, '历史', 77.5, 40);
INSERT INTO `scores` VALUES (1864, 15, 63, '计算机网络基础', 38, 40);
INSERT INTO `scores` VALUES (1865, 15, 64, '语文', 89, 40);
INSERT INTO `scores` VALUES (1866, 15, 64, '数学', 80, 40);
INSERT INTO `scores` VALUES (1867, 15, 64, '英语', 77, 40);
INSERT INTO `scores` VALUES (1868, 15, 64, '物理', 86, 40);
INSERT INTO `scores` VALUES (1869, 15, 64, '电工电子技术应用', 82, 40);
INSERT INTO `scores` VALUES (1870, 15, 64, '思想政治（心理健康与职业生涯）', 91, 40);
INSERT INTO `scores` VALUES (1871, 15, 64, '历史', 85, 40);
INSERT INTO `scores` VALUES (1872, 15, 64, '计算机网络基础', 70, 40);
INSERT INTO `scores` VALUES (1873, 15, 65, '语文', 67, 40);
INSERT INTO `scores` VALUES (1874, 15, 65, '数学', 11, 40);
INSERT INTO `scores` VALUES (1875, 15, 65, '英语', 22, 40);
INSERT INTO `scores` VALUES (1876, 15, 65, '物理', 68, 40);
INSERT INTO `scores` VALUES (1877, 15, 65, '电工电子技术应用', 56, 40);
INSERT INTO `scores` VALUES (1878, 15, 65, '思想政治（心理健康与职业生涯）', 76, 40);
INSERT INTO `scores` VALUES (1879, 15, 65, '历史', 60, 40);
INSERT INTO `scores` VALUES (1880, 15, 65, '计算机网络基础', 30, 40);
INSERT INTO `scores` VALUES (1881, 15, 66, '语文', 74, 40);
INSERT INTO `scores` VALUES (1882, 15, 66, '数学', 60, 40);
INSERT INTO `scores` VALUES (1883, 15, 66, '英语', 50, 40);
INSERT INTO `scores` VALUES (1884, 15, 66, '物理', 81, 40);
INSERT INTO `scores` VALUES (1885, 15, 66, '电工电子技术应用', 93, 40);
INSERT INTO `scores` VALUES (1886, 15, 66, '思想政治（心理健康与职业生涯）', 81, 40);
INSERT INTO `scores` VALUES (1887, 15, 66, '历史', 87.5, 40);
INSERT INTO `scores` VALUES (1888, 15, 66, '计算机网络基础', 40, 40);
INSERT INTO `scores` VALUES (1889, 15, 67, '语文', 69, 40);
INSERT INTO `scores` VALUES (1890, 15, 67, '数学', 28, 40);
INSERT INTO `scores` VALUES (1891, 15, 67, '英语', 44, 40);
INSERT INTO `scores` VALUES (1892, 15, 67, '物理', 50, 40);
INSERT INTO `scores` VALUES (1893, 15, 67, '电工电子技术应用', 81, 40);
INSERT INTO `scores` VALUES (1894, 15, 67, '思想政治（心理健康与职业生涯）', 82, 40);
INSERT INTO `scores` VALUES (1895, 15, 67, '历史', 65, 40);
INSERT INTO `scores` VALUES (1896, 15, 67, '计算机网络基础', 43, 40);
INSERT INTO `scores` VALUES (1897, 15, 68, '语文', 83, 40);
INSERT INTO `scores` VALUES (1898, 15, 68, '数学', 67, 40);
INSERT INTO `scores` VALUES (1899, 15, 68, '英语', 73, 40);
INSERT INTO `scores` VALUES (1900, 15, 68, '物理', 74, 40);
INSERT INTO `scores` VALUES (1901, 15, 68, '电工电子技术应用', 79, 40);
INSERT INTO `scores` VALUES (1902, 15, 68, '思想政治（心理健康与职业生涯）', 90, 40);
INSERT INTO `scores` VALUES (1903, 15, 68, '历史', 85, 40);
INSERT INTO `scores` VALUES (1904, 15, 68, '计算机网络基础', 60, 40);
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
) ENGINE=InnoDB AUTO_INCREMENT=242 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `students` WRITE;
INSERT INTO `students` VALUES (35, '2502290801', '陈蓝平', 2, 40);
INSERT INTO `students` VALUES (36, '2502290802', '程佳妮', 2, 40);
INSERT INTO `students` VALUES (37, '2502290803', '董雨含', 2, 40);
INSERT INTO `students` VALUES (38, '2502290804', '董子诺', 2, 40);
INSERT INTO `students` VALUES (39, '2502290805', '冯欣怡', 2, 40);
INSERT INTO `students` VALUES (40, '2502290806', '龚歆茹', 2, 40);
INSERT INTO `students` VALUES (41, '2502290807', '管欣怡', 2, 40);
INSERT INTO `students` VALUES (42, '2502290808', '郭润蕾', 2, 40);
INSERT INTO `students` VALUES (43, '2502290809', '胡佳晨', 2, 40);
INSERT INTO `students` VALUES (44, '2502290810', '李欣悦', 2, 40);
INSERT INTO `students` VALUES (45, '2502290811', '施杨', 2, 40);
INSERT INTO `students` VALUES (46, '2502290812', '施元菲', 2, 40);
INSERT INTO `students` VALUES (47, '2502290813', '王林倩', 2, 40);
INSERT INTO `students` VALUES (48, '2502290814', '王婉馨', 2, 40);
INSERT INTO `students` VALUES (49, '2502290815', '吴晨雨', 2, 40);
INSERT INTO `students` VALUES (50, '2502290816', '徐梓淇', 2, 40);
INSERT INTO `students` VALUES (51, '2502290817', '袁欣怡', 2, 40);
INSERT INTO `students` VALUES (52, '2502290818', '张栩卓', 2, 40);
INSERT INTO `students` VALUES (53, '2502290819', '朱欣怡', 2, 40);
INSERT INTO `students` VALUES (54, '2502290820', '庄珺彦', 2, 40);
INSERT INTO `students` VALUES (55, '2502290821', '曹一涵', 2, 40);
INSERT INTO `students` VALUES (56, '2502290822', '陈晓博', 2, 40);
INSERT INTO `students` VALUES (57, '2502290823', '郭梓涵', 2, 40);
INSERT INTO `students` VALUES (58, '2502290824', '胡峻豪', 2, 40);
INSERT INTO `students` VALUES (59, '2502290825', '胡宗阳', 2, 40);
INSERT INTO `students` VALUES (60, '2502290826', '黄逸晟', 2, 40);
INSERT INTO `students` VALUES (61, '2502290827', '黄喆昊', 2, 40);
INSERT INTO `students` VALUES (62, '2502290828', '汤孝庭', 2, 40);
INSERT INTO `students` VALUES (63, '2502290829', '王小双', 2, 40);
INSERT INTO `students` VALUES (64, '2502290830', '王子淼', 2, 40);
INSERT INTO `students` VALUES (65, '2502290831', '袁梓杰', 2, 40);
INSERT INTO `students` VALUES (66, '2502290832', '张志浩', 2, 40);
INSERT INTO `students` VALUES (67, '2502290833', '赵佳俊', 2, 40);
INSERT INTO `students` VALUES (68, '2502290834', '郑烨轩', 2, 40);
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
  `plain_password` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(20) DEFAULT 'teacher',
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1, 'admin', '$2a$10$YCJKyI6NSa69/Uz7j/nddekNbg/pAhgObUj0OqJLDOGFjojN.agV2', 'admin123', '管理员', 'admin');
INSERT INTO `users` VALUES (6, '2502290801', '$2a$10$0awYkwtxBt2O9g/CtmcWR.HT9kqifUFK6Lu7xxQ.ABa0L6UBIUvVu', '123456', '陈蓝平', 'student');
INSERT INTO `users` VALUES (7, '2502290802', '$2a$10$srJM1/CTAc9ZTe01ogm8i.ICep4wPHxF9aTtcUjYjf6XDiV.U9uUe', '123456', '程佳妮', 'student');
INSERT INTO `users` VALUES (8, '2502290803', '$2a$10$JFeiSWec/7GE1akbe.kfU.9YOQWIzbfh0AZCPpsHdp/OhlyA/mVH.', '123456', '董雨含', 'student');
INSERT INTO `users` VALUES (9, '2502290804', '$2a$10$ZhcFWaSYTGKjGPpvSYmflOT4DBJNWrou6mdjPmHV0CrYTir.HfrlC', '123456', '董子诺', 'student');
INSERT INTO `users` VALUES (10, '2502290805', '$2a$10$dh76zf9mzqd0QRjzNqGBuuX.XP3lFkTpiHJsVH1E6JnJfEvK0qwLi', '123456', '冯欣怡', 'student');
INSERT INTO `users` VALUES (11, '2502290806', '$2a$10$8uHH64IMBQy9wrsTAm/NPugrpKy6.NHvDK9jJgLvYMc3cZTfGHEpW', '123456', '龚歆茹', 'student');
INSERT INTO `users` VALUES (12, '2502290807', '$2a$10$NMLzi3i4Ra1zL1qHxik4zeGRXGMHGM/wZsfBmAiZlz8zO1iGGW1my', '123456', '管欣怡', 'student');
INSERT INTO `users` VALUES (13, '2502290808', '$2a$10$IiYxBEccjesGI6B78HeuXeABTNzNeEV5.Ob1rhUXWYLLsqzI1EyFi', '123456', '郭润蕾', 'student');
INSERT INTO `users` VALUES (14, '2502290809', '$2a$10$imstZbPs.lwrJ1ks5Mgj9eoVq.XILD8F71fF7Gb4bRNduNvmoZfja', '123456', '胡佳晨', 'student');
INSERT INTO `users` VALUES (15, '2502290810', '$2a$10$7uniJjpl.bXKR4Gb4k.15u3KV67nvC5sAI16X4t6aMlH/KE9.lypK', '123456', '李欣悦', 'student');
INSERT INTO `users` VALUES (16, '2502290811', '$2a$10$fkCHLcFv5UfHUDBJpMTC9e0s0MDSWvxpBHM/FwrQEe9SsWVlHxSQC', '123456', '施杨', 'student');
INSERT INTO `users` VALUES (17, '2502290812', '$2a$10$.JI4sdrgjO6JQ1w8k1sII.uDZ2i/ESK9dvHb1n6rlk746kq/8Vt7C', '123456', '施元菲', 'student');
INSERT INTO `users` VALUES (18, '2502290813', '$2a$10$vKKcj5HwxXl7nIV9LhOSEuo1ec6aSMjWEw/3zFMpHmNFhO9dqfl2e', '123456', '王林倩', 'student');
INSERT INTO `users` VALUES (19, '2502290814', '$2a$10$wgS8MfSHLNAaMgh.sntTouqXr/M7pg7MoyyV9ibWYVYS3x0uJJGye', '123456', '王婉馨', 'student');
INSERT INTO `users` VALUES (20, '2502290815', '$2a$10$xez3gTOcYeoNrg9tKKIxO.IC6R6KIggkmg0MNQkmZk4i4Bc2V/guS', '123456', '吴晨雨', 'student');
INSERT INTO `users` VALUES (21, '2502290816', '$2a$10$TYOnU1Y.5FdT/KW1RPr.uOzVPtn2XkOTAmJJtu2jDvoy.HkzF1FBy', '123456', '徐梓淇', 'student');
INSERT INTO `users` VALUES (22, '2502290817', '$2a$10$uigYUvwLPMgu5T9uZHht0OKB74TACa2eoPjMHUEBKdpP3P/stekvS', '123456', '袁欣怡', 'student');
INSERT INTO `users` VALUES (23, '2502290818', '$2a$10$GxTczWhk6o5y0DQd0qfpLOUF.ADvayur7MPdOsBAIrKViu7a7zMp2', '123456', '张栩卓', 'student');
INSERT INTO `users` VALUES (24, '2502290819', '$2a$10$jc0ZaqIm.RPc624MF9Oo8uPw/FU581DgzbC/Kmbt4KBKO1LhcBo4W', '123456', '朱欣怡', 'student');
INSERT INTO `users` VALUES (25, '2502290820', '$2a$10$9jhTiS1rrsCb9MJaXkHwsOj5W9D1Yaqivty33hrnxd8uSXvbs/rRq', '123456', '庄珺彦', 'student');
INSERT INTO `users` VALUES (26, '2502290821', '$2a$10$IOd.RBuEIYOUH/lKXVa/fO2RkP//QiRztPRRKiMPiGhSy46PV7k9i', '123456', '曹一涵', 'student');
INSERT INTO `users` VALUES (27, '2502290822', '$2a$10$T8QafpjDmrx2fbC2Oe0MDeQTMOmUNKCoym9UZ4UVZ0WavwoKQ.f3q', '123456', '陈晓博', 'student');
INSERT INTO `users` VALUES (28, '2502290823', '$2a$10$rf35pyZRl7KWxPddvEnk.eLS5fEQWYZtlxxuIenMK.H/.wy8ScgrC', '123456', '郭梓涵', 'student');
INSERT INTO `users` VALUES (29, '2502290824', '$2a$10$0mGXExiFyX8th2fk2XgpAecwQVpNwexEM1L0u73F9PiYzXgTClkfO', '123456', '胡峻豪', 'student');
INSERT INTO `users` VALUES (30, '2502290825', '$2a$10$95m8Ac2M/yRbkAkkATHrne9k2/rqJ4TR.9DgP5yFyGPVzXXsVVbRm', '123456', '胡宗阳', 'student');
INSERT INTO `users` VALUES (31, '2502290826', '$2a$10$eQN/dDsCRG0u5sKta1AZtO1INi0owDYUQwMfg4bdjH0JvQTYEGT36', '123456', '黄逸晟', 'student');
INSERT INTO `users` VALUES (32, '2502290827', '$2a$10$Nf4.xhIHxdm/FIFx.X7nx.rB3HzQ5S3hjkC.me.GsNt7e.1X.QV4K', '123456', '黄喆昊', 'student');
INSERT INTO `users` VALUES (33, '2502290828', '$2a$10$2oRrwUaA/dBKIKgHqZwB4.KzrnXosUI.gMOSM1m.gjp0NlEvjx9qy', '123456', '汤孝庭', 'student');
INSERT INTO `users` VALUES (34, '2502290829', '$2a$10$3HOgnHDQOp/elRuw/jhU6O7d8YS0PEjT/LysSGLdi3NYfgcGqWFCC', '123456', '王小双', 'student');
INSERT INTO `users` VALUES (35, '2502290830', '$2a$10$KHBaE2vQ.PoNF68X.mxZRuH1oLjNaQTyQKurbHEhE4xW7.jkERM1e', '123456', '王子淼', 'student');
INSERT INTO `users` VALUES (36, '2502290831', '$2a$10$ru2cCVIhivNMdy0SZY/IXOAALO5fHoDTeviZXoemRo8Y920H1dIIa', '123456', '袁梓杰', 'student');
INSERT INTO `users` VALUES (37, '2502290832', '$2a$10$UUKex8V.WYsE4NPYN2.hde7QdkMvlESkr4ay4v5xDENY9wc4.mkru', '123456', '张志浩', 'student');
INSERT INTO `users` VALUES (38, '2502290833', '$2a$10$M9waK8O3zn7XtIuBm9DgWOa5kXRAKZqaN4PF.6cKy/avFtd.k1dYe', '123456', '赵佳俊', 'student');
INSERT INTO `users` VALUES (39, '2502290834', '$2a$10$zJX5ZLU.eXhfb5R/ubjp2uuMd4Ao6DptDFH7B2PBIYOuYiRKDra86', '123456', '郑烨轩', 'student');
INSERT INTO `users` VALUES (40, '0187', '$2a$10$KceX1H7crqZ2LUz.FW8Fde2aSwiKBkWFriWFo.tM8uN2mMxv.omo6', '123456', '柯宇', 'teacher');
INSERT INTO `users` VALUES (41, '1111', '$2a$10$0MsMm08JUa9ggqzr8CXwDeb.4IDOIzj6UOsELx4pOdU.06U./lclm', '123456', '1111', 'teacher');
INSERT INTO `users` VALUES (42, '25008', '$2a$10$LDNSmuGowDRM.xnnhZM0dOgbL9AWz0cyEusETERpByKxFubHUeBXC', '123456', '25008', 'class');
INSERT INTO `users` VALUES (43, '1234', '$2a$10$2yMcwLmpWq/pxIeOUBO6mOSImOafoAU0BfyVz.ECbhr9fuTJ0fwqG', '123456', '123456', 'teacher');
INSERT INTO `users` VALUES (44, '2302180314', '$2a$10$d619jbuk2dyjBe.ce8KSHuXsHU/.W7nlbid5qjOuX80blU.Lv3pce', '123456', '陈建泽', 'student');
UNLOCK TABLES;

COMMIT;
