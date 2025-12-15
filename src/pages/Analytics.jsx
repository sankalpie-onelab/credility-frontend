import React, { useState, useEffect, useMemo } from 'react';
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiLayers, FiActivity, FiBarChart2, FiTrendingUp, FiSearch, FiX, FiEye, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { getCreatorStats, getAgentUsers } from '../services/api';
import { getCreatorId } from '../utils/storage';
import { formatNumber } from '../utils/helpers';

const Analytics = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('hits_desc');

  // User stats state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSortBy, setUserSortBy] = useState('hits_desc');
  const [allUsers, setAllUsers] = useState([]);

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
      // Fetch users for all agents and aggregate
      // if (data.agents_breakdown && data.agents_breakdown.length > 0) {
      //   await fetchAllUsers(data.agents_breakdown);
      // }
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

  // const fetchAllUsers = async (agents) => {
  //   try {
  //     // Fetch users from all agents in parallel
  //     const userPromises = agents.map(agent =>
  //       getAgentUsers(agent.agent_name, { limit: 1000 })
  //         .then(data => ({
  //           agentName: agent.agent_name,
  //           users: data.users || []
  //         }))
  //         .catch(() => ({ agentName: agent.agent_name, users: [] }))
  //     );

  //     const agentUsersData = await Promise.all(userPromises);

  //     // Aggregate user data
  //     const userMap = new Map();

  //     agentUsersData.forEach(({ agentName, users }) => {
  //       users.forEach(user => {
  //         if (userMap.has(user.user_id)) {
  //           const existing = userMap.get(user.user_id);
  //           existing.total_hits += user.total_requests || 0;
  //           existing.agents_used.add(agentName);
  //           existing.agent_breakdown[agentName] = user.total_requests || 0;

  //           // Update most used agent if needed
  //           if (existing.agent_breakdown[agentName] > (existing.agent_breakdown[existing.most_used_agent] || 0)) {
  //             existing.most_used_agent = agentName;
  //           }
  //         } else {
  //           userMap.set(user.user_id, {
  //             user_id: user.user_id,
  //             total_hits: user.total_requests || 0,
  //             agents_used: new Set([agentName]),
  //             most_used_agent: agentName,
  //             agent_breakdown: { [agentName]: user.total_requests || 0 }
  //           });
  //         }
  //       });
  //     });

  //     // Convert to array and transform Set to Array
  //     const aggregatedUsers = Array.from(userMap.values()).map(user => ({
  //       ...user,
  //       agents_used: Array.from(user.agents_used)
  //     }));

  //     setAllUsers(aggregatedUsers);
  //   } catch (error) {
  //     console.error('Error fetching all users:', error);
  //   }
  // };

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    if (!stats?.agents_breakdown) return [];

    let filtered = [...stats.agents_breakdown];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.agent_name.toLowerCase().includes(search) ||
          agent.display_name.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((agent) => agent.is_active === (isActive ? 1 : 0));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'hits_desc':
          return b.total_hits - a.total_hits;
        case 'hits_asc':
          return a.total_hits - b.total_hits;
        case 'name_asc':
          return a.agent_name.localeCompare(b.agent_name);
        case 'name_desc':
          return b.agent_name.localeCompare(a.agent_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [stats?.agents_breakdown, searchTerm, statusFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('hits_desc');
  };

  // Filter and sort user stats
  const filteredAndSortedUsers = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];

    let filtered = [...allUsers];

    // Apply search filter
    if (userSearchTerm) {
      const search = userSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.user_id.toLowerCase().includes(search) ||
          user.agents_used?.some(agent => agent.toLowerCase().includes(search))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (userSortBy) {
        case 'hits_desc':
          return b.total_hits - a.total_hits;
        case 'hits_asc':
          return a.total_hits - b.total_hits;
        case 'agents_desc':
          return (b.agents_used?.length || 0) - (a.agents_used?.length || 0);
        case 'agents_asc':
          return (a.agents_used?.length || 0) - (b.agents_used?.length || 0);
        case 'user_asc':
          return a.user_id.localeCompare(b.user_id);
        case 'user_desc':
          return b.user_id.localeCompare(a.user_id);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allUsers, userSearchTerm, userSortBy]);

  const handleClearUserFilters = () => {
    setUserSearchTerm('');
    setUserSortBy('hits_desc');
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
                {formatNumber(stats.summary?.total_agents_created || 0)}
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
                {formatNumber(stats.summary?.total_api_hits || 0)}
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
                <Icon as={FiUsers} color="purple.500" />
                Unique Users
              </StatLabel>
              <StatNumber>
                {formatNumber(stats.summary?.total_unique_users || 0)}
              </StatNumber>
              <StatHelpText>All agents</StatHelpText>
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
                {formatNumber(stats.recent_activity?.hits_today || 0)}
              </StatNumber>
              <StatHelpText>Requests</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Recent Activity */}
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
                {formatNumber(stats.recent_activity?.hits_today || 0)}
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
                {formatNumber(stats.recent_activity?.hits_this_week || 0)}
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
                {formatNumber(stats.recent_activity?.hits_this_month || 0)}
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
          <VStack spacing={4} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
              <Heading size="md">Agent Performance</Heading>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/my-agents')}
              >
                View All Agents
              </Button>
            </HStack>

            {/* Filters and Search */}
            {stats.agents_breakdown && stats.agents_breakdown.length > 0 && (
              <Flex
                gap={4}
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'center' }}
              >
                <InputGroup flex={1} maxW={{ md: '300px' }}>
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
                  flex={1}
                  maxW={{ md: '200px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </Select>

                <Select
                  flex={1}
                  maxW={{ md: '200px' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="hits_desc">Hits: High to Low</option>
                  <option value="hits_asc">Hits: Low to High</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </Select>

                {(searchTerm || statusFilter !== 'all' || sortBy !== 'hits_desc') && (
                  <Tooltip label="Clear all filters">
                    <IconButton
                      icon={<FiX />}
                      variant="ghost"
                      onClick={handleClearFilters}
                      aria-label="Clear filters"
                    />
                  </Tooltip>
                )}
              </Flex>
            )}

            {/* Results count */}
            {stats.agents_breakdown && stats.agents_breakdown.length > 0 && (
              <Text fontSize="sm" color="gray.500">
                Showing {filteredAndSortedAgents.length} of {stats.agents_breakdown.length} agents
              </Text>
            )}

            {/* Table */}
            {!stats.agents_breakdown || stats.agents_breakdown.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No agents yet. Create your first agent to see analytics.
              </Text>
            ) : filteredAndSortedAgents.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No agents match your filters. Try adjusting your search.
              </Text>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Agent Name</Th>
                      <Th>Display Name</Th>
                      <Th isNumeric>Total Hits</Th>
                      <Th isNumeric>Unique Users</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAndSortedAgents.map((agent) => (
                      <Tr key={agent.agent_name}>
                        <Td fontFamily="mono" fontSize="sm">
                          {agent.agent_name}
                        </Td>
                        <Td>{agent.display_name}</Td>
                        <Td isNumeric fontWeight="bold">
                          {formatNumber(agent.total_hits)}
                        </Td>
                        <Td isNumeric>
                          {formatNumber(agent.unique_users || 0)}
                        </Td>
                        <Td>
                          {agent.is_active === 1 ? (
                            <Badge colorScheme="green">Active</Badge>
                          ) : (
                            <Badge colorScheme="red">Inactive</Badge>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FiEye />}
                              onClick={() =>
                                navigate(`/agent/${agent.agent_name}/stats`)
                              }
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/agent/${agent.agent_name}`)
                              }
                            >
                              View Agent
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </VStack>
        </Box>

        {/* User Statistics Table */}
        {/* <Box
          bg={bg}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4} align="stretch">
            
            <HStack justify="space-between">
              <Box>
                <Heading size="md">User Statistics</Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Track which users are using your agents
                </Text>
              </Box>
            </HStack>

            
            {allUsers && allUsers.length > 0 && (
              <Flex
                gap={4}
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'center' }}
              >
                <InputGroup flex={1} maxW={{ md: '300px' }}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search users or agents..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <Select
                  flex={1}
                  maxW={{ md: '250px' }}
                  value={userSortBy}
                  onChange={(e) => setUserSortBy(e.target.value)}
                >
                  <option value="hits_desc">Total Hits: High to Low</option>
                  <option value="hits_asc">Total Hits: Low to High</option>
                  <option value="agents_desc">Agents Used: Most to Least</option>
                  <option value="agents_asc">Agents Used: Least to Most</option>
                  <option value="user_asc">User ID: A to Z</option>
                  <option value="user_desc">User ID: Z to A</option>
                </Select>

                {(userSearchTerm || userSortBy !== 'hits_desc') && (
                  <Tooltip label="Clear all filters">
                    <IconButton
                      icon={<FiX />}
                      variant="ghost"
                      onClick={handleClearUserFilters}
                      aria-label="Clear user filters"
                    />
                  </Tooltip>
                )}
              </Flex>
            )}

           
            {allUsers && allUsers.length > 0 && (
              <Text fontSize="sm" color="gray.500">
                Showing {filteredAndSortedUsers.length} of {allUsers.length} users
              </Text>
            )}

            
            {!allUsers || allUsers.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No user activity yet. Users will appear here once they start using your agents.
              </Text>
            ) : filteredAndSortedUsers.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No users match your filters. Try adjusting your search.
              </Text>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>User ID</Th>
                      <Th>Agents Used</Th>
                      <Th isNumeric>Total Hits</Th>
                      <Th>Most Used Agent</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAndSortedUsers.map((user) => (
                      <Tr key={user.user_id}>
                        <Td fontFamily="mono" fontSize="sm" fontWeight="medium">
                          {user.user_id}
                        </Td>
                        <Td>
                          <HStack spacing={1} flexWrap="wrap">
                            {user.agents_used?.slice(0, 3).map((agentName) => (
                              <Badge
                                key={agentName}
                                colorScheme="blue"
                                fontSize="xs"
                              >
                                {agentName}
                              </Badge>
                            ))}
                            {user.agents_used?.length > 3 && (
                              <Badge colorScheme="gray" fontSize="xs">
                                +{user.agents_used.length - 3} more
                              </Badge>
                            )}
                          </HStack>
                        </Td>
                        <Td isNumeric fontWeight="bold">
                          {formatNumber(user.total_hits)}
                        </Td>
                        <Td fontFamily="mono" fontSize="sm">
                          {user.most_used_agent || 'N/A'}
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              
                              navigator.clipboard.writeText(user.user_id);
                              toast({
                                title: 'User ID copied',
                                status: 'success',
                                duration: 2000,
                                isClosable: true,
                              });
                            }}
                          >
                            Copy ID
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </VStack>
        </Box> */}
      </VStack>
    </MainLayout>
  );
};

export default Analytics;
