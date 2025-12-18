package com.example.auth.util;

/**
 * 流式传输指标
 * 用于记录和统计流式传输的性能数据
 */
public class StreamMetrics {
    private long totalBytesReceived = 0;
    private long totalBytesSent = 0;
    private int chunkCount = 0;
    private int lineCount = 0;
    private final long startTime;

    public StreamMetrics() {
        this.startTime = System.currentTimeMillis();
    }

    /**
     * 记录接收到的数据块
     */
    public void recordChunkReceived(int bytes) {
        totalBytesReceived += bytes;
        chunkCount++;
    }

    /**
     * 记录发送的数据块
     */
    public void recordChunkSent(int bytes) {
        totalBytesSent += bytes;
    }

    /**
     * 记录处理的行数
     */
    public void recordLine() {
        lineCount++;
    }

    /**
     * 获取已用时间（毫秒）
     */
    public long getElapsedTime() {
        return System.currentTimeMillis() - startTime;
    }

    /**
     * 记录摘要日志
     */
    public void logSummary() {
        long elapsed = getElapsedTime();
        System.out.println("=== 流式传输统计 ===");
        System.out.println("接收字节数: " + totalBytesReceived);
        System.out.println("发送字节数: " + totalBytesSent);
        System.out.println("数据块数量: " + chunkCount);
        System.out.println("处理行数: " + lineCount);
        System.out.println("耗时: " + elapsed + "ms");
        
        if (totalBytesReceived > 0) {
            double lossRate = (1.0 - (double) totalBytesSent / totalBytesReceived) * 100;
            System.out.println("数据保留率: " + String.format("%.2f%%", 100 - lossRate));
            
            if (lossRate > 10) {
                System.err.println("⚠️ 警告：数据丢失率较高 " + String.format("%.2f%%", lossRate));
            }
        }
        
        System.out.println("==================\n");
    }

    // Getters
    public long getTotalBytesReceived() {
        return totalBytesReceived;
    }

    public long getTotalBytesSent() {
        return totalBytesSent;
    }

    public int getChunkCount() {
        return chunkCount;
    }

    public int getLineCount() {
        return lineCount;
    }
}
