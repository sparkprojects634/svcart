// pages/api/login.js

import mysql from "mysql2/promise";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const SECRET_KEY = process.env.JWT_SECRET || "super_secret_key";

const OTP_SECRET =
    process.env.OTP_SECRET ||
    process.env.JWT_SECRET ||
    "otp_secret_key";

const WP_TABLE_PREFIX = process.env.WP_TABLE_PREFIX || "fxiEe_";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

// --------------------------------------------------
// EMAIL VALIDATION
// --------------------------------------------------

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// --------------------------------------------------
// NORMALIZE EMAIL
// --------------------------------------------------

const normalizeEmail = (email) => {
    return String(email || "").trim().toLowerCase();
};

// --------------------------------------------------
// GENERATE OTP
// --------------------------------------------------

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

// --------------------------------------------------
// HASH OTP
// --------------------------------------------------

const hashOTP = (otp) => {
    return crypto
        .createHash("sha256")
        .update(`${otp}:${OTP_SECRET}`)
        .digest("hex");
};

// --------------------------------------------------
// DATABASE
// --------------------------------------------------

const createDBConnection = async () => {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306),

        connectTimeout: 10000,
    });
};
// --------------------------------------------------
// MAIL TRANSPORTER
// --------------------------------------------------

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,

    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

// --------------------------------------------------
// SEND OTP EMAIL
// --------------------------------------------------

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_EMAIL,

        to: email,

        subject: `${otp} is your SV Cart verification code`,

        text: `
Your SV Cart verification code is: ${otp}

This code will expire in ${OTP_EXPIRY_MINUTES} minutes.

If you did not request this code, you can safely ignore this email.
        `.trim(),

        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0; padding:0; background:#f2f3f5; font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5; padding:40px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="
          max-width:480px;
          width:100%;
          background:#ffffff;
          border-radius:16px;
          border:1px solid #ececec;
          box-shadow:0 4px 16px rgba(0,0,0,0.05);
        ">
          <tr>
            <td style="padding:40px 32px; text-align:center;">

              <img
                src="https://dashboard.svcart.shop/wp-content/uploads/2025/12/favicon.png"
                width="56"
                alt="SV Cart"
                style="display:block; margin:0 auto 24px;"
              />

              <h1 style="margin:0 0 8px; font-size:20px; line-height:1.3; color:#111111;">
                Verify your email
              </h1>

              <p style="margin:0 0 28px; font-size:14px; line-height:1.5; color:#666666;">
                Use the verification code below to continue to <strong>SV Cart</strong>.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="
                    background:#f5f7fa;
                    border:1px solid #e5e9f0;
                    border-radius:10px;
                    padding:16px 36px;
                    font-family:'Courier New',Courier,monospace;
                    font-size:32px;
                    font-weight:bold;
                    letter-spacing:10px;
                    color:#0C3A73;
                  ">
                    ${otp}
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0; font-size:13px; color:#888888;">
                This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
              </p>

              <hr style="border:none; border-top:1px solid #eeeeee; margin:28px 0;" />

              <p style="margin:0; font-size:12px; line-height:1.5; color:#aaaaaa;">
                If you didn't request this code, you can safely ignore this email — no action is needed.
              </p>

            </td>
          </tr>
        </table>

        <p style="margin:20px 0 0; font-size:11px; color:#b0b0b0;">
          © ${new Date().getFullYear()} SV Cart. All rights reserved.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>

        `,
    });
};

// --------------------------------------------------
// CREATE SESSION
// --------------------------------------------------

const createSession = (res, user) => {
    const token = jwt.sign(
        {
            id: user.ID,
            email: user.user_email,
        },
        SECRET_KEY,
        {
            expiresIn: "1h",
        }
    );

    res.setHeader(
        "Set-Cookie",
        serialize("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60,
            path: "/",
        })
    );
};

// --------------------------------------------------
// CREATE WORDPRESS CUSTOMER
// --------------------------------------------------

const createWordPressCustomer = async (conn, email) => {
    const displayName = email.split("@")[0];

    let userLogin = displayName
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .substring(0, 50);

    if (!userLogin) {
        userLogin = "customer";
    }

    const [existingLogin] = await conn.execute(
        `SELECT ID
         FROM \`${WP_TABLE_PREFIX}users\`
         WHERE user_login = ?
         LIMIT 1`,
        [userLogin]
    );

    if (existingLogin.length > 0) {
        userLogin =
            `${userLogin}-${crypto
                .randomBytes(4)
                .toString("hex")}`
                .substring(0, 60);
    }

    const randomPassword = crypto
        .randomBytes(32)
        .toString("hex");

    const hasher = require("wordpress-hash-node");

    const wpHash = hasher.HashPassword(randomPassword);

    const [result] = await conn.execute(
        `
        INSERT INTO \`${WP_TABLE_PREFIX}users\`
        (
            user_login,
            user_pass,
            user_nicename,
            user_email,
            user_url,
            user_registered,
            user_activation_key,
            user_status,
            display_name
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            '',
            UTC_TIMESTAMP(),
            '',
            0,
            ?
        )
        `,
        [
            userLogin,
            wpHash,
            userLogin,
            email,
            displayName,
        ]
    );

    const userId = result.insertId;

    await conn.execute(
        `
        INSERT INTO \`${WP_TABLE_PREFIX}usermeta\`
        (user_id, meta_key, meta_value)
        VALUES (?, ?, ?)
        `,
        [
            userId,
            "nickname",
            displayName,
        ]
    );

    await conn.execute(
        `
        INSERT INTO \`${WP_TABLE_PREFIX}usermeta\`
        (user_id, meta_key, meta_value)
        VALUES (?, ?, ?)
        `,
        [
            userId,
            `${WP_TABLE_PREFIX}capabilities`,
            'a:1:{s:8:"customer";b:1;}',
        ]
    );

    await conn.execute(
        `
        INSERT INTO \`${WP_TABLE_PREFIX}usermeta\`
        (user_id, meta_key, meta_value)
        VALUES (?, ?, ?)
        `,
        [
            userId,
            `${WP_TABLE_PREFIX}user_level`,
            "0",
        ]
    );

    return {
        ID: userId,
        user_email: email,
        display_name: displayName,
    };
};

// --------------------------------------------------
// API
// --------------------------------------------------

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }

    const {
        action,
        email,
        otp,
    } = req.body || {};

    const normalizedEmail = normalizeEmail(email);

    // --------------------------------------------------
    // BASIC EMAIL VALIDATION
    // --------------------------------------------------

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address.",
        });
    }

    let conn;

    try {

        conn = await createDBConnection();

        // ==================================================
        // SEND OTP
        // ==================================================

        if (action === "send-otp") {

            // Check last OTP
            const [existingOTP] = await conn.execute(
                `SELECT created_at
                 FROM \`${WP_TABLE_PREFIX}svcart_email_otps\`
                 WHERE email = ?
                 LIMIT 1`,
                [normalizedEmail]
            );

            if (existingOTP.length > 0) {

                const createdAt = new Date(
                    existingOTP[0].created_at
                );

                const secondsSinceLastOTP =
                    (Date.now() - createdAt.getTime()) / 1000;

                if (
                    secondsSinceLastOTP <
                    OTP_RESEND_SECONDS
                ) {
                    const remaining = Math.ceil(
                        OTP_RESEND_SECONDS -
                        secondsSinceLastOTP
                    );

                    return res.status(429).json({
                        success: false,
                        message: `Please wait ${remaining} seconds before requesting another code.`,
                        retryAfter: remaining,
                    });
                }
            }

            const generatedOTP = generateOTP();

            const otpHash = hashOTP(generatedOTP);

            // Upsert OTP
            await conn.execute(
                `INSERT INTO \`${WP_TABLE_PREFIX}svcart_email_otps\`
                (
                    email,
                    otp_hash,
                    attempts,
                    created_at,
                    expires_at,
                    verified_at
                )
                VALUES (
                    ?,
                    ?,
                    0,
                    UTC_TIMESTAMP(),
                    DATE_ADD(
                        UTC_TIMESTAMP(),
                        INTERVAL ? MINUTE
                    ),
                    NULL
                )
                ON DUPLICATE KEY UPDATE
                    otp_hash = VALUES(otp_hash),
                    attempts = 0,
                    created_at = UTC_TIMESTAMP(),
                    expires_at = DATE_ADD(
                        UTC_TIMESTAMP(),
                        INTERVAL ? MINUTE
                    ),
                    verified_at = NULL`,
                [
                    normalizedEmail,
                    otpHash,
                    OTP_EXPIRY_MINUTES,
                    OTP_EXPIRY_MINUTES,
                ]
            );

            try {

                await sendOTPEmail(
                    normalizedEmail,
                    generatedOTP
                );

            } catch (emailError) {

                console.error(
                    "OTP email error:",
                    emailError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to send verification email. Please try again.",
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Verification code sent to your email.",
                expiresIn: OTP_EXPIRY_MINUTES * 60,
            });
        }

        // ==================================================
        // VERIFY OTP
        // ==================================================

        if (action === "verify-otp") {

            if (!otp) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter the verification code.",
                });
            }

            const cleanOTP = String(otp)
                .replace(/\D/g, "")
                .substring(0, 6);

            if (cleanOTP.length !== 6) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid 6-digit code.",
                });
            }

            const [otpRows] = await conn.execute(
                `
    SELECT
        *,
        UTC_TIMESTAMP() AS current_utc
    FROM \`${WP_TABLE_PREFIX}svcart_email_otps\`
    WHERE email = ?
      AND expires_at > UTC_TIMESTAMP()
    LIMIT 1
    `,
                [normalizedEmail]
            );

            if (!otpRows || otpRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "This verification code has expired. Please request a new one.",
                });
            }


            const otpRecord = otpRows[0];

            // ==================================================
            // EXPIRY CHECK
            // ==================================================

            // ==================================================
            // DYNAMIC EXPIRY CHECK
            // ==================================================

            const [expiryCheck] = await conn.execute(
                `
    SELECT
        id,
        expires_at,
        UTC_TIMESTAMP() AS current_utc
    FROM \`${WP_TABLE_PREFIX}svcart_email_otps\`
    WHERE email = ?
      AND expires_at > UTC_TIMESTAMP()
    LIMIT 1
    `,
                [normalizedEmail]
            );

            if (!expiryCheck || expiryCheck.length === 0) {

                await conn.execute(
                    `
        DELETE FROM \`${WP_TABLE_PREFIX}svcart_email_otps\`
        WHERE email = ?
        `,
                    [normalizedEmail]
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "This verification code has expired. Please request a new one.",
                });
            }

            if (!expiryCheck || expiryCheck.length === 0) {

                await conn.execute(
                    `
        DELETE FROM \`${WP_TABLE_PREFIX}svcart_email_otps\`
        WHERE email = ?
        `,
                    [normalizedEmail]
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "This verification code has expired. Please request a new one.",
                });
            }

            // Attempt limit
            if (
                Number(otpRecord.attempts) >=
                MAX_OTP_ATTEMPTS
            ) {

                await conn.execute(
                    `DELETE FROM \`${WP_TABLE_PREFIX}svcart_email_otps\`
                     WHERE email = ?`,
                    [normalizedEmail]
                );

                return res.status(429).json({
                    success: false,
                    message:
                        "Too many incorrect attempts. Please request a new code.",
                });
            }

            const submittedHash = hashOTP(cleanOTP);
            const storedHash = String(otpRecord.otp_hash);

            const validOTP =
                submittedHash.length === storedHash.length &&
                crypto.timingSafeEqual(
                    Buffer.from(submittedHash, "utf8"),
                    Buffer.from(storedHash, "utf8")
                );

            if (!validOTP) {

                await conn.execute(
                    `UPDATE \`${WP_TABLE_PREFIX}svcart_email_otps\`
                     SET attempts = attempts + 1
                     WHERE email = ?`,
                    [normalizedEmail]
                );

                const attemptsLeft =
                    MAX_OTP_ATTEMPTS -
                    Number(otpRecord.attempts) -
                    1;

                return res.status(401).json({
                    success: false,
                    message:
                        attemptsLeft > 0
                            ? `Incorrect code. ${attemptsLeft} attempts remaining.`
                            : "Incorrect code. Please request a new one.",
                });
            }

            // Mark verified
            await conn.execute(
                `UPDATE \`${WP_TABLE_PREFIX}svcart_email_otps\`
                 SET verified_at = UTC_TIMESTAMP()
                 WHERE email = ?`,
                [normalizedEmail]
            );

            // ==================================================
            // FIND WORDPRESS USER
            // ==================================================

            const [users] = await conn.execute(
                `SELECT *
                 FROM \`${WP_TABLE_PREFIX}users\`
                 WHERE user_email = ?
                 LIMIT 1`,
                [normalizedEmail]
            );

            let user;

            // Existing user
            if (
                users &&
                users.length > 0
            ) {

                user = users[0];

            } else {

                // New customer
                user =
                    await createWordPressCustomer(
                        conn,
                        normalizedEmail
                    );
            }

            // Delete used OTP
            await conn.execute(
                `DELETE FROM \`${WP_TABLE_PREFIX}svcart_email_otps\`
                 WHERE email = ?`,
                [normalizedEmail]
            );

            // ==================================================
            // LOGIN
            // ==================================================

            createSession(res, user);

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                user: {
                    id: user.ID,
                    email: user.user_email,
                    name:
                        user.display_name ||
                        normalizedEmail.split("@")[0],
                },
            });
        }

        return res.status(400).json({
            success: false,
            message: "Invalid action.",
        });

    } catch (error) {

        console.error(
            "❌ Login API Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong. Please try again.",
        });

    } finally {

        if (conn) {
            await conn.end();
        }
    }
}