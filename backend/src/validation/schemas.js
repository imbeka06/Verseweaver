import { z } from 'zod'

export const createPostSchema = z.object({
  excerpt: z.string().min(1).max(5000),
  mediaUrl: z.string().nullable().optional(),
  visibility: z.enum(['public', 'followers', 'private']).optional().default('public'),
})

export const followSchema = z.object({
  followerName: z.string().min(1).max(100),
})

export const sendMessageSchema = z.object({
  senderName: z.string().min(1).max(100),
  text: z.string().min(1).max(2000),
})
