import React from 'react';
import {
  Box,
  VStack,
  Button,
  Icon,
  Text,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiHome,
  FiPlus,
  FiFileText,
  FiBarChart2,
  FiLayers,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarContent = ({ navigate, location }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/' },
    { icon: FiPlus, label: 'Create Agent', path: '/create-agent' },
    { icon: FiLayers, label: 'My Agents', path: '/my-agents' },
    { icon: FiFileText, label: 'Validate Document', path: '/validate' },
    { icon: FiBarChart2, label: 'Analytics', path: '/analytics' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <VStack spacing={1} align="stretch" p={4}>
      {menuItems.map((item) => (
        <Button
          key={item.path}
          leftIcon={<Icon as={item.icon} />}
          variant="ghost"
          justifyContent="flex-start"
          onClick={() => navigate(item.path)}
          bg={isActive(item.path) ? activeBg : 'transparent'}
          color={isActive(item.path) ? activeColor : 'inherit'}
          _hover={{ bg: isActive(item.path) ? activeBg : hoverBg }}
          fontWeight={isActive(item.path) ? 'bold' : 'normal'}
        >
          {item.label}
        </Button>
      ))}
    </VStack>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        position="fixed"
        left={0}
        top="60px"
        bottom={0}
        w="240px"
        bg={bg}
        borderRightWidth="1px"
        borderColor={borderColor}
        display={{ base: 'none', md: 'block' }}
        overflowY="auto"
      >
        <SidebarContent navigate={navigate} location={location} />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0} mt={10}>
            <SidebarContent navigate={navigate} location={location} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;


