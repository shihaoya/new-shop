package com.linkman.aishop.exception;

import lombok.Getter;

/**
 * 业务异常基类
 */
@Getter
public class BusinessException extends RuntimeException {
    
    /**
     * 错误码
     */
    private final Integer code;
    
    /**
     * 构造业务异常（使用默认错误码）
     */
    public BusinessException(String message) {
        super(message);
        this.code = 40002; // 默认业务错误码
    }
    
    /**
     * 构造业务异常（指定错误码）
     */
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    
    /**
     * 构造业务异常（带 cause）
     */
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = 40002;
    }
}
