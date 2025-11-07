
import crypto from 'crypto'
// import { loadLinks,saveLinks } from '../models/shortner.model.js';
import { deleteshotcodebyId, findshortlinkbyId, getallShortlinks, getshortlinkbyshortcode, insertShortLink } from '../services/shortner.services.js';
import { shortnerschema } from '../validators/shortner-validator.js';
import z from 'zod';

export const getshortnerPage =async (req, res) => {
  try {
     if (!req.user) return res.redirect("/login");
    // const file = await readFile(path.join("views", "index.html"));
    // const links = await loadLinks();
    const links = await getallShortlinks(req.user.id)


    return res.render("index",{links,host:req.host,errors: req.flash("errors")} )
    
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
}


export const PostUrlshortcode = async (req, res) => {
  try {
     if (!req.user) return res.redirect("/login");
    // const { url, shortcode } = req.body;

const result = shortnerschema.safeParse(req.body)
if (!result.success) {
  const firstError = result.error.issues[0].message;
  req.flash("errors", firstError);
  return res.redirect("/shortcode");
}
    const { url, shortcode } = result.data
    const finalshortcode = shortcode || crypto.randomBytes(4).toString("hex");
    // const links = await loadLinks();
    const links = await getshortlinkbyshortcode(finalshortcode)

    if (links) {
      req.flash("errors","Short code already exists. Please choose another.");
    return res.redirect("/shortcode");

    }
    
 await insertShortLink({
      url, finalshortcode,userId:req.user.id,
    })

    return res.redirect("/shortcode");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }}


  export const redirecttoshortlink = async (req, res) => {
  try {
    const { shortcode } = req.params;
    // const links = await loadLinks();
     const links = await getshortlinkbyshortcode(shortcode)

    if (!links) return res.status(404).send("404 error occurred");

    return res.redirect(links.url);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
}

// getshortnereditPage

export const getshortnereditPage=async(req,res)=>{
     if (!req.user) return res.redirect("/login");

  const {data:id,error}= z.coerce.number().int().safeParse(req.params.id)
  if(error) return res.redirect("/404")
  try {
    const shortLink = await findshortlinkbyId(id)
  if(!shortLink) return res.redirect("/404")
res.render("edit-shortlink",{
  id:shortLink.id,
  url:shortLink.url,
  shortcode:shortLink.shortcode,
  errors:req.flash("errors"),
})
  } catch (error) {
     console.error(error);
    return res.status(500).send("Internal server error");
  }
}


export const deleteshortcode=async(req,res)=>{

  try {
    const {data:id,error}= z.coerce.number().int().safeParse(req.params.id)
  if(error) return res.redirect("/404")
    await deleteshotcodebyId(id)
    return res.redirect("/shortcode");
  } catch (error) {
     console.error(error);
    return res.status(500).send("Internal server error");
  }
}