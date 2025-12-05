import React, { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
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
import { createAgent } from '../services/api';
import { getCreatorId } from '../utils/storage';
import { validateAgentName } from '../utils/helpers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const CreateAgent = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null); // Add this line
  const [formData, setFormData] = useState({
    agent_name: '',
    display_name: '',
    prompt: '',
    mode: 'ocr+llm',
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

  // Add this new function
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
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

    if (!formData.prompt || formData.prompt.trim().length < 10) {
      newErrors.prompt = 'Prompt must be at least 10 characters';
    }

    // Add this validation
    // if (!referenceImage) {
    //   newErrors.reference_image = 'Reference image is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const creatorId = getCreatorId();
      // Create FormData object
      const submitData = new FormData();
      submitData.append('agent_name', formData.agent_name);
      submitData.append('display_name', formData.display_name);
      submitData.append('prompt', formData.prompt);
      submitData.append('mode', formData.mode);
      submitData.append('creator_id', creatorId);

      // Only append reference_image if one was selected
      if (referenceImage) {
        submitData.append('reference_image', referenceImage);
      }

      const result = await createAgent(submitData);

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
        description: error.response?.data?.detail || error.message,
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

              <FormControl isInvalid={!!errors.prompt} isRequired>
                <FormLabel>Validation Rules (Prompt)</FormLabel>
                <Textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  placeholder="Example: Pass the document only if: 1) User age is above 54 years, 2) Document is not expired, 3) ID number has exactly 10 digits"
                  rows={8}
                  size="lg"
                />
                <FormHelperText>
                  Describe your validation rules in natural language. Be specific
                  about what conditions must be met for a document to pass.
                </FormHelperText>
                {errors.prompt && (
                  <FormErrorMessage>{errors.prompt}</FormErrorMessage>
                )}
              </FormControl>

              {/* Add this new FormControl */}
              <FormControl isInvalid={!!errors.reference_image}>
                <FormLabel>
                  Reference Document Image <Text as="span" color="gray.500" fontSize="sm">(Optional)</Text>
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  size="lg"
                  p={1}
                />
                <FormHelperText>
                  Upload a reference image of the document type for the agent to learn from (JPG, PNG)
                </FormHelperText>
                {referenceImage && (
                  <Text fontSize="sm" color="green.500" mt={2}>
                    ✓ Selected: {referenceImage.name}
                  </Text>
                )}
                {errors.reference_image && (
                  <FormErrorMessage>{errors.reference_image}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Processing Mode</FormLabel>
                <Select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  size="lg"
                >
                  <option value="ocr+llm">
                    OCR + LLM (Recommended for scanned documents)
                  </option>
                  <option value="llm">LLM Only (Faster for clear images)</option>
                </Select>
                <FormHelperText>
                  <strong>OCR + LLM:</strong> Uses AWS Textract for text extraction +
                  GPT-4 for validation.
                  <br />
                  <strong>LLM Only:</strong> Uses GPT-4 Vision API only (faster).
                </FormHelperText>
              </FormControl>

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

