import Parser from 'php-parser';
import * as fs from 'fs';
import { OutputVisitor } from './app/output-visitor';
import { Output } from './app/output';
import ts from 'typescript';
import { glob } from 'glob';
import { dirname, join, resolve } from 'path';

const parser = new Parser({
  ast: {
    withPositions: true,
    withSource: true
  },
  parser: {
    extractDoc: true
  }
});

const ROOT = '../../../';

glob('source-code/**/*.php', {
  root: ROOT
}, function(er, files) {
  console.log(files);

  fs.rmdirSync(join(ROOT, 'dist', 'output-ts'), { recursive: true });


  files.forEach(it => {
    const code = fs.readFileSync(resolve(__dirname, join(ROOT, it)), 'utf8');

    if (!(code.includes('class') || code.includes('interface') || code.includes('trait'))) {
      return;
    }
    let node;
    try {
      const result = parser.parseCode(code, it);


      const output = new Output();
      const visitor = new OutputVisitor(output);
      node = visitor.beginParse(result);

      visitor.flushLog();
    } catch (e) {
      console.log(e);
      console.error(`error occur in ${it}`);
    }

    const printer = ts.createPrinter({ removeComments: false, newLine: ts.NewLineKind.LineFeed });

    const resultFile = ts.createSourceFile('someFileName.ts', '', ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);

    let emitted;
    try {
      if (Array.isArray(node) && node.length > 1) {
        emitted = node.filter(it => it && it.kind === ts.SyntaxKind.SourceFile).map(it => {
          return printer.printNode(ts.EmitHint.Unspecified, it, resultFile);
        }).join('\n\n');
      } else {
        emitted = printer.printNode(ts.EmitHint.Unspecified, node, resultFile);
      }
    }catch (e) {
      console.log(`file: ${it}`)
      console.error(e)
    }

    const fileName = resolve(__dirname, join(ROOT, 'dist/output-ts', it.replace(/.php$/g, '.ts')));
    fs.mkdirSync(dirname(fileName), { recursive: true });

    fs.writeFileSync(fileName, emitted);

  });

});
//
// const dir = fs.readdirSync('../../../source-code', { encoding: 'utf8' });
//
//
