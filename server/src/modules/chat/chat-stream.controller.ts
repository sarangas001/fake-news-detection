import { Request, Response } from 'express';
import { chatService } from './chat.service';

export class ChatStreamController {
  /**
   * Establishes a Server-Sent Events (SSE) connection and streams AI response tokens.
   * GET /chat/stream?sessionId=...&message=...
   */
  async streamChat(req: Request, res: Response): Promise<void> {
    const sessionId = req.query.sessionId as string;
    const message = (req.query.message || req.query.content || req.query.prompt) as string;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required as a query parameter.' });
      return;
    }

    if (!message) {
      res.status(400).json({ success: false, message: 'Message content is required as a query parameter.' });
      return;
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
        sessionId,
        message,
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
