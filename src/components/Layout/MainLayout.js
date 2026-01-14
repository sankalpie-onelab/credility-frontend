import React from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh">
      <Navbar onMenuClick={onOpen} />
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <Box
        ml={{ base: 0, md: '240px' }}
        mt="60px"
        p={{ base: 4, md: 8 }}
        minH="calc(100vh - 60px)"
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;

