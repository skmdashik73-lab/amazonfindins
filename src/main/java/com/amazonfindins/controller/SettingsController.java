package com.amazonfindins.controller;

import com.amazonfindins.dto.SiteSettingsRequest;
import com.amazonfindins.model.SiteSettings;
import com.amazonfindins.service.AdminAuthService;
import com.amazonfindins.service.SiteSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    private final SiteSettingsService siteSettingsService;
    private final AdminAuthService adminAuthService;

    public SettingsController(SiteSettingsService siteSettingsService, AdminAuthService adminAuthService) {
        this.siteSettingsService = siteSettingsService;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping
    public SiteSettings getSettings() {
        return siteSettingsService.getSettings();
    }

    @PutMapping
    public SiteSettings updateSettings(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @Valid @RequestBody SiteSettingsRequest request) {
        if (!adminAuthService.isValidToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin login is required.");
        }
        return siteSettingsService.updateSettings(request);
    }
}
