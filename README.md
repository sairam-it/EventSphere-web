# EventSphere

A full-stack event management application built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Register, login, and secure user sessions
- **Event Management**: Create, view, and manage events
- **Event Registration**: Users can register for events
- **Dashboard**: Personal dashboard for hosted and participated events
- **Admin Panel**: Admin-only features for event creation
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript support
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Query** for data fetching
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EventSphere
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add the following environment variables to `server/.env`:

```env
PORT=5003
MONGO_URI=mongodb://localhost:27017/eventsphere
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

**Important**: Replace `your_super_secret_jwt_key_here` with a strong, random secret key.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or if using MongoDB as a service
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### 5. Run the Application

#### Option A: Run Both Services Separately

**Terminal 1 - Start the Server:**
```bash
cd server
npm run dev
# or
npm start
```

**Terminal 2 - Start the Client:**
```bash
cd client
npm run dev
```

#### Option B: Run Both Services (Recommended)

**Start the Server:**
```bash
cd server
npm run dev
```

**Start the Client (in a new terminal):**
```bash
cd client
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5003

## 📁 Project Structure

```
EventSphere/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API service functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Client Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server Scripts
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

## 🗄️ Database Models

- **User**: User accounts and authentication
- **Event**: Event information and details
- **Registration**: Event registrations
- **Team**: Team management for team events
- **EventRole**: Roles within events

## 🔐 Authentication

The application uses JWT tokens for authentication. Users can:
- Register with name, email, and password
- Login with email and password
- Access protected routes based on authentication status
- Admin users have additional privileges

## 🎨 UI Components

The project uses a custom UI component library built with:
- **Radix UI** primitives
- **Tailwind CSS** for styling
- **Class Variance Authority** for component variants
- **Lucide React** for icons

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGO_URI in your .env file
   - Verify MongoDB is accessible on the specified port

2. **Port Already in Use**
   - Change the PORT in server/.env
   - Kill existing processes using the port

3. **Dependencies Issues**
   - Delete node_modules and package-lock.json
   - Run `npm install` again

4. **Build Errors**
   - Check for TypeScript errors
   - Ensure all imports are correct
   - Verify all required dependencies are installed

### Development Tips

- Use `npm run dev` for both client and server for hot reloading
- Check browser console for frontend errors
- Check server console for backend errors
- Use MongoDB Compass or similar tools to inspect the database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are installed correctly
4. Verify your environment configuration

---

**Happy Coding! 🎉**
