# Credibility Frontend

A professional React frontend for the Credibility document validation platform. This application allows users to create custom validation agents and validate documents against user-defined rules.

## Features

- 🎯 **Agent Management**: Create, edit, and manage custom validation agents
- 📄 **Document Validation**: Upload and validate documents (PDF, JPG, PNG) against agent rules
- 📊 **Analytics Dashboard**: View comprehensive statistics and usage analytics
- 🌓 **Dark Mode**: Built-in dark mode support
- 📱 **Responsive Design**: Mobile-friendly interface built with Chakra UI

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router v7** - Client-side routing
- **Chakra UI** - Professional component library
- **Axios** - HTTP client for API calls
- **Local Storage** - For storing user IDs and preferences

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

## Installation

1. Clone the repository:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout/         # Layout components (Navbar, Sidebar, MainLayout)
│   └── Agent/          # Agent-specific components (AgentCard, CreateAgentModal)
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── CreateAgent.js  # Create new agent
│   ├── MyAgents.js     # List all agents
│   ├── AgentDetails.js # Agent details and editing
│   ├── AgentStats.js   # Agent statistics
│   ├── ValidateDocument.js  # Document validation
│   └── Analytics.js    # Analytics dashboard
├── services/           # API service layer
│   └── api.js         # API endpoints
├── utils/             # Utility functions
│   ├── storage.js     # Local storage management
│   └── helpers.js     # Helper functions
├── App.js             # Main app component with routing
└── index.js           # App entry point
```

## Features Overview

### Dashboard
- Overview of all agents
- Quick stats (total agents, requests, activity)
- Recent agents display
- Quick access to create new agents

### Agent Management
- **Create Agent**: Define validation rules in natural language
- **Edit Agent**: Update agent configuration
- **View Details**: See agent information and endpoint
- **Delete Agent**: Deactivate agents (soft delete)
- **Agent Modes**: 
  - `OCR + LLM` - Uses AWS Textract + GPT-4 (for scanned documents)
  - `LLM Only` - Uses GPT-4 Vision API (faster for clear images)

### Document Validation
- Upload PDF, JPG, JPEG, or PNG files
- Select agent for validation
- Real-time validation with detailed results
- View extracted data and validation reasons
- Pass/fail status with confidence scores

### Analytics
- Creator-level statistics
- Per-agent performance metrics
- User activity tracking
- Time-based analytics (today, this week, this month)
- Success/failure rates
- Top users per agent

## Local Storage

The application uses local storage to persist:
- **Creator ID**: Automatically generated unique identifier for the user
- **User ID**: Used for tracking document validation requests

These IDs are automatically generated on first use and persist across sessions.

## API Integration

The frontend communicates with the backend API at `http://localhost:8000`. All API endpoints are defined in `src/services/api.js`.

### Key API Endpoints Used:
- `POST /api/agents/create` - Create new agent
- `GET /api/agents` - List all agents
- `GET /api/agents/{agent_name}` - Get agent details
- `PUT /api/agents/{agent_name}` - Update agent
- `DELETE /api/agents/{agent_name}` - Delete agent
- `POST /api/agent/{agent_name}/validate` - Validate document
- `GET /api/agent/{agent_name}/stats` - Get agent statistics
- `GET /api/creator/{creator_id}/stats` - Get creator statistics

## Styling

The application uses Chakra UI with a custom theme configuration. The theme includes:
- Custom color palette
- Dark mode support
- Responsive breakpoints
- Custom global styles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a proof-of-concept application. For production use, consider adding:
- Authentication and authorization
- Rate limiting
- Error boundaries
- Unit and integration tests
- Performance optimization
- Accessibility improvements

## License

MIT License

## Support

For issues or questions, please contact the development team.
