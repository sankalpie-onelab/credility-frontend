import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Divider,
  Code,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormErrorMessage,
  FormHelperText,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Image,
  IconButton,
  Card,
  CardBody,
} from '@chakra-ui/react';
import {
  FiEdit,
  FiTrash2,
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiUpload,
  FiImage,
  FiX,
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { getAgent, updateAgent, deleteAgent } from '../services/api';
import { getModeColor, formatNumber, formatDate } from '../utils/helpers';
import { getCreatorId } from '../utils/storage';
import CrossValidation from '../components/CrossValidation/CrossValidation';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://13.233.155.255:8000';

const AgentDetails = () => {
  const { agentName } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Updated state structure for references with contexts
  const [references, setReferences] = useState([
    { image: null, context: '' },
  ]);

  const [formData, setFormData] = useState({});

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.800');

  // Convert s3://bucket/path to https://bucket.s3.amazonaws.com/path
  const convertS3Url = (url) => {
    if (!url) return '';
    return url
      .replace(/^s3:\/\//, 'https://')                // remove s3://
      .replace(/^https:\/\/([^/]+)\//, 'https://$1.s3.amazonaws.com/'); // add domain
  };

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const data = await getAgent(agentName);
      setAgent(data.agent);
      setFormData({
        display_name: data.agent.display_name,
        prompt: data.agent.prompt,
        mode: data.agent.mode,
        is_active: Boolean(data.agent.is_active),
        tamper_check: Boolean(data.agent.tamper_check),
      });
    } catch (error) {
      toast({
        title: 'Error loading agent',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/my-agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [agentName]);

  // Handle image file change for a specific reference
  const handleReferenceImageChange = (index, file) => {
    setReferences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image: file };
      return updated;
    });
  };

  // Handle context text change for a specific reference
  const handleReferenceContextChange = (index, context) => {
    setReferences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], context };
      return updated;
    });
  };

  // Add a new reference slot (up to 5)
  const handleAddReference = () => {
    if (references.length < 5) {
      setReferences((prev) => [...prev, { image: null, context: '' }]);
    } else {
      toast({
        title: 'Maximum references reached',
        description: 'You can add up to 5 reference images',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Remove a specific reference
  const handleRemoveReference = (indexToRemove) => {
    if (references.length > 1) {
      setReferences((prev) => prev.filter((_, index) => index !== indexToRemove));
    } else {
      // If it's the last one, just reset it
      setReferences([{ image: null, context: '' }]);
    }
  };

  const handleUpdate = async () => {
    // Validate references: if an image is provided, context should also be provided
    let hasError = false;
    references.forEach((ref, index) => {
      if (ref.image && !ref.context.trim()) {
        toast({
          title: 'Validation Error',
          description: `Please provide context for reference #${index + 1}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        hasError = true;
      }
    });

    if (hasError) return;

    setUpdating(true);
    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append('agent_name', agentName);
      submitData.append('creator_id', getCreatorId());
      submitData.append('display_name', formData.display_name);
      submitData.append('description', formData.prompt);
      submitData.append('OCR', (formData.mode === 'ocr+llm').toString());
      submitData.append('is_active', formData.is_active.toString());
      submitData.append('tamper', formData.tamper_check.toString());

      // Append reference images and contexts with numbered field names
      references.forEach((ref, index) => {
        if (ref.image) {
          const refNumber = index + 1;
          submitData.append(`reference_${refNumber}`, ref.image);
          submitData.append(`reference_${refNumber}_context`, ref.context);
        }
      });

      const result = await updateAgent(agentName, submitData);

      toast({
        title: 'Agent updated successfully',
        description: result.message || 'Your agent has been updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setReferences([{ image: null, context: '' }]); // Reset after successful update
      fetchAgent();
      onEditClose();
    } catch (error) {
      toast({
        title: 'Error updating agent',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAgent(agentName);
      toast({
        title: 'Agent deactivated',
        description: 'The agent has been deactivated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/my-agents');
    } catch (error) {
      toast({
        title: 'Error deleting agent',
        description: error.response?.data?.detail || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(agent.endpoint);
    toast({
      title: 'Endpoint copied!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleOCRToggle = (e) => {
    const useOCR = e.target.checked;
    setFormData({
      ...formData,
      mode: useOCR ? 'ocr+llm' : 'llm'
    });
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

  if (!agent) return null;

  return (
    <MainLayout>
      <VStack spacing={8} align="stretch" maxW="6xl" mx="auto">
        {/* Header */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <VStack align="start" spacing={1}>
              <HStack>
                <Heading size="lg">{agent.display_name}</Heading>
                {agent.is_active ? (
                  <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
                    <Icon as={FiCheckCircle} /> Active
                  </Badge>
                ) : (
                  <Badge colorScheme="red" display="flex" alignItems="center" gap={1}>
                    <Icon as={FiXCircle} /> Inactive
                  </Badge>
                )}
              </HStack>
              <Text fontSize="sm" color="gray.500" fontFamily="mono">
                {agent.agent_name}
              </Text>
            </VStack>

            <HStack>
              <Button
                leftIcon={<Icon as={FiUpload} />}
                onClick={() => navigate(`/validate?agent=${agent.agent_name}`)}
              >
                Validate Document
              </Button>
              <Button
                leftIcon={<Icon as={FiBarChart2} />}
                variant="outline"
                onClick={() => navigate(`/agent/${agent.agent_name}/stats`)}
              >
                View Stats
              </Button>
              <Button
                leftIcon={<Icon as={FiEdit} />}
                variant="outline"
                onClick={onEditOpen}
              >
                Edit
              </Button>
              <Button
                leftIcon={<Icon as={FiTrash2} />}
                variant="outline"
                colorScheme="red"
                onClick={onDeleteOpen}
              >
                Delete
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Stat>
              <StatLabel>Total Hits</StatLabel>
              <StatNumber>{formatNumber(agent.total_hits)}</StatNumber>
              <StatHelpText>All time requests</StatHelpText>
            </Stat>
          </Box>
          <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Stat>
              <StatLabel>Created</StatLabel>
              <StatNumber fontSize="lg">{formatDate(agent.created_at)}</StatNumber>
              <StatHelpText>Creation date</StatHelpText>
            </Stat>
          </Box>
          <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Stat>
              <StatLabel>Last Updated</StatLabel>
              <StatNumber fontSize="lg">{formatDate(agent.updated_at)}</StatNumber>
              <StatHelpText>Last modification</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Details */}
        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>
                API Endpoint
              </Text>
              <HStack>
                <Code p={3} borderRadius="md" flex={1}>
                  {API_BASE_URL}{agent.endpoint}
                </Code>
                <Button leftIcon={<Icon as={FiCopy} />} onClick={copyEndpoint}>
                  Copy
                </Button>
              </HStack>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                Validation description
              </Text>
              <Text whiteSpace="pre-wrap">{agent.prompt}</Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                Reference Images
              </Text>

              {agent.reference_images && agent.reference_images.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {agent.reference_images.map((imageUrl, index) => {
                    const publicUrl = convertS3Url(imageUrl);
                    return (
                      <Box
                        key={index}
                        as="a"
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                      >
                        <Image
                          src={publicUrl}
                          alt={`Reference ${index + 1}`}
                          borderRadius="8px"
                          border="1px solid"
                          borderColor={borderColor}
                          w="100%"
                          h="200px"
                          objectFit="cover"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                          Reference {index + 1}
                        </Text>
                      </Box>
                    )
                  })}
                </SimpleGrid>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No reference images provided
                </Text>
              )}
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                OCR
              </Text>

              <HStack align="center">
                <Switch
                  isChecked={agent.mode === 'ocr+llm'}
                  isReadOnly
                  isDisabled
                  colorScheme="blue"
                  size="lg"
                />
                <Text fontWeight="medium">
                  {agent.mode === 'ocr+llm' ? 'Enabled' : 'Disabled'}
                </Text>
              </HStack>

              <Text fontSize="sm" color="gray.500" mt={2}>
                {agent.mode === 'ocr+llm'
                  ? 'OCR enabled for text extraction'
                  : 'OCR disabled - using LLM Vision only'}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>
                Tamper Check
              </Text>

              <HStack align="center">
                <Switch
                  isChecked={Boolean(agent.tamper_check)}
                  isReadOnly
                  isDisabled
                  colorScheme="purple"
                  size="lg"
                />
                <Text fontWeight="medium">
                  {agent.tamper_check ? 'ON' : 'OFF'}
                </Text>
              </HStack>

              <Text fontSize="sm" color="gray.500" mt={2}>
                {agent.tamper_check
                  ? "Tamper detection is enabled"
                  : "Tamper detection is disabled"}
              </Text>
            </Box>

            <Divider />

            {/* Cross-Validation Component */}
            <Box>
              <CrossValidation agentName={agent.agent_name} />
            </Box>

          </VStack>
        </Box>
      </VStack>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Edit Agent</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Display Name</FormLabel>
                <Input
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Validation description</FormLabel>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  rows={6}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="ocr-toggle-edit">
                  <HStack spacing={3}>
                    <span>Use OCR</span>
                    <Switch
                      id="ocr-toggle-edit"
                      isChecked={formData.mode === 'ocr+llm'}
                      onChange={handleOCRToggle}
                      colorScheme="blue"
                    />
                  </HStack>
                </FormLabel>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Enable OCR for scanned documents. Leave off for faster processing.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="tamper-toggle-edit">
                  <HStack spacing={3}>
                    <span>Tamper Detection</span>
                    <Switch
                      id="tamper-toggle-edit"
                      isChecked={formData.tamper_check}
                      onChange={(e) =>
                        setFormData({ ...formData, tamper_check: e.target.checked })
                      }
                      colorScheme="purple"
                    />
                  </HStack>
                </FormLabel>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Enable tamper detection to check if documents have been altered.
                </Text>
              </FormControl>

              {/* Cross-Validation Component in Edit Modal */}
              <CrossValidation agentName={agentName} />

              {/* Updated Reference Images Section with Contexts */}
              <FormControl w="full">
                <FormLabel>
                  Reference Document Images{' '}
                  <Text as="span" color="gray.500" fontSize="sm">
                    (Optional - up to 5 images with context)
                  </Text>
                </FormLabel>
                <FormHelperText mb={4}>
                  Upload new reference images with context to replace existing ones. The AI will use these to better understand the document type.
                </FormHelperText>

                <VStack spacing={4} align="stretch">
                  {references.map((ref, index) => (
                    <Card key={index} bg={cardBg} variant="outline">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="semibold" fontSize="sm">
                              Reference #{index + 1}
                            </Text>
                            {references.length > 1 && (
                              <IconButton
                                icon={<FiX />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleRemoveReference(index)}
                                aria-label="Remove reference"
                              />
                            )}
                          </HStack>

                          <FormControl>
                            <FormLabel fontSize="sm">Image</FormLabel>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleReferenceImageChange(index, file);
                                }
                              }}
                              size="sm"
                              p={1}
                            />
                            {ref.image && (
                              <HStack mt={2} spacing={2}>
                                <Icon as={FiImage} color="green.500" />
                                <Text fontSize="sm" color="green.600">
                                  {ref.image.name}
                                </Text>
                              </HStack>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm">Context Description</FormLabel>
                            <Textarea
                              value={ref.context}
                              onChange={(e) => handleReferenceContextChange(index, e.target.value)}
                              placeholder="e.g., In this image you can see that there is no field names are present like Name, Address, DOB etc. The document has a photo on the left side..."
                              rows={3}
                              size="sm"
                            />
                            <FormHelperText fontSize="xs">
                              Describe what's visible in the image, layout, field names, unique characteristics, etc.
                            </FormHelperText>
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}

                  {references.length < 5 && (
                    <Button
                      onClick={handleAddReference}
                      variant="outline"
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<Icon as={FiImage} />}
                    >
                      Add Another Reference Image ({references.length}/5)
                    </Button>
                  )}
                </VStack>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active Status</FormLabel>
                <Switch
                  isChecked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate} isLoading={updating}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Agent
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to deactivate this agent? The agent data will be
              preserved but it will become inactive.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </MainLayout>
  );
};

export default AgentDetails;