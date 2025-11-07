import {createReadStream,createWriteStream} from "fs"
import path from "path"

const inputfilepath = path.join(import.meta.dirname,'input.txt');
const outputfilepath = path.join(import.meta.dirname,'output.txt');

const readablestream = createReadStream(inputfilepath,{encoding:"utf-8",highWaterMark:16,});

const writablestream = createWriteStream(outputfilepath)

readablestream.pipe(writablestream)


readablestream.on("error",(error)=> console.error("Error Occurred",error.message))
writablestream.on("error",(error)=> console.error("Error Occurred",error.message))



//   <!-- <% if (errors && errors.length>0) { %>
//             <div class="errors">
//               <% errors.forEach(error => { %>
//               <li><%= error %></li>
//               <% }) %>
//             </div>
//             <% } %> -->

// <div class="status <%= isLogedin ? 'in' : 'out' %>">
//   <%= isLogedin ? '✔ You are Logged IN' : '❌ You are not Logged In' %>
// </div>