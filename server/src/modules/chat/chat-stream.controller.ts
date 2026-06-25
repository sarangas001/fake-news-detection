import { Request, Response } from 'express';
import { chatService } from './chat.service';

export class ChatStreamController {
  /**
   * Establishes a Server-Sent Events (SSE) connection and streams AI response tokens.
   * Can accept the message in the POST body, or retrieve a previously persisted user message.
   */
  async streamChat(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const sessionId = (req.body.sessionId || req.query.sessionId) as string;
    
    // Accept message/content/prompt ONLY from the request body to avoid exposing prompt text in the URL
    const message = (req.body.message || req.body.content || req.body.prompt) as string;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required.' });
      return;
    }

    let messageContent = message;

    // If no message is provided in the request body, fallback to the latest persisted user message in the session
    if (!messageContent) {
      try {
        const messages = await chatService.getMessages(String(userId), sessionId);
        const lastUserMessage = [...messages].reverse().find((m) => m.role === 'USER');
        if (!lastUserMessage) {
          res.status(400).json({
            success: false,
            message: 'No message provided in request body and no persisted user message found for this session.',
          });
          return;
        }
        messageContent = lastUserMessage.content;
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: `Failed to load persisted message: ${error.message}`,
        });
        return;
      }
    }

    // Initialize Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx if proxying
    });

    // Send initial connection establish event
    res.write(`data: ${JSON.stringify({ event: 'connected' })}\n\n`);

    // Setup heartbeat interval to keep connection alive
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    let isConnectionClosed = false;

    req.on('close', () => {
      isConnectionClosed = true;
      clearInterval(heartbeatInterval);
    });

    try {
      const finalMessage = await chatService.streamMessage(
        String(userId),
        sessionId,
        messageContent,
        (chunk: string) => {
          if (!isConnectionClosed) {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        }
      );

      if (!isConnectionClosed) {
        // Send final completed message metadata and close stream
        res.write(`data: ${JSON.stringify({ event: 'done', message: finalMessage })}\n\n`);
        res.write('data: [DONE]\n\n');
      }
    } catch (error: any) {
      console.error('Error in chat stream:', error);
      if (!isConnectionClosed) {
        res.write(`data: ${JSON.stringify({ event: 'error', message: error.message || 'Stream error' })}\n\n`);
      }
    } finally {
      clearInterval(heartbeatInterval);
      if (!res.writableEnded) {
        res.end();
      }
    }
  }
}

export const chatStreamController = new ChatStreamController();
