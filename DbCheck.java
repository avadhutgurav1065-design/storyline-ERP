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
            
            System.out.println("Checking vendors table...");
            ResultSet rs = stmt.executeQuery("SELECT * FROM vendors");
            while (rs.next()) {
                System.out.println("Vendor: " + rs.getString("name") + ", " + rs.getString("service_type"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
