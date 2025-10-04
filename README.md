CabPro – MERN Cab Booking System
A full-stack platform for seamless cab bookings, ride management, and user authentication. Built for students and commuters to efficiently schedule, share, and review rides using a robust MERN (MongoDB, Express, React, Node.js) stack.

![CabPro Dashboard](https://img.shields.io/badge/CabPro-MERN-blue?style=for 🚀 Features

📦 Modular Architecture – Well-defined frontend (React + Vite) and backend (Node.js + Express + MongoDB) structure

👥 User Authentication – Secure login, registration, and session management

🚖 Cab Booking – Easy ride creation

📅 Ride Scheduling – Set pickup/dropoff times and notifications

🔍 Filtering & Search – Find rides by route, date, or user

💬 Ride Reviews – Leave feedback for rides and drivers

🧠 Smart Matching – Intelligent algorithms to match riders and optimize groups

📱 Responsive Design – Accessible on desktop, tablet, and mobile

🌙 Dark Mode – Toggle between light/dark themes

🛠️ Tech Stack
Frontend: React (with Vite), Axios, Context API, Custom Hooks

Backend: Node.js, Express, Mongoose (MongoDB ODM)

Authentication: JWT (JSON Web Tokens)

Styling: CSS Modules or Tailwind CSS

APIs: RESTful endpoints for rides, users, and groups

Deployment: Vercel, Heroku, or self-hosted Node.js

📦 Installation
Clone the repository

bash
git clone https://github.com/yourusername/cabpro.git
cd cabpro
Install frontend dependencies

bash
cd frontend
npm install
Install backend dependencies

bash
cd ../backend
npm install
Set up environment variables

Copy .env.example (if provided) to .env in both frontend and backend folders.

For backend .env:

text
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
For frontend .env:

text
VITE_API_URL=http://localhost:5000/api
Start both servers concurrently (from root)

bash
npm install concurrently --save-dev
npm run start
Open your browser

Frontend: http://localhost:5173

Backend API: http://localhost:5000/api

🗃️ Project Structure
text
cabpro/
├── frontend/                # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # Node + Express API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│
├── docs/                    # Documentation, diagrams, reports
├── .env                     # Root environment variables (if needed)
├── .gitignore
├── README.md
└── package.json             # Root scripts (for concurrently)
📊 Data Format Example
Ride Document (MongoDB)
json
{
  "user": "ObjectId",
  "pickup": "Manipal Campus",
  "dropoff": "UDUPI Station",
  "date": "2025-10-12T14:00:00Z",
  "seats": 3,
  "group": ["ObjectId", "ObjectId"],
  "status": "active"
}
💡 Usage
Book a ride: Register/login, fill the ride form, confirm booking.

Join a group: Search available rides, request to join.

Review a ride: After completion, rate and leave comments.

Admin features (optional): Approve rides, manage users.

🔧 Configuration
Environment Variables
Backend
MONGO_URI: MongoDB connection string

JWT_SECRET: JWT signing key

PORT: Backend port (default: 5000)

Frontend
VITE_API_URL: URL of backend API

🚀 Deployment
Vercel / Heroku
Connect repository, set environment variables in dashboard.

Deploy on push to main branch.

Manual Deployment
bash
# Build and run frontend
cd frontend
npm run build
npm run preview

# Start backend
cd ../backend
npm start
🤝 Contributing
Fork the repo

Create a feature branch (git checkout -b feature/add-cab-matching)

Commit changes (git commit -m 'Add cab matching algorithm')

Push branch (git push origin feature/add-cab-matching)

Open a pull request

📄 License
This project is licensed under the MIT License. See LICENSE.

🆘 Support
Documentation: See /docs/

Issues: GitHub Issues

Discussions: GitHub Discussions

🙏 Acknowledgments
Built with React, Node.js, Express, MongoDB

UI inspired by Material UI and Tailwind CSS

Made with 🚕 for student commuters