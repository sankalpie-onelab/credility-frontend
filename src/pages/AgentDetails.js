import React, { useState, useEffect, useCallback } from 'react';
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
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
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
import { formatNumber, formatDate } from '../utils/helpers';
import { getCreatorId } from '../utils/storage';

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

  const fetchAgent = useCallback(async () => {
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
  }, [agentName, toast, navigate]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);


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


          </VStack>
        </Box>

        {/* Widget Integration Guide */}
        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="blue.600">
              Widget Integration Guide
            </Heading>
            <Text>
              Easily embed this agent's validation in your existing forms. Copy-paste the snippet below:
            </Text>

            {/* Instructions */}
            <VStack spacing={3} align="stretch" mt={4}>
              <Box>
                <Text fontWeight="bold" mb={1}>📦 1. Load the Widget Library</Text>
                <Text fontSize="sm">
                  Add this script to your page before the closing body tag:
                </Text>
                <Code display="block" p={2} mt={1} bg="gray.50" fontSize="xs">
                  {'<script src="http://13.50.14.85/widget/doc-validator-widget.js"></script>'}
                </Code>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>🎯 2. Add HTML Structure</Text>
                <Text fontSize="sm">
                  For each document upload field, add the snippet below. Replace "unique-id-here" with a unique identifier.
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>🚀 3. Initialize</Text>
                <Text fontSize="sm">
                  Add this script after loading the widget:
                </Text>
                <Code display="block" p={2} mt={1} bg="gray.50" fontSize="xs">
                  {`<script>
  document.addEventListener('DOMContentLoaded', () => {
    DocumentValidator.autoInitialize();
  });
</script>`}
                </Code>
              </Box>
            </VStack>

            {/* Copyable Code Snippet */}
            <Box position="relative">
              <Text fontWeight="bold" mb={2} fontSize="sm">
                Copy this HTML snippet:
              </Text>
              <Box
                bg="gray.900"
                color="green.300"
                p={4}
                borderRadius="md"
                fontFamily="monospace"
                fontSize="sm"
                position="relative"
                overflowX="auto"
              >
                <pre style={{ margin: 0 }}>
                  {`
  <!-- Widget Container -->
  <div>
    <div data-widget-for="unique-id-here"></div>
  </div>
`}
                </pre>
                <Button
                  position="absolute"
                  top={2}
                  right={2}
                  size="xs"
                  colorScheme="blue"
                  leftIcon={<Icon as={FiCopy} />}
                  onClick={() => {
                    navigator.clipboard.writeText(`
  <!-- Widget Container -->
  <div>
    <div data-widget-for="unique-id-here"></div>
  </div>
`);
                    toast({
                      title: 'Code copied!',
                      status: 'success',
                      duration: 2000,
                    });
                  }}
                >
                  Copy
                </Button>
              </Box>
            </Box>

            <Box>
              <Text fontSize="sm">
                Include the Agent ID in your frontend's "input" tag.
              </Text>
              <Code display="block" p={2} mt={1} bg="gray.50" fontSize="xs">
                  {`
                  <input 
              type="file" 
              id="unique-id-here" 
              accept=".pdf,.jpg,.jpeg,.png"
              data-agent-id=${agent.agent_name}
            />
                  `}
              </Code>
            </Box>

            {/* Example with Multiple Widgets */}
            <Box mt={4} p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" mb={2}>📝 Example: Multiple Documents</Text>
              <Text fontSize="sm" mb={2}>
                Here's how to validate multiple documents with the same agent:
              </Text>
              <Code display="block" p={2} bg="gray.100" fontSize="xs" whiteSpace="pre" overflowX="auto">
                {`<!-- Document 1 -->
<div class="form-row">
  <input type="file" data-agent-id="${agent.agent_name}" />
  <button>Validate</button>
  <div data-widget-for="document-1"></div>
</div>

<!-- Document 2 (Same Agent, Separate Widget) -->
<div class="form-row">
  <input type="file" data-agent-id="${agent.agent_name}" />
  <button>Validate</button>
  <div data-widget-for="document-2"></div>
</div>`}
              </Code>
            </Box>

            {/* Key Features */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
              <Box bg="blue.50" p={3} borderRadius="md">
                <Text fontWeight="bold" mb={1}>✨ Multiple Instances</Text>
                <Text fontSize="sm">
                  Use the same agent ID multiple times with different widget IDs. Each maintains separate state.
                </Text>
              </Box>
              <Box bg="green.50" p={3} borderRadius="md">
                <Text fontWeight="bold" mb={1}>🔄 Auto Discovery</Text>
                <Text fontSize="sm">
                  The widget automatically connects file inputs, buttons, and status displays in the same row.
                </Text>
              </Box>
              <Box bg="purple.50" p={3} borderRadius="md">
                <Text fontWeight="bold" mb={1}>📊 History Panel</Text>
                <Text fontSize="sm">
                  Click the purple bubble (bottom-right) to view validation history across all agents.
                </Text>
              </Box>
              <Box bg="yellow.50" p={3} borderRadius="md">
                <Text fontWeight="bold" mb={1}>🔧 Zero Config</Text>
                <Text fontSize="sm">
                  No JavaScript required. Just add the HTML structure and let autoInitialize handle the rest.
                </Text>
              </Box>
            </SimpleGrid>
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