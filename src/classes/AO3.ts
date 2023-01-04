import Work from "./Work.ts";
import { ID } from "../types.d.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { HTMLDocument } from "../types.d.ts";
import Search, { SearchParameters } from "./Search.ts";
import { newSession, Options } from "../utils/http.ts";

export default class AO3 {
    session: ReturnType<typeof newSession>;
    DOMParser = new DOMParser();

    /**
     * a representation of AO3 in class form
     */
    constructor(opts?: Options) {
        if (opts && !opts.headers) {
            opts.headers = {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; rv:108.0) Gecko/20100101 Firefox/108.0",
            };
        }
        this.session = newSession(opts ?? {});
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
