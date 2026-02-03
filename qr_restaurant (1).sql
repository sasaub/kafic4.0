-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 03, 2026 at 03:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qr_restaurant`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('Hrana','Piće') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `type`, `created_at`) VALUES
(1, 'Glavna jela', 'Hrana', '2025-12-11 09:50:49'),
(2, 'Salate', 'Hrana', '2025-12-11 09:50:49'),
(3, 'Deserti', 'Hrana', '2025-12-11 09:50:49'),
(4, 'Sokovi', 'Piće', '2025-12-11 09:50:49'),
(5, 'Kafe', 'Piće', '2025-12-11 09:50:49'),
(6, 'Alkohol', 'Piće', '2025-12-11 09:50:49');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `name`, `description`, `price`, `category_id`, `created_at`, `updated_at`) VALUES
(1, 'Ćevapi', '10 ćevapa sa pomfritom', 1250.00, 1, '2025-12-11 11:14:29', '2025-12-11 11:14:29'),
(4, 'Espresso', NULL, 170.00, 5, '2025-12-11 12:38:52', '2025-12-11 12:38:52');

-- --------------------------------------------------------

--
-- Table structure for table `monthly_payments`
--

CREATE TABLE `monthly_payments` (
  `id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('Novo','Potvrđeno','U pripremi','Spremno','Dostavljeno') DEFAULT 'Novo',
  `time` time NOT NULL,
  `date` date NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'low',
  `destination` enum('kitchen','waiter') DEFAULT 'waiter',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `waiter_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `table_name`, `total`, `status`, `time`, `date`, `priority`, `destination`, `created_at`, `updated_at`, `waiter_id`) VALUES
(19, 'Sto 5', 1420.00, 'Potvrđeno', '13:39:00', '2025-12-11', 'medium', 'waiter', '2025-12-11 12:39:12', '2025-12-11 12:39:28', NULL),
(20, 'Sto 5', 1250.00, 'Spremno', '13:39:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 12:39:28', '2025-12-11 12:40:03', NULL),
(22, 'Sto 1', 1420.00, 'Potvrđeno', '13:55:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 12:55:58', '2025-12-11 13:06:13', NULL),
(23, 'Sto 1', 1420.00, 'Potvrđeno', '13:55:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 12:55:59', '2025-12-11 13:06:12', NULL),
(24, 'Sto 1', 1420.00, 'Potvrđeno', '13:56:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 12:56:00', '2025-12-11 13:06:09', NULL),
(25, 'Sto 1', 1420.00, 'Potvrđeno', '13:56:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 12:56:01', '2025-12-11 13:06:06', NULL),
(26, 'Sto 1', 1420.00, 'Potvrđeno', '13:56:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 12:56:02', '2025-12-11 12:56:13', NULL),
(27, 'Sto 1', 1420.00, 'Potvrđeno', '13:56:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 12:56:02', '2025-12-11 12:56:18', NULL),
(28, 'Sto 5', 1420.00, 'Potvrđeno', '14:06:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 13:06:38', '2025-12-11 13:06:53', NULL),
(29, 'Sto 5', 1420.00, 'Potvrđeno', '14:17:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 13:17:55', '2025-12-11 13:18:13', NULL),
(30, 'Sto 1', 1420.00, 'Potvrđeno', '14:18:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 13:18:53', '2025-12-11 13:18:56', NULL),
(31, 'Sto 1', 1420.00, 'Spremno', '14:27:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 13:27:57', '2025-12-11 13:31:21', NULL),
(38, 'Sto 1', 1420.00, 'Potvrđeno', '14:51:00', '2025-12-11', 'medium', 'waiter', '2025-12-11 13:51:12', '2025-12-11 13:51:12', NULL),
(39, 'Sto 1', 1420.00, 'Potvrđeno', '14:51:00', '2025-12-11', 'medium', 'waiter', '2025-12-11 13:51:15', '2025-12-11 13:51:15', NULL),
(42, 'Sto 1', 1250.00, 'Novo', '16:03:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 15:03:38', '2026-02-02 17:53:31', NULL),
(43, 'Sto 1', 1420.00, 'Novo', '16:03:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 15:03:58', '2026-02-02 17:26:06', NULL),
(44, 'Sto 1', 1420.00, 'Novo', '16:04:00', '2025-12-11', 'medium', 'kitchen', '2025-12-11 15:04:00', '2026-02-02 17:26:02', NULL),
(45, 'Sto 1', 170.00, 'Potvrđeno', '16:04:00', '2025-12-11', 'low', 'waiter', '2025-12-11 15:04:06', '2026-02-02 17:26:03', NULL),
(46, 'Sto 1', 1420.00, 'Potvrđeno', '18:26:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 17:26:02', '2026-02-02 17:26:02', NULL),
(47, 'Sto 1', 1420.00, 'Potvrđeno', '18:26:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 17:26:06', '2026-02-02 17:26:06', NULL),
(48, 'Sto 1', 1420.00, 'Potvrđeno', '18:26:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 17:26:06', '2026-02-02 17:26:06', NULL),
(49, 'Sto 1', 1420.00, 'Potvrđeno', '18:26:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 17:26:08', '2026-02-02 17:26:08', NULL),
(50, 'Sto 1', 1250.00, 'Novo', '19:02:00', '2026-02-02', 'medium', 'kitchen', '2026-02-02 18:02:46', '2026-02-02 22:42:22', 5),
(51, 'Sto 1', 1250.00, 'Novo', '19:02:00', '2026-02-02', 'medium', 'kitchen', '2026-02-02 18:02:47', '2026-02-02 22:42:24', 5),
(52, 'Sto 1', 1250.00, 'Novo', '19:02:00', '2026-02-02', 'medium', 'kitchen', '2026-02-02 18:02:49', '2026-02-02 22:42:19', 5),
(53, 'Sto 1', 1250.00, 'Novo', '19:02:00', '2026-02-02', 'medium', 'kitchen', '2026-02-02 18:02:52', '2026-02-02 18:02:58', 5),
(54, 'Sto 1', 1250.00, 'Potvrđeno', '19:02:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 18:02:58', '2026-02-02 18:02:58', 5),
(55, 'Sto 1', 1250.00, 'Potvrđeno', '19:03:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 18:03:01', '2026-02-02 18:03:01', 5),
(56, 'Sto 1', 1250.00, 'Potvrđeno', '23:42:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 22:42:19', '2026-02-02 22:42:19', 2),
(57, 'Sto 1', 1250.00, 'Potvrđeno', '23:42:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 22:42:22', '2026-02-02 22:42:22', 2),
(58, 'Sto 1', 1250.00, 'Potvrđeno', '23:42:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 22:42:24', '2026-02-02 22:42:24', 2),
(59, 'Sto 5', 1250.00, 'Novo', '23:44:00', '2026-02-02', 'medium', 'kitchen', '2026-02-02 22:44:31', '2026-02-02 23:00:29', 2),
(60, 'Sto 5', 1250.00, 'Novo', '23:44:00', '2026-02-02', 'medium', 'kitchen', '2026-02-02 22:44:43', '2026-02-02 22:57:05', 2),
(61, 'Sto 5', 1250.00, 'Potvrđeno', '23:57:00', '2026-02-02', 'medium', 'waiter', '2026-02-02 22:57:05', '2026-02-02 22:57:05', 3),
(62, 'Sto 5', 1250.00, 'Potvrđeno', '00:00:00', '2026-02-03', 'medium', 'waiter', '2026-02-02 23:00:29', '2026-02-02 23:00:29', 5),
(63, 'Sto 1', 1250.00, 'Novo', '00:02:00', '2026-02-03', 'medium', 'kitchen', '2026-02-02 23:02:42', '2026-02-02 23:02:46', 5),
(64, 'Sto 1', 1250.00, 'Potvrđeno', '00:02:00', '2026-02-03', 'medium', 'waiter', '2026-02-02 23:02:46', '2026-02-02 23:02:46', 5),
(65, 'Sto 1', 1250.00, 'Novo', '00:04:00', '2026-02-03', 'medium', 'kitchen', '2026-02-02 23:04:51', '2026-02-02 23:04:58', 5),
(66, 'Sto 1', 1250.00, 'Novo', '00:04:00', '2026-02-03', 'medium', 'kitchen', '2026-02-02 23:04:55', '2026-02-02 23:06:58', 5),
(67, 'Sto 1', 1250.00, 'Potvrđeno', '00:04:00', '2026-02-03', 'medium', 'waiter', '2026-02-02 23:04:58', '2026-02-02 23:04:58', 5),
(68, 'Sto 1', 1250.00, 'Potvrđeno', '00:06:00', '2026-02-03', 'medium', 'waiter', '2026-02-02 23:06:58', '2026-02-02 23:06:58', 5),
(69, 'Sto 1', 1250.00, 'Novo', '00:08:00', '2026-02-03', 'medium', 'kitchen', '2026-02-02 23:08:23', '2026-02-02 23:15:50', 5),
(70, 'Sto 1', 1250.00, 'Potvrđeno', '00:15:00', '2026-02-03', 'medium', 'waiter', '2026-02-02 23:15:50', '2026-02-02 23:15:50', 5),
(71, 'Sto 1', 1420.00, 'Novo', '00:19:00', '2026-02-03', 'medium', 'kitchen', '2026-02-02 23:19:56', '2026-02-02 23:19:59', 5),
(72, 'Sto 1', 1420.00, 'Potvrđeno', '00:19:00', '2026-02-03', 'medium', 'waiter', '2026-02-02 23:19:59', '2026-02-02 23:19:59', 5),
(73, 'Sto 5', 1250.00, 'Novo', '08:36:00', '2026-02-03', 'medium', 'kitchen', '2026-02-03 07:36:50', '2026-02-03 07:37:02', 2),
(74, 'Sto 5', 1250.00, 'Potvrđeno', '08:37:00', '2026-02-03', 'medium', 'waiter', '2026-02-03 07:37:02', '2026-02-03 07:37:02', 2),
(75, 'Sto 1', 1250.00, 'Novo', '13:24:00', '2026-02-03', 'medium', 'kitchen', '2026-02-03 12:24:44', '2026-02-03 12:24:47', 5),
(76, 'Sto 1', 1250.00, 'Potvrđeno', '13:24:00', '2026-02-03', 'medium', 'waiter', '2026-02-03 12:24:47', '2026-02-03 12:24:47', 5);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `name`, `quantity`, `price`, `category`, `comment`, `created_at`) VALUES
(19, 19, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:39:12'),
(20, 19, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 12:39:12'),
(21, 20, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:39:28'),
(23, 22, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:55:58'),
(24, 22, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 12:55:58'),
(25, 23, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:55:59'),
(26, 23, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 12:55:59'),
(27, 24, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:56:00'),
(28, 24, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 12:56:01'),
(29, 25, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:56:01'),
(30, 25, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 12:56:01'),
(31, 26, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:56:02'),
(32, 26, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 12:56:02'),
(33, 27, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 12:56:02'),
(34, 27, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 12:56:02'),
(35, 28, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 13:06:38'),
(36, 28, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 13:06:38'),
(37, 29, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 13:17:55'),
(38, 29, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 13:17:55'),
(39, 30, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 13:18:53'),
(40, 30, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 13:18:53'),
(41, 31, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 13:27:57'),
(42, 31, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 13:27:57'),
(55, 38, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 13:51:12'),
(56, 38, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 13:51:12'),
(57, 39, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 13:51:15'),
(58, 39, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 13:51:15'),
(63, 42, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 15:03:38'),
(64, 43, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 15:03:58'),
(65, 43, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 15:03:58'),
(66, 44, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 15:04:00'),
(67, 44, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2025-12-11 15:04:00'),
(68, 45, 'Espresso', 1, 170.00, 'Kafe', NULL, '2025-12-11 15:04:06'),
(69, 46, 'Espresso', 1, 170.00, 'Kafe', NULL, '2026-02-02 17:26:02'),
(70, 46, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 17:26:02'),
(71, 47, 'Espresso', 1, 170.00, 'Kafe', NULL, '2026-02-02 17:26:06'),
(72, 47, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 17:26:06'),
(73, 48, 'Espresso', 1, 170.00, 'Kafe', NULL, '2026-02-02 17:26:06'),
(74, 48, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 17:26:06'),
(75, 49, 'Espresso', 1, 170.00, 'Kafe', NULL, '2026-02-02 17:26:08'),
(76, 49, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 17:26:08'),
(77, 50, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 18:02:46'),
(78, 51, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 18:02:47'),
(79, 52, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 18:02:49'),
(80, 53, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 18:02:52'),
(81, 54, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 18:02:58'),
(82, 55, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 18:03:01'),
(83, 56, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 22:42:19'),
(84, 57, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 22:42:22'),
(85, 58, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 22:42:24'),
(86, 59, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 22:44:31'),
(87, 60, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 22:44:43'),
(88, 61, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 22:57:05'),
(89, 62, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:00:29'),
(90, 63, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:02:42'),
(91, 64, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:02:46'),
(92, 65, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:04:51'),
(93, 66, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:04:55'),
(94, 67, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:04:58'),
(95, 68, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:06:58'),
(96, 69, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:08:23'),
(97, 70, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:15:50'),
(98, 71, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:19:56'),
(99, 71, 'Espresso', 1, 170.00, 'Kafe', NULL, '2026-02-02 23:19:56'),
(100, 72, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-02 23:19:59'),
(101, 72, 'Espresso', 1, 170.00, 'Kafe', NULL, '2026-02-02 23:19:59'),
(102, 73, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-03 07:36:50'),
(103, 74, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-03 07:37:02'),
(104, 75, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-03 12:24:44'),
(105, 76, 'Ćevapi', 1, 1250.00, 'Glavna jela', NULL, '2026-02-03 12:24:47');

-- --------------------------------------------------------

--
-- Table structure for table `printer_settings`
--

CREATE TABLE `printer_settings` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(255) NOT NULL DEFAULT '',
  `port` int(11) NOT NULL DEFAULT 9100,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `printer_settings`
--

INSERT INTO `printer_settings` (`id`, `ip_address`, `port`, `enabled`, `updated_at`) VALUES
(1, '192.168.200.1', 9100, 1, '2026-02-03 07:42:08');

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

CREATE TABLE `tables` (
  `id` int(11) NOT NULL,
  `number` varchar(50) NOT NULL,
  `capacity` int(11) NOT NULL,
  `status` enum('Slobodan','Zauzet','Rezervisan') DEFAULT 'Slobodan',
  `qr_code` varchar(100) NOT NULL,
  `monthly_payment` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `number`, `capacity`, `status`, `qr_code`, `monthly_payment`, `created_at`, `updated_at`) VALUES
(1, '1', 4, 'Slobodan', 'QR-001', 0, '2025-12-11 11:15:49', '2025-12-11 11:15:49'),
(2, '2', 6, 'Slobodan', 'QR-002', 0, '2026-02-03 12:38:19', '2026-02-03 12:38:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','waiter','waiter-admin','kitchen') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'admin123', 'admin', '2025-12-11 09:50:49'),
(2, 'konobar', 'konobar123', 'waiter', '2025-12-11 09:50:49'),
(3, 'konobaradmin', 'konobaradmin123', 'waiter-admin', '2025-12-11 09:50:49'),
(4, 'kuhinja', 'kuhinja123', 'kitchen', '2025-12-11 09:50:49'),
(5, 'damjan', 'damjan123', 'waiter-admin', '2026-02-02 17:52:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `monthly_payments`
--
ALTER TABLE `monthly_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `table_id` (`table_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_destination` (`destination`),
  ADD KEY `waiter_id` (`waiter_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `printer_settings`
--
ALTER TABLE `printer_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number` (`number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `monthly_payments`
--
ALTER TABLE `monthly_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `printer_settings`
--
ALTER TABLE `printer_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `monthly_payments`
--
ALTER TABLE `monthly_payments`
  ADD CONSTRAINT `monthly_payments_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`waiter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
