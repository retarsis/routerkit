import * as ora from 'ora';
import { Rule, Tree } from '@angular-devkit/schematics';
import { resolve } from 'path';

import { parseRoutes } from './parse-routes';
import { generateRoutesType } from '../generation/generateRoutesType';
import { generateFile } from '../generation/utils';
import { findAngularJSON, getProjectAST, getProjectTsconfigPath } from './utils.angular';
import { error, space, taskFinish, taskStart } from '../utils/common.utils';
import { findFilePath } from '../utils/fs.utils';

export function parse(options: RouterKit.Parse.Schema): Rule {
  return (tree: Tree) => {
    const { project: projectName, dryRun } = options;
    const ROOT_DIR = findFilePath(process.cwd());

    if (!projectName) {
      throw error('Project name expected.');
    } else if (ROOT_DIR === null) {
      throw error("Can't find angular.json");
    }

    const projectSpinner = ora({ text: taskStart('Analyzing project'), stream: process.stdout }).start();
    const angularJson = findAngularJSON(tree);
    const workspace = angularJson.projects[projectName];

    if (workspace === undefined) {
      throw error(`Can't find ${projectName} project in angular.json`);
    }

    const TSCONFIG_PATH = getProjectTsconfigPath(workspace, projectName);
    const projectAST = getProjectAST(TSCONFIG_PATH);
    projectSpinner.succeed(taskFinish('Project analyzed'));

    const parsingSpinner = ora({ text: taskStart('Parsing routes'), stream: process.stdout }).start();
    const parsedRoutes = parseRoutes(workspace, projectAST);
    parsingSpinner.succeed(taskFinish('Routes parsed', JSON.stringify(parsedRoutes, null, 4)));

    if (!dryRun) {
      const generatingTypeSpinner = ora(taskStart('Generating type')).start();
      const fileName = `${projectName}.routes.d.ts`;
      const filePath = resolve(ROOT_DIR, fileName);
      const routesType = generateRoutesType(parsedRoutes, fileName);
      generatingTypeSpinner.succeed(taskFinish('Type generated'));

      const generatingFileSpinner = ora(taskStart('Generating type')).start();
      generateFile({ project: projectAST, filePath, output: routesType });
      generatingFileSpinner.succeed(taskFinish('Output generated', filePath));

      /**
       * TODO: resolve later
       * const updatingTsconfigSpinner = ora(taskStart('Generating type')).start();
       * includeRoutesTypeIntoTsconfig(tsconfigPath, fileName);
       * updatingTsconfigSpinner.succeed(taskFinish('Project tsconfig is up-to-date', tsconfigPath));
       */
    }

    space();

    return tree;
  };
}
