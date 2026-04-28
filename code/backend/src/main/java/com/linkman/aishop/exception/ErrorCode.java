package com.linkman.aishop.exception;

/**
 * 错误码常量
 */
public class ErrorCode {
    
    // 参数/业务错误 (40001-40099)
    public static final int PARAM_ERROR = 40001;
    public static final int BUSINESS_ERROR = 40002;
    public static final int VALIDATION_ERROR = 40003;
    
    // 认证错误 (40101-40199)
    public static final int UNAUTHORIZED = 40101;
    public static final int TOKEN_EXPIRED = 40102;
    public static final int TOKEN_INVALID = 40103;
    
    // 权限错误 (40301-40399)
    public static final int FORBIDDEN = 40301;
    
    // 资源错误 (40401-40499)
    public static final int NOT_FOUND = 40401;
    
    // 服务器错误 (50001-50099)
    public static final int INTERNAL_ERROR = 50001;
}
