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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Divider,
  Code,
  List,
  ListItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiArrowLeft, FiUsers, FiActivity, FiFileText } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { getAgentStats, getAgentUsers } from '../services/api';
import { formatNumber, formatDate, calculatePercentage } from '../utils/helpers';

// Sample data for when logs are not available
const SAMPLE_LOGS = [
  {
    user_id: "dev123",
    success: true,
    status: "pass",
    score: 100,
    file_input: "https://via.placeholder.com/400x300?text=Sample+Document",
    document_type: "Identity document",
    processing_time_ms: 5432,
    agent_name: "sample_agent",
    tampering_score: 0,
    tampering_status: "pass",
    ocr_extraction_status: "pass",
    ocr_extraction_confidence: 95.5,
    reason: {
      pass_conditions: ["✓ All validation checks passed"],
      fail_conditions: [],
      score_explanation: "All conditions met"
    },
    doc_extracted_json: {
      "Sample Field": "Sample Value"
    }
  },
  {
    user_id: "dev123",
    success: true,
    status: "fail",
    score: 50,
    file_input: "https://via.placeholder.com/400x300?text=Sample+Document+2",
    document_type: "Identity document",
    processing_time_ms: 6789,
    agent_name: "sample_agent",
    tampering_score: 25,
    tampering_status: "warning",
    ocr_extraction_status: "pass",
    ocr_extraction_confidence: 78.3,
    reason: {
      pass_conditions: ["✓ Some checks passed"],
      fail_conditions: ["✗ Some checks failed"],
      score_explanation: "Partial validation success"
    },
    doc_extracted_json: {
      "Sample Field": "Sample Value 2"
    }
  }
];

const AgentStats = () => {
  const { agentName } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      
      // Use logs from API if available, otherwise use sample data
      setLogs(statsData.logs || SAMPLE_LOGS);
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

  const handleLogClick = (log) => {
    setSelectedLog(log);
    onOpen();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pass':
        return 'green';
      case 'fail':
        return 'red';
      case 'warning':
        return 'orange';
      default:
        return 'gray';
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
              <StatLabel>Hits Today</StatLabel>
              <StatNumber color="gray.800">
                {(formatNumber(stats.today.hits) || 0)}
              </StatNumber>
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
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                This Week
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {formatNumber(stats.this_week?.hits || 0)}
              </Text>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                This Month
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {formatNumber(stats.this_month?.hits || 0)}
              </Text>
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
                    <Th isNumeric>No. Passed Docs</Th>
                    <Th isNumeric>No. Fail Docs</Th>
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

        {/* Logs History */}
        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <HStack justify="space-between" mb={4}>
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              <Icon as={FiFileText} />
              Logs History
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {logs.length} log{logs.length !== 1 ? 's' : ''}
            </Text>
          </HStack>

          {logs.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>
              No logs available
            </Text>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>User ID</Th>
                    <Th>Status</Th>
                    <Th isNumeric>Score</Th>
                    <Th>Document Type</Th>
                    <Th>Tampering</Th>
                    <Th>OCR Status</Th>
                    <Th isNumeric>Processing Time</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {logs.map((log, index) => (
                    <Tr 
                      key={index}
                      _hover={{cursor: 'pointer' }}
                      onClick={() => handleLogClick(log)}
                    >
                      <Td fontFamily="mono" fontSize="xs">
                        {log.user_id}
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </Td>
                      <Td isNumeric fontWeight="bold">
                        {log.score}
                      </Td>
                      <Td fontSize="xs">{log.document_type}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(log.tampering_status)}>
                          {log.tampering_score}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(log.ocr_extraction_status)}>
                          {log.ocr_extraction_confidence?.toFixed(1)}%
                        </Badge>
                      </Td>
                      <Td isNumeric fontSize="xs">
                        {log.processing_time_ms}ms
                      </Td>
                      <Td>
                        <Button 
                          size="xs" 
                          colorScheme="blue" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogClick(log);
                          }}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </VStack>

      {/* Log Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text>Log Details</Text>
              {selectedLog && (
                <Badge colorScheme={getStatusColor(selectedLog.status)} fontSize="md">
                  {selectedLog.status}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLog && (
              <VStack spacing={6} align="stretch">
                {/* Overview Stats */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>User ID</Text>
                    <Text fontFamily="mono" fontSize="sm" fontWeight="bold">
                      {selectedLog.user_id}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Score</Text>
                    <Text fontSize="2xl" fontWeight="bold" color={getStatusColor(selectedLog.status) + '.500'}>
                      {selectedLog.score}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Processing Time</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {selectedLog.processing_time_ms}ms
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Document Type</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {selectedLog.document_type}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Divider />

                {/* Document Image */}
                {selectedLog.file_input && (
                  <Box>
                    <Heading size="sm" mb={3}>Document Image</Heading>
                    <Image 
                      src={selectedLog.file_input} 
                      alt="Document" 
                      maxH="400px" 
                      objectFit="contain"
                      borderRadius="md"
                      border="1px solid"
                      borderColor={borderColor}
                    />
                  </Box>
                )}

                {/* Validation Results */}
                <Box>
                  <Heading size="sm" mb={3}>Validation Results</Heading>
                  <Box 
                    p={4} 
                    // bg={useColorModeValue('gray.50', 'gray.600')} 
                    borderRadius="md"
                  >
                    <Text fontSize="sm" mb={2} fontWeight="bold">
                      {selectedLog.reason?.score_explanation}
                    </Text>
                    
                    {selectedLog.reason?.pass_conditions?.length > 0 && (
                      <Box mb={3}>
                        <Text fontSize="sm" fontWeight="bold" color="green.500" mb={1}>
                          Passed Conditions:
                        </Text>
                        <List spacing={1}>
                          {selectedLog.reason.pass_conditions.map((condition, i) => (
                            <ListItem key={i} fontSize="xs" color="green.600">
                              {condition}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {selectedLog.reason?.fail_conditions?.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="red.500" mb={1}>
                          Failed Conditions:
                        </Text>
                        <List spacing={1}>
                          {selectedLog.reason.fail_conditions.map((condition, i) => (
                            <ListItem key={i} fontSize="xs" color="red.600">
                              {condition}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Extracted Data */}
                {selectedLog.doc_extracted_json && (
                  <Box>
                    <Heading size="sm" mb={3}>Extracted Data</Heading>
                    <Code 
                      display="block" 
                      whiteSpace="pre" 
                      p={4} 
                      borderRadius="md"
                      fontSize="xs"
                    >
                      {JSON.stringify(selectedLog.doc_extracted_json, null, 2)}
                    </Code>
                  </Box>
                )}

                {/* OCR Information */}
                <Box>
                  <Heading size="sm" mb={3}>OCR Analysis</Heading>
                  <SimpleGrid columns={3} spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Status</Text>
                      <Badge colorScheme={getStatusColor(selectedLog.ocr_extraction_status)}>
                        {selectedLog.ocr_extraction_status}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Confidence</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {selectedLog.ocr_extraction_confidence?.toFixed(2)}%
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Details</Text>
                      <Text fontSize="xs">
                        {selectedLog.ocr_extraction_reason || 'N/A'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Tampering Analysis */}
                {selectedLog.tampering_details && (
                  <Box>
                    <Heading size="sm" mb={3}>Tampering Analysis</Heading>
                    <Box 
                      p={4} 
                      // bg={useColorModeValue('red.50', 'red.900')} 
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="red.200"
                    >
                      <HStack mb={3}>
                        <Badge colorScheme="red" fontSize="md">
                          Risk Score: {selectedLog.tampering_score}
                        </Badge>
                        <Badge colorScheme="orange">
                          {selectedLog.tampering_details.confidence} confidence
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" mb={3}>
                        {selectedLog.tampering_details.summary}
                      </Text>

                      {selectedLog.tampering_details.indicators?.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Indicators:
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {selectedLog.tampering_details.indicators.map((indicator, i) => (
                              <Box 
                                key={i} 
                                p={2} 
                                // bg={useColorModeValue('white', 'gray.700')} 
                                borderRadius="md"
                                fontSize="xs"
                              >
                                <HStack justify="space-between" mb={1}>
                                  <Badge colorScheme={
                                    indicator.severity === 'high' ? 'red' : 
                                    indicator.severity === 'medium' ? 'orange' : 'yellow'
                                  }>
                                    {indicator.type}
                                  </Badge>
                                  <Text fontSize="xs" color="gray.500">
                                    {indicator.location}
                                  </Text>
                                </HStack>
                                <Text>{indicator.description}</Text>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MainLayout>
  );
};

export default AgentStats;