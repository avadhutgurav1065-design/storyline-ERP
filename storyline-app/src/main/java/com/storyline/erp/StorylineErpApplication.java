package com.storyline.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main entry point for the Storyline Event Management ERP.
 */
@SpringBootApplication
@EnableJpaAuditing
public class StorylineErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(StorylineErpApplication.class, args);
    }
}
