import AO3 from "./src/classes/AO3.ts";
import { assert } from "https://deno.land/std@0.161.0/testing/asserts.ts";

const ao3 = new AO3();

let work = await ao3.getWork("37522864");

await work.init();

assert(work.tags.length > 0);
assert(work.tags.includes("Hazbin Hotel (Web Series)")); //fandom tags
assert(work.tags.includes("Angel Dust/Husk (Hazbin Hotel)")); //ship tags
assert(work.tags.includes("FizzaRolli (Helluva Boss)")); //character tags
assert(work.tags.includes("Attempted Murder")); //freeform tags
console.log(`TAGS: ${work.tags}`);
assert(work.published instanceof Date);
console.log(`PUBLISHED: ${work.published}`);
assert(work.updated instanceof Date);
console.log(`UPDATED: ${work.updated}`);

assert(work.chapters.length > 0);
assert(await work.chapters[0].id == "93652975");
assert(await work.chapters[0].workID == "37522864");
assert(await work.chapters[0].name == "Part I");
assert((await work.chapters[0].text).length > 0);

work = await ao3.getWork("39612636");

await work.init();

//NOTE: this is not to actually make sure we're at feature parity; this is just to track regressions
assert(
  (await work.chapters[22].startNote) ===
  `TW: minor suicidal themes\n\nI'll admit, this chapter is a little... Choppy. I had an idea and I had to make do with the time I had. \n\nSmall note: I changed Diamond’s description. Before she had black tattoos and white scars over her skin. Now it’s just all scarring.`,
);
assert(
  (await work.chapters[22].endNote) ===
    "Sorry, no Ozzie + Fizz reunion yet. I promise the next chapter will be better tho",
);
assert(
  (await work.chapters[22].summary) ===
    "Fizz tries to make the best out of his comeback",
);
