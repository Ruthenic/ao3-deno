import AO3 from "./src/classes/AO3.ts";
import { assert } from "https://deno.land/std@0.161.0/testing/asserts.ts";

const ao3 = new AO3();

const work = await ao3.getWork(37522864)

assert(work.tags.length > 0)
assert(work.tags.includes("Attempted Murder"))
console.log(`TAGS: ${work.tags}`)
assert(work.published instanceof Date)
console.log(`PUBLISHED: ${work.published}`)
assert(work.updated instanceof Date)
console.log(`UPDATED: ${work.updated}`)