// custom fetch wrappers.. for reasons
import {
    CookieJar,
    wrapFetch,
} from "https://deno.land/x/another_cookiejar@v5.0.1/mod.ts";

const cookieJar = new CookieJar();

const wrappedFetch = wrapFetch({
    cookieJar,
});

const defaultOptions = {
    url: "https://archiveofourown.org/",
    headers: {
        "User-Agent":
            `Mozilla/5.0 (Windows NT 10.0; rv:108.0) Gecko/20100101 Firefox/108.0`,
    },
};

export interface Options {
    url?: string;
    headers?: Record<string, string>;
}

const newSession = (opts: Options) => {
    opts = Object.assign(defaultOptions, opts);
    return {
        get: async (path: string) => {
            const res = await wrappedFetch(
                opts.url + path,
                {
                    headers: opts.headers,
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
            const res = await wrappedFetch(
                opts.url + path,
                {
                    "credentials": "include",
                    headers: Object.assign(headers ?? {}, opts.headers),
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
};

export { newSession };
