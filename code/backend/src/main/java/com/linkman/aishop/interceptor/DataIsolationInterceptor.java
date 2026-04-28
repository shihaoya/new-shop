package com.linkman.aishop.interceptor;

import com.linkman.aishop.common.ResultCode;
import com.linkman.aishop.exception.BusinessException;
import com.linkman.aishop.security.AuthContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 数据隔离拦截器
 * 
 * 根据用户角色设置数据访问范围：
 * - 管理员（ADMIN）：可跨店铺访问，需显式传递 shopId
 * - 店铺用户（SHOP_USER）：只能访问本店数据
 * - 普通用户（USER）：只能访问自己的数据
 */
@Slf4j
@Component
public class DataIsolationInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String role = AuthContext.getRole();
        String shopId = AuthContext.getShopId();
        String userId = AuthContext.getUserId();
        
        if (role == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "未认证用户");
        }
        
        // 店铺用户和普通用户必须有 shopId
        if (!"ADMIN".equals(role) && shopId == null) {
            throw new BusinessException(ResultCode.FORBIDDEN.getCode(), "无权限访问");
        }
        
        // 将 shopId 和 userId 存入请求属性，供后续使用
        if (shopId != null) {
            request.setAttribute("shopId", shopId);
        }
        if (userId != null) {
            request.setAttribute("userId", userId);
        }
        request.setAttribute("role", role);
        
        log.debug("数据隔离检查通过: role={}, shopId={}, userId={}", role, shopId, userId);
        
        return true;
    }
}
