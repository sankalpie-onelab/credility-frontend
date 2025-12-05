import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Icon,
  useColorModeValue,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { FiEye, FiBarChart2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getModeColor, formatNumber, formatDate, truncateText } from '../../utils/helpers';

const AgentCard = ({ agent }) => {
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        <Flex align="start" flexDir="column">
          <VStack align="start" spacing={1} flex={1}>
            <Heading size="md">{agent.display_name}</Heading>
            <Text fontSize="sm" color="gray.500" fontFamily="mono">
              {agent.agent_name}
            </Text>
          </VStack>
          <HStack>
            <Badge colorScheme={getModeColor(agent.mode)}>
              {agent.mode}
            </Badge>
            
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
        </Flex>

        <Text fontSize="sm" color="gray.600" noOfLines={2}>
          {truncateText(agent.prompt, 150)}
        </Text>

        <HStack spacing={6} pt={2}>
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500">
              Total Hits
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              {formatNumber(agent.total_hits || 0)}
            </Text>
          </VStack>
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500">
              Created
            </Text>
            <Text fontSize="sm">
              {new Date(agent.created_at).toLocaleDateString()}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={2} pt={2}>
          <Button
            size="sm"
            leftIcon={<Icon as={FiEye} />}
            onClick={() => navigate(`/agent/${agent.agent_name}`)}
            flex={1}
            isDisabled={!agent.is_active}
          >
            Details
          </Button>
          <Button
            size="sm"
            leftIcon={<Icon as={FiBarChart2} />}
            variant="outline"
            onClick={() => navigate(`/agent/${agent.agent_name}/stats`)}
            flex={1}
            isDisabled={!agent.is_active}
          >
            Stats
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default AgentCard;

