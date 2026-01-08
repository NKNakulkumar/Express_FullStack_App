# 🚀 Express Full-Stack Web Application

<div align="center">

![Express.js](https://img.shields.io/badge/Express.js-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)

**Modern full-stack web app with OAuth authentication, URL shortening, and dynamic profile dashboard.**

[🌐 View Live Demo](https://express-fullstack-app.onrender.com/)

</div>

---

## ✨ Features

🔐 **OAuth Authentication** - Google & GitHub login integration  
🔗 **URL Shortener** - Create and track shortened links  
👤 **Profile Dashboard** - Modern UI with avatar upload  
📧 **Email System** - Beautiful HTML emails with MJML  
🎨 **Responsive Design** - Mobile-first, modern interface  
🔒 **Secure** - Argon2 hashing, JWT tokens, session management

---

## 🛠️ Tech Stack

**Backend:** Express.js • MySQL • Drizzle ORM • Arctic (OAuth) • Argon2 • JWT  
**Frontend:** EJS • Modern CSS • Responsive Design  
**Email:** MJML • Resend • Nodemailer  
**Validation:** Zod • Cookie-parser • Express-session

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
BASE_URL=http://localhost:3000

# Database
DATABASE_URL=mysql://username:password@localhost:3306/database_name

# Secrets
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
```

---

## 📁 Project Structure

```
├── config/
│   ├── constant.js/                
│   ├── db.js/                 
│   └── env.js/   
├── controllers/  
│   ├── auth.controllers.js/     # Route controllers
│   ├── post.controllers.js/       # shortner controllers          
├── drizzle/
│   ├── migration/        
│   ├── schema.js/     # Database & schema
│   ├── seed.js/
|          
├── emails/            
├── lib/            
├── middlewares/   # Auth & upload middleware           
├── public/
├── routes/   # Express routes
├── services/
├── validators/   # Helpers & validation
├── views/
├── partials/              # EJS templates
├── .env
└── package.json
```

---

## 🎯 Key Features

### URL Shortener
```javascript
// Create short links
POST /api/shorten
{ "url": "https://example.com/very-long-url" }

// Custom alias support
POST /api/shorten
{ "url": "https://example.com", "alias": "mylink" }
```

### Profile Management
- Upload and manage profile avatars
- Update personal information
- View account statistics
- Track activity

### OAuth Integration
- **Google OAuth 2.0** - Seamless sign-in
- **GitHub OAuth** - Developer-friendly auth
- Automatic account creation and linking

---

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
db:generate: "drizzle-kit generate", # Generate Database
db:migrate: "drizzle-kit migrate",  # Send Database
db:studio: "drizzle-kit studio", # Open Drizzle Studio
db:seed: "node --env-file=.env drizzle/seed.js" # Seed Database
```

---

## 🔒 Security

- **Argon2** password hashing
- **JWT** token authentication
- **SQL injection** prevention via ORM
- **XSS** protection and input validation
- **Secure sessions** with HTTP-only cookies
- **CSRF** protection

---

## 🌐 OAuth Setup

### Google OAuth
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API → Create OAuth credentials
3. Add redirect URI: `http://localhost:3000/auth/google/callback`

### GitHub OAuth
1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Set callback URL: `http://localhost:3000/auth/github/callback`

---

## 📸 Screenshots

| Home Page | URL Shortener | Profile Dashboard |
|-----------|---------------|-------------------|
| ![Home](screenshots/home.png) | ![Shortener](screenshots/shortner.png) | ![Dashboard](screenshots/profile.png) |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Your Name**

[![GitHub](https://img.shields.io/badge/GitHub-@yourusername-181717?style=flat&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Your%20Name-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/yourprofile)
[![Email](https://img.shields.io/badge/Email-your.email@example.com-D14836?style=flat&logo=gmail)](mailto:your.email@example.com)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Built with ❤️ using Express.js, MySQL & Drizzle ORM

</div>