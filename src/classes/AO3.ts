import Work from "./Work.ts";
import { ID } from "../types.d.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { HTMLDocument } from "../types.d.ts";
import Search, { SearchParameters } from "./Search.ts";
import {
    CookieJar,
    wrapFetch,
} from "https://deno.land/x/another_cookiejar@v5.0.1/mod.ts";

export default class AO3 {
    session: {
        get: (path: string) => Promise<Response>;
        post: (
            path: string,
            payload: unknown,
        ) => Promise<Response>;
    };
    DOMParser = new DOMParser();
    fetch: typeof fetch;
    cookieJar: CookieJar;
    #headers: Record<string, string>;

    /**
     * a representation of AO3 in class form
     */
    constructor(opts?: {
        url?: string;
    }) {
        this.cookieJar = new CookieJar();
        this.fetch = wrapFetch({ cookieJar: this.cookieJar });
        this.#headers = {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; rv:108.0) Gecko/20100101 Firefox/108.0",
        };
        this.session = {
            get: async (path: string) => {
                const res = await this.fetch(
                    opts?.url ?? "https://archiveofourown.org/" + path,
                    {
                        headers: this.#headers,
                    },
                );
                if (res.status > 300) {
                    console.log(res);
                    throw new Error("Failed request, probably rate-limited");
                }
                return res;
            },

            post: async (
                path: string,
                // deno-lint-ignore no-explicit-any
                payload: any,
                headers?: string,
            ) => {
                const res = await this.fetch(
                    opts?.url ?? "https://archiveofourown.org/" + path,
                    {
                        "credentials": "include",
                        headers: Object.assign(headers ?? {}, this.#headers),
                        method: "POST",
                        body: payload,
                    },
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
        return new Work(id, await res.text(), this.session, this.DOMParser);
    }

    async authenticate(username_or_email: string, password: string) {
        const loginPage = await this.session.get("/users/login");
        const document = this.DOMParser.parseFromString(
            await loginPage.text(),
            "text/html",
        ) as HTMLDocument;
        const authenticity_token = document.querySelector(
            "input[name='authenticity_token']",
        )?.getAttribute("value");
        if (authenticity_token) {
            await this.session.post(
                "/users/login",
                new URLSearchParams({
                    "user[login]": username_or_email,
                    "user[password]": password,
                    authenticity_token,
                    utf8: "✓",
                    commit: "Log In",
                }),
            );
        } else {
            throw new Error("Failed to get authenticity token");
        }
    }

    search(opts: SearchParameters) {
        return new Search(opts, this.session, this.DOMParser);
    }
}
