# MERN Authentication System (Backend)

This project is a secure and fully functional **Authentication System** built using the **MERN Stack** and **JSON Web Tokens (JWT)**.  
It includes user registration, login, JWT authentication, refresh tokens, role-based access, and security middlewares.

---

##  Features

###  Authentication
- User registration with validation  
- Secure password hashing (bcrypt)  
- Login with email + password  
- JWT-based authentication  
- Access Token (short-lived)  
- Refresh Token (long-lived, httpOnly cookie)

###  Authorization
- Protected routes  
- Role-based access (Admin/User)  
- Example Admin route

### ⚙ Security Implemented
- Helmet (secured headers)  
- express-rate-limit (prevents brute force attacks)  
- express-mongo-sanitize (prevents NoSQL injection)  
- xss-clean (prevents XSS attacks)  
- CORS enabled  
- httpOnly cookie for refresh token  

### 🧪 Testing
- All routes tested with Postman  
- API documented in `API_DOCS.md`

---

##  Folder Structure

