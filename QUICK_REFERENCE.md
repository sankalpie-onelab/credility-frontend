# Credibility Frontend - Quick Reference Card

## 🚀 Quick Start (3 Steps)

1. **Create `.env` file** (see ENV_SETUP.txt)
   ```
   REACT_APP_API_BASE_URL=http://localhost:8000
   ```

2. **Install & Run**
   ```bash
   npm install
   npm start
   ```

3. **Open browser**: `http://localhost:3000`

---

## 📱 Navigation Menu

| Page | Route | Purpose |
|------|-------|---------|
| **Dashboard** | `/` | Overview & quick stats |
| **Create Agent** | `/create-agent` | Create new validation agent |
| **My Agents** | `/my-agents` | List all agents (search/filter) |
| **Validate Document** | `/validate` | Upload & validate documents |
| **Analytics** | `/analytics` | View all statistics |
| **Agent Details** | `/agent/:name` | View/edit specific agent |
| **Agent Stats** | `/agent/:name/stats` | Agent performance metrics |

---

## 🎯 Main Features

### Create Agent
1. Click "Create Agent" button
2. Fill form:
   - Agent Name: `my_validator` (lowercase, underscores)
   - Display Name: `My Document Validator`
   - Prompt: Validation rules in plain English
   - Mode: `ocr+llm` or `llm`
3. Click "Create Agent"

### Validate Document
1. Go to "Validate Document"
2. Select agent from dropdown
3. Upload file (PDF, JPG, PNG)
4. Click "Validate Document"
5. View results (pass/fail, score, extracted data)

### View Stats
1. Go to agent details
2. Click "View Stats"
3. See metrics: hits, success rate, users, timing

---

## 🗂️ Project Structure

```
src/
├── components/        → Reusable UI components
│   ├── Layout/       → Navbar, Sidebar, MainLayout
│   └── Agent/        → AgentCard, CreateAgentModal
├── pages/            → Main pages (7 total)
├── services/         → API integration (api.js)
└── utils/            → Helpers (storage.js, helpers.js)
```

---

## 🔌 API Integration

**Base URL**: `http://localhost:8000` (configured in `.env`)

All endpoints in `src/services/api.js`:
- Agent CRUD operations
- Document validation
- Statistics & analytics

---

## 💾 Local Storage

Auto-generated IDs:
- **Creator ID**: `creator_TIMESTAMP_RANDOM`
- **User ID**: `user_TIMESTAMP_RANDOM`

View in Navbar → User menu

---

## 🎨 UI Features

- ✅ Dark mode toggle (Navbar)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Toast notifications (success/error/info)
- ✅ Loading spinners
- ✅ Search & filters
- ✅ Empty states with CTAs

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **App won't start** | Run `npm install` again |
| **API errors** | Check backend is running, verify `.env` |
| **"No agents found"** | Create an agent first |
| **Upload fails** | Check file type (PDF/JPG/PNG only) |
| **Stats not loading** | Make sure agent has been used at least once |

---

## 📝 Quick Tips

1. **Agent Names**: Must be lowercase, numbers, underscores (e.g., `age_check_2024`)
2. **File Size**: Max 10MB for uploads
3. **Processing Modes**:
   - `ocr+llm`: Better for scanned documents (slower)
   - `llm`: Faster for clear images
4. **Validation Prompts**: Be specific! Detail all conditions needed
5. **Dark Mode**: Persists across sessions

---

## 🔧 Development Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server |
| `npm build` | Create production build |
| `npm test` | Run tests |

---

## 📚 Documentation Files

- **README.md** - Complete project documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **PROJECT_SUMMARY.md** - Full feature list & technical details
- **ENV_SETUP.txt** - Environment configuration help
- **QUICK_REFERENCE.md** - This file!

---

## 🎯 Example Use Case

**Goal**: Validate driver's licenses for age 21+

1. Create agent:
   - Name: `age_21_check`
   - Display: `Age 21+ License Validator`
   - Prompt: 
     ```
     Pass only if:
     1. Document is a valid driver's license
     2. Person is 21 years or older
     3. License is not expired
     4. All text is clearly legible
     ```
   - Mode: `ocr+llm`

2. Test with a license image
3. View validation results
4. Check stats to see usage

---

## ✨ Key Shortcuts

- **Create Agent**: Dashboard → "Create Agent" button
- **Quick Validate**: Agent card → "Validate Document" link
- **View Stats**: Agent card → "Stats" button
- **Edit Agent**: Agent details → "Edit" button

---

## 🎉 You're Ready!

The frontend is fully functional and ready to use with your backend API.

**Next**: Create your first agent and validate a document!

---

*For detailed documentation, see README.md and SETUP_GUIDE.md*

