import { z } from "zod";

export const registerSchema =
z.object({

 firstName:
 z.string().min(2),

 lastName:
 z.string().min(2),

 email:
 z.string().email(),

 password:
 z.string().min(8)
});

export const loginSchema =
z.object({

 email:
 z.string().email(),

 password:
 z.string().min(8)
});

export const refreshSchema =
z.object({

 refreshToken:
 z.string().min(1)
});

