package com.linkman.aishop.util;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;

/**
 * 雪花 ID 生成器
 * 
 * 使用 Hutool 提供的 Snowflake 算法实现
 */
public class SnowflakeIdGenerator {
    
    private static final Snowflake SNOWFLAKE = IdUtil.getSnowflake();
    
    /**
     * 生成雪花 ID（Long 类型）
     */
    public static Long generateId() {
        return SNOWFLAKE.nextId();
    }
    
    /**
     * 生成雪花 ID（String 类型，用于前端传输）
     */
    public static String generateIdStr() {
        return String.valueOf(SNOWFLAKE.nextId());
    }
}
