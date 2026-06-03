## 第 17 步新增架构说明

### `src/game/tsumo.ts`

基础自摸入口模块。

职责：

- 导出 `canTsumo(state, winner)`，判断指定一方当前是否可以自摸。
- 导出 `declareTsumo(state, winner)`，在可自摸时将对局置为胡牌结束状态。
- 导出 `resolveComputerTsumoAfterDraw(state)`，用于电脑摸牌后自动检查并执行自摸。
- 复用 `src/game/ron.ts` 的 `evaluateWinningHand()`，避免重复实现牌形判断或役种判断。

当前自摸规则：

- 只允许未结束对局中的当前行动方自摸。
- 自摸候选牌直接使用当前行动方手牌；摸牌流程会先把摸到的牌加入手牌，因此候选通常为 14 张。
- 候选牌必须满足基础胡牌牌形，并至少命中一个役种。
- 自摸上下文传入 `method: 'tsumo'`，因此自摸本身会记录 `tsumo` 役。
- 当 `state.isHaitei` 为 `true` 时，自摸判断会额外记录 `haitei` 役。
- 自摸成功后结束结果写入 `loser: null`、`method: 'tsumo'`、命中役种、海底状态与 `isHoutei: false`。
- 不可自摸时，`declareTsumo()` 返回原状态。

设计约束：

- `tsumo.ts` 不依赖 DOM 或 UI 事件。
- `tsumo.ts` 不处理点数结算；第 19 步计分模块应读取 `endResult.method === 'tsumo'` 和 `winner` 更新双方点数。
- 玩家自摸交互后续应调用 `canTsumo()` 判断按钮展示，再调用 `declareTsumo()` 执行胡牌。
- 电脑自摸已由 `computer-turn.ts` 在摸牌后、选牌前调用 `resolveComputerTsumoAfterDraw()` 自动接入。

### `src/game/tsumo.test.ts`

基础自摸入口测试文件。

职责：

- 验证玩家摸牌后满足牌形和有役时可自摸。
- 验证牌形合法但无其他役时，自摸役本身允许胡牌。
- 验证玩家声明自摸后对局进入 `ended`。
- 验证电脑摸牌后满足自摸条件时会自动胡牌并结束对局。
- 验证海底摸月会记录 `haitei` 役。
- 验证自摸结束后不会新增牌河弃牌，也不会改写最后弃牌记录。
- 验证自摸结束结果正确记录胡牌者、胡牌方式、命中役种和 `loser: null`。

后续衔接：

- 第 18 步基础流局可继续复用 `drawTile()` 的空牌山流局结果，并补充流局后动作不可继续改变状态的测试。
- 第 19 步基础计分应把荣和的 `loser` 与自摸的 `loser: null` 区分处理。
- 第 24 步玩家胡牌交互应同时复用 `canRon()` / `declareRon()` 与 `canTsumo()` / `declareTsumo()`。

## 第 18 步新增架构说明

### `src/game/draw.ts`

摸牌与空牌山流局入口模块。

第 18 步确认并补强的流局职责：

- 当 `drawTile(state)` 发现 `state.wall` 为空时，结束对局并记录 `endResult: { type: 'exhaustive-draw' }`。
- 流局时将 `status` 设置为 `ended`，将 `currentActor` 设置为 `null`，供后续动作模块统一阻止继续操作。
- 流局时不修改玩家或电脑点数；第 19 步计分模块可继续把流局视为零分差结算。
- 已结束对局再次调用 `drawTile()` 会直接返回原状态，不会摸牌、不会改变手牌、不会改变牌山。

### `src/game/discard.ts`

打牌动作模块。

第 18 步确认并补强的流局后保护职责：

- `discardTile()` 已通过 `state.status === 'ended'` 阻止任何已结束对局继续打牌。
- 流局结束状态与胡牌结束状态共享同一保护入口，因此 `endResult.type === 'exhaustive-draw'` 后打牌会直接返回原状态。
- 打牌模块不负责创建流局结果，只负责在结束状态下保持状态不可变。

### `src/game/turn.ts`

打牌后的回合切换模块。

第 18 步确认的流局后保护职责：

- `switchTurnAfterDiscard()` 已通过 `stateAfterDiscard.status === 'ended'` 阻止已结束对局继续切换行动方。
- 流局结束后 `currentActor` 为 `null`，不会再进入合法打牌后的回合切换流程。
- 该模块不创建流局结果，只消费动作模块返回的结束状态。

### 流局状态边界

当前基础流局边界为：

- `draw.ts` 是唯一负责在空牌山摸牌时创建 `exhaustive-draw` 结束结果的模块。
- `discard.ts` 与 `turn.ts` 负责尊重 `ended` 状态，防止流局后继续打牌或切换回合。
- 流局不改变点数；第 19 步基础计分应在结算记录中显式记录双方分差为 0。
- UI 后续展示流局时应读取 `state.endResult?.type === 'exhaustive-draw'`，不要通过牌山是否为空自行推断结束结果。

### 第 18 步相关测试覆盖

- `src/game/draw.test.ts` 验证空牌山继续摸牌会结束为流局。
- `src/game/draw.test.ts` 验证流局时玩家与电脑点数仍为 100000。
- `src/game/draw.test.ts` 验证流局结束后再次摸牌不会改变状态。
- `src/game/discard.test.ts` 验证流局结束后不能继续打牌。
- `src/game/turn.test.ts` 已覆盖已结束状态不会继续切换回合。

