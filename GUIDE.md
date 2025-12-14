### Typescript setup guide

1. install devdependencies

```bash
npm install --save-dev typescript @types/node
```

2. Configure TypeScript
   Generate a tsconfig.json file, which contains all the configuration settings for the TypeScript compiler

```bash
npx tsc --init
```

Now just create a index.ts and configure output:/dist so that compiled JS will be in /dist/index.js

index.js ---> a add function loggin the answer.

```bash
tsc
```

these `tsc` command checks types of all **.ts** files and compiled it in dist folder. then you can run `node dist/index.js` and console log will appear.

2️⃣ tsx — TypeScript Runtime (DEV TOOL)
It is a runtime loader for Node that:

- Transpiles TS → JS in memory

- Immediately executes it

No files written.

```bash
tsx src/index.ts
```

**Under the hood**

```bash
1. tsx starts Node with a custom loader
2. esbuild transpiles TS → JS (fast)
3. Node executes compiled JS in memory
4. Process keeps running
```

**Compile vs Transpile**

- Compile → type check + transform **(tsc)**

- Transpile → transform only **(tsx)**

- This is the reason **tsx** is fast.

#### But these `tsx` dont work globally like running `tsx src/index.ts`.❌

#### Instead use in scripts. "dev" : "npx src/index.js" in package.json.

for developement i use - `nodemon --watch src --ext ts --exec tsx src/index.ts`

ALSO SOME LEARNINGS -

1. `exclude` and `include` keys in **tsconfig.js** helpd track and untack & type check files and dirs.

```bash
"include": ["src/**/*"],
"exclude": ["prisma.config.ts", "node_modules"]
```

2. the option - `"allowImportingTsExtensions": true` is not good for prod. **AVOID IT**

---

### Prisma setup v7

1. install dependensies. **Make sure you intialize project nodejs project in TS**.

```bash
npm install prisma @types/node @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv
```

run following cmd to intialize the prisma.

```bash
npx prisma init --datasource-provider postgresql
```

here datasource provider is postgresql because we are using postgres database.

this cmd creates `prisma/schema.prisma` and `prisma.config.ts`. the output = "../src/generated/prisma" - _i change it to custom path_.

Now write a model for test and ran following cmd

```bash
npx prisma generate
```

these actually generate **prisma client** in specified output path. ie in this case - src/generated/prisma.

Now, we have use these Prisma cleint which is generated to intialize the prisma instance.

`db/prisma.ts`

```javascript
// import Prisma from "../generated/prisma/client";
// const { PrismaClient } = Prisma;
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// Type the globalForPrisma object
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Handle graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

done.... now import the prisma and use to query..

---
