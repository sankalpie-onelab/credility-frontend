import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
  FormErrorMessage,
  FormHelperText,
  HStack,
  Switch,
} from '@chakra-ui/react';
import { createAgent } from '../../services/api';
import { getCreatorId } from '../../utils/storage';
import { validateAgentName } from '../../utils/helpers';

const CreateAgentModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agent_name: '',
    display_name: '',
    description: '',
    OCR: false,
    tamper: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Add this new handler
  const handleOCRToggle = (e) => {
    const useOCR = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      OCR: useOCR
    }));
  };

  // Add tamper toggle handler
  const handleTamperToggle = (e) => {
    const useTamper = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      tamper: useTamper
    }));
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

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const creatorId = getCreatorId();
      const result = await createAgent({
        agent_name: formData.agent_name,
        display_name: formData.display_name,
        description: formData.description,  // Changed from prompt
        OCR: formData.OCR,  // Changed from mode
        creator_id: creatorId,
        tamper: formData.tamper,  // New field
      });

      toast({
        title: 'Agent created successfully!',
        description: `Agent "${result.agent_name}" is ready to use.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        agent_name: '',
        display_name: '',
        description: '',  // Changed from prompt
        OCR: false,       // Changed from mode
        tamper: false,    // New field
      });
      setErrors({});
      onSuccess && onSuccess(result);
      onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Agent</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.agent_name} isRequired>
              <FormLabel>Agent Name</FormLabel>
              <Input
                name="agent_name"
                value={formData.agent_name}
                onChange={handleChange}
                placeholder="e.g., senior_citizen_check"
              />
              <FormHelperText>
                Lowercase letters, numbers, and underscores only (3-100 chars)
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
                placeholder="e.g., Senior Citizen Validator"
              />
              <FormHelperText>Human-readable name for the agent</FormHelperText>
              {errors.display_name && (
                <FormErrorMessage>{errors.display_name}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.description} isRequired>
              <FormLabel>Validation Rules (Description)</FormLabel>
              <Textarea
                name="description"  // Changed from prompt
                value={formData.description}  // Changed from prompt
                onChange={handleChange}
                placeholder="Describe the validation rules in natural language..."
                rows={6}
              />
              <FormHelperText>
                Define the rules for document validation in natural language
              </FormHelperText>
              {errors.description && (  // Changed from prompt
                <FormErrorMessage>{errors.description}</FormErrorMessage>  // Changed from prompt
              )}
            </FormControl>

            {/* <FormControl>
              <FormLabel>Processing Mode</FormLabel>
              <Select name="mode" value={formData.mode} onChange={handleChange}>
                <option value="ocr+llm">
                  OCR + LLM (Recommended for scanned documents)
                </option>
                <option value="llm">LLM Only (Faster for clear images)</option>
              </Select>
            </FormControl> */}
            <FormControl>
              <FormLabel htmlFor="ocr-toggle">
                <HStack spacing={3}>
                  <span>Use OCR</span>
                  <Switch
                    id="ocr-toggle"
                    isChecked={formData.OCR}  // Changed from formData.mode === 'ocr+llm'
                    onChange={handleOCRToggle}
                    colorScheme="blue"
                  />
                </HStack>
              </FormLabel>
              <FormHelperText>
                Enable OCR (AWS Textract) for scanned documents. Leave off for faster LLM-only processing.
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="tamper-toggle">
                <HStack spacing={3}>
                  <span>Enable Tamper Detection</span>
                  <Switch
                    id="tamper-toggle"
                    isChecked={formData.tamper}
                    onChange={handleTamperToggle}
                    colorScheme="purple"
                  />
                </HStack>
              </FormLabel>
              <FormHelperText>
                Enable tamper detection to identify forged or modified documents.
              </FormHelperText>
            </FormControl>

          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Create Agent
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateAgentModal;


