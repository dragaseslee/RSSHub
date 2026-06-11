# RSSHub 自定义版本说明

本仓库基于 [DIYgod/RSSHub](https://github.com/DIYgod/RSSHub) fork，包含以下自定义功能。

## 自定义功能

### 1. 请求级 Token 覆盖

允许不同用户通过 HTTP Header 传递自己的 API token，无需服务器配置环境变量。

**使用方式：**

```bash
curl -H "X-RSSHub-Github-Token: ghp_xxxx" https://your-rsshub/github/repos/DIYgod
curl -H "X-RSSHub-Youtube-Key: AIzaSyxxx" https://your-rsshub/youtube/channel/xxx
```

**涉及文件：**

- `lib/config.ts` — AsyncLocalStorage + Proxy 机制
- `lib/middleware/token-override.ts` — 解析 Header 的中间件
- `lib/app-bootstrap.tsx` — 注册中间件
- `lib/middleware/cache.ts` — 缓存 key 加入 token 指纹

### 2. 结构化 Token 缺失响应

当路由缺少必要 token 时，返回结构化 JSON 告知客户端需要哪些 token。

**响应示例：**

```json
{
    "error": {
        "code": "MISSING_CONFIG",
        "message": "GitHub trending RSS requires a GitHub access token.",
        "tokenRequirements": [
            {
                "configPath": "github.access_token",
                "header": "X-RSSHub-Github-Token",
                "envVar": "GITHUB_ACCESS_TOKEN",
                "description": "GitHub Personal Access Token",
                "required": false
            }
        ]
    }
}
```

**涉及文件：**

- `lib/errors/types/config-not-found.ts` — 增强的错误类型
- `lib/errors/index.tsx` — 错误处理返回结构化 JSON
- `lib/config/token-registry.ts` — Token 信息注册表

---

## 合并上游更新

### 基本流程

```bash
# 1. 拉取原作者最新代码
git fetch upstream

# 2. 合并到 master
git checkout master
git merge upstream/master
git push origin master

# 3. 合并到功能分支
git checkout feature/per-request-token-override
git merge master
```

### 可能冲突的文件

以下文件是自定义改动涉及的，合并时可能产生冲突：

| 文件                                   | 冲突概率 | 说明                                                                             |
| -------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `lib/config.ts`                        | 中       | 自定义改动在文件顶部（AsyncLocalStorage）和底部（Proxy），中间部分可能被上游修改 |
| `lib/app-bootstrap.tsx`                | 低       | 只加了两行 import 和一行 middleware 注册                                         |
| `lib/middleware/cache.ts`              | 低       | 只改了 cache key 生成部分                                                        |
| `lib/errors/index.tsx`                 | 中       | 错误处理部分，上游可能调整错误处理逻辑                                           |
| `lib/errors/types/config-not-found.ts` | 低       | 增强了错误类，上游不太可能改这个文件                                             |

**冲突解决原则：**

- 上游的 bug fix 和功能改进优先保留
- 自定义功能的代码尽量保留，除非上游做了根本性重构
- 如果上游重构了 config 系统，需要重新适配 AsyncLocalStorage + Proxy 方案

---

## 为新路由添加 Token 支持

### 步骤 1：在 token-registry.ts 中注册

编辑 `lib/config/token-registry.ts`，添加新服务的 token 信息：

```typescript
// 在 tokenRegistry 对象中添加
newsService: [
    {
        configPath: 'newsService.apiKey',
        header: 'X-RSSHub-Newsservice-ApiKey',
        envVar: 'NEWSSERVICE_API_KEY',
        description: 'News Service API Key',
        required: true,
        docsUrl: 'https://your-docs-url',
    },
],
```

### 步骤 2：在路由中使用

```typescript
import { config } from '@/config';
import { getTokenRequirements } from '@/config/token-registry';
import ConfigNotFoundError from '@/errors/types/config-not-found';

async function handler(ctx) {
    if (!config.newsService?.apiKey) {
        throw new ConfigNotFoundError('News Service requires an API key.', getTokenRequirements('newsService'));
    }
    // ... 正常逻辑
}
```

### Header 命名规则

```
X-RSSHub-{Service}-{Property}

Service:  首字母大写，如 Github、Youtube、Bilibili
Property: 首字母大写，连字符分隔，如 Access-Token、Api-Key

示例：
  config.github.access_token  → X-RSSHub-Github-Access-Token
  config.youtube.key          → X-RSSHub-Youtube-Key
  config.bilibili.cookie      → X-RSSHub-Bilibili-Cookie
```

### 注意事项

- **不改原路由逻辑**：只在 `throw new ConfigNotFoundError()` 时添加 token 需求参数
- **token 是可选的**：如果路由在没有 token 时也能工作（只是降级），设 `required: false`
- **token 是必需的**：如果路由必须有 token 才能工作，设 `required: true`
- **测试**：添加 token 支持后，运行 `npx vitest run lib/middleware/token-override.test.ts` 验证

---

## 部署

部署时使用 `feature/per-request-token-override` 分支：

```bash
# Docker
git clone -b feature/per-request-token-override https://github.com/dragaseslee/RSSHub.git
cd RSSHub && docker build -t rsshub-custom .

# 直接部署
git checkout feature/per-request-token-override
pnpm install && pnpm start
```
