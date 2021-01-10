/**
 * (optional)
 * Register the function that would determine which parser should be used.
 * Or just declare a parser to use.
 * Or declare a way to parse the file in multiple languages. 
 *
 * You can determine parser to be used based on file name,
 * or based on file contents.
 */
declare function lang(fn: LANG | ((ctx: FileContext) => ParserChain | LANG | void) | ParserChain): void;

/**
 * (optional)
 * Set a rule description.
 * Useful for reporter to inform used on what rule he has failed.
 */
declare function desc(desc: string): void;

/**
 * Register the rule function.
 *
 * Use this function to run queries, look at source.
 * Add rule violations if any determined using.
 */
declare function run(fn: (ctx: MainContext) => void): void;

/**
 * Represents source code that rule is running against.
 *
 * File is read once and kept in memory.
 */
declare interface FileContext {

  /**
   * Absolute path for currectly tested file.
   */
  getFilename(): string;

  /**
   * Contents of currect file.
   */
  getBuffer(): Buffer;

  /**
   * Contents of currect file as string.
   */
  getSource(): string;
}

/**
 * Use this function to run queries, look at source.
 * Add rule violations if any determined using.
 */
declare interface MainContext extends FileContext {

  /**
   * Query a particular syntax tree.
   */
  query(lang: LANG, query: string): QueryMatch[];

  /**
   * Check if there exists a particular syntax.
   * Use this if you conditionaly choose the language to parse in.
   */
  hasSyntax(lang: LANG): boolean;

  /**
   * Returns root node of parsed language.
   * A file may contain a mix of many languages.
   * If choosen language is not found (not parsed) an error will be thrown.
   */
  getSyntax(lang: LANG): SyntaxNode;

  /**
   * Creates named violation in this context, and returns it.
   * If one or more calls to this method are made, the rule is considered failed.
   */
  violation(title: string): Violation;

  /**
   * Sugar that just adds all matched nodes from all patterns and all their
   * matches as violation.
   */
  toViolations(title: string, matches: QueryMatch[]): void;
}

declare interface Violation {

  /**
   * Bytes from and to in source buffer to be considered as error range.
   * Do not use this function if rule fails not because of file contents,
   * in cases when ruling on filename convention or file encoding.
   */
  setRange(range: number, end: number): this;
}

/**
 * All the languages this framework has support on.
 */
declare type LANG =
  "php"  |
  "html" |
  "css"  |
  "js"

/**
 * Structure that allows to describe a multilang file parsing.
 */
declare interface ParserChain {

  /**
   * The parser to use.
   */
  entry: LANG,

  /**
   * Subsequent parser configuratons.
   */
  chain?: ParserChain[],

  /**
   * Parallel tree to be used for for this parser.
   * Must be omited for top level parse.
   */
  from?: (parent_tree: Tree) => Range2[],

  /**
   * (!) Use this only when you absolutely have to.
   * This is an escape patch for cases when parent parser cannot handle the mixed language content.
   * Here you basically edit the source before parsing it with current level parser.
   * This source will be tossed after usage.
   */
  edit?: (source: string, parent_tree?: Tree) => string,
}

declare interface Capture {
  name: string,
  node: SyntaxNode,
}

declare interface QueryMatch {
  pattern: number,
  captures: Capture[],
}

declare interface SyntaxNode {
  tree: Tree;
  type: string;
  isNamed: boolean;
  text: string;
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
  parent: SyntaxNode | null;
  children: Array<SyntaxNode>;
  namedChildren: Array<SyntaxNode>;
  childCount: number;
  namedChildCount: number;
  firstChild: SyntaxNode | null;
  firstNamedChild: SyntaxNode | null;
  lastChild: SyntaxNode | null;
  lastNamedChild: SyntaxNode | null;
  nextSibling: SyntaxNode | null;
  nextNamedSibling: SyntaxNode | null;
  previousSibling: SyntaxNode | null;
  previousNamedSibling: SyntaxNode | null;

  hasError(): boolean;
  isMissing(): boolean;
  toString(): string;
  child(index: number): SyntaxNode | null;
  namedChild(index: number): SyntaxNode | null;
  firstChildForIndex(index: number): SyntaxNode | null;
  firstNamedChildForIndex(index: number): SyntaxNode | null;

  descendantForIndex(index: number): SyntaxNode;
  descendantForIndex(startIndex: number, endIndex: number): SyntaxNode;
  namedDescendantForIndex(index: number): SyntaxNode;
  namedDescendantForIndex(startIndex: number, endIndex: number): SyntaxNode;
  descendantForPosition(position: Point): SyntaxNode;
  descendantForPosition(startPosition: Point, endPosition: Point): SyntaxNode;
  namedDescendantForPosition(position: Point): SyntaxNode;
  namedDescendantForPosition(startPosition: Point, endPosition: Point): SyntaxNode;
  descendantsOfType(types: String | Array<String>, startPosition?: Point, endPosition?: Point): Array<SyntaxNode>;

  closest(types: String | Array<String>): SyntaxNode | null;
}

declare interface Tree {
  readonly rootNode: SyntaxNode;
}

declare type Point = {
  row: number;
  column: number;
};

declare type Range2 = {
  startIndex: number,
  endIndex: number,
  startPosition: Point,
  endPosition: Point
}
