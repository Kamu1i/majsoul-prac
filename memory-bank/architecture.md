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

## 第 21 步新增架构说明

### `src/ui/render.ts`

基础页面布局渲染模块。

第 21 步扩展后的职责：

- 导出 `renderApp(container, state)`，根据当前 `GameState` 完整重绘基础对局页面。
- 渲染应用标题、副标题和当前状态标记。
- 渲染双方点数，直接读取 `state.player.points` 与 `state.computer.points`。
- 渲染电脑区域，但电脑手牌只按数量显示牌背，不展示具体牌面。
- 渲染玩家区域，并展示玩家当前手牌牌面。
- 渲染中心状态区，包括当前回合、剩余牌山数量、听牌提示和可胡提示。
- 渲染玩家牌河与电脑牌河，按各自 `discardPile` 顺序展示。
- 渲染基础操作按钮区域；第 21 步按钮仍为禁用占位。
- 渲染结束结果：
  - 流局显示牌山摸完提示。
  - 胡牌显示胡牌方、胡牌方式与命中役种。

设计约束：

- `render.ts` 只读取 `GameState`，不修改游戏规则状态。
- 电脑手牌在非调试路径下不暴露具体牌面。
- 听牌提示与可胡提示当前是布局占位，后续步骤应接入真实规则判断。
- 操作按钮当前只提供页面结构，第 23 步和第 24 步再连接打牌、胡牌等交互。

### `src/styles.css`

基础页面样式文件。

第 21 步扩展后的职责：

- 定义应用整体页面布局、标题区和记分板样式。
- 定义对局桌面三段区域：电脑区、中心状态与牌河区、玩家区。
- 定义牌面、牌背、牌河、手牌和空状态文字样式。
- 定义操作按钮区域样式。
- 提供窄屏下的基础响应式布局。

### `src/main.test.ts`

第 21 步补充的布局测试覆盖：

- 验证初始化状态可以渲染基础页面布局。
- 验证页面包含玩家点数、电脑点数、剩余牌山、当前回合、听牌提示、可胡提示、双方牌河和操作按钮区域。
- 验证电脑手牌区域显示牌背，并且不暴露索子或字牌具体牌面。

### 后续 UI 衔接边界

- 第 22 步应在当前结构基础上把玩家手牌升级为可点击交互元素，并确保每次状态变化后重新调用 `renderApp()`。
- 第 23 步应让玩家手牌点击触发 `discardTileAndSwitchTurn()` 和电脑自动回合，不应把规则逻辑写入 `render.ts`。
- 第 24 步应让胡牌按钮读取 `canRon()` / `canTsumo()` 等规则入口决定展示和执行。

## 第 22 步新增架构说明

### `src/ui/render.ts`

玩家手牌与牌河渲染模块。

第 22 步扩展后的职责：

- `renderApp(container, state)` 继续作为页面完整重绘入口，每次调用都会用当前 `GameState` 替换容器内容。
- 玩家手牌现在通过 `renderPlayerHand()` 渲染为 `button.tile-button`，不再只是静态牌面文本。
- 每个玩家手牌按钮携带：
  - `data-tile-id`：基础牌 ID。
  - `data-copy-index`：实体牌副本编号。
  - `aria-label`：例如“打出3索”，用于后续交互和辅助功能。
- 玩家牌河与电脑牌河继续使用 `renderTileRow()` 按 `discardPile` 数组顺序渲染。
- 玩家牌河与电脑牌河容器现在有明确 `aria-label`，方便测试和后续事件定位。

设计约束：

- `render.ts` 仍只读取 `GameState`，不修改状态，不调用打牌、摸牌、胡牌或副露规则。
- 玩家手牌按钮只提供 DOM 交互承载点；实际点击处理留给 `src/ui/events.ts` 和第 23 步实现。
- 电脑手牌仍只渲染牌背，不暴露具体牌面。
- 通过完整重绘容器避免多次渲染时重复追加旧牌。

### `src/styles.css`

第 22 步补充的样式职责：

- `.tile-button` 为玩家手牌按钮提供可点击光标。
- `.tile-button:hover` 与 `.tile-button:focus-visible` 为鼠标悬停和键盘聚焦提供视觉反馈。
- 牌按钮继续复用 `.tile` 的基础牌面样式，保持与牌河静态牌展示一致。

### `src/main.test.ts`

第 22 步补充的渲染测试覆盖：

- 初始化后玩家手牌区域渲染 13 个可点击牌按钮。
- 玩家手牌按钮的 `data-tile-id` 和 `data-copy-index` 对应当前状态中的实体牌。
- 玩家弃牌后的状态重新渲染时，玩家手牌减少 1 张，玩家牌河显示对应弃牌。
- 电脑牌河按 `discardPile` 中的弃牌顺序渲染。
- 多次渲染同一状态不会导致玩家手牌或电脑牌背重复显示。

### 后续 UI 衔接边界

- 第 23 步应在 `src/ui/events.ts` 中绑定玩家手牌按钮点击事件。
- 第 23 步点击事件应读取按钮上的实体牌标识，在当前玩家手牌中找到对应 `TileCopy` 后调用游戏流程模块。
- 第 23 步不应让 `render.ts` 承担状态修改职责。
- 第 24 步再把可胡提示和胡牌按钮接入真实 `canRon()` / `canTsumo()` 判断。

## 第 23 步新增架构说明

### `src/ui/events.ts`

玩家摸牌与打牌交互绑定模块。

职责：

- 导出 `bindAppEvents(container, initialState)`，在页面容器上绑定点击事件，并返回解绑函数。
- 在闭包中维护当前 UI 状态 `currentState`，每次合法操作后更新状态并调用 `renderApp(container, currentState)` 完整重绘页面。
- 通过事件委托处理：
  - `data-action="draw"` 的摸牌按钮点击。
  - `button.tile-button` 的玩家手牌点击。
- 使用 `findPlayerTileByButton()` 从手牌按钮的 `data-tile-id` 与 `data-copy-index` 找回玩家当前手牌中的实体牌。
- 使用 `canPlayerDraw()` 限制只有玩家回合、当前行动方为玩家且玩家手牌为 13 张时才能摸牌。
- 使用 `canPlayerDiscard()` 限制只有玩家回合、当前行动方为玩家且玩家手牌为 14 张时才能打牌。
- 使用 `resolvePlayerDiscard()` 组合玩家打牌后的流程：
  - 调用 `discardTileAndSwitchTurn()` 处理玩家打牌、电脑荣和检查、电脑副露检查和普通回合切换。
  - 如果玩家弃牌后进入电脑回合，则调用 `playComputerTurn()` 执行电脑自动摸牌、自摸检查、选牌、打牌和切回玩家回合。

设计约束：

- `events.ts` 只负责 UI 事件到游戏流程模块的连接，不直接实现打牌、摸牌、胡牌、副露或计分规则。
- 非玩家回合、未摸牌前、对局结束后或按钮实体牌标识无效时，事件处理直接返回，不改变状态。
- 当前 UI 状态只保存在本次绑定事件的闭包中；第 25 步新对局按钮接入时应通过同一个状态更新路径重置 `currentState`。

### `src/ui/render.ts`

第 23 步补充的交互提示职责：

- 摸牌按钮现在只在玩家回合且玩家手牌为 13 张时可用。
- 玩家回合提示会根据手牌数量区分：
  - 13 张：提示“当前回合：玩家，请摸牌。”
  - 14 张：提示“当前回合：玩家，请打出一张牌。”
- 当最后弃牌者为电脑且当前已回到玩家回合时，提示会显示“电脑已自动行动”，帮助用户确认电脑已经完成自动摸打。

设计约束：

- `render.ts` 仍不修改 `GameState`，也不直接调用 `drawTile()`、`discardTileAndSwitchTurn()` 或 `playComputerTurn()`。
- 电脑是否已经行动由状态中的 `lastDiscard` 与 `currentActor` 反映，渲染层只负责把该状态转成提示文案。

### `src/main.test.ts`

第 23 步补充的 UI 事件测试覆盖：

- 玩家点击摸牌按钮后，玩家手牌增加，剩余牌山减少。
- 玩家摸牌前点击手牌不会改变页面状态。
- 玩家摸牌后点击手牌会进入玩家牌河，并触发电脑基础回合。
- 电脑回合期间玩家点击手牌不会改变状态。
- 对局结束后玩家点击手牌不会改变状态。
- 玩家回合提示会区分摸牌阶段和打牌阶段。
- 电脑自动行动后页面提示会显示电脑已自动行动。

### 后续 UI 衔接边界

- 第 24 步应继续在 `events.ts` 中绑定胡牌按钮事件，不应把胡牌判断写入 `render.ts`。
- 第 24 步的胡牌按钮展示应读取 `canRon()` / `declareRon()` 与 `canTsumo()` / `declareTsumo()` 并重新渲染。
- 当前第 23 步没有连接玩家吃、碰、杠按钮；后续玩家副露 UI 应复用 `src/game/meld.ts` 的候选判断和声明入口。

## 第 24 步新增架构说明

### `src/ui/render.ts`

玩家胡牌提示与结算展示渲染模块。

第 24 步扩展后的职责：

- `renderApp(container, state)` 每次重绘时计算玩家当前胡牌机会，并据此渲染可胡提示与胡牌按钮状态。
- 通过 `getPlayerWinOpportunity()` 优先调用 `canTsumo(state, 'player')` 判断自摸；自摸不可用时再调用 `canRon(state, 'player')` 判断荣和。
- 可胡提示会展示玩家可自摸或可荣和，以及对应命中役种。
- 玩家不可胡时显示“玩家当前不可胡”。
- 听牌提示通过 `getPlayerWinningWaits()` 遍历 `allowedTiles`，把玩家 13 张手牌加候选牌后交给 `evaluateWinningHand()` 判断，显示可胡待牌。
- 胡牌按钮现在使用 `data-action="win"`，只在玩家可自摸或可荣和时启用。
- 对局结束后若 `state.scoreSettlement` 存在，会渲染点数变化面板，展示双方分差与结算后点数。

设计约束：

- `render.ts` 仍不直接修改 `GameState`，也不调用 `declareRon()` 或 `declareTsumo()` 执行胡牌。
- `render.ts` 可以调用只读判断函数 `canRon()`、`canTsumo()` 和 `evaluateWinningHand()`，用于决定提示文案与按钮启用状态。
- 当前听牌提示是基础枚举待牌，不实现进张效率、复杂向听数或副露选择提示。
- 结算展示直接读取 `state.scoreSettlement`，不在 UI 中重新计算点数变化。

### `src/ui/events.ts`

玩家胡牌按钮事件绑定模块。

第 24 步扩展后的职责：

- 在既有事件委托中处理 `data-action="win"` 的胡牌按钮点击。
- `resolvePlayerWin()` 会先调用 `declareTsumo(currentState, 'player')`。
- 如果自摸声明没有改变状态，再调用 `declareRon(currentState, 'player')`。
- 胡牌成功后更新闭包中的 `currentState` 并调用 `renderApp(container, currentState)` 完整重绘页面。
- 不可胡时 `declareTsumo()` 与 `declareRon()` 都返回原状态，事件处理直接忽略。

设计约束：

- `events.ts` 只连接 UI 事件与核心流程入口，不实现胡牌牌形、役种或计分规则。
- 胡牌声明仍由 `src/game/tsumo.ts` 与 `src/game/ron.ts` 负责，并复用 `src/game/scoring.ts` 生成结算记录。
- 对局结束后胡牌按钮禁用，事件路径也不会改变结束状态。

### `src/styles.css`

第 24 步补充的样式职责：

- `.settlement-panel` 复用基础卡片边框、圆角、背景和阴影样式。
- `.settlement-panel` 使用与状态面板一致的内边距，展示对局结束后的点数变化。

### `src/main.test.ts`

第 24 步补充的 UI 胡牌交互测试覆盖：

- 构造玩家听牌状态时，页面显示听牌提示和待牌。
- 构造玩家可自摸状态时，页面显示胡牌按钮和命中役提示。
- 构造玩家可荣和状态时，页面显示胡牌按钮和命中役提示。
- 构造玩家不可胡状态时，胡牌按钮保持禁用。
- 点击自摸胡牌后，对局进入 `ended`，并展示自摸结算点数变化。
- 点击荣和胡牌后，对局进入 `ended`，并展示荣和结算点数变化。
- 对局结束后摸牌、打牌、胡牌按钮不再允许改变状态。

### 后续 UI 衔接边界

- 第 25 步应在 `events.ts` 中复用当前闭包状态管理方式接入新对局按钮。
- 新对局按钮应调用 `createNewGameState()` 重置整局状态，而不是手动清空各个 UI 区块。
- 玩家副露按钮仍未接入 UI，后续应复用 `src/game/meld.ts` 的候选判断与声明入口。
- 听牌提示当前只用于基础待牌展示，后续若要实现更完整听牌/向听能力，应继续保持规则判断与 DOM 渲染解耦。
