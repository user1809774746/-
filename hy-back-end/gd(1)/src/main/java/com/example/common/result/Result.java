package com.example.common.result;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * 统一返回结果类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    private Boolean success;

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data, true);
    }

    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data, true);
    }

    public static <T> Result<T> success(String message) {
        return new Result<>(200, message, null, true);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null, false);
    }

    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null, false);
    }

    public static <T> Result<T> error(Integer code, String message, T data) {
        return new Result<>(code, message, data, false);
    }
}
