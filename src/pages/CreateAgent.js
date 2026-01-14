import React, { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  useColorModeValue,
  FormErrorMessage,
  FormHelperText,
  Text,
  Code,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { getCreatorId } from '../utils/storage';
import { validateAgentName } from '../utils/helpers';
import CrossValidation from '../components/CrossValidation/CrossValidation';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://13.233.155.255:8000';

const CreateAgent = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    agent_name: '',
    display_name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.agent_name) {
      newErrors.agent_name = 'Agent name is required';
    } else if (!validateAgentName(formData.agent_name)) {
      newErrors.agent_name =
        'Must be lowercase letters, numbers, underscores only (3-100 chars)';
    }

    if (!formData.display_name || formData.display_name.trim().length < 3) {
      newErrors.display_name = 'Display name must be at least 3 characters';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const creatorId = getCreatorId();
      
      // Create FormData object for the v2 endpoint
      const submitData = new FormData();
      submitData.append('agent_name', formData.agent_name);
      submitData.append('display_name', formData.display_name);
      submitData.append('description', formData.description);
      if (creatorId) {
        submitData.append('creator_id', creatorId);
      }

      // Call the v2 endpoint
      const response = await fetch(`${API_BASE_URL}/api/agents/v2/create`, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create agent');
      }

      const result = await response.json();

      toast({
        title: 'Agent created successfully!',
        description: result.message || `Agent "${result.agent_name}" is ready to use.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate(`/agent/${result.agent_name}`);
    } catch (error) {
      toast({
        title: 'Error creating agent',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box maxW="4xl" mx="auto">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>
              Create New Agent
            </Heading>
            <Text color="gray.500">
              Define custom validation rules for document processing
            </Text>
          </Box>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg={bg}
            p={8}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6}>
              <FormControl isInvalid={!!errors.agent_name} isRequired>
                <FormLabel>Agent Name</FormLabel>
                <Input
                  name="agent_name"
                  value={formData.agent_name}
                  onChange={handleChange}
                  placeholder="e.g., senior_citizen_check"
                  size="lg"
                />
                <FormHelperText>
                  Lowercase letters, numbers, and underscores only (3-100 chars).
                  This will be used in the API endpoint.
                </FormHelperText>
                {errors.agent_name && (
                  <FormErrorMessage>{errors.agent_name}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.display_name} isRequired>
                <FormLabel>Display Name</FormLabel>
                <Input
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="e.g., Senior Citizen Document Validator"
                  size="lg"
                />
                <FormHelperText>
                  A human-readable name for your agent
                </FormHelperText>
                {errors.display_name && (
                  <FormErrorMessage>{errors.display_name}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.description} isRequired>
                <FormLabel>Validation Rules (Description)</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Example: Pass the document only if: 1) User age is above 54 years, 2) Document is not expired, 3) ID number has exactly 10 digits"
                  rows={8}
                  size="lg"
                />
                <FormHelperText>
                  Describe your validation rules in natural language. Be specific
                  about what conditions must be met for a document to pass.
                </FormHelperText>
                {errors.description && (
                  <FormErrorMessage>{errors.description}</FormErrorMessage>
                )}
              </FormControl>

              {/* Cross-Validation Component */}
              <CrossValidation agentName={formData.agent_name} />

              <Divider />

              <Box w="full">
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Your agent will be available at:
                </Text>
                <Code p={3} borderRadius="md" w="full" display="block">
                  POST {API_BASE_URL}/api/agent/{formData.agent_name || 'your_agent_name'}
                  /validate
                </Code>
              </Box>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                isLoading={loading}
              >
                Create Agent
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </MainLayout>
  );
};

export default CreateAgent;