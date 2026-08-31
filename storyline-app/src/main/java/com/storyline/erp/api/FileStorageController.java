package com.storyline.erp.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.api.entity.StoredFile;
import com.storyline.erp.api.repository.StoredFileRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Handles file upload and download for event documents (PDF, PPT, DOCX, Excel, images, etc.).
 * Files are stored in the database to prevent data loss on ephemeral filesystems (like Render).
 */
@RestController
@RequestMapping("/api/files")
public class FileStorageController {

    private final StoredFileRepository storedFileRepository;

    public FileStorageController(StoredFileRepository storedFileRepository) {
        this.storedFileRepository = storedFileRepository;
    }

    /**
     * Upload a file. Returns the stored filename that can be used to construct download/view URLs.
     */
    @PostMapping("/upload")
    public ApiResponse<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error("File is empty");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storedFileName = UUID.randomUUID().toString() + extension;
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            StoredFile storedFile = new StoredFile();
            storedFile.setId(storedFileName);
            storedFile.setOriginalFilename(originalFilename != null ? originalFilename : storedFileName);
            storedFile.setContentType(contentType);
            storedFile.setData(file.getBytes());

            storedFileRepository.save(storedFile);

            Map<String, String> result = Map.of(
                "fileName", storedFileName,
                "originalName", storedFile.getOriginalFilename(),
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
        Optional<StoredFile> storedFileOpt = storedFileRepository.findById(fileName);
        if (storedFileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StoredFile storedFile = storedFileOpt.get();
        ByteArrayResource resource = new ByteArrayResource(storedFile.getData()) {
            @Override
            public String getFilename() {
                return storedFile.getOriginalFilename();
            }
        };

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(storedFile.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + storedFile.getOriginalFilename() + "\"")
                .body(resource);
    }

    /**
     * View/preview a file inline in the browser (no download dialog).
     */
    @GetMapping("/view/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        Optional<StoredFile> storedFileOpt = storedFileRepository.findById(fileName);
        if (storedFileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StoredFile storedFile = storedFileOpt.get();
        ByteArrayResource resource = new ByteArrayResource(storedFile.getData()) {
            @Override
            public String getFilename() {
                return storedFile.getOriginalFilename();
            }
        };

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(storedFile.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + storedFile.getOriginalFilename() + "\"")
                .body(resource);
    }
}
