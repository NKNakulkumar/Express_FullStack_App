import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { refreshTokenfun, verifyjwtToken } from "../services/auth.services.js";

// export const verifyAuthentication = (req, res, next) => {
//   const token = req.cookies.Access_token;
//   if (!token) {
//     req.user = null;
//     return next();
//   }

//   try {
//     const decodedToken = verifyjwtToken(token);
//     req.user = decodedToken;
//     console.log(`req.user:`, req.user);
//   } catch (error) {s
//     req.user = null;
//   }

//   return next();
// };

// ✔️ You can add any property to req, but:

// Avoid overwriting existing properties.
// Use req.user for authentication.
// Group custom properties under req.custom if needed.
// Keep the data lightweight.

export const verifyAuthentication = async(req, res, next) => {
const accessToken = req.cookies.Access_token;
const refreshToken = req.cookies.Refresh_token;

req.user = null;
if (!accessToken&&!refreshToken) {
  return next()
}

if(accessToken){
   try {
const decodedToken = verifyjwtToken(accessToken);
    req.user = decodedToken;
    return next()
    } catch (err) {
      // access token invalid/expired — fall through to try refresh token
      console.log("Access token verify error:", err?.message || err);
    }
}

if (refreshToken) {
  try {
    const {newAccessToken,newRefreshToken,user} = await refreshTokenfun(refreshToken)
      req.user = user;

    const baseconfig = {httpOnly:true , secure:true}
         res.cookie("Access_token", newAccessToken,{
          ...baseconfig,
          maxAge:ACCESS_TOKEN_EXPIRY,
         });
    
         //
     res.cookie("Refresh_token", newRefreshToken,{
          ...baseconfig,
          maxAge:REFRESH_TOKEN_EXPIRY,
         });
         return next()
    
  } 
  catch (error) {
      console.log("verifyAuthentication refresh error:", error?.message || error);
      // On any error, clear cookies and continue unauthenticated
      return next();
  }
}
return next();

}