import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
public class DBTest {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection(
                "jdbc:postgresql://db.gfxqaoqjpvmyxvkzmlej.supabase.co:5432/postgres",
                "postgres",
                "ct&8Gz%25E2Xts."
            );
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT status, count(*) FROM events GROUP BY status;");
            while (rs.next()) {
                System.out.println("STATUS: " + rs.getString(1) + ", COUNT: " + rs.getInt(2));
            }
            rs.close();
            stmt.close();
            conn.close();
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
