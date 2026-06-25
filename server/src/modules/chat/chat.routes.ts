import { Router } from 'express';
import { chatController } from './chat.controller';
import { chatStreamController } from './chat-stream.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Protect all chat routes with authentication middleware
router.use(authMiddleware);

// GET /stream - Stream AI response using persisted message
router.get('/stream', (req, res) => chatStreamController.streamChat(req, res));

// POST /stream - Stream AI response using POST body
router.post('/stream', (req, res) => chatStreamController.streamChat(req, res));

// POST /sessions - Create a new chat session
router.post('/sessions', chatController.createSession);

// POST /sessions/:sessionId/messages - Send a message in a session
router.post('/sessions/:sessionId/messages', chatController.sendMessage);

// GET /sessions - Retrieve all chat sessions for the authenticated user
router.get('/sessions', chatController.getSessions);

// GET /sessions/:sessionId/messages - Retrieve all messages in a session
router.get('/sessions/:sessionId/messages', chatController.getMessages);

// GET /stream - Stream an AI response over SSE
router.get('/stream', chatStreamController.streamChat);

// DELETE /sessions/:sessionId - Delete a chat session and its messages
router.delete('/sessions/:sessionId', chatController.deleteSession);

export const chatRoutes = router;
