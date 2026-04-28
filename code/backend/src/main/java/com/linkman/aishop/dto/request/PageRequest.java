package com.linkman.aishop.dto.request;

import lombok.Data;

/**
 * 分页请求参数
 */
@Data
public class PageRequest {
    
    /**
     * 页码，从 1 开始
     */
    private Integer page = 1;
    
    /**
     * 每页条数，默认 20
     */
    private Integer pageSize = 20;
    
    /**
     * 排序字段（camelCase）
     */
    private String sortField;
    
    /**
     * 排序方向：asc / desc
     */
    private String sortOrder = "desc";
    
    /**
     * 验证分页参数
     */
    public void validate() {
        if (page == null || page < 1) {
            page = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 20;
        }
        // 限制最大每页条数，防止恶意请求
        if (pageSize > 100) {
            pageSize = 100;
        }
    }
}
