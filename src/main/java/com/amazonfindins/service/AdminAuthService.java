package com.amazonfindins.service;

import com.amazonfindins.dto.AdminLoginRequest;
import com.amazonfindins.dto.AdminLoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminAuthService {

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.token:amazonfindins-admin-token}")
    private String adminToken;

    public AdminLoginResponse login(AdminLoginRequest request) {
        if (!adminUsername.equals(request.getUsername()) || !adminPassword.equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        }

        return new AdminLoginResponse(adminToken, "Login successful.");
    }

    public boolean isValidToken(String token) {
        return token != null && token.equals(adminToken);
    }
}
