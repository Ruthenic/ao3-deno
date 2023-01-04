//FIXME: we need to test single-chapter works too (because those seem to be really inconsistent for some reason?)
import AO3 from "../mod.ts";
import {
    assert,
    AssertionError,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";

export default function test(ao3: AO3) {
    Deno.test("chapters", async (test) => {
        const work = await ao3.getWork("43251729");
        await work.init();

        await test.step("initialization", async () => {
            assert(
                work.chapters.length > 0,
                "chapters array is not initialized",
            );

            try {
                await work.chapters[0].init();
                await work.chapters[3].init();
            } catch {
                throw new AssertionError("failed to initialize chapter");
            }
        });

        await test.step("IDs", () => {
            assert(
                work.chapters[0].id === "108714198",
                "incorrect chapter ID",
            );
            assert(
                work.chapters[0].workID === "43251729",
                "incorrect work ID",
            ); //why do we even store the work's ID publicly in a chapter?
        });
        await test.step("name", () => {
            assert(
                work.chapters[0].name === "Welcome to the Studio",
                "incorrect/missing chapter names",
            );
        });
        await test.step("content", () => {
            //FIXME: this should probably be tested better
            assert(
                (work.chapters[0].text).length > 0,
                "text/content is completely missing",
            );
        });
        await test.step("notes and summary", () => {
            //FIXME: write a chapter of my fic (lol) that includes a summary and end note for testing
            assert(
                work.chapters[3].startNote ===
                    `If you haven't noticed yet, most of these chapters are named after Bendy fansongs

This is definitely because I'm trying to be smart and cool and make funny references, and definitely not because I'm uncreative :)`,
                "incorrect start note parsing",
            );
        });
    });
}
