package com.amazonfindins.service;

import com.amazonfindins.dto.SiteSettingsRequest;
import com.amazonfindins.model.SiteSettings;
import com.amazonfindins.repository.SiteSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class SiteSettingsService {

    private static final Long SETTINGS_ID = 1L;

    private final SiteSettingsRepository siteSettingsRepository;

    public SiteSettingsService(SiteSettingsRepository siteSettingsRepository) {
        this.siteSettingsRepository = siteSettingsRepository;
    }

    public SiteSettings getSettings() {
        return siteSettingsRepository.findById(SETTINGS_ID).orElseGet(() -> {
            SiteSettings settings = new SiteSettings();
            settings.setId(SETTINGS_ID);
            return siteSettingsRepository.save(settings);
        });
    }

    public SiteSettings updateSettings(SiteSettingsRequest request) {
        SiteSettings settings = getSettings();
        settings.setWebsiteName(request.getWebsiteName());
        settings.setLogoUrl(request.getLogoUrl() == null ? "" : request.getLogoUrl());
        return siteSettingsRepository.save(settings);
    }
}
