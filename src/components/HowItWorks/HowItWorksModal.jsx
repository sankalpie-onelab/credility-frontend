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
    Box,
    Image,
    Text,
    VStack,
    HStack,
    IconButton,
    useColorModeValue,
    Flex,
    Circle,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import image1 from "../../assets/flow1.png";

const HowItWorksModal = ({ isOpen, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: image1, // Replace with your actual image paths
            title: 'Step 1: Your Session ID',
            description: 'You will be assigned a computer generated creator ID and user ID. Consider the creator as the API creator and the user as the API consumer.',
        },
        {
            image: image1, // Replace with your actual image paths
            title: 'Step 1: Your Session ID',
            description: 'Start by creating a custom validation agent. Define your validation rules in natural language and choose the processing mode that fits your needs.',
        },
        {
            image: '/images/step2.png',
            title: 'Step 2: Upload Documents',
            description: 'Upload documents you want to validate. Our system supports various formats and can process both scanned documents and clear images.',
        },
        {
            image: '/images/step3.png',
            title: 'Step 3: Get Results',
            description: 'Receive instant validation results with detailed feedback. Track your validation history and monitor agent performance through comprehensive analytics.',
        },
        {
            image: '/images/step4.png',
            title: 'Step 4: Monitor & Optimize',
            description: 'Use the dashboard to monitor your agents\' performance, view statistics, and optimize your validation workflows based on real-time insights.',
        },
    ];

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>How It Works</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={6}>
                        {/* Carousel */}
                        <Box position="relative" w="full" h="400px">
                            {/* Image Container */}
                            <Flex
                                position="relative"
                                w="full"
                                h="full"
                                align="center"
                                justify="center"
                                bg={bgColor}
                                borderRadius="lg"
                                borderWidth="1px"
                                borderColor={borderColor}
                                overflow="hidden"
                            >
                                <Image
                                    src={slides[currentSlide].image}
                                    alt={slides[currentSlide].title}
                                    objectFit="contain"
                                    maxH="100%"
                                    maxW="100%"
                                    fallback={
                                        <Box
                                            w="full"
                                            h="full"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg="gray.100"
                                            color="gray.500"
                                        >
                                            <Text>Image {currentSlide + 1}</Text>
                                        </Box>
                                    }
                                />
                            </Flex>

                            {/* Navigation Arrows */}
                            <IconButton
                                icon={<FiChevronLeft />}
                                position="absolute"
                                left={2}
                                top="50%"
                                transform="translateY(-50%)"
                                onClick={prevSlide}
                                colorScheme="blue"
                                variant="solid"
                                size="sm"
                                isRound
                                aria-label="Previous slide"
                                zIndex={2}
                            />
                            <IconButton
                                icon={<FiChevronRight />}
                                position="absolute"
                                right={2}
                                top="50%"
                                transform="translateY(-50%)"
                                onClick={nextSlide}
                                colorScheme="blue"
                                variant="solid"
                                size="sm"
                                isRound
                                aria-label="Next slide"
                                zIndex={2}
                            />
                        </Box>

                        {/* Slide Indicators */}
                        <HStack spacing={2}>
                            {slides.map((_, index) => (
                                <Circle
                                    key={index}
                                    size="10px"
                                    bg={currentSlide === index ? 'blue.500' : 'gray.300'}
                                    cursor="pointer"
                                    onClick={() => goToSlide(index)}
                                    transition="all 0.3s"
                                    _hover={{ transform: 'scale(1.2)' }}
                                />
                            ))}
                        </HStack>

                        {/* Text Content */}
                        <VStack spacing={3} w="full" textAlign="center" px={4}>
                            <Text fontSize="xl" fontWeight="bold" color="blue.500">
                                {slides[currentSlide].title}
                            </Text>
                            <Text color="gray.600">
                                {slides[currentSlide].description}
                            </Text>
                        </VStack>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3} w="full" justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                            {currentSlide + 1} of {slides.length}
                        </Text>
                        <HStack>
                            {currentSlide < slides.length - 1 ? (
                                <Button colorScheme="blue" onClick={nextSlide}>
                                    Next
                                </Button>
                            ) : (
                                <Button colorScheme="green" onClick={onClose}>
                                    Get Started
                                </Button>
                            )}
                        </HStack>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default HowItWorksModal;
