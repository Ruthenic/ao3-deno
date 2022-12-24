import AO3 from "./src/classes/AO3.ts";

const ao3 = new AO3();

await ao3.authenticate(
    Deno.env.get("AO3USERNAME") as string,
    Deno.env.get("AO3PASSWORD") as string,
);

const res = await ao3.search({
    fandoms: ["Murder Drones (Web Series)"],
    limit: 10,
});

await res.update(1);

res.results.forEach(
    (v) => console.log(v.name),
);
