package com.example.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class RealNameVerificationService {

    @Value("${juhe.idcard.v7.url:https://op.juhe.cn/idcard/hw}")
    private String apiUrl;

    @Value("${juhe.idcard.v7.key:}")
    private String apiKey;

    @Value("${juhe.idcard.v7.openId:}")
    private String openId;

    @Value("${juhe.idcard.v7.rsaPublicKey:}")
    private String rsaPublicKey;

    private final RestTemplate restTemplate;

    public RealNameVerificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 调用聚合数据 V7 实名认证接口
     *
     * @param realName  姓名
     * @param idCardNum 身份证号
     * @return 聚合接口返回的完整结果
     */
    public Map<String, Object> verifyRealName(String realName, String idCardNum) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("未配置 juhe.idcard.v7.key");
        }
        if (openId == null || openId.isEmpty()) {
            throw new IllegalStateException("未配置 juhe.idcard.v7.openId");
        }
        if (rsaPublicKey == null || rsaPublicKey.isEmpty()) {
            throw new IllegalStateException("未配置 juhe.idcard.v7.rsaPublicKey");
        }

        String rawAesKey = generateRandomString(16);
        String rawAesIv = generateRandomString(12);

        try {
            String encryptedRealName = encryptAesGcmBase64(realName, rawAesKey, rawAesIv);
            String encryptedIdCard = encryptAesGcmBase64(idCardNum, rawAesKey, rawAesIv);

            String encryptedAesKey = encryptRsaBase64(rawAesKey);
            String encryptedAesIv = encryptRsaBase64(rawAesIv);

            String signature = hmacSha256Hex(rawAesKey + rawAesIv + apiKey, openId);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("key", apiKey);
            form.add("aesKey", encryptedAesKey);
            form.add("aesIv", encryptedAesIv);
            form.add("idcard", encryptedIdCard);
            form.add("realname", encryptedRealName);
            form.add("signature", signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null) {
                body = new HashMap<>();
                body.put("error_code", -1);
                body.put("reason", "实名认证服务无响应");
            }
            return body;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error_code", -1);
            error.put("reason", "调用实名认证服务异常: " + e.getMessage());
            return error;
        }
    }

    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String encryptAesGcmBase64(String plainText, String rawAesKey, String rawAesIv) throws Exception {
        byte[] keyBytes = rawAesKey.getBytes(StandardCharsets.UTF_8);
        byte[] ivBytes = rawAesIv.getBytes(StandardCharsets.UTF_8);

        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(128, ivBytes);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);
        byte[] cipherBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(cipherBytes);
    }

    private String encryptRsaBase64(String plain) throws Exception {
        PublicKey publicKey = loadPublicKey();
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-1AndMGF1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] cipherBytes = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(cipherBytes);
    }

    private PublicKey loadPublicKey() throws Exception {
        String pem = rsaPublicKey
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(pem);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(keySpec);
    }

    private String hmacSha256Hex(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(digest.length * 2);
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
