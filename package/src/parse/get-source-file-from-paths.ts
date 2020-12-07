import { Project, SourceFile, ts } from 'ts-morph';
import { error } from 'shared';

/*
 * Works like Project.getSourceFileOrThrow function,
 * but if an path alias is encountered, it tries to find the file by the alias
 */
export const getSourceFileOrThrow = (project: Project, relativeFilePath: string): SourceFile => {
  const compilerOptions = project.compilerOptions.get();
  const { paths } = compilerOptions;

  if (paths) {
    const matchedAliases = Object.keys(paths)
      .map(alias => ({
        originPath: alias,
        withoutAsterisk: alias.replace('*', '')
      }))
      .filter(({ withoutAsterisk }) => relativeFilePath.startsWith(withoutAsterisk));

    if (matchedAliases.length) {
      const baseUrl = compilerOptions.baseUrl || '';
      return tryGetSourceFileByAliasOrThrow(project, matchedAliases, paths, relativeFilePath, baseUrl);
    }
  }

  return project.getSourceFileOrThrow(relativeFilePath);
};

const tryGetSourceFileByAliasOrThrow = (
  project: Project,
  aliases: RouterKit.Parse.Alias[],
  paths: ts.MapLike<string[]>,
  relativeFilePath: string,
  baseUrl: string
): SourceFile => {
  const maxMatchedAlias = getMaxMatchedAlias(aliases);
  const resolvedPaths = paths[maxMatchedAlias.originPath];

  const sourceFile = resolvedPaths
    .map(path => {
      const pathWithBase = `${baseUrl}/${path.replace('*', '')}`;
      const resolvedPath = relativeFilePath.replace(maxMatchedAlias.withoutAsterisk, pathWithBase);
      return project.getSourceFile(resolvedPath);
    })
    .find(file => !!file);

  if (!sourceFile) {
    throw error(`Can't find file with relative path ${relativeFilePath}`);
  }

  return sourceFile;
};

const getMaxMatchedAlias = (aliases: RouterKit.Parse.Alias[]): RouterKit.Parse.Alias => {
  return aliases.reduce((maxMatched: RouterKit.Parse.Alias, alias: RouterKit.Parse.Alias) => {
    const maxLength = maxMatched.withoutAsterisk.length;
    const currentAliasLength = alias.withoutAsterisk.length;

    return maxLength > currentAliasLength ? maxMatched : alias;
  }, aliases[0]);
};
