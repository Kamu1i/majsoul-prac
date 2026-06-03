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


## 2026-06-03：完成第 9 步，实现摸牌动作

已完成 `memory-bank/implementation-plan.md` 中的第 9 步：实现摸牌动作。

本次完成内容：

- 新增 `src/game/draw.ts`，将摸牌动作从综合对局状态模块中拆出，避免 `src/game/game-state.ts` 继续膨胀。
- 在 `src/game/draw.ts` 中实现 `drawTile(state)`：
  - 根据 `state.currentActor` 判断当前摸牌方。
  - 从 `state.wall` 第一张取牌。
  - 将摸到的牌追加到当前行动方的 `hand`。
  - 将摸走的牌从 `wall` 中移除。
  - 当摸走的是牌山最后一张牌时，将 `isHaitei` 标记为 `true`。
  - 当牌山为空时，不增加任何手牌，并将对局置为流局结束状态。
- 牌山为空时的流局结果写入：
  - `status: 'ended'`
  - `currentActor: null`
  - `endResult: { type: 'exhaustive-draw' }`
  - `isHaitei: false`
- 新增 `src/game/draw.test.ts`，覆盖玩家摸牌、电脑摸牌、从牌山第一张摸牌、摸到最后一张触发海底标记、空牌山触发流局结束等场景。
- 修复一次构建兼容性问题：测试中避免使用 `Array.prototype.at()`，改用 ES2020 兼容的数组索引访问，以符合当前 `tsconfig.json` 的 `lib: ["ES2020", "DOM", "DOM.Iterable"]` 配置。

验证结果：

- 用户已确认 `npm run test` 通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 10 步。
- 第 10 步应实现打牌动作：从当前行动方手牌中移除指定实始牌，加入对应弃牌河，并记录 `lastDiscard`、打牌者与河底标记。
- 第 10 步应继续保持 `src/game/game-state.ts` 轻量，优先将打牌动作拆到独立模块，例如 `src/game/discard.ts`。
- 第 10 步需要注意：非法打牌、非当前行动方打牌、已结束对局打牌都不应修改状态。

## 2026-06-03：完成第 10 步，实现打牌动作

已完成 `memory-bank/implementation-plan.md` 中的第 10 步：实现打牌动作。

本次完成内容：

- 新增 `src/game/discard.ts`，将打牌动作从对局状态聚合模块中拆出，避免 `src/game/game-state.ts` 形成巨型动作模块。
- 在 `src/game/discard.ts` 中实现 `discardTile(state, actor, tileToDiscard)`：
  - 只允许当前行动方打牌。
  - 已结束对局不能继续打牌。
  - 从当前行动方手牌中按实体牌身份移除指定牌。
  - 将打出的牌追加到当前行动方 `discardPile`。
  - 写入 `lastDiscard`，记录最后打出的牌和打牌者。
  - 当状态已有 `isHaitei: true` 时，合法打牌后设置 `isHoutei: true`。
  - 非法打牌会直接返回原状态，不修改手牌、牌河或最后弃牌记录。
- `discardTile()` 使用牌 ID 与 `copyIndex` 判断实体牌身份，避免只依赖对象引用导致测试或后续 UI 传参不稳定。
- 新增 `src/game/discard.test.ts`，覆盖：
  - 玩家打牌后玩家手牌减少 1，玩家牌河增加 1。
  - 电脑打牌后电脑手牌减少 1，电脑牌河增加 1。
  - 最后打出的牌和打牌者记录正确。
  - 海底摸牌后的弃牌会设置河底标记。
  - 打出不在手牌中的牌会失败且状态不变。
  - 非当前行动方打牌会失败且状态不变。

验证结果：

- 用户已确认 `npm run test` 通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 11 步。
- 第 11 步应实现回合切换：合法打牌后在玩家与电脑之间切换 `currentActor` 和 `status`。
- 非法打牌不应触发回合切换，因此第 11 步应基于 `discardTile()` 返回值或独立的合法性判断组合流程，避免无条件切换。
- 已结束状态下不应继续切换回合。
- 当前 `discardTile()` 只负责打牌本身，不负责胡牌判断、吃碰杠响应、计分或回合切换。


## 2026-06-03：完成第 11 步，实现回合切换

已完成 `memory-bank/implementation-plan.md` 中的第 11 步：实现回合切换。

本次完成内容：

- 新增 `src/game/turn.ts`，将合法打牌后的回合切换流程从打牌模块和对局状态模块中拆出。
- 在 `src/game/turn.ts` 中实现 `discardTileAndSwitchTurn(state, actor, tileToDiscard)`：
  - 先复用 `discardTile()` 执行打牌。
  - 仅在打牌合法、状态确实变化后切换回合。
  - 玩家合法打牌后切换为电脑回合。
  - 电脑合法打牌后切换为玩家回合。
  - 非法打牌、非当前行动方打牌或已结束状态打牌不会触发回合切换。
- 在 `src/game/turn.ts` 中实现 `switchTurnAfterDiscard(stateBeforeDiscard, stateAfterDiscard)`，方便后续流程在已经完成打牌动作后单独组合回合切换。
- 新增 `src/game/turn.test.ts`，覆盖：
  - 玩家合法打牌后 `currentActor` 变为 `computer`，`status` 变为 `computer-turn`。
  - 电脑合法打牌后 `currentActor` 变为 `player`，`status` 变为 `player-turn`。
  - 非法打牌不会切换行动方，并返回原状态。
  - 已结束状态下不会切换行动方。
  - 已经完成合法 `discardTile()` 后，可以通过 `switchTurnAfterDiscard()` 单独完成回合切换。

验证结果：

- 用户已确认 `npm run test` 通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 12 步。
- 第 12 步应实现基础电脑出牌策略，建议新增 `src/game/ai.ts`。
- 电脑策略只应负责从电脑手牌中选择要打出的牌，不直接修改 `GameState`。
- 第 13 步再把电脑摸牌、AI 选牌、打牌和回合切换组合成电脑自动回合流程。
- 当前 `turn.ts` 已可作为第 13 步组合流程的基础，但不负责摸牌、AI、胡牌判断或计分。

## 2026-06-03：完成第 12 步，实现基础电脑出牌策略

已完成 `memory-bank/implementation-plan.md` 中的第 12 步：实现基础电脑出牌策略。

本次完成内容：

- 新增 `src/game/ai.ts`，将电脑选牌策略独立为游戏核心逻辑模块。
- 在 `src/game/ai.ts` 中实现 `chooseComputerDiscardTile(hand)`：
  - 只接收电脑手牌并返回建议打出的实体牌。
  - 不读取或修改 `GameState`，也不执行摸牌、打牌或回合切换。
  - 当电脑手牌为空时返回 `null`，表示无可打牌结果。
  - 会统计手牌中每种牌的数量，避免优先拆对子、刻子或杠子候选。
  - 会识别孤立牌：单张字牌视为孤立；单张索子若没有相邻索子也视为孤立。
  - 有孤立牌时，优先返回固定牌序最小的孤立牌。
  - 没有孤立牌时，返回固定牌序最小的手牌作为兜底。
  - 同种牌按 `copyIndex` 作为稳定排序兜底，保证策略结果确定可测试。
- 新增 `src/game/ai.test.ts`，覆盖：
  - 固定电脑手牌时返回预期牌。
  - 返回的牌一定存在于电脑手牌中。
  - 电脑手牌为空时返回 `null`。
  - 同一手牌多次调用返回一致结果。
  - 没有孤立牌时返回固定牌序最小的手牌。
- 修复一次 TypeScript 类型收窄问题：在判断索子相邻牌时，确保候选牌和目标牌都被收窄为索子后再访问 `rank`。

验证结果：

- 用户已确认 `npm run test` 通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 13 步。
- 第 13 步应连接电脑自动回合，建议新增独立流程模块组合 `drawTile()`、`chooseComputerDiscardTile()` 和 `discardTileAndSwitchTurn()`。
- 电脑自动回合流程应只在当前行动方为电脑且对局未结束时执行。
- 牌山为空时，电脑回合应通过摸牌流程触发流局，不应继续选择或打牌。
- `src/game/ai.ts` 仍应只负责选牌策略，不应直接修改对局状态或依赖 DOM。

## 2026-06-03：完成第 13 步，连接电脑自动回合

已完成 `memory-bank/implementation-plan.md` 中的第 13 步：连接电脑自动回合。

本次完成内容：

- 新增 `src/game/computer-turn.ts`，将电脑自动回合流程独立为游戏核心流程模块。
- 在 `src/game/computer-turn.ts` 中实现 `playComputerTurn(state)`：
  - 仅在 `status` 为 `computer-turn` 且 `currentActor` 为 `computer` 时执行。
  - 先复用 `drawTile()` 让电脑从牌山摸牌。
  - 如果摸牌后对局已结束，例如空牌山触发流局，则直接返回结束状态，不再打牌。
  - 复用 `chooseComputerDiscardTile()` 从电脑手牌中选择要打出的牌。
  - 复用 `discardTileAndSwitchTurn()` 完成电脑打牌并切换回玩家回合。
  - 非电脑回合调用时直接返回原状态，不修改对局。
- 新增 `src/game/computer-turn.test.ts`，覆盖电脑自动回合的关键流程。

新增测试覆盖：

- 电脑回合开始且牌山非空时，会先摸牌再打牌。
- 电脑回合结束后，电脑手牌数量保持在当前流程预期。
- 电脑牌河增加 1 张，最后弃牌者记录为电脑。
- 电脑回合结束后，行动方切换回玩家。
- 牌山为空时，电脑回合触发流局，不再打牌。
- 非电脑回合调用 `playComputerTurn()` 不会修改状态。

验证结果：

- 用户已确认 `npm run test -- src/game/computer-turn.test.ts` 通过。
- 用户已确认 `npm run test` 通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 14 步。
- 第 14 步应实现基础胡牌牌形判断，建议新增独立规则模块，例如 `src/game/rules.ts` 或更细分的胡牌形判断模块。
- 胡牌牌形判断只应判断牌形，不应在第 14 步直接决定有役、荣和、自摸或计分。
- 当前 `computer-turn.ts` 只组合摸牌、AI 选牌、打牌和回合切换，不负责胡牌判断、副露、计分或 UI 渲染。

## 2026-06-03：完成第 14 步，实现基础胡牌牌形判断

已完成 `memory-bank/implementation-plan.md` 中的第 14 步：实现基础胡牌牌形判断。

本次完成内容：

- 新增 `src/game/rules.ts`，将基础胡牌牌形判断独立为规则模块。
- 在 `src/game/rules.ts` 中实现 `isStandardWinningHand(tiles)`：
  - 只判断标准形“四组面子 + 一组雀头”。
  - 胡牌候选必须正好为 14 张。
  - 候选牌必须全部来自当前允许牌池：一索至九索、白、发、中。
  - 支持刻子面子。
  - 支持索子顺子面子。
  - 字牌只能作为刻子或雀头，不能作为顺子。
  - 同一种牌数量超过 4 张时判为非法牌形。
- 在 `src/game/rules.ts` 中导出 `standardWinningHandTileCount` 和 `standardMeldTileCount`，便于测试和后续规则模块复用。
- 新增 `src/game/rules.test.ts`，覆盖第 14 步要求的标准形测试场景。

新增测试覆盖：

- 合法的四面子一雀头牌形可被识别为有效标准形。
- 包含索子顺子的合法牌形可被识别。
- 包含字牌刻子的合法牌形可被识别。
- 字牌白、发、中不会被当作顺子。
- 缺少雀头的牌形不可被识别为有效标准形。
- 牌数不符合 14 张要求时不可被识别为有效标准形。
- 包含非法牌时不可被识别为有效标准形。

验证结果：

- 用户已确认 `npm run test -- src/game/rules.test.ts` 通过。
- 用户已确认 `npm run test` 通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 15 步。
- 第 15 步应在基础胡牌判断中加入七对子牌形。
- 七对子必须由七组有效对子组成，四张相同牌不能拆成两组对子。
- 当前 `isStandardWinningHand()` 只判断标准形，不负责七对子、有役、荣和、自摸、副露或计分。

## 2026-06-03：完成第 15 步，实现七对子胡牌形判断

已完成 `memory-bank/implementation-plan.md` 中的第 15 步：实现七对子胡牌形判断。

本次完成内容：

- 更新 `src/game/rules.ts`，在基础胡牌牌形规则中加入七对子判断。
- 在 `src/game/rules.ts` 中新增 `isSevenPairsWinningHand(tiles)`：
  - 胡牌候选必须正好为 14 张。
  - 候选牌必须全部来自当前允许牌池：一索至九索、白、发、中。
  - 同一种牌数量不能超过 4 张。
  - 必须正好由 7 种不同牌组成。
  - 每一种牌都必须正好出现 2 张。
  - 四张相同牌不会被拆成两组对子。
- 在 `src/game/rules.ts` 中新增 `isBasicWinningHand(tiles)`，用于统一组合标准形与七对子基础胡牌牌形判断。
- 在 `src/game/rules.ts` 中抽出候选胡牌通用校验逻辑，避免标准形和七对子重复实现 14 张、合法牌和数量上限检查。
- 更新 `src/game/rules.test.ts`，补充第 15 步要求的七对子测试场景。

新增测试覆盖：

- 七组不同对子可被识别为七对子胡牌形。
- 包含四张相同牌时，不能被错误识别为两组对子。
- 六组对子加两张不成对牌不可胡。
- 七对子判断与标准形判断互不破坏。
- `isBasicWinningHand()` 可以识别标准形或七对子任一基础胡牌形。

验证结果：

- 用户已确认 `npm run test -- src/game/rules.test.ts` 通过。
- 用户已确认 `npm run test` 通过。
- 用户已确认 `npm run build` 通过。

后续注意事项：

- 在用户明确要求前，不开始第 16 步。
- 第 16 步应实现基础有役判断与荣和入口，胡牌入口必须同时满足基础胡牌牌形和至少一个日麻役。
- 后续荣和入口应调用 `isBasicWinningHand()`，而不是只调用 `isStandardWinningHand()`，避免遗漏七对子。
- 第 16 步应至少支持当前受限牌池可用的基础役种判断，例如役牌、断幺九、七对子、河底等，并记录命中役种。

## 2026-06-03：完成第 16 步，实现基础有役判断与荣和入口

已完成 `memory-bank/implementation-plan.md` 中的第 16 步：实现基础有役判断与荣和入口。

本次完成内容：

- 更新 `src/game/game-state.ts`，新增 `Yaku` 类型，当前包含 `riichi`、`tsumo`、`yakuhai`、`tanyao`、`seven-pairs`、`haitei`、`houtei`。
- 扩展 `GameEndResult` 的胡牌结束结果，荣和结束时现在会记录：
  - 胡牌者 `winner`。
  - 放铳者 `loser`。
  - 胡牌方式 `method`。
  - 命中役种 `yaku`。
  - 河底状态 `isHoutei`。
- 新增 `src/game/ron.ts`，将基础有役判断与荣和入口独立为规则/流程模块。
- 在 `src/game/ron.ts` 中实现 `evaluateWinningHand(tiles, context)`：
  - 先复用 `isBasicWinningHand()` 判断标准形或七对子基础牌形。
  - 牌形不合法时直接返回不可胡。
  - 牌形合法后再判断基础役种。
  - 当前支持役牌、断幺九、七对子、河底，并为立直、自摸、海底预留上下文入口。
  - 没有任何役种时仍判定为不可胡，确保满足日麻“有役”要求。
- 在 `src/game/ron.ts` 中实现 `canRon(state, winner)`：
  - 读取最后弃牌 `lastDiscard`。
  - 使用胡牌者手牌加最后弃牌组成 14 张候选牌。
  - 禁止已结束状态、无最后弃牌、或一方荣自己打出的牌。
- 在 `src/game/ron.ts` 中实现 `declareRon(state, winner)`：
  - 可荣和时将对局置为 `ended`。
  - 清空 `currentActor`。
  - 写入完整胡牌结束结果。
  - 不可荣和时返回原状态。
- 在 `src/game/ron.ts` 中实现 `resolveComputerRonAfterPlayerDiscard(state)`，用于玩家弃牌后电脑可胡即自动荣和。
- 更新 `src/game/turn.ts`，在 `discardTileAndSwitchTurn()` 中接入电脑荣和检查：
  - 玩家合法弃牌后，先检查电脑能否荣和。
  - 若电脑荣和，则直接保持结束状态，不再切换到电脑回合。
  - 若电脑不可荣和，则沿用原有回合切换流程。
- 新增 `src/game/ron.test.ts`，覆盖第 16 步核心场景。

新增测试覆盖：

- 基础有役判断可以识别役牌。
- 基础有役判断可以识别断幺九。
- 基础有役判断可以识别七对子。
- 玩家手牌加电脑最后打出的牌同时满足牌形和有役时，玩家可荣和。
- 玩家手牌加电脑最后打出的牌牌形合法但无役时，玩家不可荣和。
- 玩家手牌加电脑最后打出的牌有役但牌形不合法时，玩家不可荣和。
- 电脑手牌加玩家最后打出的牌同时满足牌形和有役时，电脑自动荣和。
- 河底最后弃牌可作为 `houtei` 役种参与判断。
- 胡牌后对局进入已结束状态，并记录胡牌者、放铳者、胡牌方式和命中役种。

验证结果：

- 用户已确认第 16 步相关测试通过。

后续注意事项：

- 在用户明确要求前，不开始第 17 步。
- 第 17 步应实现基础自摸入口，并复用 `evaluateWinningHand()`。
- 自摸入口应将 `method` 设置为 `tsumo`，让自摸本身作为役种参与判断。
- 如果摸到牌山最后一张并自摸，应通过 `isHaitei` 记录海底状态与海底役。
- 电脑自摸应自动胡牌；玩家自摸应先提供可胡状态，后续 UI 步骤再连接按钮。
- 第 19 步基础计分可复用 `endResult.method` 判断自摸或荣和，并复用 `winner` / `loser` 更新点数。

## 2026-06-03：完成第 17 步，实现基础自摸入口

已完成 `memory-bank/implementation-plan.md` 中的第 17 步：实现基础自摸入口。

本次完成内容：

- 新增 `src/game/tsumo.ts`，将基础自摸判断与声明流程独立为游戏核心流程模块。
- 在 `src/game/tsumo.ts` 中实现 `canTsumo(state, winner)`：
  - 只允许未结束对局中的当前行动方判断自摸。
  - 复用 `evaluateWinningHand()` 判断当前行动方 14 张手牌是否满足“基础牌形 + 至少一个役种”。
  - 传入 `method: 'tsumo'`，让自摸本身作为役种参与判断。
  - 传入 `isHaitei`，让海底摸月可作为 `haitei` 役参与判断。
- 在 `src/game/tsumo.ts` 中实现 `declareTsumo(state, winner)`：
  - 可自摸时将对局置为 `ended`。
  - 清空 `currentActor`。
  - 写入胡牌结束结果，记录胡牌者、`loser: null`、`method: 'tsumo'`、命中役种、海底状态与河底状态。
  - 不可自摸时返回原状态。
- 在 `src/game/tsumo.ts` 中实现 `resolveComputerTsumoAfterDraw(state)`，用于电脑摸牌后可自摸则自动胡牌。
- 更新 `src/game/computer-turn.ts`，电脑摸牌后先检查自摸；若电脑自摸成功，则直接结束对局，不再选牌、打牌或切换回合。
- 更新 `src/game/game-state.ts`，扩展胡牌结束结果，新增 `isHaitei` 字段，便于自摸和后续计分/展示区分海底状态。
- 更新 `src/game/ron.ts` 与 `src/game/ron.test.ts`，荣和结束结果补充 `isHaitei: false`，保持胡牌结束结果结构一致。
- 新增 `src/game/tsumo.test.ts`，覆盖第 17 步自摸入口核心场景。

新增测试覆盖：

- 玩家摸牌后同时满足牌形和有役时，`canTsumo()` 显示玩家可自摸。
- 玩家摸牌后牌形合法但无其他役时，自摸役本身允许胡牌。
- 玩家选择自摸后对局结束。
- 电脑摸牌后满足自摸条件时，电脑自动胡牌并结束对局。
- 海底摸月可作为 `haitei` 役参与判断。
- 自摸结束后不会向任何牌河新增弃牌，也不会改写最后弃牌记录。
- 自摸结束结果会正确记录胡牌者、`method: 'tsumo'`、命中役种和 `loser: null`。

验证结果：

- 用户已确认第 17 步相关测试通过。

后续注意事项：

- 在用户明确要求前，不开始第 18 步。
- 第 18 步应实现基础流局规则的补强，重点验证流局后不能继续摸牌、打牌或切换回合，并确认流局不改变双方点数。
- 当前 `drawTile()` 已能在空牌山摸牌时写入 `{ type: 'exhaustive-draw' }`，第 18 步可在现有流局入口基础上补充测试和必要保护。
- 第 19 步基础计分可读取 `endResult.method` 区分自摸和荣和；自摸结束结果中 `loser` 为 `null`，计分模块应据此扣除另一方点数。

## 2026-06-03：完成第 18 步，实现基础流局

已完成 `memory-bank/implementation-plan.md` 中的第 18 步：实现基础流局。

本次完成内容：

- 复用 `src/game/draw.ts` 中已有的空牌山摸牌流局入口：当 `wall` 为空时，`drawTile()` 会将对局置为 `ended`，清空 `currentActor`，并写入 `endResult: { type: 'exhaustive-draw' }`。
- 补充 `src/game/draw.test.ts`，验证流局时玩家与电脑点数保持 100000 不变。
- 补充 `src/game/draw.test.ts`，验证已流局结束的对局不能继续通过摸牌改变状态。
- 补充 `src/game/discard.test.ts`，验证已流局结束的对局不能继续打牌。
- 继续复用 `src/game/turn.test.ts` 中已结束状态不会切换回合的覆盖，满足流局后不能继续切换回合的要求。
- 本步骤没有引入计分变更；流局暂不改变双方点数，为第 19 步基础计分保留清晰边界。

验证结果：

- 用户已确认第 18 步相关测试通过。
- 用户已确认全量测试通过。
- 用户已确认构建通过。

后续注意事项：

- 在用户明确要求前，不开始第 19 步。
- 第 19 步应实现基础结算模块，按固定分值处理自摸、荣和与流局。
- 流局结算应保持双方点数不变，并记录结算原因、得分变化和结算后点数。
- 第 19 步可读取 `endResult.type` 区分 `win` 与 `exhaustive-draw`，读取 `endResult.method` 区分自摸与荣和。

