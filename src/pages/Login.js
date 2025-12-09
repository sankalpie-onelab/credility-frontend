import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Image,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import logo from '../assets/credility_logo.png';

// Hard-coded credentials - In production, these should be environment variables
const CREATOR_LOGIN_EMAIL = 'user_111@gmail.com';
const CREATOR_LOGIN_PASSWORD = 'user_111@12345';
const CONSUMER_LOGIN_EMAIL = 'dev123@gmail.com';
const CONSUMER_LOGIN_PASSWORD = 'dev123@12345';

const CREDENTIALS = {
  CREATOR: {
    email: CREATOR_LOGIN_EMAIL,
    password: CREATOR_LOGIN_PASSWORD,
    role: 'creator'
  },
  CONSUMER: {
    email: CONSUMER_LOGIN_EMAIL,
    password: CONSUMER_LOGIN_PASSWORD,
    role: 'consumer'
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check credentials
    const isCreator = 
      email === CREDENTIALS.CREATOR.email && 
      password === CREDENTIALS.CREATOR.password;
    
    const isConsumer = 
      email === CREDENTIALS.CONSUMER.email && 
      password === CREDENTIALS.CONSUMER.password;

    setTimeout(() => {
      if (isCreator) {
        login(CREDENTIALS.CREATOR.email, CREDENTIALS.CREATOR.role);
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Creator!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } else if (isConsumer) {
        login(CREDENTIALS.CONSUMER.email, CREDENTIALS.CONSUMER.role);
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Consumer!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/validate');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <Box bg="white" p={8} borderRadius="lg" boxShadow="xl">
          <VStack spacing={6}>
            {/* <Image src={logo} alt="Credility Logo" maxW="200px" /> */}
            <Heading size="lg" color="brand.700">
              Welcome!
            </Heading>
            
            <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="brand.500">
              <Text color="gray.700" fontSize="sm" textAlign="center" lineHeight="tall">
                This application helps you create custom agents and test them out using a dummy consumer (dev123). 
                Build intelligent verification agents, deploy them, and validate documents seamlessly.
              </Text>
            </Box>

            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <VStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    focusBorderColor="brand.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      focusBorderColor="brand.500"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  width="100%"
                  size="lg"
                  isLoading={isLoading}
                  mt={4}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              Please contact your administrator for login credentials
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;