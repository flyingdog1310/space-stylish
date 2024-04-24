# Space-Stylish API Documentation Guide

## 📖 Overview

Space-Stylish is a complete e-commerce platform API that provides user management, product management, order processing, marketing campaigns, and report analysis functionalities.

## 🚀 Quick Start

### 1. Start the API Server

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit the .env file and fill in the necessary configurations

# Start the API server
npm run dev
```

### 2. View API Documentation

#### Method 1: Using Swagger UI Server

```bash
# Start Swagger UI server
npm run swagger
# or
npm run docs
```

Then visit in your browser: http://localhost:8080

#### Method 2: Using Online Swagger Editor

1. Visit [Swagger Editor](https://editor.swagger.io/)
2. Copy the content of the `swagger.yaml` file into the editor
3. You can see the interactive API documentation on the right side

#### Method 3: Directly View YAML File

Open the `swagger.yaml` file directly to view the complete API specification.

### 3. Test the API

```bash
# Run API tests
npm test
# or
npm run test:api
```

## 🔐 Authentication

### JWT Token Authentication

Most API endpoints require JWT token authentication. The token acquisition process:

1. **Register User**
   ```bash
   POST /api/v1/user/signup
   {
     "name": "User Name",
     "email": "user@example.com",
     "password": "password"
   }
   ```

2. **Login to Get Token**
   ```bash
   POST /api/v1/user/signin
   {
     "provider": "native",
     "email": "user@example.com",
     "password": "password"
   }
   ```

3. **Use Token**
   Add to the Header of subsequent requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

### Facebook Login

```bash
POST /api/v1/user/signin
{
  "provider": "facebook",
  "access_token": "facebook_access_token"
}
```

## 📋 API Endpoint Categories

### 🔑 Authentication Related (`/api/v1/user/`)

| Endpoint   | Method | Description       | Auth Required |
| ---------- | ------ | ----------------- | ------------- |
| `/signup`  | POST   | User Registration | ❌             |
| `/signin`  | POST   | User Login        | ❌             |
| `/profile` | GET    | Get User Profile  | ✅             |

### 🛍️ Product Related (`/api/v1/products/`)

| Endpoint      | Method | Description              | Auth Required |
| ------------- | ------ | ------------------------ | ------------- |
| `/all`        | GET    | Get All Products         | ❌             |
| `/{category}` | GET    | Get Products by Category | ❌             |
| `/search`     | GET    | Search Products          | ❌             |
| `/details`    | GET    | Get Product Details      | ❌             |

### 📦 Order Related (`/api/v1/order/`)

| Endpoint    | Method | Description | Auth Required |
| ----------- | ------ | ----------- | ------------- |
| `/checkout` | POST   | Checkout    | ✅             |

### 📢 Marketing Related (`/api/v1/marketing/`)

| Endpoint     | Method | Description             | Auth Required |
| ------------ | ------ | ----------------------- | ------------- |
| `/campaigns` | GET    | Get Marketing Campaigns | ❌             |

### 📊 Report Related (`/api/v1/report/`)

| Endpoint              | Method | Description                  | Auth Required |
| --------------------- | ------ | ---------------------------- | ------------- |
| `/payments`           | GET    | User Payment Statistics      | ❌             |
| `/total`              | GET    | Total Sales                  | ❌             |
| `/sold_color_percent` | GET    | Color Sales Percentage       | ❌             |
| `/sold_price_percent` | GET    | Price Range Sales Percentage | ❌             |
| `/top-five`           | GET    | Top Five Best Sellers        | ❌             |

### 👨‍💼 Admin Functions (`/admin/`)

| Endpoint           | Method | Description               | Auth Required |
| ------------------ | ------ | ------------------------- | ------------- |
| `/create_role`     | POST   | Create Role               | ✅             |
| `/assign_role`     | POST   | Assign Role               | ✅             |
| `/create_product`  | POST   | Create Product            | ✅             |
| `/create_campaign` | POST   | Create Marketing Campaign | ✅             |
| `/get_orders`      | GET    | Get Order Data            | ✅             |

## 💡 Usage Examples

### 1. Get Product List

```bash
curl -X GET "http://localhost:3000/api/v1/products/all?paging=0" \
  -H "Content-Type: application/json"
```

### 2. Search Products

```bash
curl -X GET "http://localhost:3000/api/v1/products/search?keyword=shirt&paging=0" \
  -H "Content-Type: application/json"
```

### 3. User Registration

```bash
curl -X POST "http://localhost:3000/api/v1/user/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123"
  }'
```

### 4. User Login

```bash
curl -X POST "http://localhost:3000/api/v1/user/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "native",
    "email": "johndoe@example.com",
    "password": "password123"
  }'
```

### 5. Get User Profile (Authentication Required)

```bash
curl -X GET "http://localhost:3000/api/v1/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 6. Checkout (Authentication Required)

```bash
curl -X POST "http://localhost:3000/api/v1/order/checkout" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prime": "tappay_prime_token",
    "order": {
      "list": [
        {
          "id": 1,
          "name": "Product Name",
          "qty": 2,
          "color": {
            "name": "Red"
          }
        }
      ],
      "shipping": "standard",
      "payment": "credit_card",
      "freight": 100,
      "recipient": {
        "name": "Recipient Name",
        "phone": "0912345678",
        "email": "recipient@example.com",
        "address": "Recipient Address",
        "time": "anytime"
      }
    }
  }'
```

## 🔧 Environment Variables

Create a `.env` file and set the following variables:

```env
# Server Configuration
SERVER_PORT=3000
API_VERSION=v1

# JWT Authentication
JWT_SIGN_SECRET=your_jwt_secret_key

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=stylish

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-1
S3_BUCKET=your_bucket_name

# TapPay Configuration
PARTNER_KEY=your_tappay_partner_key
MERCHANT_ID=your_tappay_merchant_id

# Facebook Configuration
APP_ID=your_facebook_app_id
APP_SECRET=your_facebook_app_secret
```

## 🧪 Testing

### Run API Tests

```bash
# Run all tests
npm test

# Set custom API base URL
API_BASE_URL=http://localhost:3000 npm test
```
## 📝 Error Handling

### Common Error Codes

| Status Code | Description           | Solution                            |
| ----------- | --------------------- | ----------------------------------- |
| 200         | Success               | -                                   |
| 400         | Bad Request           | Check request parameter format      |
| 401         | Unauthorized          | Check JWT token                     |
| 403         | Forbidden             | Check permissions or token validity |
| 404         | Not Found             | Check API endpoint path             |
| 500         | Internal Server Error | Check server logs                   |

### Error Response Format

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Version Control

Current API Version: `v1`

Version changes will be reflected in the URL: `/api/v2/...`

## 📄 License

This project is licensed under the MIT License.
