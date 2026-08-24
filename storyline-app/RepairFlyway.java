import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RepairFlyway {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://db.gfxqaoqjpvmyxvkzmlej.supabase.co:5432/postgres";
        String user = "postgres";
        String password = "ct&8Gz%25E2Xts.";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            int deleted = stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version = '1.6.0'");
            System.out.println("Deleted rows: " + deleted);
        }
    }
}
