import bcrypt

hash1 = b'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
hash2 = b'$2a$10$3Z7l6rwxUGrRWVIBOwNCluCVi4JsVOLQAyaaWdJpfTATvpeH1bxKi'

print("Hash1 matches Admin@123:", bcrypt.checkpw(b'Admin@123', hash1))
print("Hash2 matches Admin@123:", bcrypt.checkpw(b'Admin@123', hash2))
print("Hash1 matches admin:", bcrypt.checkpw(b'admin', hash1))
print("Hash1 matches password:", bcrypt.checkpw(b'password', hash1))

new_hash = bcrypt.hashpw(b'Admin@123', bcrypt.gensalt())
print("New hash for Admin@123:", new_hash.decode())
