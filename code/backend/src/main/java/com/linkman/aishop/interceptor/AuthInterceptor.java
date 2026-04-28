package com.linkman.aishop.interceptor;

import com.linkman.aishop.common.ResultCode;
import com.linkman.aishop.exception.BusinessException;
import com.linkman.aishop.security.AuthContext;
import com.linkman.aishop.security.JwtUtils;
import com.linkman.aishop.security.LoginUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 认证拦截器
 * 
 * 验证请求中的 JWT Token，提取用户信息并存入 AuthContext
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {
    
    private final JwtUtils jwtUtils;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 从请求头获取 Token
        String authorization = request.getHeader("Authorization");
        
        if (authorization == null || authorization.isEmpty()) {
            throw new BusinessException(ResultCode.UNAUTHORIZED.getCode(), "未提供认证令牌");
        }
        
        // 去除 Bearer 前缀
        String token = authorization;
        if (authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        }
        
        // 验证 Token
        if (!jwtUtils.validateToken(token)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID.getCode(), "认证令牌无效或已过期");
        }
        
        // 提取用户信息
        String userId = jwtUtils.getUserIdFromToken(token);
        String shopId = jwtUtils.getShopIdFromToken(token);
        String role = jwtUtils.getRoleFromToken(token);
        
        // 构建登录用户对象
        LoginUser loginUser = new LoginUser(userId, shopId, role);
        
        // 存入 ThreadLocal
        AuthContext.setLoginUser(loginUser);
        
        log.debug("用户认证成功: userId={}, role={}", userId, role);
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 请求结束后清除 ThreadLocal，防止内存泄漏
        AuthContext.clear();
    }
}
