import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
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
  Button,
  Icon,
} from '@chakra-ui/react';
import { FiArrowLeft, FiUsers, FiActivity } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { getAgentStats, getAgentUsers } from '../services/api';
import { formatNumber, formatDate, calculatePercentage } from '../utils/helpers';

const AgentStats = () => {
  const { agentName } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchData();
  }, [agentName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getAgentStats(agentName),
        getAgentUsers(agentName, { limit: 10 }),
      ]);

      setStats(statsData.stats);
      setUsers(usersData.users || []);
    } catch (error) {
      toast({
        title: 'Error loading stats',
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
        <HStack>
          <Button
            leftIcon={<Icon as={FiArrowLeft} />}
            variant="ghost"
            onClick={() => navigate(`/agent/${agentName}`)}
          >
            Back
          </Button>
          <Box flex={1}>
            <Heading size="lg">Agent Statistics</Heading>
            <Text color="gray.500" fontFamily="mono">
              {agentName}
            </Text>
          </Box>
        </HStack>

        {/* Main Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Box
            bg={bg}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel>Total Requests</StatLabel>
              <StatNumber>{formatNumber(stats.total_hits)}</StatNumber>
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
              <StatLabel>Success Rate</StatLabel>
              <StatNumber color="green.500">
                {(parseFloat(stats.success_rate) || 0).toFixed(1)}%
              </StatNumber>
              <StatHelpText>
                {formatNumber(stats.pass_count)} passed
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
              <StatLabel>Unique Users</StatLabel>
              <StatNumber>{formatNumber(stats.unique_users)}</StatNumber>
              <StatHelpText>Total users</StatHelpText>
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
              <StatLabel>Avg Processing Time</StatLabel>
              <StatNumber>{stats.avg_processing_time_ms}ms</StatNumber>
              <StatHelpText>Per request</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Pass/Fail/Error Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box
            bg={bg}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel>Passed</StatLabel>
              <StatNumber color="green.500">
                {formatNumber(stats.pass_count)}
              </StatNumber>
              <StatHelpText>
                {calculatePercentage(stats.pass_count, stats.total_hits)}% of total
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
              <StatLabel>Failed</StatLabel>
              <StatNumber color="red.500">
                {formatNumber(stats.fail_count)}
              </StatNumber>
              <StatHelpText>
                {calculatePercentage(stats.fail_count, stats.total_hits)}% of total
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
              <StatLabel>Errors</StatLabel>
              <StatNumber color="orange.500">
                {formatNumber(stats.error_count)}
              </StatNumber>
              <StatHelpText>
                {calculatePercentage(stats.error_count, stats.total_hits)}% of total
              </StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Time-based Stats */}
        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Heading size="md" mb={4}>
            Activity Timeline
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                Today
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {formatNumber(stats.today?.hits || 0)}
              </Text>
              <HStack spacing={4} mt={2}>
                <Badge colorScheme="green">
                  {stats.today?.pass || 0} pass
                </Badge>
                <Badge colorScheme="red">{stats.today?.fail || 0} fail</Badge>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                This Week
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {formatNumber(stats.this_week?.hits || 0)}
              </Text>
              <HStack spacing={4} mt={2}>
                <Badge colorScheme="green">
                  {stats.this_week?.pass || 0} pass
                </Badge>
                <Badge colorScheme="red">{stats.this_week?.fail || 0} fail</Badge>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                This Month
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {formatNumber(stats.this_month?.hits || 0)}
              </Text>
              <HStack spacing={4} mt={2}>
                <Badge colorScheme="green">
                  {stats.this_month?.pass || 0} pass
                </Badge>
                <Badge colorScheme="red">{stats.this_month?.fail || 0} fail</Badge>
              </HStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Top Users */}
        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <HStack justify="space-between" mb={4}>
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              <Icon as={FiUsers} />
              Top Users
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Last 10 users
            </Text>
          </HStack>

          {users.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>
              No users yet
            </Text>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>User ID</Th>
                    <Th isNumeric>Requests</Th>
                    <Th isNumeric>Pass</Th>
                    <Th isNumeric>Fail</Th>
                    <Th isNumeric>Errors</Th>
                    <Th>Last Used</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.user_id}>
                      <Td fontFamily="mono" fontSize="xs">
                        {user.user_id}
                      </Td>
                      <Td isNumeric fontWeight="bold">
                        {formatNumber(user.total_requests)}
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme="green">{user.pass_count}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme="red">{user.fail_count}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme="orange">{user.error_count}</Badge>
                      </Td>
                      <Td fontSize="xs">
                        {new Date(user.last_used).toLocaleDateString()}
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

export default AgentStats;

