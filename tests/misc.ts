import AO3 from "../mod.ts";
import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";

export default function test(ao3: AO3) {
    Deno.test("misc", async (test) => {
        await test.step("alternate instances", async () => {
            const ao3 = new AO3({
                url: "https://squidgeworld.org/",
            });

            const work = await ao3.getWork(34491);
            await work.init();

            assert(
                work.name === "Implementing OTW's Code To Build SquidgeWorld",
                "failed to get a work from alternate instance",
            );
        });
    });
}
