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
  useDisclosure,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiPlus, FiLayers, FiSearch } from 'react-icons/fi';
import MainLayout from '../components/Layout/MainLayout';
import AgentCard from '../components/Agent/AgentCard';
import CreateAgentModal from '../components/Agent/CreateAgentModal';
import { listAgents } from '../services/api';
import { getCreatorId } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

const MyAgents = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const creatorId = getCreatorId();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await listAgents({ creator_id: creatorId, limit: 100 });
      setAgents(data.agents || []);
      setFilteredAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      if (error.response?.status !== 404) {
        toast({
          title: 'Error loading agents',
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
    fetchAgents();
  }, []);

  useEffect(() => {
    let filtered = agents;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((agent) =>
        statusFilter === 'active' ? agent.is_active : !agent.is_active
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgents(filtered);
  }, [agents, statusFilter, searchTerm]);

  const handleAgentCreated = () => {
    fetchAgents();
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
            <Heading size="lg">My Agents</Heading>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="blue"
              // onClick={onOpen}
              onClick={()=>navigate('/create-agent')}
            >
              Create Agent
            </Button>
          </HStack>
          <Text color="gray.500">
            Manage all your custom validation agents
          </Text>
        </Box>

        {/* Filters */}
        {agents.length > 0 && (
          <HStack spacing={4}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              maxW="200px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </Select>
          </HStack>
        )}

        {/* Agents Grid */}
        {filteredAgents.length === 0 && agents.length === 0 ? (
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
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="blue"
              onClick={onOpen}
            >
              Create Your First Agent
            </Button>
          </Box>
        ) : filteredAgents.length === 0 ? (
          <Box
            bg={cardBg}
            p={12}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <Text color="gray.500">No agents match your filters</Text>
          </Box>
        ) : (
          <>
            <Text color="gray.500">
              Showing {filteredAgents.length} of {agents.length} agents
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </SimpleGrid>
          </>
        )}
      </VStack>

      <CreateAgentModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleAgentCreated}
      />
    </MainLayout>
  );
};

export default MyAgents;

