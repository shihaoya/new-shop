package com.linkman.aishop.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * 日期时间工具类
 * 
 * 统一使用 ISO 8601 格式进行 API 传输
 */
public class DateUtils {
    
    /**
     * ISO 8601 格式化器
     */
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    
    /**
     * 常用格式化器（用于显示）
     */
    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * 格式化 LocalDateTime 为 ISO 8601 字符串
     */
    public static String toIsoString(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.atZone(ZoneId.of("UTC")).format(ISO_FORMATTER);
    }
    
    /**
     * 格式化 LocalDateTime 为显示字符串
     */
    public static String toDisplayString(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DISPLAY_FORMATTER);
    }
    
    /**
     * 解析 ISO 8601 字符串为 LocalDateTime
     */
    public static LocalDateTime fromIsoString(String isoString) {
        if (isoString == null || isoString.isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(isoString, ISO_FORMATTER);
    }
    
    /**
     * 获取当前时间（UTC）
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(ZoneId.of("UTC"));
    }
    
    /**
     * 获取当前时间（本地时区）
     */
    public static LocalDateTime nowLocal() {
        return LocalDateTime.now();
    }
}
