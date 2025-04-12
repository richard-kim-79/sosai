import React from 'react';
import { ChakraProvider, Box, Container, Heading } from '@chakra-ui/react';
import Chat from './components/Chat';

function App() {
  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.md" py={8}>
          <Heading mb={8} textAlign="center">SOSAI 챗봇</Heading>
          <Chat />
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 