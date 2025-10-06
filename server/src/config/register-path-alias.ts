import Module from "module";
import path from "path";

const aliasPrefix = "@/";
const moduleWithResolve = Module as unknown as typeof Module & { __atAliasPatched?: boolean };

if (!moduleWithResolve.__atAliasPatched) {
  const originalResolveFilename = Module._resolveFilename;
  const projectRoot = path.resolve(__dirname, "..");

  moduleWithResolve._resolveFilename = function (
    request: string,
    parent: NodeModule | null,
    isMain: boolean,
    options: unknown
  ) {
    if (typeof request === "string" && request.startsWith(aliasPrefix)) {
      const withoutPrefix = request.slice(aliasPrefix.length);
      const resolvedRequest = path.join(projectRoot, withoutPrefix);
      return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
    }

    return originalResolveFilename.call(this, request, parent, isMain, options);
  } as typeof Module._resolveFilename;

  moduleWithResolve.__atAliasPatched = true;
}
