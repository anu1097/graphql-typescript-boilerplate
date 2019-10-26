import { generateMergedSchema } from './../utils/utils';
import { generateNamespace } from '@gql2ts/from-schema';
import * as fs from 'fs';
import * as path from 'path';

fs.writeFile(path.join(__dirname+'/../types/schema.d.ts'), generateNamespace('GQL', generateMergedSchema()), (err)=>{console.log({err})});
