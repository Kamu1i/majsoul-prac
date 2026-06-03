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

## 2026-06-02：完成第 4 步，生成完整牌池

已完成 `memory-bank/implementation-plan.md` 中的第 4 步：生成完整牌池。

本次完成内容：

- 新增 `src/game/deck.ts`，基于 `src/game/tile.ts` 中的 `allowedTiles` 生成完整牌池。
- 定义 `TileCopy`，用于表示某一种牌的第 1 至第 4 张副本。
- 实现 `createTilePool()`，生成 12 种允许牌各 4 张、总数 48 张的未洗牌牌池。
- 实现 `countTileTypes()`，用于统计牌池中每种牌出现次数，方便测试和后续验证复用。
- 新增 `src/game/deck.test.ts`，覆盖牌池总数、每种牌 4 张、非法牌排除、副本序号和多次生成稳定性。

验证结果：

- 用户已确认第 4 步测试通过。

后续注意事项：

- 在用户明确要求前，不开始第 5 步。
- 第 5 步应实现洗牌能力，并保持洗牌逻辑与 `createTilePool()` 分离。
- 洗牌测试应保证洗牌后牌数和每种牌数量不变，并提供可控随机来源以保证测试可重复。
- `src/main.ts` 仍不应引入牌池、洗牌、胡牌或计分逻辑。



## 2026-06-02：完成第 5 步，实现洗牌能力

已完成 `memory-bank/implementation-plan.md` 中的第 5 步：实现洗牌能力。

本次完成内容：

- 更新 `src/game/deck.ts`，新增 `RandomSource` 类型，用于抽象随机数来源。
- 在 `src/game/deck.ts` 中新增 `shuffleTilePool()`，基于 Fisher-Yates 洗牌算法返回新的洗始牌池。
- `shuffleTilePool()` 默认使用 `Math.random`，同时允许调用方注入固定随机来源，方便测试生成可重复结果。
- 洗牌函数不会修改传入的原始牌池数组，而是复制数组后再洗牌。
- 更新 `src/game/deck.test.ts`，新增洗牌相关测试，覆盖洗牌后总数不变、每种牌数量不变、固定随机来源可重复、原始牌池不被修改。

验证结果：

- `npm run test` 已通过，16 个测试全部通过。
- `npm run build` 已通过。
- 用户已确认第 5 步测试通过。

后续注意事项：

- 在用户明确要求前，不开始第 6 步。
- 第 6 步应定义玩家状态，至少包含手牌、牌河、副露列表和当前点数。
- 玩家初始点数固定为 100000 点。
- 玩家状态逻辑不得依赖 DOM，也不应放入 `src/main.ts`。
- `shuffleTilePool()` 已可作为后续发牌和对局初始化时创建洗始牌山的基础能力。

## 2026-06-02：完成第 6 步，定义玩家状态

已完成 `memory-bank/implementation-plan.md` 中的第 6 步：定义玩家和电脑共享的玩家状态。

本次完成内容：

- 新增 `src/game/player.ts`，定义玩家状态模块。
- 在 `src/game/player.ts` 中新增 `initialPlayerPoints`，统一声明玩家与电脑初始点数为 100000 点。
- 在 `src/game/player.ts` 中新增 `PlayerState`，包含：
  - `hand`：当前手牌。
  - `discardPile`：牌河。
  - `melds`：副露列表。
  - `points`：当前点数。
- 在 `src/game/player.ts` 中新增 `MeldType` 与 `Meld`，为后续吃、碰、杠副露流程预留基础结构。
- 实现 `createPlayerState()`，用于创建一份新的玩家状态实例。
- 新增 `src/game/player.test.ts`，覆盖玩家状态初始化与玩家、电脑实例隔离。

验证结果：

- 用户已确认第 6 步测试通过。
- 用户已确认构建或相关验证通过。

后续注意事项：

- 在用户明确要求前，不开始第 7 步。
- 第 7 步应实现发牌流程：玩家和电脑各 13 张初始手牌，牌山剩余 22 张。
- 发牌流程应复用 `src/game/deck.ts` 中的 `createTilePool()` 与 `shuffleTilePool()`。
- 发牌后手牌应按 `compareTiles()` 的排序规则保持稳定顺序。
- `PlayerState` 已提供手牌、牌河、副露列表和点数结构，后续发牌、摸牌、打牌、副露、胡牌和计分模块应复用该状态，不要在对局状态或 UI 中重复定义玩家字段。

## 2026-06-03：完成第 7 步，实现发牌流程

已完成 `memory-bank/implementation-plan.md` 中的第 7 步：实现玩家与电脑的初始发牌流程。

本次完成内容：

- 新增 `src/game/deal.ts`，将发牌逻辑从牌池、玩家状态和 UI 中独立出来。
- 在 `src/game/deal.ts` 中新增 `initialHandTileCount`，统一声明二人对局每人初始手牌为 13 张。
- 在 `src/game/deal.ts` 中新增 `dealtPlayerCount`，当前固定为玩家与电脑二人。
- 在 `src/game/deal.ts` 中新增 `sortTileCopies()`，按 `compareTiles()` 的基础牌序和 `copyIndex` 对实体牌稳定排序。
- 在 `src/game/deal.ts` 中新增 `dealInitialHands()`，从传入牌山前 26 张中分别取 13 张给玩家与电脑，并返回剩余 22 张牌山。
- `dealInitialHands()` 会为玩家与电脑创建独立 `PlayerState`，不会修改传入的牌山数组。
- 新增 `src/game/deal.test.ts`，覆盖玩家手牌数量、电脑手牌数量、剩余牌山数量、发牌前后 48 张实体牌守恒、实体牌不重复分配、手牌排序稳定和传入牌山不被修改。

验证结果：

- 用户已确认第 7 步测试通过。

后续注意事项：

- 在用户明确要求前，不开始第 8 步。
- 第 8 步应定义完整对局状态，整合玩家状态、电脑状态、牌山、当前行动方、对局阶段、最后打出的牌、结束结果、海底标记和河底标记。
- 第 8 步初始化新对局时可以复用 `createTilePool()`、`shuffleTilePool()` 和 `dealInitialHands()`，避免在对局状态中重复发牌逻辑。
- `dealInitialHands()` 当前只接收外部传入的牌山，不负责创建牌池或洗牌；这让测试可以传入固定牌山，也让后续对局初始化自行决定随机来源。
- `src/main.ts` 仍不应引入发牌、胡牌或计分逻辑。

## 2026-06-03：完成第 8 步，定义完整对局状态

已完成 `memory-bank/implementation-plan.md` 中的第 8 步：定义完整对局状态。

本次完成内容：

- 更新 `src/game/game-state.ts`，将原先的初始化占位状态扩展为完整对局状态结构。
- 在 `src/game/game-state.ts` 中扩展 `GameStatus`，包含：
  - `not-started`：未开始。
  - `player-turn`：玩家回合。
  - `computer-turn`：电脑回合。
  - `ended`：已结束。
- 在 `src/game/game-state.ts` 中新增 `Actor`，用于统一表示当前行动方、胡牌方和放铳方，目前包含 `player` 与 `computer`。
- 在 `src/game/game-state.ts` 中新增 `WinMethod`，用于表示后续胡牌方式，目前包含 `ron` 与 `tsumo`。
- 在 `src/game/game-state.ts` 中新增 `GameEndResult`，用于记录后续和牌或流局结束结果。
- 在 `src/game/game-state.ts` 中新增 `DiscardRecord`，用于记录最后打出的实体牌与打牌者。
- `GameState` 现在包含玩家状态、电脑状态、牌山、当前行动方、最后打出的牌、结束结果、海底标记和河底标记。
- 新增 `createNewGameState(randomSource?)`，负责创建牌池、洗牌、发牌并初始化一局新对局。
- `createNewGameState()` 复用 `createTilePool()`、`shuffleTilePool()` 和 `dealInitialHands()`，没有重复实现牌池、洗牌或发牌逻辑。
- `createInitialGameState()` 现在返回一份新对局状态，用于继续兼容当前入口和渲染层。
- 新增 `src/game/game-state.test.ts`，覆盖新对局初始化后的双方状态、剩余牌山、当前行动方、海底/河底标记、最后打出的牌和对局阶段。
- 更新 `src/main.test.ts`，适配入口现在导出已初始化的新对局状态。

验证结果：

- 用户已确认第 8 步测试通过。

后续注意事项：

- 在用户明确要求前，不开始第 9 步。
- 第 9 步应实现摸牌动作：当前行动方从牌山摸一张牌，牌山减少 1，并在摸到牌山最后一张时记录海底标记。
- 当牌山为空时，摸牌动作不应继续摸牌，而应进入流局结束状态。
- 第 9 步应复用本次新增的 `currentActor`、`wall`、`isHaitei` 和 `endResult` 字段，不要在 UI 层实现摸牌或流局逻辑。
- `src/game/game-state.ts` 已成为对局状态聚合模块，但仍应只负责状态结构和新对局初始化；后续摸牌、打牌、回合切换等动作可视复杂度拆到独立流程模块，避免形成巨文件。

