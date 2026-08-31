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
            
            stmt.executeUpdate("DROP SCHEMA public CASCADE;");
            stmt.executeUpdate("CREATE SCHEMA public;");
            System.out.println("Schema wiped.");
        }
    }
}
