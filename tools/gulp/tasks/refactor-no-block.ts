import { dest, src, task } from 'gulp';
import { buildConfig } from '../../package-tools';
import { join } from 'path';
import through2 from 'through2';
import ts from 'typescript';
import { refactorNoBlock } from './method-no-block/refactor.no-block';


task('refactor-no-block:dist', async () => {
  console.log(buildConfig.projectDir);

  const projectDir = buildConfig.projectDir;
  const outputDir = join(buildConfig.outputDir, 'output-refactor-no-block');

  src('source-for-no-block/**/*.ts', {
    base: 'source-for-no-block/'
  })
    .pipe(
      through2.obj((file, _, cb) => {
        if (file.isBuffer()) {

          const filename = 'test.ts';
          const code = file.contents.toString();

          const sourceFile = ts.createSourceFile(
            filename, code, ts.ScriptTarget.Latest
          );

          let transformationResult = ts.transform(sourceFile, [
            refactorNoBlock(),
          ]);

          const transformedSourceFile = transformationResult.transformed[0];
          const printer = ts.createPrinter();

          const result = printer.printNode(
            ts.EmitHint.Unspecified,
            transformedSourceFile,
            transformedSourceFile
          );

          file.contents = Buffer.from(result);
        }
        cb(null, file);
      }))
    .pipe(
      dest(outputDir)
    );
});
