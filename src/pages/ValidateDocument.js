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
  Code,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  IconButton,
  Input
} from '@chakra-ui/react';
import { FiUpload, FiCheckCircle, FiXCircle, FiFile, FiImage, FiX } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { validateDocument } from '../services/api';
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
  const [singleFiles, setSingleFiles] = useState([]);
  const [singleLinks, setSingleLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [result, setResult] = useState(null);

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

  // Convert s3://bucket/path to https://bucket.s3.amazonaws.com/path
  const convertS3Url = (url) => {
    if (!url) return '';
    return url
      .replace(/^s3:\/\//, 'https://')                // remove s3://
      .replace(/^https:\/\/([^/]+)\//, 'https://$1.s3.amazonaws.com/'); // add domain
  };

  const isValidLink = (value) => {
    // Accept any non-empty string, including database keys or internal IDs.
    // If you later need stricter rules, add them here.
    return Boolean(value && value.trim());
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Single Document - allow up to 3 files (combined with links)
    if (selectedFiles.length === 0) return;

    const remainingSlots = 3 - (singleFiles.length + singleLinks.length);
    if (remainingSlots <= 0) {
      toast({
        title: 'Maximum items reached',
        description: 'You can add up to 3 files/links in total',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const validFiles = filesToAdd.filter(isValidFileType);

    if (validFiles.length !== filesToAdd.length) {
      toast({
        title: 'Invalid file type',
        description: 'Some files were skipped. Only PDF, JPG, JPEG, or PNG files are allowed',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }

    const updatedFiles = [...singleFiles, ...validFiles];
    setSingleFiles(updatedFiles);

    // Keep legacy `file`/preview in sync with the first file so existing logic still works
    const firstFile = updatedFiles[0] || null;
    setFile(firstFile);
    setResult(null);

    if (firstFile && firstFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(firstFile);
    } else {
      setPreview(null);
    }

    if (updatedFiles.length + singleLinks.length >= 3) {
      toast({
        title: 'Maximum items reached',
        description: 'You can add up to 3 files/links in total',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveSingleFile = (index) => {
    const updated = singleFiles.filter((_, i) => i !== index);
    setSingleFiles(updated);

    const firstFile = updated[0] || null;
    setFile(firstFile);

    if (firstFile && firstFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(firstFile);
    } else {
      setPreview(null);
    }
  };

  const handleAddLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed) return;

    if (!isValidLink(trimmed)) {
      toast({
        title: 'Invalid link',
        description: 'Please enter a valid URL (http/https) or a valid database/internal link identifier.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (singleFiles.length + singleLinks.length >= 3) {
      toast({
        title: 'Maximum items reached',
        description: 'You can add up to 3 files/links in total',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSingleLinks([...singleLinks, trimmed]);
    setNewLink('');
    setResult(null);
  };

  const handleRemoveLink = (index) => {
    setSingleLinks(singleLinks.filter((_, i) => i !== index));
  };

  const handleValidate = async () => {
    // Collect up to 3 files from singleFiles array
    const filesToSend = singleFiles.slice(0, 3);

    if (filesToSend.length === 0 && (!file && singleFiles.length === 0)) {
      toast({
        title: 'No file selected',
        description: 'Please select at least one document file to validate',
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
      const fileList = [];
      
      filesToSend.forEach((file) => {
        fileList.push(file);
      });
      if (singleLinks.length > 0) {
        fileList.push(...singleLinks);
      }
      formData.append('files', fileList);
      formData.append('user_id', userId);

      const validationResult = await validateDocument(selectedAgent, formData);
      setResult(validationResult);

      const status = validationResult.final_status?.status || validationResult.status || 'unknown';
      const score = validationResult.score || 0;

      toast({
        title: 'Validation complete',
        description: `Document ${status} with score: ${score}/100`,
        status: status === 'pass' ? 'success' : 'error',
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
    setSingleFiles([]);
    setSingleLinks([]);
    setNewLink('');
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

        {/* Single Document Validation */}
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
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <Icon as={FiUpload} boxSize={12} color="gray.400" mb={4} />
                    <Text fontSize="lg" fontWeight="bold" mb={2}>
                      Click to upload or drag and drop
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Up to 3 items total (files and/or links). PDF, JPG, JPEG, or PNG (MAX. 10MB per file)
                    </Text>
                  </Box>

                  {(singleFiles.length > 0 || singleLinks.length > 0) && (
                    <Box w="full">
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold" fontSize="sm">
                          Selected Items
                        </Text>
                        <Badge colorScheme="blue">
                          {singleFiles.length + singleLinks.length}/3
                        </Badge>
                      </HStack>

                      <VStack spacing={2} align="stretch">
                        {singleFiles.map((f, index) => (
                          <Box key={`file-${index}`} w="full" p={3} bg={dropBg} borderRadius="md">
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={FiFile} boxSize={5} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {f.name}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {formatFileSize(f.size)}
                                    {index === 0 && ' • Used for validation'}
                                  </Text>
                                </VStack>
                              </HStack>
                              <IconButton
                                size="sm"
                                icon={<FiX />}
                                aria-label="Remove file"
                                onClick={() => handleRemoveSingleFile(index)}
                              />
                            </HStack>
                          </Box>
                        ))}

                        {singleLinks.map((link, index) => (
                          <Box key={`link-${index}`} w="full" p={3} bg={dropBg} borderRadius="md">
                            <HStack justify="space-between" align="flex-start">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.500">
                                  Link {index + 1}
                                </Text>
                                <Text fontSize="sm" noOfLines={2} wordBreak="break-all">
                                  {link}
                                </Text>
                              </VStack>
                              <IconButton
                                size="sm"
                                icon={<FiX />}
                                aria-label="Remove link"
                                onClick={() => handleRemoveLink(index)}
                              />
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Add link input */}
                  <HStack w="full" spacing={2}>
                    <Input
                      placeholder="Paste document link (URL or database/internal link)"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      size="sm"
                      isDisabled={singleFiles.length + singleLinks.length >= 3}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddLink}
                      isDisabled={!newLink.trim() || singleFiles.length + singleLinks.length >= 3}
                    >
                      Add Link
                    </Button>
                  </HStack>

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
                    isDisabled={(!file && singleFiles.length === 0) || !selectedAgent}
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
                    colorScheme={getStatusColor(result.final_status?.status || result.status)}
                    fontSize="lg"
                    px={3}
                    py={1}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon
                      as={(result.final_status?.status || result.status) === 'pass' ? FiCheckCircle : FiXCircle}
                    />
                    {(result.final_status?.status || result.status)?.toUpperCase()}
                  </Badge>
                  <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                    Score: {result.score}/100
                  </Badge>
                  {result.final_status?.manual_review === 'YES' && (
                    <Badge colorScheme="orange" fontSize="lg" px={3} py={1}>
                      Human Verification Required
                    </Badge>
                  )}
                </HStack>
              </HStack>

              {/* Final Status Alert */}
              {result.final_status && (
                <>
                  <Alert
                    status={result.final_status.status === 'pass' ? 'success' : 'error'}
                    variant="subtle"
                    borderRadius="md"
                  >
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Final Status: {result.final_status.status.toUpperCase()}</AlertTitle>
                      {result.final_status.manual_review === 'YES' && (
                        <AlertDescription>
                          This validation requires Human Verification. Please check the Human Verification items below.
                        </AlertDescription>
                      )}
                    </Box>
                  </Alert>
                  <Divider />
                </>
              )}

              {/* Human Verification Items */}
              {result.manual_review_items && result.manual_review_items.length > 0 && (
                <>
                  <Box>
                    <Heading size="sm" mb={3}>Human Verification Items</Heading>
                    <VStack align="stretch" spacing={3}>
                      {result.manual_review_items.map((item, index) => {
                        const severityColor = item.severity === 'CRITICAL' ? 'red' :
                                             item.severity === 'HIGH' ? 'orange' :
                                             item.severity === 'MEDIUM' ? 'yellow' : 'gray';
                        return (
                          <Box
                            key={index}
                            p={4}
                            bg={dropBg}
                            borderRadius="md"
                            borderLeftWidth="4px"
                            borderLeftColor={`${severityColor}.500`}
                          >
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="bold" fontSize="sm">
                                {item.field}
                              </Text>
                              <Badge colorScheme={severityColor} fontSize="xs">
                                {item.severity}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                              {item.reason}
                            </Text>
                            <Box
                              p={2}
                              bg={bg}
                              borderRadius="sm"
                              borderWidth="1px"
                              borderColor={borderColor}
                            >
                              <Text fontSize="xs" fontWeight="semibold" color="blue.600" mb={1}>
                                Recommended Action:
                              </Text>
                              <Text fontSize="xs">
                                {item.recommended_action}
                              </Text>
                            </Box>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Documents Array Display */}
              {result.documents && result.documents.length > 0 ? (
                <>
                  <Box>
                    <Heading size="sm" mb={3}>Documents ({result.documents.length})</Heading>
                    <VStack align="stretch" spacing={4}>
                      {result.documents.map((doc, docIndex) => (
                        <Box
                          key={docIndex}
                          p={4}
                          bg={dropBg}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={borderColor}
                        >
                          <HStack justify="space-between" mb={3}>
                            <Text fontWeight="bold" fontSize="md">
                              Document {docIndex + 1}: {doc.doc_id}
                            </Text>
                            <Badge
                              colorScheme={getStatusColor(doc.validation?.status)}
                              fontSize="sm"
                              px={2}
                              py={1}
                            >
                              {doc.validation?.status || 'UNKNOWN'}
                            </Badge>
                          </HStack>

                          {/* Document Validation Details */}
                          {doc.validation?.reason && (
                            <Box mb={3}>
                              <VStack align="stretch" spacing={2}>
                                {doc.validation.reason.pass_conditions?.length > 0 && (
                                  <Box>
                                    <Text fontWeight="semibold" fontSize="xs" color="green.600" mb={1}>
                                      ✓ Passed Conditions:
                                    </Text>
                                    <VStack align="stretch" spacing={1} pl={3}>
                                      {doc.validation.reason.pass_conditions.map((condition, index) => (
                                        <Text key={index} fontSize="xs">
                                          {condition}
                                        </Text>
                                      ))}
                                    </VStack>
                                  </Box>
                                )}

                                {doc.validation.reason.fail_conditions?.length > 0 && (
                                  <Box>
                                    <Text fontWeight="semibold" fontSize="xs" color="red.600" mb={1}>
                                      ✗ Failed Conditions:
                                    </Text>
                                    <VStack align="stretch" spacing={1} pl={3}>
                                      {doc.validation.reason.fail_conditions.map((condition, index) => (
                                        <Text key={index} fontSize="xs">
                                          {condition}
                                        </Text>
                                      ))}
                                    </VStack>
                                  </Box>
                                )}

                                {doc.validation.reason.user_questions?.length > 0 && (
                                  <Box>
                                    <Text fontWeight="semibold" fontSize="xs" color="blue.600" mb={1}>
                                      💬 Questions & Answers:
                                    </Text>
                                    <VStack align="stretch" spacing={1} pl={3}>
                                      {doc.validation.reason.user_questions.map((qa, index) => (
                                        <Text key={index} fontSize="xs">
                                          {qa}
                                        </Text>
                                      ))}
                                    </VStack>
                                  </Box>
                                )}

                                {doc.validation.reason.score_explanation && (
                                  <Box>
                                    <Text fontWeight="semibold" fontSize="xs" color="gray.600" mb={1}>
                                      📊 Score Explanation:
                                    </Text>
                                    <Text fontSize="xs" pl={3}>
                                      {doc.validation.reason.score_explanation}
                                    </Text>
                                  </Box>
                                )}
                              </VStack>
                            </Box>
                          )}

                          {/* Extracted Fields */}
                          {doc.extracted_fields && (
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" mb={2}>
                                Extracted Fields:
                              </Text>
                              {doc.extracted_fields.mandatory && (
                                <Box mb={2}>
                                  <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                                    Mandatory Fields:
                                  </Text>
                                  <Code display="block" whiteSpace="pre" p={2} borderRadius="sm" fontSize="xs" overflowX="auto">
                                    {JSON.stringify(doc.extracted_fields.mandatory, null, 2)}
                                  </Code>
                                </Box>
                              )}
                              {doc.extracted_fields.optional && (
                                <Box>
                                  <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                                    Optional Fields:
                                  </Text>
                                  <Code display="block" whiteSpace="pre" p={2} borderRadius="sm" fontSize="xs" overflowX="auto">
                                    {JSON.stringify(doc.extracted_fields.optional, null, 2)}
                                  </Code>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                  <Divider />
                </>
              ) : null}

              {/* Cross-Validation Section */}
              {result.cross_validation && (
                <>
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Heading size="sm">Cross-Validation</Heading>
                      <Badge
                        colorScheme={getStatusColor(result.cross_validation.status)}
                        fontSize="sm"
                        px={3}
                        py={1}
                      >
                        {result.cross_validation.status}
                      </Badge>
                    </HStack>
                    {result.cross_validation.reason && (
                      <VStack align="stretch" spacing={2}>
                        {result.cross_validation.reason.pass_conditions?.length > 0 && (
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="green.600" mb={1}>
                              ✓ Passed Conditions:
                            </Text>
                            <VStack align="stretch" spacing={1} pl={4}>
                              {result.cross_validation.reason.pass_conditions.map((condition, index) => (
                                <Text key={index} fontSize="sm">
                                  {condition}
                                </Text>
                              ))}
                            </VStack>
                          </Box>
                        )}

                        {result.cross_validation.reason.fail_conditions?.length > 0 && (
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="red.600" mb={1}>
                              ✗ Failed Conditions:
                            </Text>
                            <VStack align="stretch" spacing={1} pl={4}>
                              {result.cross_validation.reason.fail_conditions.map((condition, index) => (
                                <Text key={index} fontSize="sm">
                                  {condition}
                                </Text>
                              ))}
                            </VStack>
                          </Box>
                        )}

                        {result.cross_validation.reason.score_explanation && (
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600" mb={1}>
                              📊 Score Explanation:
                            </Text>
                            <Text fontSize="sm" pl={4}>
                              {result.cross_validation.reason.score_explanation}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    )}
                  </Box>
                  <Divider />
                </>
              )}

              {/* Legacy Single Document Validation Display (Backward Compatibility) */}
              {!result.documents && result.reason && (
                <>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Validation Details:
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      {result.reason?.pass_conditions?.length > 0 && (
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color="green.600" mb={1}>
                            ✅ Passed Conditions:
                          </Text>
                          <VStack align="stretch" spacing={1} pl={4}>
                            {result.reason.pass_conditions.map((condition, index) => (
                              <Text key={index} fontSize="sm">
                                {condition}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {result.reason?.fail_conditions?.length > 0 && (
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color="red.600" mb={1}>
                            ❌ Failed Conditions:
                          </Text>
                          <VStack align="stretch" spacing={1} pl={4}>
                            {result.reason.fail_conditions.map((condition, index) => (
                              <Text key={index} fontSize="sm">
                                {condition}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {result.reason?.user_questions?.length > 0 && (
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color="blue.600" mb={1}>
                            💬 Questions & Answers:
                          </Text>
                          <VStack align="stretch" spacing={1} pl={4}>
                            {result.reason.user_questions.map((qa, index) => (
                              <Text key={index} fontSize="sm">
                                {qa}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {result.reason?.score_explanation && (
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color="gray.600" mb={1}>
                            📊 Score Breakdown:
                          </Text>
                          <Text fontSize="sm" pl={4}>
                            {result.reason.score_explanation}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                  <Divider />
                </>
              )}

              {result.tampering_status === 'enabled' && (
                <>
                  <Divider />
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="bold">
                        Tampering Detection:
                      </Text>
                      <HStack>
                        <Badge
                          colorScheme={result.tampering_details?.tampering_detected ? 'red' : 'green'}
                          fontSize="md"
                          px={3}
                          py={1}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Icon
                            as={result.tampering_details?.tampering_detected ? FiXCircle : FiCheckCircle}
                          />
                          {result.tampering_details?.tampering_detected ? 'TAMPERING DETECTED' : 'NO TAMPERING'}
                        </Badge>
                        <Badge
                          colorScheme={result.tampering_score > 70 ? 'red' : result.tampering_score > 40 ? 'orange' : 'green'}
                          fontSize="md"
                          px={3}
                          py={1}
                        >
                          Risk Score: {result.tampering_score}/100
                        </Badge>
                      </HStack>
                    </HStack>

                    {result.tampering_details && (
                      <VStack align="stretch" spacing={3}>
                        {result.tampering_details.summary && (
                          <Box
                            p={3}
                            bg={result.tampering_details.tampering_detected ? 'red.50' : 'green.50'}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor={result.tampering_details.tampering_detected ? 'red.200' : 'green.200'}
                          >
                            <Text fontSize="sm" fontWeight="semibold" mb={1}>
                              {result.tampering_details.tampering_detected ? '⚠️' : '✅'} Summary:
                            </Text>
                            <Text fontSize="sm">
                              {result.tampering_details.summary}
                            </Text>
                          </Box>
                        )}

                        {result.tampering_details.confidence && (
                          <HStack>
                            <Text fontSize="sm" fontWeight="semibold">
                              Confidence Level:
                            </Text>
                            <Badge
                              colorScheme={
                                result.tampering_details.confidence === 'high' ? 'red' :
                                  result.tampering_details.confidence === 'medium' ? 'orange' : 'yellow'
                              }
                            >
                              {result.tampering_details.confidence.toUpperCase()}
                            </Badge>
                          </HStack>
                        )}

                        {result.tampering_details.indicators?.length > 0 && (
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" mb={2}>
                              🔍 Detected Issues:
                            </Text>
                            <VStack align="stretch" spacing={2} pl={4}>
                              {result.tampering_details.indicators.map((indicator, index) => (
                                <Box
                                  key={index}
                                  p={3}
                                  bg={dropBg}
                                  borderRadius="md"
                                  borderLeftWidth="4px"
                                  borderLeftColor={
                                    indicator.severity === 'high' ? 'red.500' :
                                      indicator.severity === 'medium' ? 'orange.500' : 'yellow.500'
                                  }
                                >
                                  <HStack justify="space-between" mb={1}>
                                    <Text fontSize="sm" fontWeight="bold">
                                      {indicator.type.replace(/_/g, ' ').toUpperCase()}
                                    </Text>
                                    <Badge
                                      colorScheme={
                                        indicator.severity === 'high' ? 'red' :
                                          indicator.severity === 'medium' ? 'orange' : 'yellow'
                                      }
                                      size="sm"
                                    >
                                      {indicator.severity}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    {indicator.description}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    Location: {indicator.location}
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    )}
                  </Box>
                </>
              )}

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Document Information:
                </Text>
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <Text fontSize="sm" fontWeight="semibold" minW="120px">
                      Document Type:
                    </Text>
                    <Badge>{result.document_type || 'Unknown'}</Badge>
                  </HStack>
                  {result.file_name && (
                    <HStack>
                      <Text fontSize="sm" fontWeight="semibold" minW="120px">
                        File Name:
                      </Text>
                      <Text fontSize="sm">{result.file_name}</Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {result.ocr_extraction_status && (
                <>
                  <Divider />
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="bold">
                        OCR Extraction Quality:
                      </Text>
                      <HStack>
                        <Badge
                          colorScheme={result.ocr_extraction_status === 'pass' ? 'green' : 'orange'}
                          fontSize="md"
                          px={3}
                          py={1}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Icon
                            as={result.ocr_extraction_status === 'pass' ? FiCheckCircle : FiXCircle}
                          />
                          {result.ocr_extraction_status.toUpperCase()}
                        </Badge>
                        {result.ocr_extraction_confidence !== null && result.ocr_extraction_confidence !== undefined && (
                          <Badge
                            colorScheme={
                              result.ocr_extraction_confidence >= 80 ? 'green' :
                                result.ocr_extraction_confidence >= 60 ? 'orange' : 'red'
                            }
                            fontSize="md"
                            px={3}
                            py={1}
                          >
                            Confidence: {result.ocr_extraction_confidence.toFixed(1)}%
                          </Badge>
                        )}
                      </HStack>
                    </HStack>

                    {result.ocr_extraction_reason && (
                      <Box
                        p={3}
                        bg={result.ocr_extraction_status === 'pass' ? 'green.50' : 'orange.50'}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={result.ocr_extraction_status === 'pass' ? 'green.200' : 'orange.200'}
                      >
                        <Text fontSize="sm" fontWeight="semibold" mb={1}>
                          {result.ocr_extraction_status === 'pass' ? '✅' : '⚠️'} Details:
                        </Text>
                        <Text fontSize="sm">
                          {result.ocr_extraction_reason}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              <Divider />

              {result.reference_images && result.reference_images.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <HStack mb={3}>
                      <Icon as={FiImage} boxSize={5} />
                      <Text fontWeight="bold">
                        Reference Images Used:
                      </Text>
                      <Badge colorScheme="blue">
                        {result.reference_images.length} image{result.reference_images.length !== 1 ? 's' : ''}
                      </Badge>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                      {result.reference_images.map((imageUrl, index) => {
                        const httpUrl = convertS3Url(imageUrl);
                        return (
                          <Box
                            key={index}
                            p={2}
                            borderWidth="1px"
                            borderColor={borderColor}
                            borderRadius="md"
                            bg={bg}
                            cursor="pointer"
                            onClick={() => window.open(httpUrl, '_blank')}
                          >
                            <Image
                              src={httpUrl}
                              alt={`Reference ${index + 1}`}
                              objectFit="cover"
                              borderRadius="md"
                              maxH="200px"
                              w="full"
                            />
                            <Text fontSize="xs" textAlign="center" mt={2}>
                              Image {index + 1}
                            </Text>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                </>
              )}

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

export default ValidateDocument