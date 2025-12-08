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
} from '@chakra-ui/react';
import {
  FiEdit,
  FiTrash2,
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiUpload,
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { getAgent, updateAgent, deleteAgent } from '../services/api';
import { getModeColor, formatNumber, formatDate } from '../utils/helpers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://13.233.155.255:8000';
// let API_BASE_URL;

// if (process.env.NODE_ENV === 'development') {
//   // Local dev: use .env value
//   API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://13.233.155.255:8000';
// } else {
//   // Production: proxy through frontend domain
//   API_BASE_URL = '/api';
// }

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
  const [referenceImage, setReferenceImage] = useState(null); // Add this line
  const [formData, setFormData] = useState({});

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Create FormData object if there's a reference image
      let submitData;
      if (referenceImage) {
        submitData = new FormData();
        submitData.append('display_name', formData.display_name);
        submitData.append('prompt', formData.prompt);
        submitData.append('mode', formData.mode);
        submitData.append('is_active', formData.is_active);
        submitData.append('tamper_check', formData.tamper_check);
        submitData.append('reference_image', referenceImage);
      } else {
        submitData = formData;
      }

      await updateAgent(agentName, submitData);
      toast({
        title: 'Agent updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setReferenceImage(null); // Reset after successful update
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

  // Add this new handler
  const handleOCRToggle = (e) => {
    const useOCR = e.target.checked;
    setFormData({
      ...formData,
      mode: useOCR ? 'ocr+llm' : 'llm'
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
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
                {/* <Badge colorScheme={agent.mode === 'ocr+llm' ? 'blue' : 'gray'}>
                  OCR: {agent.mode === 'ocr+llm' ? 'Enabled' : 'Disabled'}
                </Badge> */}
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
                Reference Image
              </Text>

              {agent.reference_image ? (
                <a href={agent.reference_image} target="_blank" rel="noopener noreferrer">
                  <img
                    src={agent.reference_image}
                    alt="Reference"
                    style={{
                      maxWidth: "300px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      cursor: "pointer"
                    }}
                  />
                </a>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No reference image provided
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

          </VStack>
        </Box>
      </VStack>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
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

              {/* <FormControl>
                <FormLabel>Processing Mode</FormLabel>
                <Select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
                  }
                >
                  <option value="ocr+llm">OCR + LLM</option>
                  <option value="llm">LLM Only</option>
                </Select>
              </FormControl> */}

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

              <FormControl>
                <FormLabel>
                  Reference Document Image <Text as="span" color="gray.500" fontSize="sm">(Optional)</Text>
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  size="md"
                  p={1}
                />
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Upload a new reference image to update the existing one (JPG, PNG)
                </Text>
                {referenceImage && (
                  <Text fontSize="sm" color="green.500" mt={2}>
                    ✓ Selected: {referenceImage.name}
                  </Text>
                )}
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

