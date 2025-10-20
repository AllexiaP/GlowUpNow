-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 20, 2025 at 08:00 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `glowupnow`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(100) DEFAULT NULL,
  `entity_id` int(10) UNSIGNED DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `service_id` int(10) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('pending','confirmed','canceled','completed') NOT NULL DEFAULT 'pending',
  `notes` varchar(500) DEFAULT NULL,
  `reschedule_count` tinyint(4) NOT NULL DEFAULT 0,
  `cancel_count` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `service_id`, `date`, `start_time`, `end_time`, `status`, `notes`, `reschedule_count`, `cancel_count`, `created_at`) VALUES
(1, 2, 1, '2025-10-30', '09:00:00', '10:00:00', 'canceled', 'fsafa', 0, 0, '2025-10-20 00:01:05'),
(2, 1, 1, '2025-10-05', '09:00:00', '10:00:00', 'confirmed', 'afadfadfsdfewa', 0, 0, '2025-10-20 00:37:03'),
(3, 1, 1, '2025-10-29', '09:00:00', '10:00:00', 'confirmed', 'fasfs', 0, 0, '2025-10-20 01:33:25'),
(4, 1, 1, '2025-10-16', '09:00:00', '10:00:00', 'confirmed', 'sdadas', 0, 0, '2025-10-20 01:41:01'),
(5, 3, 20, '2025-10-10', '15:00:00', '15:30:00', 'pending', '', 0, 0, '2025-10-20 04:40:54'),
(6, 3, 3, '2025-10-20', '10:00:00', '10:50:00', 'canceled', '', 1, 1, '2025-10-20 06:09:56'),
(7, 3, 2, '2025-10-22', '13:00:00', '14:00:00', 'canceled', '', 0, 0, '2025-10-20 06:11:50'),
(8, 3, 3, '2025-10-21', '11:00:00', '11:50:00', 'pending', '', 0, 0, '2025-10-20 06:20:02'),
(9, 3, 6, '2025-10-31', '09:00:00', '10:15:00', 'confirmed', '', 0, 0, '2025-10-20 06:21:38'),
(10, 3, 4, '2025-11-05', '14:05:00', '15:05:00', 'pending', '', 0, 0, '2025-10-20 09:06:45');

-- --------------------------------------------------------

--
-- Table structure for table `booking_status_history`
--

CREATE TABLE `booking_status_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `booking_id` int(10) UNSIGNED NOT NULL,
  `old_status` enum('pending','confirmed','canceled','completed') DEFAULT NULL,
  `new_status` enum('pending','confirmed','canceled','completed') NOT NULL,
  `changed_by_user_id` int(10) UNSIGNED DEFAULT NULL,
  `changed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_status_history`
--

INSERT INTO `booking_status_history` (`id`, `booking_id`, `old_status`, `new_status`, `changed_by_user_id`, `changed_at`) VALUES
(1, 1, 'pending', 'confirmed', 2, '2025-10-20 00:36:20'),
(2, 2, 'pending', 'confirmed', 2, '2025-10-20 00:37:18'),
(3, 1, 'confirmed', 'canceled', 2, '2025-10-20 01:29:52'),
(4, 2, 'confirmed', 'pending', 2, '2025-10-20 01:31:48'),
(5, 2, 'pending', 'confirmed', 2, '2025-10-20 01:32:11'),
(6, 3, 'pending', 'confirmed', 2, '2025-10-20 01:33:53'),
(7, 4, 'pending', 'confirmed', 2, '2025-10-20 01:47:30'),
(8, 4, 'confirmed', 'confirmed', 2, '2025-10-20 01:47:30'),
(9, 4, 'confirmed', 'confirmed', 2, '2025-10-20 01:47:30'),
(10, 4, 'confirmed', 'confirmed', 2, '2025-10-20 01:47:31'),
(11, 4, 'confirmed', 'canceled', 2, '2025-10-20 01:47:31'),
(12, 4, 'canceled', 'canceled', 2, '2025-10-20 01:47:31'),
(13, 4, 'canceled', 'confirmed', 2, '2025-10-20 01:47:31'),
(14, 4, 'confirmed', 'canceled', 2, '2025-10-20 01:47:31'),
(15, 1, 'canceled', 'pending', 2, '2025-10-20 01:49:00'),
(16, 1, 'pending', 'confirmed', 2, '2025-10-20 01:52:51'),
(17, 1, 'confirmed', 'confirmed', 2, '2025-10-20 01:52:51'),
(18, 1, 'confirmed', 'confirmed', 2, '2025-10-20 01:52:51'),
(19, 1, 'confirmed', 'confirmed', 2, '2025-10-20 01:52:51'),
(20, 1, 'confirmed', 'confirmed', 2, '2025-10-20 01:52:52'),
(21, 1, 'confirmed', 'confirmed', 2, '2025-10-20 01:52:52'),
(22, 6, 'pending', 'canceled', 3, '2025-10-20 06:14:43'),
(23, 1, 'confirmed', 'confirmed', 2, '2025-10-20 07:01:14'),
(24, 1, 'confirmed', 'confirmed', 2, '2025-10-20 07:14:06'),
(25, 9, 'pending', 'confirmed', 2, '2025-10-20 07:14:06'),
(26, 9, 'confirmed', 'confirmed', 2, '2025-10-20 07:14:06'),
(27, 9, 'confirmed', 'confirmed', 2, '2025-10-20 07:14:06'),
(28, 9, 'confirmed', 'confirmed', 2, '2025-10-20 07:14:06'),
(29, 1, 'confirmed', 'confirmed', 2, '2025-10-20 07:14:25'),
(30, 1, 'confirmed', 'canceled', 2, '2025-10-20 07:14:25'),
(31, 7, 'pending', 'canceled', 2, '2025-10-20 07:25:58'),
(32, 4, 'canceled', 'confirmed', 2, '2025-10-20 07:26:20');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `category`, `description`, `price`, `duration_minutes`, `image_path`, `is_featured`, `active`, `category_id`, `created_at`) VALUES
(1, 'Body Scrub', 'Packages', 'asasf', 100.00, 60, NULL, 0, 1, NULL, '2025-10-20 00:00:14'),
(2, 'Classic Deep Cleansing Facial', 'Facial', 'Deep pore cleansing with exfoliation and mask for radiant skin.', 1100.00, 60, NULL, 1, 1, NULL, '2025-10-20 02:18:57'),
(3, 'Hydrating Glow Facial', 'Facial', 'Moisture-rich treatment to nourish dry and dull skin for a dewy finish.', 1000.00, 50, NULL, 1, 1, NULL, '2025-10-20 02:18:57'),
(4, 'Acne Clarifying Facial', 'Facial', 'Targeted treatment for acne-prone skin including extraction and antibacterial mask.', 1300.00, 60, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(5, 'Swedish Full Body Massage', 'Massage', 'Gentle to medium pressure massage to relax muscles and improve circulation.', 900.00, 60, NULL, 1, 1, NULL, '2025-10-20 02:18:57'),
(6, 'Deep Tissue Massage', 'Massage', 'Focused, firm pressure to release chronic muscle tension and knots.', 1400.00, 75, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(7, 'Aromatherapy Relaxation Massage', 'Massage', 'Warm aromatic oils and soothing strokes to calm the mind and body.', 1100.00, 60, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(8, 'Manicure (Classic)', 'Hand and Foot', 'Nail shaping, cuticle care and polish application for neat hands.', 450.00, 40, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(9, 'Pedicure (Spa)', 'Hand and Foot', 'Soak, exfoliation, nail care and hydrating foot massage.', 650.00, 50, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(10, 'Gel Manicure', 'Hand and Foot', 'Long-lasting gel polish cured under LED for durable shine.', 700.00, 60, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(11, 'Women\'s Haircut + Blow-dry', 'Hair', 'Professional haircut followed by styling and blow-dry.', 800.00, 60, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(12, 'Hair Coloring (Full)', 'Hair', 'Full hair color service including consultation and toner.', 2200.00, 120, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(13, 'Keratin Smoothing Treatment', 'Hair', 'Frizz control and smoothing treatment for sleek hair lasting weeks.', 3500.00, 150, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(14, 'Classic Eyelash Extensions (Full Set)', 'Eyelash', 'Natural-looking individual lash extensions applied by a certified technician.', 1800.00, 90, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(15, 'Eyelash Fill (2-3 weeks)', 'Eyelash', 'Refill to maintain fullness and shape of lash extensions.', 600.00, 45, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(16, 'Brow Wax & Shape', 'Waxing', 'Waxing and shaping of the brows to enhance facial features.', 300.00, 25, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(17, 'Eyebrow Tinting', 'Eyebrow', 'Tint brows for a fuller, defined look between shapes.', 350.00, 20, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(18, 'Lip Waxing', 'Waxing', 'Quick lip waxing for smooth, hair-free results.', 200.00, 10, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(19, 'Full Leg Waxing', 'Waxing', 'Full leg hair removal for smooth legs.', 800.00, 45, NULL, 0, 1, NULL, '2025-10-20 02:18:57'),
(20, 'Bikini Waxing', 'Waxing', 'Careful and hygienic bikini area waxing.', 500.00, 30, NULL, 0, 1, NULL, '2025-10-20 02:18:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'customer',
  `phone` varchar(40) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `created_at`) VALUES
(1, 'Kate Molato', 'kate@gmail.com', '$2y$10$ya7PGBJS9yPFSMrcS4prTebYphIcAaqt/YYsuPRJnTMrJ7YxVduGm', 'customer', '98675645235', '2025-10-19 22:52:16'),
(2, 'Administrator', 'admin@gmail.com', '$2y$10$kNGrudJ8.qpGvo8fZBn4ruQY10GgLej9f7SUAPOyJghS2s8pVkGnS', 'admin', NULL, '2025-10-19 23:44:37'),
(3, 'Allexia Papa', 'allexia@gmail.com', '$2y$10$FvpDD3XZa2Wrp1LdEG0vHeFre2tk8KkZ8OLw9E0Pda3lCUFD/mNhC', 'customer', '', '2025-10-20 01:57:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_al_user` (`user_id`),
  ADD KEY `idx_al_entity` (`entity`,`entity_id`),
  ADD KEY `idx_al_created_at` (`created_at`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_b_date_status` (`date`,`status`),
  ADD KEY `idx_b_status_date` (`status`,`date`),
  ADD KEY `idx_b_service_date` (`service_id`,`date`),
  ADD KEY `idx_b_user_date` (`user_id`,`date`);

--
-- Indexes for table `booking_status_history`
--
ALTER TABLE `booking_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bsh_user` (`changed_by_user_id`),
  ADD KEY `idx_bsh_booking` (`booking_id`),
  ADD KEY `idx_bsh_changed_at` (`changed_at`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_categories_name` (`name`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_services_active` (`active`),
  ADD KEY `idx_services_price` (`price`),
  ADD KEY `idx_services_category` (`category`),
  ADD KEY `idx_services_category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `booking_status_history`
--
ALTER TABLE `booking_status_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_b_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  ADD CONSTRAINT `fk_b_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_status_history`
--
ALTER TABLE `booking_status_history`
  ADD CONSTRAINT `fk_bsh_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bsh_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
