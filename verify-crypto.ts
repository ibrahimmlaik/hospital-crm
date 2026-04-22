
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-secret");

async function main() {
    console.log("Testing bcryptjs...");
    const hash = await bcrypt.hash("password123", 10);
    console.log("Hash created:", hash.substring(0, 10) + "...");
    const match = await bcrypt.compare("password123", hash);
    console.log("Password match:", match);

    console.log("Testing jose...");
    const token = await new SignJWT({ userId: "123", role: "ADMIN" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .sign(JWT_SECRET);
    console.log("Token created:", token.substring(0, 10) + "...");

    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("Token verified. Role:", payload.role);
}

main().catch(console.error);
