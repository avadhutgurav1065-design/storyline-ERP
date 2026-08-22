package com.storyline.erp.common.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Generates business-readable IDs with prefixes.
 * Format: PREFIX-YYYY-SEQUENTIAL
 * Examples: QT-2026-001, EVT-2026-001, LEAD-2026-001
 *
 * Note: In production, the sequential part should come from a database sequence
 * to ensure uniqueness across restarts. This utility provides the formatting.
 */
public final class IdGenerator {

    private IdGenerator() {}

    /**
     * Generate a business ID with the given prefix and sequence number.
     * @param prefix  e.g., "QT", "EVT", "LEAD"
     * @param sequence  the sequential number from DB
     * @return formatted ID like "QT-2026-001"
     */
    public static String generate(String prefix, long sequence) {
        String year = String.valueOf(LocalDate.now().getYear());
        return String.format("%s-%s-%03d", prefix, year, sequence);
    }

    /**
     * Generate a business ID using current year and a 4-digit sequence.
     */
    public static String generateLong(String prefix, long sequence) {
        String year = String.valueOf(LocalDate.now().getYear());
        return String.format("%s-%s-%04d", prefix, year, sequence);
    }
}
