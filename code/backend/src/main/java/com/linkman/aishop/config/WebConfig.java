package com.linkman.aishop.config;

import com.linkman.aishop.interceptor.AuthInterceptor;
import com.linkman.aishop.interceptor.DataIsolationInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置类
 * 
 * 注册拦截器并配置拦截路径
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    
    private final AuthInterceptor authInterceptor;
    private final DataIsolationInterceptor dataIsolationInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 认证拦截器：拦截所有 /api/** 路径，排除白名单
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",      // 登录
                        "/api/auth/register",    // 注册
                        "/api/file/upload"       // 文件上传（可能需要认证，根据需求调整）
                );
        
        // 数据隔离拦截器：在认证之后执行
        registry.addInterceptor(dataIsolationInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/file/upload"
                );
    }
}
