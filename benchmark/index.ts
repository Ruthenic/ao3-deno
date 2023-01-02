import AO3 from "../mod.ts";

const ao3 = new AO3();

await ao3.authenticate(
    "mdrakea3@tutanota.com",
    Deno.env.get("PASSWORD") as string,
);

const work = await ao3.getWork("43757691");
await work.init();

console.log(work.tags);

const chapter = work.chapters[0];

console.log(await chapter.text);
