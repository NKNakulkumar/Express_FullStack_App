
import fs  from "fs/promises"
import path from "path"
import ejs from "ejs"
import mjml2html from "mjml"
export const gethtmlfromMjmltemplate= async(templete,data)=>{

const mjmltemplate = await fs.readFile(path.join(import.meta.dirname,"..","emails",`${templete}.mjml`),"utf-8")

const firldtemplate  = ejs.render(mjmltemplate,data)

return  mjml2html(firldtemplate).html;


}