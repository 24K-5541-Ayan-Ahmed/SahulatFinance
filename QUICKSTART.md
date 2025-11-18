# 🚀 Quick Start Guide

**Get the AI-Enhanced Microfinance Loan Management System running in 5 minutes!**

---

## ⚡ Prerequisites Check

Before starting, ensure you have:
- ✅ **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- ✅ **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
- ✅ Command line access (Terminal/PowerShell/Command Prompt)

### Verify Installations

```bash
# Check Python version
python --version
# OR
python3 --version

# Check Node.js version
node --version

# Check npm version
npm --version
```

If all commands work, you're ready to proceed! 🎉

---

## 📦 Installation Steps

### Step 1: Navigate to Project

```bash
cd path/to/Hackathon
```

### Step 2: Backend Setup (2 minutes)

```bash
# Go to backend folder
cd backend

# Create virtual environment (Windows)
python -m venv venv

# Create virtual environment (macOS/Linux)
python3 -m venv venv

# Activate virtual environment
# Windows PowerShell:
venv\Scripts\activate
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

✅ **Backend setup complete!**

### Step 3: Frontend Setup (2 minutes)

**Open a NEW terminal** (keep the first one open) and:

```bash
# Navigate to frontend folder
cd path/to/Hackathon/frontend

# Install dependencies
npm install
```

✅ **Frontend setup complete!**

---

## ▶️ Running the Application

### Terminal 1: Start Backend

```bash
# Make sure you're in the backend folder with venv activated
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Start FastAPI server
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **Backend is running!** API available at `http://localhost:8000`

### Terminal 2: Start Frontend

```bash
# In a NEW terminal, go to frontend folder
cd path/to/Hackathon/frontend

# Start React dev server
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

✅ **Frontend is running!** Application available at `http://localhost:3000`

---

## 🎉 Access the Application

Open your web browser and visit:

```
http://localhost:3000
```

You should see the **AI-Enhanced Microfinance Loan Management System** dashboard! 🎊

---

## 🔍 Quick Tour

### 1️⃣ Register a Client (30 seconds)
1. Click **"Client Onboarding"** tab
2. Click **"+ Register New Client"** button
3. Fill in the form with sample data:
   - **Name**: John Doe
   - **CNIC**: 12345-1234567-1
   - **Phone**: +92-300-1234567
   - **Address**: 123 Main Street, Karachi
   - **Monthly Income**: 50000
   - **Employment Status**: Employed
   - **Existing Loans**: 0
   - **Credit History**: Good
4. Click **"Register & Calculate Risk Score"**
5. ✅ **See AI-calculated risk score!**

### 2️⃣ Create a Loan (30 seconds)
1. Click **"Loan Application"** tab
2. Click **"+ Create New Loan"** button
3. Select the client you just created
4. Enter **Loan Amount**: 100000
5. Click **"Get AI-Powered Loan Suggestions"**
6. ✅ **Review AI recommendations!**
7. Click **"Create Loan & Generate Schedule"**
8. ✅ **Loan created with automatic repayment schedule!**

### 3️⃣ Track Repayments (30 seconds)
1. Click **"Repayment Tracking"** tab
2. Select the loan from the dropdown
3. View installment schedule
4. Click **"Mark as Paid"** on an installment
5. ✅ **See payment tracking in action!**

### 4️⃣ View Dashboard (10 seconds)
1. Click **"Dashboard"** tab
2. ✅ **See statistics and beautiful charts!**

---

## 🛠️ Troubleshooting

### Problem: "pip: command not found" or "python: command not found"

**Solution**: Python not installed or not in PATH
- Download and install Python from [python.org](https://www.python.org/downloads/)
- ✅ **Important**: Check "Add Python to PATH" during installation

### Problem: "npm: command not found" or "node: command not found"

**Solution**: Node.js not installed or not in PATH
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation

### Problem: Backend says "Address already in use" (Port 8000)

**Solution**: Another application is using port 8000

```bash
# Use a different port
uvicorn main:app --reload --port 8001

# Then update frontend proxy:
# Edit frontend/vite.config.js
# Change target: 'http://localhost:8000' to target: 'http://localhost:8001'
```

### Problem: Frontend says port 3000 is in use

**Solution**: Vite will automatically ask if you want to use port 3001
- Press `y` to use the suggested port

### Problem: Backend starts but API calls fail

**Solution**: Check if backend is really running
1. Open browser and visit: `http://localhost:8000/docs`
2. You should see FastAPI Swagger documentation
3. If not, check terminal for error messages

### Problem: Database errors

**Solution**: Delete database and restart
```bash
# Go to backend folder
cd backend

# Delete database file
rm mlms_database.db  # macOS/Linux
del mlms_database.db  # Windows

# Restart backend server
# Database will be recreated automatically
```

### Problem: Module import errors in backend

**Solution**: Virtual environment not activated or dependencies not installed
```bash
# Activate virtual environment
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### Problem: React components not loading

**Solution**: Node modules not installed properly
```bash
# Go to frontend folder
cd frontend

# Delete node_modules and reinstall
rm -rf node_modules  # macOS/Linux
rmdir /s node_modules  # Windows
npm install
```

---

## 📖 Additional Resources

- **Full Documentation**: See `README.md`
- **System Architecture**: See `ARCHITECTURE.md`
- **Database Schema**: See `DATABASE_SCHEMA.sql`
- **API Documentation**: Visit `http://localhost:8000/docs` when backend is running

---

## 🎯 Next Steps

1. **Explore Features**: Try all four modules
2. **Add Sample Data**: Create multiple clients and loans
3. **Test AI Features**: See risk scoring and alerts in action
4. **Review Code**: Check the source code to understand implementation
5. **Customize**: Modify styles, add features, or enhance AI models

---

## 🆘 Still Need Help?

1. **Check Terminal Output**: Look for error messages in both terminals
2. **Browser Console**: Open browser DevTools (F12) → Console tab
3. **API Documentation**: Visit `http://localhost:8000/docs` for API testing
4. **Start Fresh**: 
   ```bash
   # Delete database
   cd backend
   rm mlms_database.db  # or del mlms_database.db on Windows
   
   # Restart both servers
   ```

---

## ✅ Success Checklist

- ✅ Python installed and working
- ✅ Node.js installed and working
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ Backend server running on port 8000
- ✅ Frontend server running on port 3000
- ✅ Application accessible in browser
- ✅ Can register clients and see AI risk scores
- ✅ Can create loans and see AI suggestions
- ✅ Can track repayments and see alerts
- ✅ Can view dashboard with charts

**All checked?** Congratulations! 🎉 You're ready to demo your hackathon project!

---

## 💡 Pro Tips

1. **Keep Both Terminals Open**: Backend and frontend run simultaneously
2. **Use API Docs**: Test APIs at `http://localhost:8000/docs`
3. **Check Database**: Use DB Browser for SQLite to view data
4. **Hot Reload**: Both servers auto-reload on file changes
5. **Clean Data**: Delete `mlms_database.db` to start fresh anytime

---

**Happy Hacking! 🚀**

