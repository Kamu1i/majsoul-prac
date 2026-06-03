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

## 第 19 步新增架构说明

### `src/game/scoring.ts`

基础固定分值计分模块。

职责：

- 导出 `ronPointDelta`，声明当前基础荣和固定分值为 20000 点。
- 导出 `tsumoPointDelta`，声明当前基础自摸固定分值为 15000 点。
- 导出 `createScoreSettlement(endResult, state)`，根据结束结果与当前双方点数生成结算记录。
- 导出 `applyScoreSettlement(state, settlement)`，把已生成的结算记录应用到双方点数。
- 导出 `settleGameEnd(state)`，为已有 `endResult` 的状态生成并应用结算，便于后续流程复用。

当前结算规则：

- 荣和：胡牌方增加 20000 点，放铳方扣除 20000 点。
- 自摸：胡牌方增加 15000 点，另一方扣除 15000 点。
- 流局：双方点数变化均为 0。
- 结算记录统一包含：
  - `reason`：`ron`、`tsumo` 或 `exhaustive-draw`。
  - `delta`：玩家与电脑各自点数变化。
  - `after`：结算后的玩家与电脑点数。

设计约束：

- `scoring.ts` 不依赖 DOM 或 UI 事件。
- 当前只实现基础固定分值，不实现番符、亲子差异、供托、场棒、多局制或完整日麻点数表。
- `scoring.ts` 只根据 `GameEndResult` 计算点数，不重新判断胡牌牌形或役种。

### `src/game/game-state.ts`

第 19 步新增与计分相关的状态类型：

- `ScoreReason`：结算原因，包含荣和、自摸和流局。
- `ScoreDelta`：玩家与电脑点数变化。
- `ScoreAfter`：结算后的玩家与电脑点数。
- `ScoreSettlement`：完整结算记录。
- `GameState.scoreSettlement`：当前对局结束后的结算记录；新对局初始化为 `null`。

后续 UI 展示对局结果时，应优先读取 `state.scoreSettlement`，不要重复推导点数变化。

### `src/game/ron.ts`

第 19 步新增的计分衔接：

- `declareRon()` 在荣和成功时创建 `endResult` 后，调用 `createScoreSettlement()` 生成结算记录。
- 荣和结束状态会同步更新 `player.points` 与 `computer.points`。
- 荣和结束状态会写入 `scoreSettlement`，供测试和 UI 展示使用。

### `src/game/tsumo.ts`

第 19 步新增的计分衔接：

- `declareTsumo()` 在自摸成功时创建 `endResult` 后，调用 `createScoreSettlement()` 生成结算记录。
- 自摸结束状态会同步更新 `player.points` 与 `computer.points`。
- 自摸结束状态会写入 `scoreSettlement`，并继续保持 `loser: null` 表示非放铳结算。

### `src/game/draw.ts`

第 19 步新增的流局计分衔接：

- 空牌山触发流局时，`drawTile()` 会创建 `endResult: { type: 'exhaustive-draw' }`。
- 流局结束状态会写入零分差 `scoreSettlement`。
- 流局仍不改变双方 `points`。

### `src/game/scoring.test.ts`

基础计分测试文件。

职责：

- 验证玩家荣和时玩家 +20000、电脑 -20000。
- 验证电脑荣和时电脑 +20000、玩家 -20000。
- 验证玩家自摸时玩家 +15000、电脑 -15000。
- 验证电脑自摸时电脑 +15000、玩家 -15000。
- 验证流局时双方点数不变。
- 验证结算前后双方点数变化符合二人零和预期。

### 第 19 步相关测试覆盖

- `src/game/scoring.test.ts` 覆盖独立计分模块的固定分值规则。
- `src/game/ron.test.ts` 覆盖荣和结束流程写入 `scoreSettlement`。
- `src/game/tsumo.test.ts` 覆盖自摸结束流程写入 `scoreSettlement`。
- `src/game/draw.test.ts` 覆盖流局结束流程写入零分差 `scoreSettlement`。

## 第 20 步新增架构说明

### `src/game/meld.ts`

副露候选判断与执行模块。

职责：

- 导出 `getChiCandidates(state, actor)`，基于最后弃牌和指定一方手牌返回可吃候选。
- 导出 `getPonCandidate(state, actor)`，返回可碰候选或 `null`。
- 导出 `getOpenKanCandidate(state, actor)`，返回可明杠候选或 `null`。
- 导出 `getClosedKanCandidates(state, actor)`，返回当前行动方可暗杠候选。
- 导出 `declareChi()`、`declarePon()`、`declareOpenKan()`、`declareClosedKan()`，执行对应副露操作。
- 导出 `resolveComputerMeldAfterPlayerDiscard(state)`，用于玩家弃牌后电脑自动副露。

当前副露规则：

- 吃牌只允许索子顺子，不允许字牌吃牌，也不允许非连续索子吃牌。
- 碰牌由两张同牌手牌加最后弃牌组成。
- 明杠由三张同牌手牌加最后弃牌组成。
- 暗杠由当前行动方手牌中四张同牌组成，不读取最后弃牌。
- 副露执行后会从副露方手牌移除对应实体牌，并把组合写入副露方 `melds`。
- 使用弃牌形成的副露会从弃牌来源方牌河移除该弃牌，并清空 `lastDiscard`，避免后续重复响应同一张弃牌。
- 电脑自动副露优先级为明杠、碰、吃；基础版不做复杂收益判断。
- 电脑通过玩家弃牌副露后，由 `turn.ts` 继续调用 AI 选择一张牌打出，再切回玩家回合。

设计约束：

- `meld.ts` 不依赖 DOM 或 UI 事件。
- `meld.ts` 不处理摸牌、胡牌结算或页面提示。
- 当前不实现王牌、岭上牌、抢杠、加杠、杠后补牌或复杂副露选择策略。
- 玩家 UI 后续应先读取候选判断函数决定按钮展示，再调用对应声明函数执行副露。

### `src/game/player.ts`

第 20 步扩展副露状态结构：

- `MeldType` 现在包含 `chi`、`pon`、`open-kan`、`closed-kan`。
- `Meld.tiles` 记录完整副露组合。
- `Meld.calledTile` 记录被叫牌；暗杠为 `null`。
- `Meld.from` 记录弃牌来源；暗杠为 `null`。

### `src/game/rules.ts`

第 20 步新增副露胡牌牌形入口：

- `isWinningHandWithOpenMelds(tiles, openMeldCount)` 根据已有副露数量判断剩余暗手牌是否可构成合法胡牌结构。
- 无副露时继续复用 `isBasicWinningHand()`，保留标准形和七对子判断。
- 有副露时按 `14 - openMeldCount * 3` 计算暗手牌期望数量，并要求暗手牌能组成雀头与剩余面子。

### `src/game/ron.ts`

第 20 步新增副露胡牌衔接：

- `WinEvaluationContext` 新增 `melds` 字段。
- `evaluateWinningHand()` 现在调用 `isWinningHandWithOpenMelds()`，支持已有副露的胡牌判断。
- 役牌与断幺九判断会同时读取暗手牌和副露牌组。
- 七对子只在无副露时参与役种判断。
- `canRon()` 会读取胡牌方当前 `melds`，因此荣和入口可处理副露后的剩余手牌。

### `src/game/tsumo.ts`

第 20 步新增副露胡牌衔接：

- `canTsumo()` 调用 `evaluateWinningHand()` 时会传入当前行动方已有副露。
- 自摸仍要求当前行动方、未结束状态、有效牌形与至少一个役种。

### `src/game/turn.ts`

第 20 步新增电脑副露流程衔接：

- 玩家合法弃牌后仍先调用电脑荣和检查。
- 电脑不能荣和时，调用 `resolveComputerMeldAfterPlayerDiscard()` 尝试自动副露。
- 电脑副露成功后，复用 `chooseComputerDiscardTile()` 选择打出牌，并再次通过 `discardTileAndSwitchTurn()` 完成打牌与回合切换。
- 如果电脑没有副露，则沿用原有普通回合切换逻辑。

### `src/game/meld.test.ts`

副露流程测试文件。

职责：

- 验证玩家可以用电脑弃牌完成合法吃牌。
- 验证字牌不能被吃、非连续索子不能被吃。
- 验证玩家可以用电脑弃牌完成合法碰牌。
- 验证玩家可以用电脑弃牌完成合法明杠。
- 验证玩家可以在自己回合完成合法暗杠。
- 验证电脑满足条件时按确定性规则自动副露。
- 验证副露后对应手牌数量减少、副露列表增加、弃牌来源记录正确。
- 验证副露后胡牌判断仍要求有效牌形和有役。

### 第 20 步相关测试覆盖

- `src/game/meld.test.ts` 覆盖副露候选判断、声明入口、电脑自动副露和副露后的胡牌判断。
- `src/game/player.test.ts` 覆盖新副露结构下玩家状态实例隔离。
- `src/game/turn.test.ts` 覆盖玩家弃牌后电脑自动副露、电脑打牌并切回玩家的流程。
