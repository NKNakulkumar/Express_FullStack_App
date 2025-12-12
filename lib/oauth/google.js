import { Google } from "arctic";
import { env } from "../../config/env.js";

// export const google = new Google(env.GOOGLE_CLIENT_ID,env.GOOGLE_CLIENT_SECRET,"http://localhost:3004/google/callback");
export const google = new Google(env.GOOGLE_CLIENT_ID,env.GOOGLE_CLIENT_SECRET, env.GOOGLE_CALLBACK_URL);