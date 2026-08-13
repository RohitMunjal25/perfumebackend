# Auth And Account Flow

Use these example files as a frontend reference:

- `api.js`: shared API helper with bearer token.
- `AuthPage.jsx`: register, OTP verify, resend OTP, login with password, login with OTP, forgot password.
- `MyOrderDetailPage.jsx`: order detail page after clicking an order from My Orders.

## Register

Send:

```http
POST /api/auth/register/request
```

```json
{
  "name": "Rohit",
  "email": "rohit@example.com",
  "mobile": "9999999999",
  "password": "password123"
}
```

Backend sends OTP to email. User verifies:

```http
POST /api/auth/otp/verify
```

```json
{
  "email": "rohit@example.com",
  "otp": "123456"
}
```

## Resend OTP

Allowed after 2 minutes:

```http
POST /api/auth/otp/resend
```

```json
{
  "email": "rohit@example.com",
  "purpose": "auth"
}
```

For forgot password use:

```json
{
  "email": "rohit@example.com",
  "purpose": "password_reset"
}
```

## Login With Password

```http
POST /api/auth/password/login
```

```json
{
  "email": "rohit@example.com",
  "password": "password123"
}
```

## Login With OTP

```http
POST /api/auth/login/otp/request
```

```json
{
  "email": "rohit@example.com"
}
```

Then verify through `/api/auth/otp/verify`.

## Forgot Password

```http
POST /api/auth/forgot/request
```

```json
{
  "email": "rohit@example.com"
}
```

Then reset:

```http
POST /api/auth/forgot/verify
```

```json
{
  "email": "rohit@example.com",
  "otp": "123456",
  "password": "newpassword123"
}
```

## My Order Detail

When user clicks any order card from My Orders, open a page like:

```txt
/account/orders/:orderId
```

Hit:

```http
GET /api/orders/:orderId
Authorization: Bearer USER_TOKEN
```

Show:

- Order ID
- Product name, image, quantity, price
- Delivery address
- Payment status and summary
- Tracking link or embedded iframe
- Support link

