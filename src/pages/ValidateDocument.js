import React, { useState, useEffect, useCallback } from 'react';
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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  IconButton,
  Input
} from '@chakra-ui/react';
import { FiUpload, FiCheckCircle, FiXCircle, FiFile, FiX } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { validateDocument, validateDocumentWithSupporting } from '../services/api';
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
  const [validationType, setValidationType] = useState('single');
  const [supportingFiles, setSupportingFiles] = useState([]);
  const [supportingFileDescriptions, setSupportingFileDescriptions] = useState([]);

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dropBg = useColorModeValue('gray.50', 'gray.600');

  const creatorId = getCreatorId();
  const userId = getUserId();

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const { listAgents } = await import('../services/api');
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
  }, [creatorId, toast, selectedAgent]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);


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

  const handleSupportingFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files || []);
  
  const validFiles = selectedFiles.filter(f => isValidFileType(f));
  
  if (validFiles.length !== selectedFiles.length) {
    toast({
      title: 'Invalid file type',
      description: 'Some files were skipped. Only PDF, JPG, JPEG, or PNG files are allowed',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  }

  const newFiles = [...supportingFiles, ...validFiles].slice(0, 5);
  setSupportingFiles(newFiles);
  
  // Add empty descriptions for new files
  const newDescriptions = [...supportingFileDescriptions];
  validFiles.forEach(() => {
    newDescriptions.push('');
  });
  setSupportingFileDescriptions(newDescriptions.slice(0, 5));
  
  setResult(null);

  if (newFiles.length >= 5) {
    toast({
      title: 'Maximum files reached',
      description: 'You can upload up to 5 supporting documents',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }
};

  const removeSupportingFile = (index) => {
  setSupportingFiles(supportingFiles.filter((_, i) => i !== index));
  setSupportingFileDescriptions(supportingFileDescriptions.filter((_, i) => i !== index));
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

    if (validationType === 'multi' && supportingFiles.length === 0) {
      toast({
        title: 'No supporting documents',
        description: 'Please upload at least one supporting document for cross-validation',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      if (validationType === 'single') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);

        const validationResult = await validateDocument(selectedAgent, formData);
        setResult(validationResult);

        toast({
          title: 'Validation complete',
          description: `Document ${validationResult.status} with score: ${validationResult.score}/100`,
          status: validationResult.status === 'pass' ? 'success' : 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const formData = new FormData();
        formData.append('main_file', file);
        formData.append('user_id', userId);
        
        supportingFiles.forEach((suppFile, index) => {
          formData.append(`supporting_file_${index + 1}`, suppFile);
          formData.append(`supporting_file_${index + 1}_description`, supportingFileDescriptions[index] || '');
        });

        const validationResult = await validateDocumentWithSupporting(selectedAgent, formData);
        setResult(validationResult);

        toast({
          title: 'Cross-validation complete',
          description: validationResult.overall_message,
          status: validationResult.overall_status === 'pass' ? 'success' : 'error',
          duration: 5000,
          isClosable: true,
        });
      }
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
    setSupportingFiles([]);
    setSupportingFileDescriptions([]);
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
        <Box>
          <Heading size="lg" mb={2}>
            Validate Document
          </Heading>
          <Text color="gray.500">
            Upload a document and validate it against your agent's rules
          </Text>
        </Box>

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
                  {agent.display_name}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Tabs 
          variant="enclosed" 
          colorScheme="blue"
          onChange={(index) => {
            setValidationType(index === 0 ? 'single' : 'multi');
            setResult(null);
          }}
        >
          <TabList>
            <Tab>Single Document Validation</Tab>
            <Tab>Agentic Multi-Doc Cross Validation</Tab>
          </TabList>

          <TabPanels>
            {/* Single Document Validation */}
            <TabPanel px={0}>
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
            </TabPanel>

            {/* Multi-Document Cross Validation */}
            <TabPanel px={0}>
              <VStack spacing={6}>
                {/* Main Document */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} w="full">
                  <Text fontWeight="bold" mb={4}>Main Document</Text>
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
                      onClick={() => document.getElementById('main-file-input').click()}
                    >
                      <input
                        id="main-file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <Icon as={FiUpload} boxSize={12} color="gray.400" mb={4} />
                      <Text fontSize="lg" fontWeight="bold" mb={2}>
                        Click to upload main document
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
                          <Button size="sm" onClick={() => setFile(null)}>
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
                  </VStack>
                </Box>

                {/* Supporting Documents */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} w="full">
                  <HStack justify="space-between" mb={4}>
                    <Text fontWeight="bold">Supporting Documents</Text>
                    <Badge colorScheme="blue">
                      {supportingFiles.length}/5 uploaded
                    </Badge>
                  </HStack>
                  
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
                      onClick={() => document.getElementById('supporting-files-input').click()}
                      opacity={supportingFiles.length >= 5 ? 0.5 : 1}
                      pointerEvents={supportingFiles.length >= 5 ? 'none' : 'auto'}
                    >
                      <input
                        id="supporting-files-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleSupportingFileChange}
                        multiple
                        style={{ display: 'none' }}
                        disabled={supportingFiles.length >= 5}
                      />
                      <Icon as={FiUpload} boxSize={12} color="gray.400" mb={4} />
                      <Text fontSize="lg" fontWeight="bold" mb={2}>
                        Click to upload supporting documents
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Upload up to 5 supporting documents (PDF, JPG, JPEG, PNG)
                      </Text>
                    </Box>

                    {supportingFiles.map((suppFile, index) => (
  <Box key={index} w="full">
    <Box w="full" p={4} bg={dropBg} borderRadius="md" mb={2}>
      <HStack justify="space-between">
        <HStack>
          <Badge colorScheme="purple">{index + 1}</Badge>
          <Icon as={FiFile} boxSize={6} />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold">{suppFile.name}</Text>
            <Text fontSize="sm" color="gray.500">
              {formatFileSize(suppFile.size)}
            </Text>
          </VStack>
        </HStack>
        <IconButton
          size="sm"
          icon={<FiX />}
          onClick={() => removeSupportingFile(index)}
          aria-label="Remove file"
        />
      </HStack>
    </Box>
    <Input
      placeholder={`Description (optional) - e.g., "Medical bill for insurance claim"`}
      size="sm"
      value={supportingFileDescriptions[index] || ''}
      onChange={(e) => {
        const newDescriptions = [...supportingFileDescriptions];
        newDescriptions[index] = e.target.value;
        setSupportingFileDescriptions(newDescriptions);
      }}
      mb={4}
    />
  </Box>
))}
                  </VStack>
                </Box>

                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={handleValidate}
                  isLoading={loading}
                  isDisabled={!file || !selectedAgent || supportingFiles.length === 0}
                  leftIcon={<Icon as={FiCheckCircle} />}
                >
                  Run Agentic Cross Validation
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Multi-Document Validation Result */}
        {result && validationType === 'multi' && (
          <VStack spacing={6} align="stretch">
            {/* Overall Status */}
            {/* <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Overall Validation Result</Heading>
                  <Badge
                    colorScheme={getStatusColor(result.overall_status)}
                    fontSize="xl"
                    px={4}
                    py={2}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon as={result.overall_status === 'pass' ? FiCheckCircle : FiXCircle} />
                    {result.overall_status.toUpperCase()}
                  </Badge>
                </HStack>
                <Text fontSize="md" color="gray.600">
                  {result.overall_message}
                </Text>
              </VStack>
            </Box> */}


            {/* Supporting Documents */}
            {/* <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" mb={4}>Supporting Documents</Heading>
              <VStack spacing={4} align="stretch">
                {result.supporting_documents.map((doc, index) => (
                  <Box key={index} p={4} bg={dropBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Badge colorScheme="purple">{index + 1}</Badge>
                        <Text fontWeight="bold">{doc.file_name}</Text>
                      </HStack>
                      <HStack>
                        <Badge colorScheme={getStatusColor(doc.validation_status)} px={2} py={1}>
                          {doc.validation_status.toUpperCase()}
                        </Badge>
                        <Badge colorScheme="blue" px={2} py={1}>
                          {doc.validation_score}/100
                        </Badge>
                      </HStack>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb={2}>Type: {doc.document_type}</Text>

                    {doc.validation_reason?.pass_conditions?.length > 0 && (
                      <Box mb={2}>
                        <Text fontWeight="semibold" fontSize="xs" color="green.600" mb={1}>
                          ✅ Passed:
                        </Text>
                        <VStack align="stretch" spacing={1} pl={2}>
                          {doc.validation_reason.pass_conditions.map((condition, i) => (
                            <Text key={i} fontSize="xs">{condition}</Text>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {doc.validation_reason?.fail_conditions?.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" fontSize="xs" color="red.600" mb={1}>
                          ❌ Failed:
                        </Text>
                        <VStack align="stretch" spacing={1} pl={2}>
                          {doc.validation_reason.fail_conditions.map((condition, i) => (
                            <Text key={i} fontSize="xs">{condition}</Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box> */}

            {/* Agentic Cross Validation */}
            <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Agentic Cross Validation</Heading>
                  <HStack>
                    <Badge
                      colorScheme={getStatusColor(result.agentic_cross_validation.status)}
                      fontSize="lg"
                      px={3}
                      py={1}
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={result.agentic_cross_validation.status === 'pass' ? FiCheckCircle : FiXCircle} />
                      {result.agentic_cross_validation.status.toUpperCase()}
                    </Badge>
                    <Badge
                      colorScheme={result.agentic_cross_validation.risk_score > 70 ? 'red' : result.agentic_cross_validation.risk_score > 40 ? 'orange' : 'green'}
                      fontSize="lg"
                      px={3}
                      py={1}
                    >
                      Risk Score: {result.agentic_cross_validation.risk_score}/100
                    </Badge>
                  </HStack>
                </HStack>

                <Divider />

                <Box p={3} bg={result.agentic_cross_validation.status === 'pass' ? 'green.50' : 'red.50'} borderRadius="md" borderWidth="1px" borderColor={result.agentic_cross_validation.status === 'pass' ? 'green.200' : 'red.200'}>
                  <Text fontSize="sm">{result.agentic_cross_validation.overall_message}</Text>
                </Box>

                {/* Document Relationship */}
                {result.agentic_cross_validation.document_relationship && (
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Document Relationship</Text>
                      <Badge colorScheme={result.agentic_cross_validation.document_relationship.relationships_valid ? 'green' : 'red'}>
                        {result.agentic_cross_validation.document_relationship.relationships_valid ? 'VALID' : 'INVALID'}
                      </Badge>
                    </HStack>
                    <VStack align="stretch" spacing={1} pl={4}>
                      {result.agentic_cross_validation.document_relationship.findings.map((finding, i) => (
                        <Text key={i} fontSize="sm">• {finding}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Consistency Checks */}
                {result.agentic_cross_validation.contradictions?.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="red.600" mb={2}>
                      ⚠️ Contradictions Found:
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {result.agentic_cross_validation.contradictions.map((contradiction, i) => (
                        <Box key={i} p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" fontWeight="bold">{contradiction.field_name}</Text>
                            <Badge colorScheme="orange" size="sm">
                              {contradiction.severity}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" mb={2}>{contradiction.explanation}</Text>
                          <VStack align="stretch" spacing={1} fontSize="xs" color="gray.600" pl={2}>
                            {contradiction.conflicting_documents?.map((doc, docIndex) => (
                              <Text key={docIndex}>
                                • <Text as="span" fontWeight="bold">{doc.type}:</Text> {doc.value}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* Document Agreement */}
                {result.agentic_cross_validation.document_agreement && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Document Agreement</Text>
                    <HStack spacing={4}>
                      <Badge colorScheme="blue" px={3} py={1}>
                        Total: {result.agentic_cross_validation.document_agreement.total_documents}
                      </Badge>
                      <Badge colorScheme="green" px={3} py={1}>
                        Agreement: {result.agentic_cross_validation.document_agreement.agreement_percentage}%
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" mt={2} color="gray.600">
                      {result.agentic_cross_validation.document_agreement.message}
                    </Text>
                  </Box>
                )}

                {/* Warnings */}
                {result.agentic_cross_validation.warnings?.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" color="orange.600" mb={2}>
                      ⚠️ Warnings:
                    </Text>
                    <VStack align="stretch" spacing={1} pl={4}>
                      {result.agentic_cross_validation.warnings.map((warning, i) => (
                        <Text key={i} fontSize="sm">• {warning}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Processing Info */}
            <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  Total Processing Time: {result.processing_time_ms}ms
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Agent: {result.agent_name}
                </Text>
              </HStack>
            </Box>
          </VStack>
        )}
      </VStack>
    </MainLayout>
  );
};

export default ValidateDocument