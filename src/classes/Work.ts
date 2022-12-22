import Chapter from "./Chapter.ts";
import { DOMParser, Element, HTMLDocument, ID } from "../types.d.ts";

export default class Work {
    #session: {
        get: (path: string) => Promise<Response>;
    };
    /**
     * ID of the work
     */
    id: ID;
    #document: HTMLDocument;
    #DOMParser: DOMParser;
    /**
     * the name of the work
     */
    name = "";
    /**
     * a list of Chapters in the work
     */
    chapters: Chapter[] = [];
    /**
     * a list of tags in the work
     */
    tags: string[] = [];
    /**
     * the approximate date the work was published
     */
    published?: Date;
    /**
     * the approximate date the work was last updated
     */
    updated?: Date;

    /**
     * represents a work on AO3
     * @param id the ID of the work
     * @param body the HTML body of the work (in text)
     * @param session an axiod session (used for fetching additional details)
     */
    constructor(
        id: ID,
        body: string,
        session: {
            get: (path: string) => Promise<Response>;
        },
        DOMParser: DOMParser,
    ) {
        this.#session = session;
        this.id = id;
        this.#document = DOMParser.parseFromString(
            body,
            "text/html",
        ) as HTMLDocument;
        this.#DOMParser = DOMParser;
    }

    //jank incarnate
    async init() {
        this.populateMetadata();
        this.populateTags();
        this.populateDates();
        await this.populateChapters();
    }

    // deletes our #document if we want to clean up memory and not use a shitton
    freeDocument() {
        //completely sane behaviour
        this.#document = undefined as unknown as HTMLDocument;
    }

    populateMetadata() {
        this.name = (this.#document.querySelector("h2.title") as Element)
            .innerText.trim();
    }

    populateTags() {
        Array.from(
            (this.#document.querySelector("dd.fandom > ul.commas") as Element)
                ?.children ?? [],
        ).map(
            (t) => this.tags.push(t.children[0].innerText),
        );
        Array.from(
            (this.#document.querySelector(
                "dd.relationship > ul.commas",
            ) as Element)
                ?.children ?? [],
        ).map(
            (t) => this.tags.push(t.children[0].innerText),
        );
        Array.from(
            (this.#document.querySelector(
                "dd.character > ul.commas",
            ) as Element)
                ?.children ?? [],
        ).map(
            (t) => this.tags.push(t.children[0].innerText),
        );
        Array.from(
            (this.#document.querySelector("dd.freeform > ul.commas") as Element)
                ?.children ?? [], //does that make me insane
        ).map(
            (t) => this.tags.push(t.children[0].innerText),
        );
    }

    populateDates() {
        this.published = new Date(
            this.#document.querySelector("dd.published")?.innerText as string,
        );
        this.updated = new Date(
            this.#document.querySelector("dd.status")?.innerText as string,
        );
    }

    //CW: horrifying jank
    async populateChapters() {
        let firstChapterUrl = ""; //satisfy the typescript gods
        try {
            firstChapterUrl =
                (this.#document.querySelector("li.chapter > a") as Element)
                    .getAttribute(
                        "href",
                    ) as string + "?view_adult=true";
        } catch {
            //assume single chapter work
            const newChapter = new Chapter(
                this.id,
                this.id,
                this.#session,
                this.#DOMParser,
                {},
            );
            this.chapters.push(
                newChapter,
            );
            return;
        }
        const res = await this.#session.get(firstChapterUrl);
        const document = this.#DOMParser.parseFromString(
            await res.text(),
            "text/html",
        ) as HTMLDocument;

        Array.from((document.getElementById("selected_id") as Element).children)
            .sort(
                (a, b) => {
                    return Number(a.getAttribute("value")) -
                        Number(b.getAttribute("value"));
                },
            ).forEach((c) => {
                const newChapter = new Chapter(
                    this.id,
                    c.getAttribute("value") as string,
                    this.#session,
                    this.#DOMParser,
                    { name: c.innerText },
                );
                this.chapters.push(
                    newChapter,
                );
            });
    }
}
