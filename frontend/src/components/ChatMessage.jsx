import React from 'react';
import styled from '@emotion/styled';

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: 8px 0;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 20px;
  background-color: ${props => props.isUser ? '#007AFF' : '#E9E9EB'};
  color: ${props => props.isUser ? 'white' : 'black'};
  word-wrap: break-word;
`;

const ChatMessage = ({ message, isUser }) => {
  return (
    <MessageContainer isUser={isUser}>
      <MessageBubble isUser={isUser}>
        {message}
      </MessageBubble>
    </MessageContainer>
  );
};

export default ChatMessage; 