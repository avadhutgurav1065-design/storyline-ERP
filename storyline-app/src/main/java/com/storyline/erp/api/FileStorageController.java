package com.storyline.erp.api;

import com.storyline.erp.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Handles file upload and download for event documents (PDF, PPT, DOCX, Excel, images, etc.).
 * Files are stored on the server filesystem under a configurable uploads directory.
 * The stored path (relative) is saved in the database via the EventDocument entity.
 */
@RestController
@RequestMapping("/api/files")
public class FileStorageController {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /**
     * Upload a file. Returns the stored filename that can be used to construct download/view URLs.
     * Example: POST /api/files/upload  (multipart/form-data with "file" part)
     * Response: { success: true, data: { fileName: "abc-123-decor.pptx", downloadUrl: "/api/files/download/abc-123-decor.pptx" } }
     */
    @PostMapping("/upload")
    public ApiResponse<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error("File is empty");
        }

        try {
            // Generate a unique filename to prevent collisions
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storedFileName = UUID.randomUUID().toString() + extension;

            // Save file to disk
            Path targetLocation = this.uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return the stored filename and constructed URLs
            Map<String, String> result = Map.of(
                "fileName", storedFileName,
                "originalName", originalFilename != null ? originalFilename : "unknown",
                "downloadUrl", "/api/files/download/" + storedFileName,
                "viewUrl", "/api/files/view/" + storedFileName
            );

            return ApiResponse.success("File uploaded successfully", result);
        } catch (IOException e) {
            return ApiResponse.error("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Download a file as an attachment (browser will trigger "Save As" dialog).
     */
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = this.uploadPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException e) {
                contentType = "application/octet-stream";
            }
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * View/preview a file inline in the browser (no download dialog).
     * Works for PDFs, images, and other browser-renderable types.
     */
    @GetMapping("/view/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        try {
            Path filePath = this.uploadPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException e) {
                contentType = "application/octet-stream";
            }
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
