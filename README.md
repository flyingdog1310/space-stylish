# Space-Stylish E-commerce Website

An e-commerce website with integrated Swagger API documentation.

## Architecture Overview

### Integrated Architecture
- **Main Application**: `app.js` - Contains website functionality and API documentation
- **Swagger UI**: Integrated into the main application, no additional server required
- **API Documentation**: Automatically generated from `swagger.yaml`

### Access Methods
- **Website Homepage**: `http://localhost:${SERVER_PORT}/`
- **API Documentation**: `http://localhost:${SERVER_PORT}/swagger`
- **Direct YAML**: `http://localhost:${SERVER_PORT}/swagger.yaml`

## Quick Start

### Install Dependencies
```bash
npm install
```

### Environment Variables Setup
Create a `.env` file and set the following variables:
```env
SERVER_PORT=3000
API_VERSION=v1
JWT_SIGN_SECRET=your_jwt_secret
PARTNER_KEY=your_tappay_partner_key
MERCHANT_ID=your_tappay_merchant_id
APP_ID=your_facebook_app_id
APP_SECRET=your_facebook_app_secret
```

### Start Application
```bash
# Development mode
npm run dev

# Or production mode
npm start
```

### View API Documentation
After starting, visit `http://localhost:3000/swagger` to view the complete API documentation.

## Directory Structure

```
space-stylish/
├── app.js                 # Main application (with integrated Swagger)
├── swagger.yaml          # API specification file
├── swagger-ui.html       # Swagger UI interface
├── controllers/          # API controllers
├── models/              # Data models
├── views/               # EJS templates
├── public/              # Static resources
└── util/                # Utility functions
```

## API Endpoints

### Product Related
- `GET /api/v1/products` - Get product list
- `POST /api/v1/products` - Create new product
- `GET /api/v1/products/:id` - Get specific product

### User Related
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `GET /api/v1/user/profile` - Get user profile

### Order Related
- `POST /api/v1/order` - Create order
- `GET /api/v1/order/:id` - Get order details

### Marketing Related
- `GET /api/v1/marketing/campaigns` - Get marketing campaigns
- `POST /api/v1/marketing/campaigns` - Create marketing campaign

## Development Guide

### Modifying API Documentation
1. Edit the `swagger.yaml` file
2. Restart the application
3. Visit `/swagger` to see updates

### Adding New API Endpoints
1. Add routes in the corresponding controller
2. Add API specifications in `swagger.yaml`
3. Restart the application

## Important Notes

- Swagger UI is now fully integrated into the main application
- No need to run `swagger-server.js` separately
- All API documentation can be accessed through the main application's port

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Cache**: Redis
- **Authentication**: JWT, Argon2
- **File Upload**: Multer, AWS S3
- **Payment**: TapPay
- **Social Login**: Facebook OAuth
- **API Documentation**: Swagger UI

## Contributing

Welcome to submit Issues and Pull Requests to improve this project!

## License

This project is licensed under the MIT License.
