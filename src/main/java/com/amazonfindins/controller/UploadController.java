package com.amazonfindins.controller;

import com.amazonfindins.dto.UploadResponse;
import com.amazonfindins.service.AdminAuthService;
import com.amazonfindins.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/admin")
public class UploadController {

    private final FileStorageService fileStorageService;
    private final AdminAuthService adminAuthService;

    public UploadController(FileStorageService fileStorageService, AdminAuthService adminAuthService) {
        this.fileStorageService = fileStorageService;
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/upload")
    public UploadResponse uploadImage(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @RequestParam("image") MultipartFile image) {
        if (!adminAuthService.isValidToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin login is required.");
        }
        return new UploadResponse(fileStorageService.storeImage(image));
    }
}
