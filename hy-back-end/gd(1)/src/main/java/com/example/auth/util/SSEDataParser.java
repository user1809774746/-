package com.example.auth.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import java.util.Map;

/**
 * SSE数据解析器
 * 用于解析Server-Sent Events格式的数据
 */
@RequiredArgsConstructor
public class SSEDataParser {
    private final ObjectMapper objectMapper;

    /**
     * 解析SSE行
     * @param line SSE格式的行 (如: "data: {...}" 或 "{...}")
     * @return 解析结果
     */
    public ParsedSSEData parseLine(String line) {
        if (line == null || line.trim().isEmpty()) {
            return ParsedSSEData.empty();
        }

        String trimmedLine = line.trim();

        // 检查是否为结束标记
        if (trimmedLine.equals("[DONE]") || trimmedLine.equals("data: [DONE]")) {
            return ParsedSSEData.done();
        }

        // 提取JSON部分
        String jsonStr = trimmedLine;
        if (trimmedLine.startsWith("data:")) {
            jsonStr = trimmedLine.substring(5).trim();
        }

        if (jsonStr.isEmpty()) {
            return ParsedSSEData.empty();
        }

        try {
            // 尝试解析为JSON
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(jsonStr, Map.class);
            
            String type = (String) data.get("type");
            Object contentObj = data.get("content");
            
            if (contentObj == null) {
                return ParsedSSEData.empty();
            }

            String content;
            if (contentObj instanceof String) {
                content = (String) contentObj;
            } else {
                // 将嵌套对象/数组序列化为合法 JSON 字符串，方便后续 ContentFilter 解析
                content = objectMapper.writeValueAsString(contentObj);
            }
            
            // 检查content是否为完整的JSON
            boolean isComplete = isCompleteJSON(content);
            
            return new ParsedSSEData(type, content, isComplete, true);
            
        } catch (Exception e) {
            // 解析失败，返回原始数据
            return new ParsedSSEData(null, jsonStr, false, false);
        }
    }

    /**
     * 判断字符串是否为完整的JSON
     */
    private boolean isCompleteJSON(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = str.trim();
        
        // 简单检查：JSON对象或数组的开始和结束括号是否匹配
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            return true;
        }
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            return true;
        }
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return true;
        }
        
        // 尝试解析验证
        try {
            objectMapper.readTree(trimmed);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断是否为有效的SSE行
     */
    public boolean isValidSSELine(String line) {
        if (line == null || line.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = line.trim();
        return trimmed.startsWith("data:") || 
               trimmed.startsWith("{") || 
               trimmed.equals("[DONE]");
    }

    /**
     * 解析结果数据类
     */
    public static class ParsedSSEData {
        private final String type;
        private final String content;
        private final boolean isComplete;
        private final boolean isValid;

        public ParsedSSEData(String type, String content, boolean isComplete, boolean isValid) {
            this.type = type;
            this.content = content;
            this.isComplete = isComplete;
            this.isValid = isValid;
        }

        public String getType() {
            return type;
        }

        public String getContent() {
            return content;
        }

        public boolean isComplete() {
            return isComplete;
        }

        public boolean isValid() {
            return isValid;
        }

        public static ParsedSSEData empty() {
            return new ParsedSSEData(null, "", false, false);
        }

        public static ParsedSSEData done() {
            return new ParsedSSEData("done", "[DONE]", true, true);
        }

        public boolean isDone() {
            return "done".equals(type) || "[DONE]".equals(content);
        }

        public boolean isEmpty() {
            return content == null || content.isEmpty();
        }
    }
}
