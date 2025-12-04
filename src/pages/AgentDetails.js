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
        is_active: data.agent.is_active,
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
      await updateAgent(agentName, formData);
      toast({
        title: 'Agent updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
                <Badge colorScheme={getModeColor(agent.mode)}>{agent.mode}</Badge>
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
                  {agent.endpoint}
                </Code>
                <Button leftIcon={<Icon as={FiCopy} />} onClick={copyEndpoint}>
                  Copy
                </Button>
              </HStack>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                Validation Prompt
              </Text>
              <Text whiteSpace="pre-wrap">{agent.prompt}</Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                Processing Mode
              </Text>
              <Badge colorScheme={getModeColor(agent.mode)} fontSize="md" p={2}>
                {agent.mode}
              </Badge>
              <Text fontSize="sm" color="gray.500" mt={2}>
                {agent.mode === 'ocr+llm'
                  ? 'Uses AWS Textract for OCR + GPT-4 for validation'
                  : 'Uses GPT-4 Vision API only (faster)'}
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
                <FormLabel>Validation Prompt</FormLabel>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  rows={6}
                />
              </FormControl>

              <FormControl>
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

