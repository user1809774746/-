package com.example.auth.dto;

import lombok.Data;

@Data
public class ResponseDTO {
    private int code;
    private String message;
    private Object data;

    public ResponseDTO(int code, String message, Object data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static ResponseDTO success(Object data) {
        return new ResponseDTO(200, "success", data);
    }

    public static ResponseDTO error(int code, String message) {
        return new ResponseDTO(code, message, null);
    }
}