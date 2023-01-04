import AO3 from "../mod.ts";
import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";

export default function test(ao3: AO3) {
    Deno.test("searches", async (test) => {
        await test.step("specific search", async () => {
            const search = ao3.search({
                freeform: [
                    "no beta we die like sammy",
                    "not at all your honor",
                ],
                fandoms: ["Bendy and the Ink Machine"],
            });
            await search.update(0);

            assert(search.results[0].id === "43251729", "incorrect work found");
        });
        await test.step("broad search", async () => {
            const search = ao3.search({
                freeform: [
                    "Smut",
                ],
            });
            await search.update(0);
            assert(search.results.length > 10, "not enough search results");

            await search.update(1);
            assert(
                search.results.length > 10,
                "could not find second page of results",
            );
        });
    });
}
