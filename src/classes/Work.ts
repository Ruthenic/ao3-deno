import Chapter from "./Chapter.ts";
import type {
    DOMParser,
} from "https://denopkg.dev/gh/Ruthenic/deno-dom@master/src/dom/dom-parser.ts";
import type {
    Element,
} from "https://denopkg.dev/gh/Ruthenic/deno-dom@master/src/dom/element.ts";
import type {
    HTMLDocument,
} from "https://denopkg.dev/gh/Ruthenic/deno-dom@master/src/dom/document.ts";
import { ID } from "../types.d.ts";

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
        this.populateTags();
        this.populateDates();
        await this.populateChapters();
    }

    populateTags() {
        Array.from(
            (this.#document.querySelector("dd.fandom > ul.commas") as Element)
                .children,
        ).map(
            (t) => this.tags.push(t.children[0].innerText),
        );
        Array.from(
            (this.#document.querySelector(
                "dd.relationship > ul.commas",
            ) as Element)
                .children,
        ).map(
            (t) => this.tags.push(t.children[0].innerText),
        );
        Array.from(
            (this.#document.querySelector(
                "dd.character > ul.commas",
            ) as Element)
                .children,
        ).map(
            (t) => this.tags.push(t.children[0].innerText),
        );
        Array.from(
            (this.#document.querySelector("dd.freeform > ul.commas") as Element)
                .children,
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
        const firstChapterUrl =
            (this.#document.querySelector("li.chapter > a") as Element)
                .getAttribute(
                    "href",
                ) as string + "?view_adult=true";
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
                );
                this.chapters.push(
                    newChapter,
                );
            });
    }
}
