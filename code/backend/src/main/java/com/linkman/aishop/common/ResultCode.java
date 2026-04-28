package com.linkman.aishop.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 响应状态码枚举
 * 
 * 错误码规范：
 * - 200: 成功
 * - 201: 创建成功
 * - 40001~40099: 参数/业务错误
 * - 40101: 未登录
 * - 40102: token 过期
 * - 40301: 无权限
 * - 40401: 资源不存在
 * - 50001: 服务器内部错误
 */
@Getter
@AllArgsConstructor
public enum ResultCode {
    
    // 成功
    SUCCESS(200, "操作成功"),
    CREATED(201, "创建成功"),
    
    // 参数/业务错误 (40001-40099)
    PARAM_ERROR(40001, "参数错误"),
    BUSINESS_ERROR(40002, "业务错误"),
    VALIDATION_ERROR(40003, "校验失败"),
    
    // 认证错误 (40101-40199)
    UNAUTHORIZED(40101, "未登录或登录已过期"),
    TOKEN_EXPIRED(40102, "Token已过期"),
    TOKEN_INVALID(40103, "Token无效"),
    
    // 权限错误 (40301-40399)
    FORBIDDEN(40301, "无权限访问"),
    
    // 资源错误 (40401-40499)
    NOT_FOUND(40401, "资源不存在"),
    
    // 服务器错误 (50001-50099)
    INTERNAL_ERROR(50001, "服务器内部错误");
    
    /**
     * 状态码
     */
    private final Integer code;
    
    /**
     * 消息
     */
    private final String message;
}
