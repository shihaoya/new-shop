package com.linkman.aishop.security;

/**
 * 用户认证上下文
 * 
 * 使用 ThreadLocal 存储当前请求的用户信息，实现线程隔离
 */
public class AuthContext {
    
    private static final ThreadLocal<LoginUser> CONTEXT = new ThreadLocal<>();
    
    /**
     * 设置当前用户信息
     */
    public static void setLoginUser(LoginUser loginUser) {
        CONTEXT.set(loginUser);
    }
    
    /**
     * 获取当前用户信息
     */
    public static LoginUser getLoginUser() {
        return CONTEXT.get();
    }
    
    /**
     * 获取当前用户ID
     */
    public static String getUserId() {
        LoginUser loginUser = CONTEXT.get();
        return loginUser != null ? loginUser.getUserId() : null;
    }
    
    /**
     * 获取当前店铺ID
     */
    public static String getShopId() {
        LoginUser loginUser = CONTEXT.get();
        return loginUser != null ? loginUser.getShopId() : null;
    }
    
    /**
     * 获取当前用户角色
     */
    public static String getRole() {
        LoginUser loginUser = CONTEXT.get();
        return loginUser != null ? loginUser.getRole() : null;
    }
    
    /**
     * 判断是否为管理员
     */
    public static boolean isAdmin() {
        LoginUser loginUser = CONTEXT.get();
        return loginUser != null && loginUser.isAdmin();
    }
    
    /**
     * 清除当前用户信息（请求结束后调用）
     */
    public static void clear() {
        CONTEXT.remove();
    }
}
