import { IAxiodResponse } from "https://deno.land/x/axiod@0.26.2/interfaces.ts";
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";
import Work from "./Work.ts";

export default class AO3 {
    session: typeof axiod

    constructor(opts?: Record<string, any>) {
        this.session = axiod.create({
            baseURL: opts?.url ?? "https://archiveofourown.org/"
        })
    }

    async getWork(id: ID) {
        const res = await this.session.get(`/works/${id}?view_adult=true&view_full_work=true`)
        return new Work(id, res.data, this.session)
    }
}