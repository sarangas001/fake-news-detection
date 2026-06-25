import { Request, Response } from 'express';
import { chatService } from './chat.service';

export class ChatController {
  /**
   * Creates a new chat session.
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { title, linkedAnalysisId } = req.body;
      const session = await chatService.createSession(
        String(userId),
        title,
        linkedAnalysisId
      );

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error: any) {
      console.error('Error creating chat session:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Sends a message in an existing chat session and returns the assistant's response.
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { sessionId } = req.params;
      const { message, content } = req.body;
      const messageContent = message || content;

      if (!sessionId) {
        res.status(400).json({ success: false, message: 'Session ID is required' });
        return;
      }

      if (!messageContent) {
        res.status(400).json({ success: false, message: 'Message content is required' });
        return;
      }

      const responseMessage = await chatService.sendMessage(
        String(userId),
        sessionId as string,
        messageContent
      );

      res.status(200).json({
        success: true,
        data: responseMessage,
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Gets all messages for a specific chat session.
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ success: false, message: 'Session ID is required' });
        return;
      }

      const messages = await chatService.getMessages(String(userId), sessionId as string);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Gets all chat sessions for the authenticated user.
   */
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const sessions = await chatService.getUserSessions(String(userId));

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error: any) {
      console.error('Error getting user sessions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Deletes a specific chat session and its messages.
   */
  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ success: false, message: 'Session ID is required' });
        return;
      }

      const deleted = await chatService.deleteSession(String(userId), sessionId as string);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Chat session not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Chat session and messages deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting chat session:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

export const chatController = new ChatController();
