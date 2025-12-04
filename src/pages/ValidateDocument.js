import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  useToast,
  Select,
  FormControl,
  FormLabel,
  Image,
  Badge,
  Divider,
  Code,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiUpload, FiCheckCircle, FiXCircle, FiFile } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { validateDocument, listAgents } from '../services/api';
import { getCreatorId, getUserId } from '../utils/storage';
import { getStatusColor, formatFileSize, isValidFileType } from '../utils/helpers';

const ValidateDocument = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(searchParams.get('agent') || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [result, setResult] = useState(null);

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dropBg = useColorModeValue('gray.50', 'gray.600');

  const creatorId = getCreatorId();
  const userId = getUserId();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const data = await listAgents({ creator_id: creatorId, is_active: true });
      setAgents(data.agents || []);
      if (data.agents?.length > 0 && !selectedAgent) {
        setSelectedAgent(data.agents[0].agent_name);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error loading agents',
        description: 'Please create an agent first',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!isValidFileType(selectedFile)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PDF, JPG, JPEG, or PNG files only',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a document to validate',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedAgent) {
      toast({
        title: 'No agent selected',
        description: 'Please select an agent for validation',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const validationResult = await validateDocument(selectedAgent, formData);
      setResult(validationResult);

      toast({
        title: 'Validation complete',
        description: `Document ${validationResult.status}: ${validationResult.score}/100`,
        status: validationResult.status === 'pass' ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Validation failed',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  if (loadingAgents) {
    return (
      <MainLayout>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Box>
      </MainLayout>
    );
  }

  if (agents.length === 0) {
    return (
      <MainLayout>
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No Active Agents Found
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            You need to create at least one active agent before you can validate
            documents.
          </AlertDescription>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() => navigate('/create-agent')}
          >
            Create Agent
          </Button>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch" maxW="6xl" mx="auto">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Validate Document
          </Heading>
          <Text color="gray.500">
            Upload a document and validate it against your agent's rules
          </Text>
        </Box>

        {/* Agent Selection */}
        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <FormControl>
            <FormLabel>Select Agent</FormLabel>
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              size="lg"
            >
              {agents.map((agent) => (
                <option key={agent.agent_name} value={agent.agent_name}>
                  {agent.display_name} ({agent.mode})
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* File Upload */}
        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <VStack spacing={4}>
            <Box
              w="full"
              p={8}
              bg={dropBg}
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={borderColor}
              borderRadius="lg"
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.400' }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Icon as={FiUpload} boxSize={12} color="gray.400" mb={4} />
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Click to upload or drag and drop
              </Text>
              <Text fontSize="sm" color="gray.500">
                PDF, JPG, JPEG, or PNG (MAX. 10MB)
              </Text>
            </Box>

            {file && (
              <Box w="full" p={4} bg={dropBg} borderRadius="md">
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FiFile} boxSize={6} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{file.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatFileSize(file.size)}
                      </Text>
                    </VStack>
                  </HStack>
                  <Button size="sm" onClick={handleReset}>
                    Remove
                  </Button>
                </HStack>
              </Box>
            )}

            {preview && (
              <Box w="full" maxW="500px">
                <Image src={preview} alt="Preview" borderRadius="md" />
              </Box>
            )}

            <Button
              colorScheme="blue"
              size="lg"
              w="full"
              onClick={handleValidate}
              isLoading={loading}
              isDisabled={!file || !selectedAgent}
              leftIcon={<Icon as={FiCheckCircle} />}
            >
              Validate Document
            </Button>
          </VStack>
        </Box>

        {/* Validation Result */}
        {result && (
          <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Validation Result</Heading>
                <HStack>
                  <Badge
                    colorScheme={getStatusColor(result.status)}
                    fontSize="lg"
                    px={3}
                    py={1}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon
                      as={result.status === 'pass' ? FiCheckCircle : FiXCircle}
                    />
                    {result.status.toUpperCase()}
                  </Badge>
                  <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                    Score: {result.score}/100
                  </Badge>
                </HStack>
              </HStack>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Validation Reasons:
                </Text>
                <VStack align="stretch" spacing={2}>
                  {result.reason?.map((reason, index) => (
                    <Text key={index} fontSize="sm">
                      • {reason}
                    </Text>
                  ))}
                </VStack>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Document Type:
                </Text>
                <Badge>{result.document_type || 'Unknown'}</Badge>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Extracted Data:
                </Text>
                <Code
                  display="block"
                  whiteSpace="pre"
                  p={4}
                  borderRadius="md"
                  overflowX="auto"
                >
                  {JSON.stringify(result.doc_extracted_json, null, 2)}
                </Code>
              </Box>

              <Divider />

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  Processing Time: {result.processing_time_ms}ms
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Agent: {result.agent_name}
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </MainLayout>
  );
};

export default ValidateDocument;

