import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FiLayers, FiActivity, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { getCreatorStats } from '../services/api';
import { getCreatorId } from '../utils/storage';
import { formatNumber } from '../utils/helpers';

const Analytics = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const creatorId = getCreatorId();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getCreatorStats(creatorId);
      setStats(data);
    } catch (error) {
      toast({
        title: 'Error loading analytics',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
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

  if (!stats) return null;

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch" maxW="7xl" mx="auto">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Analytics Dashboard
          </Heading>
          <Text color="gray.500">
            Overview of all your agents and their performance
          </Text>
        </Box>

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Box
            bg={bg}
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
                {formatNumber(stats.summary?.total_agents || 0)}
              </StatNumber>
              <StatHelpText>
                {stats.summary?.active_agents || 0} active
              </StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={bg}
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
                {formatNumber(stats.summary?.total_hits_all_agents || 0)}
              </StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={bg}
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
                {formatNumber(stats.recent_activity?.this_week || 0)}
              </StatNumber>
              <StatHelpText>Requests</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={bg}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel display="flex" alignItems="center" gap={2}>
                <Icon as={FiTrendingUp} color="orange.500" />
                Today
              </StatLabel>
              <StatNumber>
                {formatNumber(stats.recent_activity?.today || 0)}
              </StatNumber>
              <StatHelpText>Requests</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Time-based Activity */}
        <Box
          bg={bg}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading size="md" mb={6}>
            Recent Activity
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box textAlign="center" p={4}>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Today
              </Text>
              <Text fontSize="4xl" fontWeight="bold" color="blue.500">
                {formatNumber(stats.recent_activity?.today || 0)}
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                requests
              </Text>
            </Box>

            <Box textAlign="center" p={4}>
              <Text fontSize="sm" color="gray.500" mb={2}>
                This Week
              </Text>
              <Text fontSize="4xl" fontWeight="bold" color="purple.500">
                {formatNumber(stats.recent_activity?.this_week || 0)}
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                requests
              </Text>
            </Box>

            <Box textAlign="center" p={4}>
              <Text fontSize="sm" color="gray.500" mb={2}>
                This Month
              </Text>
              <Text fontSize="4xl" fontWeight="bold" color="green.500">
                {formatNumber(stats.recent_activity?.this_month || 0)}
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                requests
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Agent Performance Table */}
        <Box
          bg={bg}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Agent Performance</Heading>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/my-agents')}
            >
              View All Agents
            </Button>
          </HStack>

          {!stats.agents || stats.agents.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>
              No agents yet. Create your first agent to see analytics.
            </Text>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Agent Name</Th>
                    <Th>Display Name</Th>
                    <Th isNumeric>Total Hits</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stats.agents.map((agent) => (
                    <Tr key={agent.agent_name}>
                      <Td fontFamily="mono" fontSize="sm">
                        {agent.agent_name}
                      </Td>
                      <Td>{agent.display_name}</Td>
                      <Td isNumeric fontWeight="bold">
                        {formatNumber(agent.total_hits)}
                      </Td>
                      <Td>
                        {agent.is_active ? (
                          <Badge colorScheme="green">Active</Badge>
                        ) : (
                          <Badge colorScheme="red">Inactive</Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/agent/${agent.agent_name}`)
                            }
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/agent/${agent.agent_name}/stats`)
                            }
                          >
                            Stats
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </VStack>
    </MainLayout>
  );
};

export default Analytics;

