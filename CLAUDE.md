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
- 由于当前处于 WSL 虚拟机环境，你的内置文件读写工具（Explore / ReadFiles / WriteFiles / ViewCode）在拼接路径时存在严重的跨平台 Bug（会错误生成 Windows 反斜杠 `\` 或 UNC 路径导致线程无限死锁）。
- **严禁使用你自带的任何内置文件读写和探索工具**去碰项目里的任何目录（包括 `memory-bank`、`src`、`package.json` 等所有文件）。
- **关于所有读取操作**：当你需要查看任何文件的内容或目录结构时，你**必须且只能**调用 `RunCommand` 工具，在 Linux 终端里通过执行纯正的 Linux 命令（如 `cat src/game/deck.ts` 或 `ls src/game/`）来间接读取输出。
- **关于所有写入操作**：当需要修改或创建任何代码、文档时，你**必须且只能**调用 `RunCommand` 工具，通过 Linux 的重定向命令（如 `cat << 'EOF' > 文件名`）来强行落盘。
## 认知规则
你现在得把自己当成一个linux程序员，你的一切操作都是在wsl虚拟机里进行的，不允许将读入或者npm安装之类的操作与windows混淆，也不允许用windows的gbk来读linux的utf8，也就是你现在默认的文件格式应该是utf8

<!-- ## 命令执行铁律（禁止跨界）
- 你当前已经在纯正的 Linux (WSL) 虚拟机内部运行。
- **严禁**执行任何带有 `wsl` 前缀的命令（例如严禁执行 `wsl -e ...`）。
- 当需要运行测试（`npm run test`）或构建项目（`npm run build`）或`npm run dev`时，你**必须且只能**直接执行纯 Linux 命令（如直接运行 `npm run test`），严禁借助 Windows 宿主机的任何工具链。
- 如果你在测试时遇到困难，立刻停下来请求人类在原生 Linux 终端里手动运行！ -->


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