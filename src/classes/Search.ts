//NOTE: AO3's searching "api" is an absolute clusterfuck. i'm sorry.

import Work from "./Work.ts";
import asyncForEach from "../utils/asyncForeach.ts";
import { DOMParser, Element, HTMLDocument } from "../types.d.ts";

export const Ratings = {
    unrated: 9,
    generalAudiences: 10,
    teenAudiences: 11,
    mature: 12,
    explicit: 13,
};

export const Warnings = {
    creatorChoseNotToUseArchiveWarnings: 14,
    noArchiveWarningsApply: 16,
    graphicDepictionsOfViolence: 17,
    majorCharacterDeath: 18,
    noncon: 19,
    underage: 20,
};

export interface SearchParameters {
    /*
     * the amount of works to fetch
     *
    */
    limit?: number;
    any?: string;
    title?: string;
    author?: string;
    single_chapter?: boolean;
    word_count?: number;
    language?: string;
    fandoms?: string[];
    freeform?: string[];
    ratings?: number[];
    warnings?: number[];
}

export default class Search {
    #baseApiURL = "/works/search?commit=Search";
    #opts: SearchParameters;
    #session: {
        get: (path: string) => Promise<Response>;
    };
    #document!: HTMLDocument;
    #DOMParser: DOMParser;
    results: Work[] = [];

    #urlConstructor(pageNum = 1) {
        let url = this.#baseApiURL;

        url += `&page=${pageNum}
            &work_search[query]=${this.#opts.any ?? ""}
            &work_search[title]=${this.#opts.title ?? ""}
            &work_search[creators]=${this.#opts.author ?? ""}
            &${
            this.#opts.freeform?.map((v) => `work_search[freeform_names]=${v}`)
                .join("&")
        }`;

        return url;
    }

    constructor(opts: SearchParameters, session: {
        get: (path: string) => Promise<Response>;
    }, DOMParser: DOMParser) {
        this.#session = session;
        this.#opts = opts;
        this.#DOMParser = DOMParser;
    }

    async update(pageNum: number) {
        this.results = [];
        const url = this.#urlConstructor(pageNum);

        const res = await this.#session.get(url);
        this.#document = this.#DOMParser.parseFromString(
            await res.text(),
            "text/html",
        ) as HTMLDocument;

        let i = 0;
        const limit = this.#opts.limit ?? 20;
        await asyncForEach(
            Array.from(this.#document.querySelectorAll("[role='article']")),
            async (e: Element) => {
                if (i >= limit) {
                    return;
                }
                const workId = e.id.replace("work_", "");
                console.log(workId);
                const res = await this.#session.get(
                    `/works/${workId}?view_adult=true&view_full_work=true`,
                );
                const work = new Work(
                    workId,
                    await res.text(),
                    this.#session,
                    this.#DOMParser,
                );
                await work.init();
                this.results.push(work);
                i++;
            },
        );
    }
}
