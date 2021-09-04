import ts from 'typescript';


export function refactorNoBlock<T extends ts.Node>(/*typeChecker: TypeChecker*/): ts.TransformerFactory<T> {
  return (context) => {
    let parent;
    const visit: ts.Visitor = (node) => {
      if (ts.isDecorator(node)) {
        return undefined;
      }
      if (
        ts.isMethodDeclaration(node)
      ) {

        return ts.updateMethod(
          node,
          node.decorators,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.questionToken,
          node.typeParameters,
          node.parameters.map(it => {
            return ts.updateParameter(it,
              it.decorators,
              it.modifiers,
              it.dotDotDotToken,
              it.name,
              it.questionToken ? it.questionToken : (it.initializer ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined),
              it.type,
              undefined
            );
          }),
          node.type,
          undefined
        );
      }

      return ts.visitEachChild(node, (child) => visit(child), context);
    };

    return (node) => ts.visitNode(node, visit);
  };
}
