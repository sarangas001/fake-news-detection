import { z } from "zod";

export const createAnalysisSchema =
z.object({

  content:
    z.string()
     .min(20)
     .max(15000),

  sourceType:
    z.enum([
      "TEXT",
      "ARTICLE",
      "IMAGE",
      "CHAT"
    ])
});