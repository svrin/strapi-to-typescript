import * as fs from 'fs';
import * as path from 'path';
import { IStrapiModel } from './models/strapi-model';

/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function to return the results when the processing is done. Returns all files with full path.
 * @param filter Optional filter to specify which files to include, e.g. for json files: (f: string) => /.json$/.test(f)
 */
const walk = (
  dir: string,
  done: (err: Error | null, files?: string[]) => void,
  filter?: (f: string) => boolean
) => {
  let foundFiles: string[] = [];
  fs.readdir(dir, (err: NodeJS.ErrnoException | null, list: string[]) => {
    if (err) {
      return done(err);
    }
    let pending = list.length;
    if (!pending) {
      return done(null, foundFiles);
    }
    list.forEach((file: string) => {
      file = path.resolve(dir, file);
      // tslint:disable-next-line:variable-name
      fs.stat(file, (_err2, stat) => {
        if (stat && stat.isDirectory()) {
          walk(
            file,
            // tslint:disable-next-line:variable-name
            (_err3, res) => {
              if (res) {
                foundFiles = foundFiles.concat(res);
              }
              if (!--pending) {
                done(null, foundFiles);
              }
            },
            filter
          );
        } else {
          if (typeof filter === 'undefined' || (filter && filter(file))) {
            foundFiles.push(file);
          }
          if (!--pending) {
            done(null, foundFiles);
          }
        }
      });
    });
  });
};

export const findFiles = (dir: string, ext: RegExp = /.settings.json$/) =>
  new Promise<string[]>((resolve, reject) => {
    const filter = (f: string) => ext.test(f);
    walk(
      dir,
      (err, files) => {
        if (err) {
          reject(err);
        } else if (files) {
          resolve(files);
        }
      },
      filter
    );
  });


/**
 * Wrapper around "findFiles".
 * 
 */
export async function findFilesFromMultipleDirectories(...files: string[]): Promise<string[]> {
  const inputs = [... new Set(files)]

  var actions = inputs.map(i => fs.statSync(i).isFile() ? [i] : findFiles(i)); // run the function over all items

  // we now have a promises array and we want to wait for it

  var results = await Promise.all(actions); // pass array of promises

  // flatten
  return (new Array<string>()).concat.apply([], results)
}

/*
 */
export const importFiles = (files: string[], results:IStrapiModel[] = [], merge: Partial<IStrapiModel> = {}) =>
  new Promise<IStrapiModel[]>((resolve, reject) => {

    let pending = files.length;

    files.forEach(f => {

      try {
        const data = fs.readFileSync(f, { encoding: 'utf8' });
        
        pending--;

        let strapiModel = Object.assign(JSON.parse(data), { _filename: f, ...merge })
        if (strapiModel.info && strapiModel.info.name) {
          
          let sameNameIndex = results.map(s => s.info.name).indexOf(strapiModel.info.name);
          if (sameNameIndex === -1 || strapiModel._isComponent !== results[sameNameIndex]._isComponent) {
            results.push(strapiModel);
          } else {
            console.warn(`Already have model '${strapiModel.info.name}' => skip ${results[sameNameIndex]._filename} use ${strapiModel._filename}`)
            results[sameNameIndex] = strapiModel;
          }
        } else {
          results.push(strapiModel);
        }

        if (pending === 0) {
          resolve(results);
        }
      } catch (err) {
        reject(err);
      }
    })
  });
