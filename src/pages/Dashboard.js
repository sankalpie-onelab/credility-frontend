import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  Icon,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useDisclosure,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiLayers, FiBarChart2, FiActivity } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AgentCard from '../components/Agent/AgentCard';
import CreateAgentModal from '../components/Agent/CreateAgentModal';
import HowItWorksModal from '../components/HowItWorks/HowItWorksModal';
import { listAgents, getCreatorStats } from '../services/api';
import { getCreatorId } from '../utils/storage';
import { formatNumber } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isHowItWorksOpen, onOpen: onHowItWorksOpen, onClose: onHowItWorksClose } = useDisclosure();
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const creatorId = getCreatorId();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch agents and creator stats
      const [agentsData, statsData] = await Promise.all([
        listAgents({ creator_id: creatorId, limit: 10 }),
        getCreatorStats(creatorId),
      ]);

      setAgents(agentsData.agents || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error toast if it's just empty data
      if (error.response?.status !== 404) {
        toast({
          title: 'Error loading dashboard',
          description: error.response?.data?.detail || error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAgentCreated = () => {
    fetchData();
  };

  if (loading) {
    return (
      <MainLayout>
        <Center h="50vh">
          <Spinner size="xl" color="blue.500" />
        </Center>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Heading size="lg">Dashboard</Heading>
            <HStack spacing={3}>
              {/* <Button
                variant="outline"
                colorScheme="blue"
                size="md"
                onClick={onHowItWorksOpen}
              >
                See How It Works
              </Button> */}
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="blue"
                // onClick={onOpen}
                onClick={()=> navigate("/create-agent")}
              >
                Create Agent
              </Button>
            </HStack>
          </HStack>
          <Text color="gray.500">
            Manage your custom validation agents and view analytics
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FiLayers} color="blue.500" />
                Total Agents
              </StatLabel>
              <StatNumber>
                {formatNumber(stats?.summary?.total_agents_created || 0)}
              </StatNumber>
              <StatHelpText>
                {stats?.summary?.active_agents || 0} active
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FiBarChart2} color="green.500" />
                Total Requests
              </StatLabel>
              <StatNumber>
                {formatNumber(stats?.summary?.total_api_hits || 0)}
              </StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FiActivity} color="purple.500" />
                This Week
              </StatLabel>
              <StatNumber>
                {formatNumber(stats?.recent_activity?.hits_this_week || 0)}
              </StatNumber>
              <StatHelpText>Requests</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FiActivity} color="orange.500" />
                Today
              </StatLabel>
              <StatNumber>
                {formatNumber(stats?.recent_activity?.hits_today || 0)}
              </StatNumber>
              <StatHelpText>Requests</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Recent Agents */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Recent Agents</Heading>
            {agents.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/my-agents')}
              >
                View All
              </Button>
            )}
          </HStack>

          {agents.length === 0 ? (
            <Box
              bg={cardBg}
              p={12}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              textAlign="center"
            >
              <Icon as={FiLayers} boxSize={12} color="gray.400" mb={4} />
              <Heading size="md" mb={2} color="gray.500">
                No agents yet
              </Heading>
              <Text color="gray.500" mb={4}>
                Create your first agent to start validating documents
              </Text>
              <Button leftIcon={<Icon as={FiPlus} />} colorScheme="blue" onClick={onOpen}>
                Create Your First Agent
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      <CreateAgentModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleAgentCreated}
      />

      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={onHowItWorksClose} />
    </MainLayout>
  );
};

export default Dashboard;

