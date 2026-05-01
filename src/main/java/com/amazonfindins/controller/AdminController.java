package com.amazonfindins.controller;

import com.amazonfindins.dto.AdminLoginRequest;
import com.amazonfindins.dto.AdminLoginResponse;
import com.amazonfindins.dto.ProductRequest;
import com.amazonfindins.model.Product;
import com.amazonfindins.service.AdminAuthService;
import com.amazonfindins.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ProductService productService;
    private final AdminAuthService adminAuthService;

    public AdminController(ProductService productService, AdminAuthService adminAuthService) {
        this.productService = productService;
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public AdminLoginResponse login(@Valid @RequestBody AdminLoginRequest request) {
        return adminAuthService.login(request);
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @Valid @RequestBody ProductRequest request) {
        requireAdmin(token);
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        requireAdmin(token);
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @PathVariable Long id) {
        requireAdmin(token);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin(String token) {
        if (!adminAuthService.isValidToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin login is required.");
        }
    }
}
