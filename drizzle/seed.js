
import {db} from '../config/db.js'
import * as schemas  from './schema.js'
import { reset, seed } from 'drizzle-seed'

// await reset(db,schemas)
// When ever You can Reset All you data


const USER_ID = 1;

await reset(db, {
  ShortLinkTable: schemas.shortLink
});

await seed(
  db,
  { ShortLinkTable: schemas.shortLink },
  { count: 100 }
).refine((f) => ({
  ShortLinkTable: {
    columns: {
      userId: f.default({ defaultValue: USER_ID }),
      url: f.default({
        defaultValue: "https://weatherclimateapp.vercel.app/"
      })
    }
  }
}));

process.exit(0);
