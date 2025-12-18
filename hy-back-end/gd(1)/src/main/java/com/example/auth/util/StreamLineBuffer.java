package com.example.auth.util;

import java.util.ArrayList;
import java.util.List;

/**
 * 流式数据行缓冲器
 * 用于处理跨数据块边界的行，确保只输出完整的行
 */
public class StreamLineBuffer {
    private final StringBuilder buffer = new StringBuilder();
    private final int maxBufferSize;

    public StreamLineBuffer() {
        this(16384); // 默认16KB最大缓冲
    }

    public StreamLineBuffer(int maxBufferSize) {
        this.maxBufferSize = maxBufferSize;
    }

    /**
     * 添加数据块到缓冲区，返回所有完整的行
     * @param chunk 新的数据块
     * @return 完整的行列表
     */
    public List<String> addChunk(String chunk) {
        List<String> completeLines = new ArrayList<>();
        
        if (chunk == null || chunk.isEmpty()) {
            return completeLines;
        }

        buffer.append(chunk);

        // 检查缓冲区大小
        if (buffer.length() > maxBufferSize) {
            System.err.println("⚠️ 行缓冲区超过最大限制: " + buffer.length() + " 字节");
            // 强制输出，避免内存溢出
            completeLines.add(buffer.toString());
            buffer.setLength(0);
            return completeLines;
        }

        // 提取所有完整的行（以\n结尾）
        int lastNewlineIndex;
        while ((lastNewlineIndex = buffer.indexOf("\n")) != -1) {
            String line = buffer.substring(0, lastNewlineIndex);
            completeLines.add(line);
            buffer.delete(0, lastNewlineIndex + 1);
        }

        return completeLines;
    }

    /**
     * 获取缓冲区中剩余的数据（流结束时调用）
     * @return 剩余数据
     */
    public String flush() {
        String remaining = buffer.toString();
        buffer.setLength(0);
        return remaining;
    }

    /**
     * 清空缓冲区
     */
    public void clear() {
        buffer.setLength(0);
    }

    /**
     * 获取当前缓冲区大小
     */
    public int getBufferSize() {
        return buffer.length();
    }
}
