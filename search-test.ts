import AO3 from "./src/classes/AO3.ts";

const ao3 = new AO3();

const res = await ao3.search({
    freeform: ["no beta read we die like sammy"],
    limit: 1,
});

await res.update(1);

console.log(await res.results[0].chapters[0].text);
