package com.amazonfindins.dto;

import jakarta.validation.constraints.NotBlank;

public class SiteSettingsRequest {

    @NotBlank(message = "Website name is required.")
    private String websiteName;

    private String logoUrl;

    public String getWebsiteName() {
        return websiteName;
    }

    public void setWebsiteName(String websiteName) {
        this.websiteName = websiteName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
