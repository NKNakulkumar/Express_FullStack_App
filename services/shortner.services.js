
import { count, desc, eq } from 'drizzle-orm'
import {db }from '../config/db.js'
import {shortLink} from '../drizzle/schema.js'


export const getallShortlinks=async({userId,limit=10,offset=0})=>{  // old 
 const condition = eq(shortLink.userId,userId);

  const shortLinks =   await db.select().from(shortLink).where(condition).orderBy(desc(shortLink.createdAt)).limit(limit).offset(offset);
  const [{totalcount}] = await db.select({totalcount:count()}).from(shortLink).where(condition)
  return {shortLinks,totalcount}

}

export const getshortlinkbyshortcode=async(shortcode)=>{
const [result] = await db.select().from(shortLink).where(eq(shortLink.shortcode,shortcode))
return result;
}


export const insertShortLink=async({url,finalshortcode,userId})=>{     // old 
await db.insert(shortLink).values({url,shortcode:finalshortcode,userId})

}


export const findshortlinkbyId=async(id)=>{

const [result] = await db.select().from(shortLink).where(eq(shortLink.id,id))
return result;

}

// deleteshotcodebyId

export const deleteshotcodebyId=async(id)=>{
return await db.delete(shortLink).where(eq(shortLink.id,id))
}