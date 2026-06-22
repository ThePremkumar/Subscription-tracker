# Subscription Tracker API

A production-ready **RESTful API** for managing subscriptions built with Node.js and Express.js. This service provides comprehensive user authentication, subscription management, and automated email notifications with a scalable, enterprise-grade architecture.

![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

- ✅ **JWT Authentication** - Secure user registration and login
- ✅ **Subscription Management** - Full CRUD operations for subscriptions
- ✅ **Email Notifications** - Automated reminders with custom templates
- ✅ **Environment Configuration** - Separate dev/prod configurations
- ✅ **Centralized Error Handling** - Consistent error responses
- ✅ **Request Validation** - Input validation and sanitization
- ✅ **Database Integration** - MongoDB with Mongoose ODM
- ✅ **Scalable Architecture** - Modular, maintainable codebase
- ✅ **CI/CD Ready** - Production deployment ready

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 16+ |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Email Service** | Nodemailer + Upstash |
| **Environment** | dotenv |
| **Linting** | ESLint |
| **Process Manager** | PM2 (production) |

---

## 📂 Project Structure

```
Subscription-tracker-API/
├── 📁 config/                 # Configuration files
│   ├── database.js            # Database configuration
│   ├── nodemailer.js          # Email service config
│   └── environment.js         # Environment settings
├── 📁 controllers/            # Business logic
│   ├── auth.controller.js     # Authentication logic
│   ├── subscription.controller.js  # Subscription CRUD
│   ├── user.controller.js     # User management
│   └── workflow.controller.js # Email workflows
├── 📁 database/               # Database connection
│   └── mongodb.js             # MongoDB connection setup
├── 📁 middlewares/            # Custom middleware
│   ├── arcject.middleware.js  # Request validation
│   ├── auth.middleware.js     # JWT verification
│   └── error.middleware.js    # Error handling
├── 📁 models/                 # Data models
│   ├── subscription.model.js  # Subscription schema
│   └── user.model.js          # User schema
├── 📁 routes/                 # API routes
│   ├── auth.routes.js         # Auth endpoints
│   ├── subscription.routes.js # Subscription endpoints
│   ├── user.routes.js         # User endpoints
│   └── workflow.routes.js     # Email workflow endpoints
├── 📁 utils/                  # Utility functions
│   ├── email-template.js      # Email templates
│   └── send-email.js          # Email service
├── 📄 app.js                  # Application entry point
├── 📄 package.json            # Dependencies & scripts
├── 📄 .env.development.local  # Development environment
├── 📄 .env.production.local   # Production environment
└── 📄 README.md               # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- MongoDB 5.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ThePremkumar/Subscription-tracker-API.git
   cd Subscription-tracker-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.development.local
   # Edit the file with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

---

## 🔑 Environment Variables

Create a `.env.development.local` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/subscription-tracker

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password

# Upstash Redis (for workflow management)
UPSTASH_URL=your_upstash_redis_url
UPSTASH_TOKEN=your_upstash_token

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Subscriptions

#### Create Subscription
```http
POST /api/subscriptions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Netflix Premium",
  "price": 15.99,
  "currency": "USD",
  "billingCycle": "monthly",
  "nextBillingDate": "2024-01-15T00:00:00.000Z",
  "category": "Entertainment",
  "description": "Streaming service subscription"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": "64a7b8c9d1e2f3a4b5c6d7e9",
    "name": "Netflix Premium",
    "price": 15.99,
    "currency": "USD",
    "billingCycle": "monthly",
    "nextBillingDate": "2024-01-15T00:00:00.000Z",
    "category": "Entertainment",
    "description": "Streaming service subscription",
    "userId": "64a7b8c9d1e2f3a4b5c6d7e8",
    "isActive": true,
    "createdAt": "2024-01-01T10:30:00.000Z"
  }
}
```

#### Get All Subscriptions
```http
GET /api/subscriptions?page=1&limit=10&category=Entertainment
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": "64a7b8c9d1e2f3a4b5c6d7e9",
        "name": "Netflix Premium",
        "price": 15.99,
        "currency": "USD",
        "billingCycle": "monthly",
        "nextBillingDate": "2024-01-15T00:00:00.000Z",
        "category": "Entertainment",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### Get Subscription by ID
```http
GET /api/subscriptions/64a7b8c9d1e2f3a4b5c6d7e9
Authorization: Bearer <jwt_token>
```

#### Update Subscription
```http
PUT /api/subscriptions/64a7b8c9d1e2f3a4b5c6d7e9
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "price": 17.99,
  "nextBillingDate": "2024-02-15T00:00:00.000Z"
}
```

#### Delete Subscription
```http
DELETE /api/subscriptions/64a7b8c9d1e2f3a4b5c6d7e9
Authorization: Bearer <jwt_token>
```

### Users

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

#### Get All Users (Admin only)
```http
GET /api/users
Authorization: Bearer <admin_jwt_token>
```

### Workflow

#### Send Subscription Reminders
```http
POST /api/workflow/send-reminders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reminderDays": 3,
  "subscriptionIds": ["64a7b8c9d1e2f3a4b5c6d7e9"]
}
```

---

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Default expiration: 7 days
- Refresh tokens: Not implemented (coming in v2)

---

## 🛡 Error Handling

All errors follow a consistent JSON format:

```json
{
  "success": false,
  "message": "Detailed error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "stack": "Error stack trace (development only)"
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### API Testing with Postman
Import the Postman collection from `/docs/postman-collection.json`

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Commands

| Environment | Command |
|-------------|---------|
| Development | `npm run dev` |
| Staging | `npm run start:staging` |
| Production | `npm run start:prod` |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style
- Follow ESLint configuration
- Use conventional commit messages
- Add JSDoc comments for functions
- Maintain test coverage above 80%

---

## 📈 Roadmap

- [ ] GraphQL API support
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] Multi-currency support
- [ ] Subscription sharing features

---

## 📞 Support

- **Documentation**: [API Docs](https://api-docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/ThePremkumar/Subscription-tracker-API/issues)
- **Email**: spremkumar2424@gmail.com

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Prem Kumar**
- GitHub: [@ThePremkumar](https://github.com/ThePremkumar)
- LinkedIn: [Connect with me](https://linkedin.com/in/thepremkumar)
- Email: spremkumar2424@gmail.com

---

## 🙏 Acknowledgments

- Express.js community for the excellent framework
- MongoDB team for the robust database solution
- All contributors who helped improve this project

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**

Made with ❤️ by [Prem Kumar](https://github.com/ThePremkumar)

</div>