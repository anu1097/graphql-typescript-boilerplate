import { generateNamespace } from "@gql2ts/from-schema";
import * as fs from "fs";
import * as path from "path";
import { generateMergedSchema } from "./../utils/utils";

fs.writeFile(
	path.join(__dirname + "/../types/schema.d.ts"),
	// tslint:disable-next-line: no-console
	generateNamespace("GQL", generateMergedSchema()), (err) => { console.log({ err }); },
);
