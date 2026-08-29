import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://db.gfxqaoqjpvmyxvkzmlej.supabase.co:5432/postgres";
        String user = "postgres";
        String pass = "ct&8Gz%25E2Xts.";
        
        String[] tables = {"clients", "quotations", "events", "products", "invoices", "users", "vendors"};
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
            
            for (String table : tables) {
                try {
                    ResultSet rs = stmt.executeQuery("SELECT count(*) FROM " + table);
                    if (rs.next()) {
                        System.out.println(table + " count: " + rs.getInt(1));
                    }
                } catch (Exception e) {
                    System.out.println(table + " error: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
