import React, { useState } from 'react';
import { Box, Input, Button, HStack } from '@chakra-ui/react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box p={4} borderTop="1px" borderColor="gray.200">
      <form onSubmit={handleSubmit}>
        <HStack spacing={3}>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={disabled}
            size="lg"
            borderRadius="full"
          />
          <Button
            type="submit"
            colorScheme="blue"
            isDisabled={disabled || !message.trim()}
            borderRadius="full"
            size="lg"
          >
            전송
          </Button>
        </HStack>
      </form>
    </Box>
  );
};

export default ChatInput; 