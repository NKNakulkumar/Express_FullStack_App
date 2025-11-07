
import { Router } from 'express';
import { PostUrlshortcode,getshortnerPage,getshortnereditPage,redirecttoshortlink,deleteshortcode } from '../controllers/post.controllers.js';

// const router = Router();
// // router.get('/report',(req,res)=>{
// // res.render('report')
// // })
// // controller
// router.get('/shortcode', getshortnerpage)
// router.post('/shortcode', ShortnerControl)
// router.get('/:shortcode', redirecttoshortlink)
// // router.route("/edit/:id").get(getshortnereditPage)
// // router.route("/delete/:id").post(deleteshortcode)



const router = Router();


router.get("/shortcode", getshortnerPage)
router.post("/",PostUrlshortcode)
router.post("/shortcode",PostUrlshortcode)
router.get("/:shortcode", redirecttoshortlink);
router.route("/edit/:id").get(getshortnereditPage)
router.route("/delete/:id").post(deleteshortcode)
export const shortnerRoutes =  router;