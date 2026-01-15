import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  Icon,
  useColorMode,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Image
} from '@chakra-ui/react';
import { FiMoon, FiSun, FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getCreatorId, getUserDisplayName } from '../../utils/storage';
import { logout, getAuthData, getCurrentUser } from '../../utils/auth';
import logo from "../../assets/credility_logo.png";

const Navbar = ({ onMenuClick }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navigate = useNavigate();
  const creatorId = getCreatorId();
  const authData = getAuthData();
  const user = getCurrentUser();
  const displayName = getUserDisplayName();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bg={bg}
      borderBottomWidth="1px"
      borderColor={borderColor}
      px={4}
      py={3}
      zIndex={1000}
    >
      <Flex justify="space-between" align="center" maxW="full" mx="auto">
        <HStack spacing={4}>
          <IconButton
            icon={<FiMenu />}
            variant="ghost"
            display={{ base: 'flex', md: 'none' }}
            onClick={onMenuClick}
            aria-label="Open menu"
          />
          <Heading
            size="md"
            cursor="pointer"
            onClick={() => navigate('/')}
            bgGradient="linear(to-r, blue.400, purple.500)"
            bgClip="text"
          >
            Onelab
          </Heading>
        </HStack>

        <HStack spacing={2}>
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<FiUser />}
              variant="ghost"
              size="sm"
            >
              <Text display={{ base: 'none', md: 'block' }}>
                {displayName}
              </Text>
            </MenuButton>
            <MenuList>
              {user && (
                <>
                  <MenuItem isDisabled>
                    <Text fontSize="xs" color="gray.500">
                      {user.full_name ? 'Name' : 'Email'}
                    </Text>
                  </MenuItem>
                  <MenuItem isDisabled>
                    <Text fontSize="xs">
                      {displayName}
                    </Text>
                  </MenuItem>
                  {user.full_name && (
                    <MenuItem isDisabled>
                      <Text fontSize="xs" color="gray.500">
                        Email: {user.email}
                      </Text>
                    </MenuItem>
                  )}
                  <MenuItem isDisabled>
                    <Text fontSize="xs" color="gray.500">
                      Role: {user.role}
                    </Text>
                  </MenuItem>
                  <MenuDivider />
                </>
              )}
              <MenuItem isDisabled>
                <Text fontSize="xs" color="gray.500">
                  Creator ID
                </Text>
              </MenuItem>
              <MenuItem isDisabled>
                <Text fontSize="xs" fontFamily="mono">
                  {creatorId}
                </Text>
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>

          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle color mode"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;