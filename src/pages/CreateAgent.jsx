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
  HStack,
  Switch,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  IconButton,
  Card,
  CardBody,
  Stack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiImage, FiX } from 'react-icons/fi';
import MainLayout from '../components/Layout/MainLayout';
import { createAgent } from '../services/api';
import { getCreatorId } from '../utils/storage';
import { validateAgentName } from '../utils/helpers';
import CrossValidation from '../components/CrossValidation/CrossValidation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.233.155.255:8000';

const CreateAgent = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  // Updated state structure for references with contexts
  const [references, setReferences] = useState([
    { image: null, context: '' },
  ]);
  
  const [formData, setFormData] = useState({
    agent_name: '',
    display_name: '',
    description: '',
    OCR: false,
    tamper: false,
  });
  const [errors, setErrors] = useState({});
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.800');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOCRToggle = (e) => {
    const useOCR = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      OCR: useOCR
    }));
  };

  const handleTamperToggle = (e) => {
    const useTamper = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      tamper: useTamper
    }));
  };

  // Handle image file change for a specific reference
  const handleReferenceImageChange = (index, file) => {
    setReferences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image: file };
      return updated;
    });
    
    // Clear any errors for this reference
    if (errors[`reference_${index + 1}`]) {
      setErrors((prev) => ({ ...prev, [`reference_${index + 1}`]: '' }));
    }
  };

  // Handle context text change for a specific reference
  const handleReferenceContextChange = (index, context) => {
    setReferences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], context };
      return updated;
    });
    
    // Clear any errors for this reference context
    if (errors[`reference_${index + 1}_context`]) {
      setErrors((prev) => ({ ...prev, [`reference_${index + 1}_context`]: '' }));
    }
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

    // Validate references: if an image is provided, context should also be provided
    references.forEach((ref, index) => {
      if (ref.image && !ref.context.trim()) {
        newErrors[`reference_${index + 1}_context`] = 'Please provide context for this reference image';
      }
    });

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
      submitData.append('description', formData.description);
      submitData.append('ocr', formData.OCR.toString());
      submitData.append('creator_id', creatorId);
      submitData.append('tamper', formData.tamper.toString());

      // Append reference images and contexts with numbered field names
      references.forEach((ref, index) => {
        if (ref.image) {
          const refNumber = index + 1;
          submitData.append(`reference_${refNumber}`, ref.image);
          submitData.append(`reference_${refNumber}_context`, ref.context);
        }
      });

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

              {/* Updated Reference Images Section with Contexts */}
              <FormControl>
                <FormLabel>
                  Reference Document Images{' '}
                  <Text as="span" color="gray.500" fontSize="sm">
                    (Optional - up to 5 images with context)
                  </Text>
                </FormLabel>
                <FormHelperText mb={4}>
                  Upload reference images and provide context for each. The AI will use these to better understand the document type.
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

                          <FormControl isInvalid={!!errors[`reference_${index + 1}`]}>
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
                              size="md"
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
                            {errors[`reference_${index + 1}`] && (
                              <FormErrorMessage>{errors[`reference_${index + 1}`]}</FormErrorMessage>
                            )}
                          </FormControl>

                          <FormControl isInvalid={!!errors[`reference_${index + 1}_context`]}>
                            <FormLabel fontSize="sm">Context Description</FormLabel>
                            <Textarea
                              value={ref.context}
                              onChange={(e) => handleReferenceContextChange(index, e.target.value)}
                              placeholder="e.g., In this image you can see that there is no field names are present like Name, Address, DOB etc. The document has a photo on the left side..."
                              rows={3}
                              size="md"
                            />
                            <FormHelperText fontSize="xs">
                              Describe what's visible in the image, layout, field names, unique characteristics, etc.
                            </FormHelperText>
                            {errors[`reference_${index + 1}_context`] && (
                              <FormErrorMessage>{errors[`reference_${index + 1}_context`]}</FormErrorMessage>
                            )}
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

              <FormControl>
                <FormLabel htmlFor="ocr-toggle-page">
                  <HStack spacing={3}>
                    <span>Use OCR</span>
                    <Switch
                      id="ocr-toggle-page"
                      isChecked={formData.OCR}
                      onChange={handleOCRToggle}
                      colorScheme="blue"
                      size="lg"
                    />
                  </HStack>
                </FormLabel>
                <FormHelperText>
                  <strong>Enabled:</strong> Recommended for scanned documents.
                  <br />
                  <strong>Disabled:</strong> Faster for clear images.
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="tamper-toggle-page">
                  <HStack spacing={3}>
                    <span>Enable Tamper Detection</span>
                    <Switch
                      id="tamper-toggle-page"
                      isChecked={formData.tamper}
                      onChange={handleTamperToggle}
                      colorScheme="purple"
                      size="lg"
                    />
                  </HStack>
                </FormLabel>
                <FormHelperText>
                  <strong>Enabled:</strong> Performs additional checks to detect if the document has been tampered with or forged.
                  <br />
                  <strong>Disabled:</strong> Skips tamper detection (faster processing).
                </FormHelperText>
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
