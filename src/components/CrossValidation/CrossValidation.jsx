import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Switch,
  HStack,
  VStack,
  Select,
  Button,
  Icon,
  Text,
  IconButton,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FiArrowRight, FiX, FiInfo } from 'react-icons/fi';

// Common document fields that users can map
const COMMON_FIELDS = [
  'Name 1',
  'Name 2',
  'Name 3',
  'Address',
  'Date of Birth',
  'ID Number',
  'Document Number',
  'Issue Date',
  'Expiry Date',
  'Phone Number',
  'Email',
  'Gender',
  'Nationality',
  'Photo',
  'Signature',
];

const CrossValidation = ({ agentName }) => {
  const [enabled, setEnabled] = useState(false);
  const [mappings, setMappings] = useState([
    { sourceField: '', targetField: '' },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const infoBg = useColorModeValue('blue.50', 'blue.900');

  // Load from localStorage when component mounts or agentName changes
  useEffect(() => {
    if (agentName && agentName.length > 0) {
      const storageKey = `cross_validation_${agentName}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setEnabled(parsed.enabled || false);
          setMappings(parsed.mappings || [{ sourceField: '', targetField: '' }]);
        } catch (error) {
          console.error('Error parsing cross-validation data:', error);
        }
      } else {
        // Reset to defaults if no saved data for this agent
        setEnabled(false);
        setMappings([{ sourceField: '', targetField: '' }]);
      }
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [agentName]);

  // Save to localStorage only when user interacts (not on agentName change)
  const saveToLocalStorage = () => {
    if (agentName && agentName.length > 0 && isLoaded) {
      const storageKey = `cross_validation_${agentName}`;
      const dataToSave = {
        enabled,
        mappings,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  };

  // Save when enabled or mappings change, but only if component is loaded
  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage();
    }
  }, [enabled, mappings, isLoaded]);

  const handleToggle = (e) => {
    setEnabled(e.target.checked);
  };

  const handleAddMapping = () => {
    setMappings([...mappings, { sourceField: '', targetField: '' }]);
  };

  const handleRemoveMapping = (index) => {
    if (mappings.length > 1) {
      setMappings(mappings.filter((_, i) => i !== index));
    }
  };

  const handleSourceChange = (index, value) => {
    const newMappings = [...mappings];
    newMappings[index].sourceField = value;
    setMappings(newMappings);
  };

  const handleTargetChange = (index, value) => {
    const newMappings = [...mappings];
    newMappings[index].targetField = value;
    setMappings(newMappings);
  };

  // Don't render if agentName is empty or too short
  if (!agentName || agentName.length < 3) {
    return null;
  }

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        {/* Header with Toggle */}
        <FormControl>
          <FormLabel htmlFor={`cross-validation-toggle-${agentName}`}>
            <HStack spacing={3} justify="space-between">
              <Text fontWeight="semibold" fontSize="lg">
                Cross-Validation Document
              </Text>
              <Switch
                id={`cross-validation-toggle-${agentName}`}
                isChecked={enabled}
                onChange={handleToggle}
                colorScheme="blue"
                size="lg"
              />
            </HStack>
          </FormLabel>
        </FormControl>

        {enabled && (
          <>
            <Divider />

            {/* Mappings */}
            <VStack spacing={3} align="stretch">
              {mappings.map((mapping, index) => (
                <HStack key={index} spacing={2} align="center">
                  {/* Source Field */}
                  <Select
                    placeholder="Select field"
                    value={mapping.sourceField}
                    onChange={(e) => handleSourceChange(index, e.target.value)}
                    size="md"
                    flex={1}
                  >
                    {COMMON_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </Select>

                  {/* Arrow */}
                  <Icon as={FiArrowRight} boxSize={5} color="gray.500" />

                  {/* Target Field */}
                  <Select
                    placeholder="Select field"
                    value={mapping.targetField}
                    onChange={(e) => handleTargetChange(index, e.target.value)}
                    size="md"
                    flex={1}
                  >
                    {COMMON_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </Select>

                  {/* Remove Button */}
                  {mappings.length > 1 && (
                    <IconButton
                      icon={<FiX />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleRemoveMapping(index)}
                      aria-label="Remove mapping"
                    />
                  )}
                </HStack>
              ))}

              {/* Add Mapping Button */}
              <Button
                onClick={handleAddMapping}
                variant="link"
                colorScheme="blue"
                size="sm"
                leftIcon={<Text fontSize="lg">+</Text>}
                justifyContent="flex-start"
              >
                Add Mapping
              </Button>
            </VStack>

            <Divider />

            {/* Super Admin Default Configuration Info */}
            <Box
              bg={infoBg}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="blue.200"
            >
              <HStack spacing={2} align="start">
                <Icon as={FiInfo} color="blue.500" mt={0.5} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold" fontSize="sm" color="blue.700">
                    Super Admin Default Configuration
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    These are the default rules inherited from Super Admin settings
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default CrossValidation;
