# Credibility Frontend - Quick Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the frontend root directory:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## 📋 Prerequisites

Before starting the frontend, ensure:

1. ✅ Backend API is running at `http://localhost:8000`
2. ✅ Node.js (v14+) is installed
3. ✅ npm or yarn is available

## 🎯 First Steps

Once the application is running:

1. **Dashboard View**: The app will automatically generate a unique `creator_id` for you
2. **Create Your First Agent**:
   - Click "Create Agent" button
   - Fill in the agent details:
     - Agent Name: `test_validator` (lowercase, underscores, numbers only)
     - Display Name: `Test Document Validator`
     - Prompt: Your validation rules in natural language
     - Mode: Choose `ocr+llm` or `llm`
   - Click "Create Agent"

3. **Validate a Document**:
   - Navigate to "Validate Document"
   - Select your agent
   - Upload a document (PDF, JPG, PNG)
   - Click "Validate Document"
   - View the results!

4. **View Analytics**:
   - Check the Analytics page for overall statistics
   - View individual agent stats for detailed performance metrics

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout/       # Navbar, Sidebar, MainLayout
│   │   └── Agent/        # AgentCard, CreateAgentModal
│   ├── pages/            # Main application pages
│   │   ├── Dashboard.js
│   │   ├── CreateAgent.js
│   │   ├── MyAgents.js
│   │   ├── AgentDetails.js
│   │   ├── AgentStats.js
│   │   ├── ValidateDocument.js
│   │   └── Analytics.js
│   ├── services/         # API integration
│   │   └── api.js
│   ├── utils/           # Helper functions
│   │   ├── storage.js   # Local storage utilities
│   │   └── helpers.js   # General helpers
│   ├── App.js           # Main app with routing
│   └── index.js         # Entry point
├── public/              # Static assets
├── package.json
└── README.md
```

## 🎨 Features

### Agent Management
- ✅ Create custom validation agents
- ✅ Edit agent configuration
- ✅ View agent details
- ✅ Delete/deactivate agents
- ✅ Search and filter agents

### Document Validation
- ✅ Upload PDF, JPG, PNG files
- ✅ Real-time validation
- ✅ Detailed results with extracted data
- ✅ Pass/fail status with scores
- ✅ Validation reasons

### Analytics & Stats
- ✅ Overall dashboard
- ✅ Per-agent statistics
- ✅ User tracking
- ✅ Time-based metrics
- ✅ Success/failure rates

## 🔧 Configuration

### Local Storage
The app automatically manages:
- **Creator ID**: Your unique identifier (auto-generated)
- **User ID**: For tracking validation requests (auto-generated)

These persist across browser sessions.

### API Endpoints
All API calls go through `src/services/api.js`:
- Base URL: Configured via `REACT_APP_API_BASE_URL`
- Timeout: 30 seconds
- Error handling: Automatic with toast notifications

## 🎭 UI/UX Features

- **Dark Mode**: Toggle in the navbar
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Professional Look**: Built with Chakra UI
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Spinners and loading indicators
- **Error Handling**: Graceful error messages

## 🐛 Troubleshooting

### Application won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### API connection errors
1. Check if backend is running at `http://localhost:8000`
2. Verify `.env` file has correct `REACT_APP_API_BASE_URL`
3. Check browser console for CORS errors

### "No agents found" message
1. Create an agent using the "Create Agent" button
2. Make sure the agent is marked as "Active"
3. Check the backend API is responding

## 📝 Example Agent

Here's a sample agent configuration:

**Agent Name**: `age_verifier`  
**Display Name**: `Age Verification Validator`  
**Prompt**:
```
Pass the document only if:
1. The person is 18 years or older
2. The document is not expired
3. The document has a clear photo
4. All required fields are legible
```
**Mode**: `ocr+llm`

## 🔐 Security Notes

This is a POC (Proof of Concept) application:
- ❌ No authentication implemented
- ❌ No rate limiting
- ❌ Creator IDs are stored in localStorage (not secure for production)

For production use, implement:
- ✅ Proper authentication (JWT, OAuth)
- ✅ API rate limiting
- ✅ Secure token storage
- ✅ HTTPS only
- ✅ Input validation
- ✅ CSRF protection

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🎯 Next Steps

1. Test with your backend API
2. Create sample agents
3. Validate test documents
4. Check analytics
5. Customize the theme (optional)

## 💡 Tips

- Use descriptive agent names
- Write clear validation prompts
- Test with various document types
- Monitor agent statistics regularly
- Keep agents active for use

## 📞 Support

For issues or questions:
- Check the browser console for errors
- Verify backend API connectivity
- Review the API documentation
- Check network tab in DevTools

---

Happy validating! 🎉

