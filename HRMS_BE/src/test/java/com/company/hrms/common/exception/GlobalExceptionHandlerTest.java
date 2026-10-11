package com.company.hrms.common.exception;

import com.company.hrms.model.dto.response.ApiResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Nên trả về 403 Forbidden khi gặp AccessDeniedException")
    void shouldHandleAccessDeniedException() {
        AccessDeniedException ex = new AccessDeniedException("Forbidden");

        ResponseEntity<ApiResponse<Object>> response = handler.handleAccessDeniedException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Bạn không có quyền thực hiện chức năng này", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Nên trả về AppException với đúng HttpStatus và message")
    void shouldHandleAppException() {
        AppException ex = new AppException("Lỗi nghiệp vụ", HttpStatus.BAD_REQUEST);

        ResponseEntity<ApiResponse<Object>> response = handler.handleAppException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Lỗi nghiệp vụ", response.getBody().getMessage());
    }
}
