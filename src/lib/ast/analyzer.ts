const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");
const Python = require("tree-sitter-python");
const TypeScript = require("tree-sitter-typescript");

export function analyzeCode(code: string, language: string) {
  if (!code || typeof code !== "string") {
    console.warn("AST Analyzer: No valid code provided");
    return null;
  }

  const parser = new Parser();

  try {
    switch (language.toLowerCase()) {
      case "javascript":
        if (JavaScript && typeof JavaScript === "object") parser.setLanguage(JavaScript);
        break;
      case "python":
        if (Python && typeof Python === "object") parser.setLanguage(Python);
        break;
      case "typescript":
        const tsLang = TypeScript.typescript || (typeof TypeScript === "object" ? TypeScript : null);
        if (tsLang) parser.setLanguage(tsLang);
        break;
      default:
        return null;
    }

    const tree = parser.parse(code);
    
    const results = {
      classes: 0,
      functions: 0,
      imports: 0,
      complexity: 0,
    };

    const traverse = (node: any) => {
      if (!node) return;
      
      const type = node.type;
      if (type.includes("class_definition") || type.includes("class_declaration")) {
        results.classes++;
      }
      if (type.includes("function_definition") || type.includes("method_definition") || type.includes("arrow_function")) {
        results.functions++;
      }
      if (type.includes("import_statement") || type.includes("import_from_statement")) {
        results.imports++;
      }
      
      results.complexity += node.childCount;

      for (let i = 0; i < node.childCount; i++) {
        traverse(node.child(i));
      }
    };

    traverse(tree.rootNode);
    return results;
  } catch (error) {
    console.error("AST Parsing Error:", error);
    return null;
  }
}
