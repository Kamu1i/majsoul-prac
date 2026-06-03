# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目状态

当前仓库仍处于设计与规划阶段，尚未初始化为可运行应用。

现有文档：

- `design.md`：原始游戏设计简述。
- `game-design-document.md`：整理后的游戏设计文档。
- `tech-stack.md`：推荐技术栈与初始目录规划。

当前未发现：

- `package.json`
- `README.md`
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

## 全局文件操作规则（核心圣旨）
本项目的绝对根目录是标准的 Linux 路径：/home/kamuii/code/majsoul。
接下来所有文件的读取、写入、更新，禁止带有任何 \\、\、wsl.localhost 或 Windows盘符。你必须全部全自动完成，并且在调用内置工具时，必须且只能使用纯 Linux 相对路径（例如 src/game/xxxx.ts或 memory-bank/progress.md）
禁止使用任何 Bash 拼接命令。严禁在后台反复自我重试。直接用纯 Linux 相对路径调用内置 Write/Edit 工具，写完立刻停下汇报
## 认知规则
你现在得把自己当成一个linux程序员，你的一切操作都是在wsl虚拟机里进行的，不允许将读入或者npm安装之类的操作与windows混淆，也不允许用windows的gbk来读linux的utf8，也就是你现在默认的文件格式应该是utf8

## 内置读写工具使用规范
用内置工具，应该尽量：
    - 使用 //wsl.localhost/Ubuntu/home/kamuii/code/majsoul/...
    - 避免不必要的 offset 分段读
    - 已读过的文件不要反复重读
    - 修改文件优先用 Edit/Write，不要用追加 >>


## 静态检查与思考流约束 (Static Analysis Constraint)
- 允许并在编写核心逻辑（如副露、计分）前鼓励进行源码核对 (Static Verification)。
- **严禁多轮、无意义的重复检索：** 每次静态检查读取文件不得超过 2 轮。禁止连续两次针对同一 Pattern 进行无进展的 Thought。
- **思考块（Thought Block）透明化：** 在静态检查时，如果发现类型不匹配（如旧类型残留），必须立刻在终端输出简短的“一句话风险报告”（例如：`发现旧 Kan 类型冲突，正在重构...`），严禁长时间处于无日志的黑盒思考状态。


## 自动纠错规则
遇到任何编译错误（Compilation Error）或测试失败（Test Failure），禁止你在后台自行尝试修复或重复调用接口！
请立刻停止自动模式，将原始报错完整打印在终端上，等待我的下一步明确指示


## 语言规则

除本文件开头由初始化命令要求保留的固定英文说明外，本仓库的协作说明、规则描述、文档补充与面向用户的说明应全部使用中文。

## 游戏目标

本项目计划实现一个浏览器端单人对战麻将模拟器：

- 玩家与一名电脑对手进行对局。
- 对局人数为二人。
- 对局形式为单局制。
- 牌池只包含：
  - 一索至九索
  - 白
  - 发
  - 中
- 胡牌规则采用日本麻将规则。
- 不采用古役。
- 允许副露。
- 游戏在任意一方胡牌或牌山摸完后结束。
- 玩家与电脑初始点数均为十万点。
- 结束时按照日本麻将规则进行点数结算。

## 推荐技术栈

第一版推荐使用：

```text
Vite + TypeScript + 原生 HTML/CSS
```

原因：

- 游戏可以完全在浏览器本地运行，第一版不需要后端、数据库或接口服务。
- 麻将规则涉及较多状态与数据结构，使用 TypeScript 有助于降低规则实现错误。
- Vite 配置简单、启动快，适合小型前端游戏。
- 当前主要复杂度在游戏规则与流程，不在界面组件结构，原生 HTML/CSS 足够完成最小可行版本。

如果后续界面复杂度明显提升，可再考虑升级为：

```text
Vite + TypeScript + React
```

## 常用命令

当前项目尚未初始化，因此没有可执行的构建、测试或检查命令。

在出现 `package.json` 之前，不要假设以下命令已经存在：

```text
npm run dev
npm run build
npm run lint
npm run test
```

项目初始化后，应以 `package.json` 中的 `scripts` 为准记录实际命令。

## 计划架构

推荐的初始目录结构：

```text
src/
  main.ts
  game/
    tile.ts
    deck.ts
    player.ts
    game-state.ts
    rules.ts
    scoring.ts
    ai.ts
  ui/
    render.ts
    events.ts
  styles.css
index.html
```

职责划分：

- `src/game/` 放置游戏核心逻辑与状态流转。
- `src/ui/` 负责界面渲染与用户输入事件。
- `main.ts` 负责初始化游戏，并连接界面与游戏逻辑。
- 胡牌判断、计分、牌山、玩家状态、电脑策略应尽量与界面渲染解耦，方便后续测试。

## 初始实现顺序

建议按以下顺序推进：

1. 定义牌的数据结构与受限牌池。
2. 实现洗牌、发牌、摸牌、打牌。
3. 实现玩家与电脑的回合切换。
4. 实现简单电脑出牌逻辑。
5. 实现日本麻将胡牌判断。
6. 实现副露支持。
7. 实现牌山摸完后的流局处理。
8. 实现基础点数结算。
9. 完善界面展示与操作体验。


## 补充规则

整个开发过程严格遵守模块化（多文件）和禁止单体巨文件（monolith）的要求，代码可读性要高

# 重要提示：
# 写任何代码前必须完整阅读 memory-bank/@architecture.md（包含完整数据库结构）
# 写任何代码前必须完整阅读 memory-bank/@game-design-document.md
# 每完成一个重大功能或里程碑后，必须更新 memory-bank/@architecture.md