import AO3 from "../src/classes/AO3.ts";
import workTest from "./work.ts";
import chaptersTest from "./chapter.ts";

const ao3 = new AO3();

await workTest(ao3);
await chaptersTest(ao3);
