import { convert } from './ts-exporter';
import { IConfigOptions } from '..';
import { findFilesFromMultipleDirectories, importFiles, findFiles } from './importer';

const log = console.log;
const logError = console.error;

export const exec = async (options: IConfigOptions) => {
  try {
    // find *.settings.json
    let strapiModels = await importFiles(await findFilesFromMultipleDirectories(...options.input));

    if (options.inputGroup) console.log("option '--inputGroup' is deprecated use '--components'.");
    if (options.components || options.inputGroup )
      strapiModels = await importFiles(await findFiles(options.components || options.inputGroup, /(.json|schema.js)$/), strapiModels, { _isComponent: true });

    // build and write .ts
    const count = await convert(strapiModels, options);

    log(`Generated ${count} interfaces.`);
  } catch (e) {
    logError(e)
  }
};
