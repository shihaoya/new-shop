package com.linkman.aishop.controller;

import com.linkman.aishop.common.PageResult;
import com.linkman.aishop.common.Result;
import com.linkman.aishop.security.AuthContext;
import com.linkman.aishop.util.SnowflakeIdGenerator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器
 * 
 * 用于验证基础设施是否正常工作
 */
@RestController
@RequestMapping("/api/test")
public class TestController {
    
    /**
     * 健康检查接口（无需认证）
     */
    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "ok");
        data.put("timestamp", System.currentTimeMillis());
        return Result.success(data);
    }
    
    /**
     * 获取当前用户信息（需要认证）
     */
    @GetMapping("/me")
    public Result<Map<String, Object>> getCurrentUser() {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", AuthContext.getUserId());
        data.put("shopId", AuthContext.getShopId());
        data.put("role", AuthContext.getRole());
        data.put("isAdmin", AuthContext.isAdmin());
        return Result.success(data);
    }
    
    /**
     * 测试雪花 ID 生成
     */
    @GetMapping("/snowflake")
    public Result<Map<String, Object>> testSnowflake() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", SnowflakeIdGenerator.generateIdStr());
        data.put("idLong", SnowflakeIdGenerator.generateId());
        return Result.success(data);
    }
    
    /**
     * 测试分页响应
     */
    @GetMapping("/page")
    public Result<PageResult<Map<String, Object>>> testPage() {
        Map<String, Object> item = new HashMap<>();
        item.put("id", "1");
        item.put("name", "测试数据");
        
        PageResult<Map<String, Object>> pageResult = PageResult.of(
            java.util.Collections.singletonList(item),
            1L,
            1,
            20
        );
        
        return Result.success(pageResult);
    }
}
