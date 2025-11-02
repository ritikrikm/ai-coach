import { supabaseService } from "../clients/supabase";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import crypto from "crypto";
/**
 * Create a new interview session.
 * @param role  The role being practiced (e.g. "Frontend (React)")
 * @param jd    Optional job description text that was used to build the competency graph
 * @returns     The inserted session row
 */
export async function createSession(role: string, jd?: string) {
  const { data, error } = await supabaseService
    .from("sessions")
    .insert({ role, jd })
    .select()
    .single();
  if (error) throw error;
  const payload = {sesionId:data.id,role:data.role}
  const accessToken = jwt.sign(payload,process.env.JWT_SECRET!,{expiresIn:"15s"});
  const refreshToken = jwt.sign(payload,process.env.JWT_SECRET!,{expiresIn:"7d"});

  const refreshHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await supabaseService
  .from("sessions")
  .update({refreshTokenHash:refreshHash})
  .eq("id",data.id);

  (await cookies()).set("refresh_token",refreshToken,{
    httpOnly:true,
    secure:true,
    path:'/',
    maxAge:7*24*60*60//7d
  })
  
  return {session:data , accessToken};
}

/**
 * Retrieve a session by its id.
 */
export function withSession(
  handler:(req:Request,session:any)=>Promise<Response>
) {
  return async (req:Request)=>{
 //get the refresh token
  const refreshToken = (await cookies()).get("refersh_token")?.value;
  if(!refreshToken) throw new Error("Missing refresh token");
  //verify with jwt

  try {
    const payload = jwt.verify(refreshToken,process.env.JWT_SECRET!) as {
      sessionId:string,
      role:string
    };
    const refreshHash =crypto.createHash("sha256").update(refreshToken).digest("hex");
    const { data, error } = await supabaseService
      .from("sessions")
      .select("*")
      .eq("id", payload.sessionId)
      .eq("refreshTokenHash",refreshHash)
      .single();
  
    if (error || !data) {
      return new Response("Inavlid",{status:401});
    }
    return await handler(req,data);
  } catch (error) {
    return new Response("Unauthorized",{status:401});
  }
  }
 

}

/**
 * List all sessions for administrative or debugging purposes.
 * In a real app you would likely filter by user id once auth is added.
 */
export async function listSessions(limit = 20) {
  const { data, error } = await supabaseService
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
