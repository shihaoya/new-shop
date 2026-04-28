package com.linkman.aishop.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录用户信息
 * 
 * 存储在 ThreadLocal 中，用于在请求处理过程中获取当前用户信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUser {
    
    /**
     * 用户ID（雪花ID字符串）
     */
    private String userId;
    
    /**
     * 店铺ID（雪花ID字符串，管理员为 null）
     */
    private String shopId;
    
    /**
     * 角色：ADMIN（管理员）、SHOP_USER（店铺用户）、USER（普通用户）
     */
    private String role;
    
    /**
     * 判断是否为管理员
     */
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
    
    /**
     * 判断是否为店铺用户
     */
    public boolean isShopUser() {
        return "SHOP_USER".equals(role);
    }
    
    /**
     * 判断是否为普通用户
     */
    public boolean isUser() {
        return "USER".equals(role);
    }
}
