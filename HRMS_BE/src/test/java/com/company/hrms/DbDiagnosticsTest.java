package com.company.hrms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class DbDiagnosticsTest {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void testDatabase() {
        System.out.println("====== DB DIAG ======");
        try {
            List<Map<String, Object>> shifts = jdbcTemplate.queryForList("SELECT * FROM shifts");
            System.out.println("SHIFTS: " + shifts);
            List<Map<String, Object>> assigns = jdbcTemplate.queryForList("SELECT * FROM shift_assignments");
            System.out.println("ASSIGNS: " + assigns);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
