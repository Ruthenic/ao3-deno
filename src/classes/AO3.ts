import Work from "./Work.ts";
import { ID } from "../types.d.ts";
import {
    DOMParser,
} from "https://denopkg.dev/gh/Ruthenic/deno-dom@master/deno-dom-native.ts";
import Search, { SearchParameters } from "./Search.ts";

export default class AO3 {
    session: {
        get: (path: string) => Promise<Response>;
    };
    DOMParser = new DOMParser();

    /**
     * a representation of AO3 in class form
     */
    constructor(opts?: {
        url?: string;
    }) {
        /*this.session = axiod.create({
      baseURL: opts?.url ?? "https://archiveofourown.org/",
    });*/
        this.session = {
            get: async (path: string) => {
                const res = await fetch(
                    opts?.url ?? "https://archiveofourown.org/" + path,
                );
                if (res.status > 300) {
                    console.log(res);
                    throw new Error("Failed request, probably rate-limited");
                }
                return res;
            },
        };
    }

    /**
     * gets a Work from an ID
     * @returns {Promise<Work>} a Work class for the work
     */
    async getWork(id: ID): Promise<Work> {
        const res = await this.session.get(
            `/works/${id}?view_adult=true&view_full_work=true`,
        );
        return new Work(id, await res.text(), this.session, new DOMParser());
    }

    async search(opts: SearchParameters) {
        return new Search(opts, this.session, new DOMParser());
    }
}
