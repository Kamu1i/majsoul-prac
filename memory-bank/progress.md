# 开发进度记录

## 2026-06-02：完成第 1 步，初始化最小前端工程

已完成 `memory-bank/implementation-plan.md` 中的第 1 步：初始化 Vite + TypeScript + 原生 HTML/CSS 最小前端工程。

本次完成内容：

- 新增 `package.json`，配置基础脚本：
  - `npm run dev`：启动 Vite 开发服务器。
  - `npm run build`：执行 TypeScript 类型检查并进行 Vite 生产构建。
  - `npm run test`：运行 Vitest 测试。
- 新增 `package-lock.json`，锁定 npm 依赖版本。
- 新增 `index.html`，作为浏览器入口页面。
- 新增 `src/main.ts`，渲染最小占位页面。
- 新增 `src/styles.css`，提供占位页面基础样式。
- 新增 `src/main.test.ts`，提供基础测试，确认测试框架可运行。
- 新增 `tsconfig.json`，配置 TypeScript 编译规则。
- 新增 `vite.config.ts`，配置 Vite 与 Vitest。

验证结果：

- 用户已确认测试全部通过。
- 用户已负责完成依赖安装与验证。

后续注意事项：

- 在用户明确要求前，不开始第 2 步。
- 第 2 步应在当前最小工程基础上建立模块化目录结构。
- 当前入口仍只包含占位展示，不包含牌、牌山、胡牌、计分或回合逻辑。

## 2026-06-02：完成第 2 步，建立模块化目录结构

已完成 `memory-bank/implementation-plan.md` 中的第 2 步：建立模块化目录结构。

本次完成内容：

- 新增 `src/game/` 目录，用于承载后续游戏核心逻辑与状态流转。
- 新增 `src/game/game-state.ts`，定义当前最小初始化状态 `GameState` 与 `createInitialGameState()`。
- 新增 `src/ui/` 目录，用于承载后续页面渲染与用户输入事件。
- 新增 `src/ui/render.ts`，将页面渲染职责从入口文件中拆出。
- 新增 `src/ui/events.ts`，提供事件绑定入口；当前为占位实现，后续交互步骤再扩展。
- 更新 `src/main.ts`，入口现在只负责引入样式、创建初始状态、调用渲染模块和事件模块。
- 更新 `src/main.test.ts`，覆盖初始化状态与 UI 渲染模块的基础行为。

验证结果：

- 用户已确认测试通过。

后续注意事项：

- 在用户明确要求前，不开始第 3 步。
- 第 3 步应定义基础牌数据模型，但不要把牌、牌山、胡牌或计分逻辑放回 `src/main.ts`。
- `src/main.ts` 应继续保持轻量，只作为模块连接入口。

## 2026-06-02：完成第 3 步，定义基础牌数据模型

已完成 `memory-bank/implementation-plan.md` 中的第 3 步：定义基础牌数据模型。

本次完成内容：

- 新增 `src/game/tile.ts`，定义当前项目允许使用的 12 种牌：一索至九索、白、发、中。
- 在 `src/game/tile.ts` 中定义 `TileSuit`、`SouzuRank`、`DragonValue`、`SouzuTile`、`DragonTile` 和 `Tile` 类型。
- 为每种牌提供稳定的 `id`、展示用 `label` 和排序用 `sortOrder`。
- 导出 `allowedTiles` 和 `tileIds`，作为后续牌池生成、手牌排序和规则判断的基础数据来源。
- 导出 `compareTiles()`，用于确定性排序。
- 导出 `isSameTile()`，用于按稳定 ID 判断两张牌是否为同一种牌。
- 导出 `getTileById()`，用于根据稳定 ID 获取牌定义。
- 新增 `src/game/tile.test.ts`，覆盖允许牌数量、允许牌内容、非法牌排除、同牌比较和排序规则。
- 修复一次 TypeScript 模板字符串类型推断问题：将由 `map()` 动态生成牌定义改为显式常量数组，保证 `id` 被推断为精确字面量类型。

验证结果：

- 用户已确认第 3 步测试通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 4 步。
- 第 4 步应基于 `allowedTiles` 生成完整牌池，每种允许牌 4 张，总数 48 张。
- 第 4 步应将牌池生成与洗牌逻辑分离；不要提前实现洗牌能力。
- `src/main.ts` 仍不应引入牌池、洗牌、胡牌或计分逻辑。

