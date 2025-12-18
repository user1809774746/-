package com.example.auth.controller;

import com.example.auth.entity.Province;
import com.example.auth.service.ProvinceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/provinces")
@CrossOrigin(origins = "*")
public class ProvinceController {
    
    @Autowired
    private ProvinceService provinceService;
    
    /**
     * 根据省份名称获取省份照片
     * GET /api/provinces/photo?name=北京
     */
    @GetMapping("/photo")
    public ResponseEntity<Map<String, Object>> getProvincePhoto(@RequestParam String name) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<Province> province = provinceService.getProvinceByName(name);
        
        if (province.isPresent()) {
            response.put("success", true);
            response.put("provinceName", province.get().getProvinceName());
            response.put("photoUrl", province.get().getProvincePhotoUrl());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "未找到该省份信息");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * 根据省份名称获取完整省份信息
     * GET /api/provinces/detail?name=北京
     */
    @GetMapping("/detail")
    public ResponseEntity<Map<String, Object>> getProvinceDetail(@RequestParam String name) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<Province> province = provinceService.getProvinceByName(name);
        
        if (province.isPresent()) {
            response.put("success", true);
            response.put("data", province.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "未找到该省份信息");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * 获取所有省份列表
     * GET /api/provinces/all
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllProvinces() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Province> provinces = provinceService.getAllProvinces();
            response.put("success", true);
            response.put("data", provinces);
            response.put("total", provinces.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取省份列表失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * 添加省份
     * POST /api/provinces
     * Body: {"provinceName": "北京", "provincePhotoUrl": "http://example.com/beijing.jpg"}
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> addProvince(@RequestBody Province province) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Province savedProvince = provinceService.addProvince(province);
            response.put("success", true);
            response.put("message", "省份添加成功");
            response.put("data", savedProvince);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * 更新省份信息
     * PUT /api/provinces/{id}
     * Body: {"provinceName": "北京市", "provincePhotoUrl": "http://example.com/beijing-new.jpg"}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProvince(
            @PathVariable Long id,
            @RequestBody Province province) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Province updatedProvince = provinceService.updateProvince(id, province);
            response.put("success", true);
            response.put("message", "省份更新成功");
            response.put("data", updatedProvince);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * 删除省份
     * DELETE /api/provinces/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProvince(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            provinceService.deleteProvince(id);
            response.put("success", true);
            response.put("message", "省份删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
