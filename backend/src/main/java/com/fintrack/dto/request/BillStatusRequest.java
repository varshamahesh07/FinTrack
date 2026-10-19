package com.fintrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BillStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;
}
