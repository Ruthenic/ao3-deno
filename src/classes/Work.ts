import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts"
import Chapter from "./Chapter.ts"
import { DOMParser, Element, HTMLDocument } from "https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts";

export default class Work {
    session: typeof axiod
    id: ID
    document: HTMLDocument
    chapters: Chapter[] = []
    tags: string[] = []
    published?: Date
    updated?: Date

    constructor(id: ID, body: string, session: typeof axiod) {
        this.session = session
        this.id = id
        this.document = new DOMParser().parseFromString(body, "text/html") as HTMLDocument
        this.populateTags()
        this.populateDates()
    }

    populateTags() {
        Array.from((this.document.querySelector("dd.fandom > ul.commas") as Element).children).map(
            t => this.tags.push(t.children[0].innerText)
        )
        Array.from((this.document.querySelector("dd.relationship > ul.commas") as Element).children).map(
            t => this.tags.push(t.children[0].innerText)
        )
        Array.from((this.document.querySelector("dd.character > ul.commas") as Element).children).map(
            t => this.tags.push(t.children[0].innerText)
        )
        Array.from((this.document.querySelector("dd.freeform > ul.commas") as Element).children).map(
            t => this.tags.push(t.children[0].innerText)
        )
    }

    populateDates() {
        this.published = new Date(this.document.querySelector("dd.published")?.innerText as string)
        this.updated = new Date(this.document.querySelector("dd.status")?.innerText as string)
    }
}