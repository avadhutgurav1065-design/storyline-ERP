import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Scratch {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Admin@123 matches N9qo... : " + encoder.matches("Admin@123", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"));
        System.out.println("Admin@123 matches 3Z7l... : " + encoder.matches("Admin@123", "$2a$10$3Z7l6rwxUGrRWVIBOwNCluCVi4JsVOLQAyaaWdJpfTATvpeH1bxKi"));
        System.out.println("admin matches N9qo... : " + encoder.matches("admin", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"));
        System.out.println("password matches N9qo... : " + encoder.matches("password", "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"));
    }
}
