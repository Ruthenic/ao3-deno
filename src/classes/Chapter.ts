import { DOMParser, Element, HTMLDocument, ID } from "../types.d.ts";

export default class Chapter {
    #session: {
        get: (path: string) => Promise<Response>;
    };
    isInited = false;
    #document!: HTMLDocument;
    #DOMParser: DOMParser;
    #id: ID;
    #workID: ID;
    #name!: string;
    #html!: string;
    #text!: string;
    #summary!: string;
    #startNote!: string;
    #endNote!: string;
    earlyName?: Promise<string>;
    id!: Promise<ID>;
    workID!: Promise<ID>;
    name!: Promise<string>;
    html!: Promise<string>;
    text!: Promise<string>;
    summary!: Promise<string>;
    startNote!: Promise<string>;
    endNote!: Promise<string>;

    constructor(
        workId: ID,
        id: ID,
        session: {
            get: (path: string) => Promise<Response>;
        },
        DOMParser: DOMParser,
        // deno-lint-ignore no-explicit-any
        extraInfo: Record<string, any>,
    ) {
        this.#session = session;
        this.#workID = workId;
        this.#id = id;
        this.#DOMParser = DOMParser;
        this.earlyName = extraInfo.name;

        return new Proxy(this, {
            get: async (target, prop) => {
                if (prop === "earlyName") {
                    return this.earlyName;
                }
                if (!this.isInited) {
                    await target.init();
                    target.isInited = true;
                }
                switch (prop) {
                    case "id":
                        return target.#id;
                    case "workID":
                        return target.#workID;
                    case "name":
                        return target.#name;
                    case "html":
                        return target.#html;
                    case "text":
                        return target.#text;
                    case "summary":
                        return target.#summary;
                    case "startNote":
                        return target.#startNote;
                    case "endNote":
                        return target.#endNote;
                }
            },
        });
    }

    async init() {
        const res = await this.#session.get(
            `/works/${this.#workID}/chapters/${this.#id}?view_adult=true`,
        );
        this.#document = this.#DOMParser.parseFromString(
            await res.text(),
            "text/html",
        ) as HTMLDocument;
        this.populateMetadata();
        this.populateSummary();
        this.populateNotes();
        await this.populateText();
    }

    populateMetadata() {
        this.#name = this.#document.querySelector("h3.title")?.innerText
            .replace(
                /Chapter \d+: /,
                "",
            ).trim() as string;
    }

    populateSummary() {
        this.#summary = this.#document.querySelector("#summary > .userstuff")
            ?.innerText.trim() as string;
    }

    populateNotes() {
        const notesList = Array.from(
            this.#document.querySelectorAll(".notes > .userstuff"),
        ).map((n) => (n as Element).innerHTML);
        this.#startNote = notesList[0]?.trim()?.replace(/<\/{0,1}p>/g, "\n")
            ?.trim();
        this.#endNote = notesList[1]?.trim()?.replace(/<\/{0,1}p>/g, "\n")
            ?.trim();
    }

    async populateText() {
        this.#text = "";

        Array.from(
            this.#document.querySelectorAll(
                "div.userstuff[role='article'] > p",
            ),
        ).forEach(
            (t) => {
                this.#text += (t as Element).innerText + "\n";
            },
        );
        try {
            this.#text = this.#text.trim();

            this.#html = (this.#document.querySelector(
                "div.userstuff[role='article']",
            ) as Element).innerHTML;
        } catch {
            //assume single chapter work
            const res = await this.#session.get(
                `/works/${this.#workID}?view_adult=true`,
            );
            this.#document = this.#DOMParser.parseFromString(
                await res.text(),
                "text/html",
            ) as HTMLDocument;

            this.#html = (this.#document.querySelector(
                "[role='article'] > div.userstuff",
            ) as Element).innerHTML;

            Array.from(
                this.#document.querySelectorAll(
                    "[role='article'] > div.userstuff > p",
                ),
            ).forEach(
                (t) => {
                    this.#text += (t as Element).innerText + "\n";
                    this.#html += (t as Element).innerHTML;
                },
            );
        }
    }
}
