import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Pages
import Dashboard from './pages/Dashboard';
import CreateAgent from './pages/CreateAgent';
import MyAgents from './pages/MyAgents';
import AgentDetails from './pages/AgentDetails';
import AgentStats from './pages/AgentStats';
import ValidateDocument from './pages/ValidateDocument';
import Analytics from './pages/Analytics';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Custom theme
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      },
    }),
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
          <Route path="/my-agents" element={<ProtectedRoute><MyAgents /></ProtectedRoute>} />
          <Route path="/agent/:agentName" element={<ProtectedRoute><AgentDetails /></ProtectedRoute>} />
          <Route path="/agent/:agentName/stats" element={<ProtectedRoute><AgentStats /></ProtectedRoute>} />
          <Route path="/validate" element={<ProtectedRoute><ValidateDocument /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
