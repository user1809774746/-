package com.example.auth.service;

import com.example.auth.entity.Province;
import com.example.auth.repository.ProvinceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProvinceService {
    
    @Autowired
    private ProvinceRepository provinceRepository;
    
    /**
     * 根据省份名称获取省份信息
     */
    public Optional<Province> getProvinceByName(String provinceName) {
        return provinceRepository.findByProvinceName(provinceName);
    }
    
    /**
     * 获取所有省份
     */
    public List<Province> getAllProvinces() {
        return provinceRepository.findAll();
    }
    
    /**
     * 添加省份
     */
    public Province addProvince(Province province) {
        // 检查省份名称是否已存在
        if (provinceRepository.existsByProvinceName(province.getProvinceName())) {
            throw new RuntimeException("省份名称已存在");
        }
        return provinceRepository.save(province);
    }
    
    /**
     * 更新省份信息
     */
    public Province updateProvince(Long provinceId, Province province) {
        Province existingProvince = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new RuntimeException("省份不存在"));
        
        // 检查新名称是否与其他省份重复
        if (province.getProvinceName() != null && 
            !province.getProvinceName().equals(existingProvince.getProvinceName())) {
            if (provinceRepository.existsByProvinceName(province.getProvinceName())) {
                throw new RuntimeException("省份名称已存在");
            }
            existingProvince.setProvinceName(province.getProvinceName());
        }
        
        if (province.getProvincePhotoUrl() != null) {
            existingProvince.setProvincePhotoUrl(province.getProvincePhotoUrl());
        }
        
        return provinceRepository.save(existingProvince);
    }
    
    /**
     * 删除省份
     */
    public void deleteProvince(Long provinceId) {
        if (!provinceRepository.existsById(provinceId)) {
            throw new RuntimeException("省份不存在");
        }
        provinceRepository.deleteById(provinceId);
    }
}
