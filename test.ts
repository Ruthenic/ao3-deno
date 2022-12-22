import AO3 from "./src/classes/AO3.ts";
import { assert } from "https://deno.land/std@0.161.0/testing/asserts.ts";

const ao3 = new AO3();

/* const res = await ao3.search({
    any: "hazbin hotel",
    limit: 1,
});

await res.update(1);

console.log(await res.results[0].chapters[0].text); */

let work = await ao3.getWork("43724875");

await work.init();
