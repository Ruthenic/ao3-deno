import AO3 from "../mod.ts";
import type { Work } from "../mod.ts";
import { assert } from "https://deno.land/std@0.167.0/testing/asserts.ts";

export default async function test(ao3: AO3) {
    Deno.test("works", async (test) => {
        let work: Work;
        await test.step("initialization", async () => {
            work = await ao3.getWork("43251729");
            await work.init();
        });

        await test.step("tags", async (test) => {
            assert(work.tags.length > 0, "Failed to parse any tags");
            await test.step("fandoms", () => {
                assert(
                    work.tags.includes("Bendy and the Ink Machine"),
                    "Failed to get correct fandom tags",
                );
            });
            await test.step("characters", () => {
                assert(
                    work.tags.includes("Bendy (Bendy and the Ink Machine)"),
                    "Failed to get correct character tags",
                );
            });
            await test.step("ships", () => {
                assert(
                    work.tags.includes(
                        "Bendy (Bendy and the Ink Machine)/Reader",
                    ),
                    "Failed to get correct ship tags",
                );
            });
            await test.step("freeforms", () => {
                assert(
                    work.tags.includes("no beta read we die like sammy"),
                    "Failed to get correct freeform tags",
                );
            });
        });

        await test.step("other metadata", () => {
            assert(
                work.name === "Inky Desires [Bendy X Reader]",
                "incorrect work name",
            );
        });
    });
}
