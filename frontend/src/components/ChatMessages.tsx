import React from 'react'
import { VStack, Box, Text } from '@chakra-ui/react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatMessagesProps {
  messages: Message[]
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <VStack spacing={4} align="stretch">
      {messages.map((message) => (
        <Box
          key={message.id}
          display="flex"
          justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
        >
          <Box
            maxW="70%"
            bg={message.sender === 'user' ? 'blue.500' : 'gray.100'}
            color={message.sender === 'user' ? 'white' : 'black'}
            px={4}
            py={2}
            borderRadius="lg"
          >
            <Text>{message.text}</Text>
            <Text
              fontSize="xs"
              color={message.sender === 'user' ? 'whiteAlpha.700' : 'gray.500'}
              mt={1}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </Box>
        </Box>
      ))}
    </VStack>
  )
} 