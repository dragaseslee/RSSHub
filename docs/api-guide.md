# RSSHub 自定义实例 API 文档

本文档说明如何使用带 Token 覆盖功能的 RSSHub 实例。

## 基础信息

- **Base URL**: `https://your-rsshub-instance.com`
- **协议**: HTTPS（强烈建议，保护 Header 中的 Token）
- **认证**: 部分路由需要 API Token，通过 HTTP Header 传递

---

## Token 传递方式

### 通过 HTTP Header（推荐）

在请求中添加 `X-RSSHub-{Service}-{Key}` 格式的 Header：

```bash
curl -H "X-RSSHub-Github-Token: ghp_xxxxxxxxxxxx" \
     https://your-rsshub/github/repos/DIYgod
```

### Header 命名规则

```
X-RSSHub-{服务名}-{属性名}

服务名: 首字母大写，如 Github、Youtube、Spotify
属性名: 首字母大写，多个单词用连字符分隔
```

**示例：**

| 服务     | Header                           | 说明                           |
| -------- | -------------------------------- | ------------------------------ |
| GitHub   | `X-RSSHub-Github-Token`          | GitHub Personal Access Token   |
| YouTube  | `X-RSSHub-Youtube-Key`           | YouTube Data API Key           |
| Spotify  | `X-RSSHub-Spotify-ClientId`      | Spotify Client ID              |
| Spotify  | `X-RSSHub-Spotify-ClientSecret`  | Spotify Client Secret          |
| Twitter  | `X-RSSHub-Twitter-AuthToken`     | Twitter Auth Token             |
| Pixiv    | `X-RSSHub-Pixiv-RefreshToken`    | Pixiv Refresh Token            |
| Bilibili | `X-RSSHub-Bilibili-Cookie-{UID}` | Bilibili Cookie（按 UID 区分） |

### 同时传递多个 Token

```bash
curl -H "X-RSSHub-Spotify-ClientId: your_client_id" \
     -H "X-RSSHub-Spotify-ClientSecret: your_client_secret" \
     https://your-rsshub/spotify/playlist/xxx
```

---

## 错误响应格式

当缺少必需的 Token 时，服务器返回结构化错误信息。

### 响应格式

```json
{
    "error": {
        "code": "MISSING_CONFIG",
        "message": "错误描述信息",
        "tokenRequirements": [
            {
                "configPath": "github.access_token",
                "header": "X-RSSHub-Github-Token",
                "envVar": "GITHUB_ACCESS_TOKEN",
                "description": "GitHub Personal Access Token (classic or fine-grained)",
                "required": false,
                "docsUrl": "https://docs.rsshub.app/deploy/config#route-specific-configurations"
            }
        ],
        "hint": "Pass tokens via HTTP headers (e.g., X-RSSHub-{Service}-{Key}) or configure environment variables on the server."
    }
}
```

### 字段说明

| 字段                      | 类型   | 说明                              |
| ------------------------- | ------ | --------------------------------- |
| `error.code`              | string | 错误代码，固定为 `MISSING_CONFIG` |
| `error.message`           | string | 人类可读的错误描述                |
| `error.tokenRequirements` | array  | 缺少的 Token 列表                 |
| `error.hint`              | string | 解决提示                          |

### tokenRequirements 数组元素

| 字段          | 类型    | 说明                               |
| ------------- | ------- | ---------------------------------- |
| `configPath`  | string  | 配置路径，如 `github.access_token` |
| `header`      | string  | 对应的 HTTP Header 名称            |
| `envVar`      | string  | 对应的环境变量名                   |
| `description` | string  | Token 的用途说明                   |
| `required`    | boolean | `true`=必需，`false`=可选          |
| `docsUrl`     | string  | 文档链接（可选）                   |

---

## 客户端处理流程

### 流程图

```
发送请求
    ↓
收到响应
    ↓
状态码 200? ──是──→ 正常处理 RSS 数据
    │
    否
    ↓
响应体包含 error.code = "MISSING_CONFIG"?
    │
    ├──是──→ 解析 tokenRequirements
    │         ↓
    │         收集用户 Token（从配置/输入）
    │         ↓
    │         重新发送请求，附带 Token Header
    │
    └──否──→ 其他错误，按常规方式处理
```

### 代码示例（JavaScript）

```javascript
async function fetchRSS(url, userTokens = {}) {
    // 构建 Token Header
    const headers = {};
    for (const [service, token] of Object.entries(userTokens)) {
        headers[`X-RSSHub-${service}`] = token;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    // 检查是否缺少 Token
    if (data.error?.code === 'MISSING_CONFIG') {
        console.warn('缺少必要的 Token:', data.error.message);

        // 从 tokenRequirements 中提取需要的 Header
        const requiredHeaders = data.error.tokenRequirements.filter((t) => t.required).map((t) => t.header);

        console.log('请提供以下 Header:', requiredHeaders);
        console.log('Token 需求详情:', data.error.tokenRequirements);

        // 返回错误信息供上层处理
        return {
            success: false,
            error: data.error,
            requiredHeaders,
        };
    }

    // 正常返回 RSS 数据
    return { success: true, data };
}

// 使用示例
const result = await fetchRSS('https://your-rsshub/spotify/playlist/xxx', {
    'Spotify-ClientId': 'your_client_id',
    'Spotify-ClientSecret': 'your_client_secret',
});

if (!result.success) {
    // 显示给用户需要哪些 Token
    result.error.tokenRequirements.forEach((req) => {
        console.log(`需要: ${req.header}`);
        console.log(`说明: ${req.description}`);
        console.log(`是否必需: ${req.required ? '是' : '否'}`);
    });
}
```

### 代码示例（Python）

```python
import requests

def fetch_rsshub(url, user_tokens=None):
    """获取 RSS 数据，自动处理 Token 需求"""
    headers = {}

    # 添加用户 Token
    if user_tokens:
        for service, token in user_tokens.items():
            headers[f'X-RSSHub-{service}'] = token

    response = requests.get(url, headers=headers)
    data = response.json()

    # 检查是否缺少 Token
    if data.get('error', {}).get('code') == 'MISSING_CONFIG':
        error = data['error']
        print(f'缺少 Token: {error["message"]}')

        # 提取需要的 Header
        required = [t['header'] for t in error['tokenRequirements'] if t['required']]
        print(f'请提供以下 Header: {required}')

        return {'success': False, 'error': error}

    return {'success': True, 'data': data}


# 使用示例
result = fetch_rsshub(
    'https://your-rsshub/spotify/playlist/xxx',
    {
        'Spotify-ClientId': 'your_client_id',
        'Spotify-ClientSecret': 'your_client_secret'
    }
)

if not result['success']:
    for req in result['error']['tokenRequirements']:
        print(f"Header: {req['header']}")
        print(f"说明: {req['description']}")
        print(f"必需: {'是' if req['required'] else '否'}")
        print()
```

---

## 缓存说明

- **不同用户的请求独立缓存**：使用不同 Token 的用户会获得不同的缓存
- **无 Token 用户共享缓存**：没有传 Token 的用户共享同一份缓存
- **缓存时间**：由服务器配置决定，通常为几分钟

---

## 常见问题

### Q: 为什么我的请求返回 503 错误？

A: 检查响应体是否包含 `error.code: "MISSING_CONFIG"`。如果是，说明需要提供 Token。

### Q: Token 是必需的还是可选的？

A: 查看 `tokenRequirements` 中的 `required` 字段：

- `true`：必须提供，否则无法使用该路由
- `false`：可选，提供后可获得更高配额或更多功能

### Q: 我的 Token 安全吗？

A: Token 通过 HTTP Header 传递，不会出现在 URL 或日志中。建议：

- 使用 HTTPS 连接
- 不要在公开场合分享带 Token 的完整 URL
- 定期轮换 Token

### Q: 一个路由需要多个 Token 怎么办？

A: 在同一个请求中添加多个 Header。例如 Spotify 需要 Client ID 和 Client Secret：

```bash
curl -H "X-RSSHub-Spotify-ClientId: xxx" \
     -H "X-RSSHub-Spotify-ClientSecret: yyy" \
     https://your-rsshub/spotify/playlist/xxx
```

### Q: 如何获取这些 Token？

A: 查看错误响应中的 `docsUrl` 字段，或参考各服务的官方文档申请 API Token。

---

## 支持的服务列表

| 服务            | 路由示例                            | 需要的 Token                                               |
| --------------- | ----------------------------------- | ---------------------------------------------------------- |
| GitHub          | `/github/repos/:user`               | `X-RSSHub-Github-Token`（可选）                            |
| GitHub Trending | `/github/trending/:since/:language` | `X-RSSHub-Github-Token`（必需）                            |
| YouTube         | `/youtube/channel/:id`              | `X-RSSHub-Youtube-Key`（必需）                             |
| Spotify         | `/spotify/playlist/:id`             | `X-RSSHub-Spotify-ClientId` + `ClientSecret`（必需）       |
| Twitter         | `/twitter/user/:id`                 | `X-RSSHub-Twitter-AuthToken`（必需）                       |
| Pixiv           | `/pixiv/user/:id`                   | `X-RSSHub-Pixiv-RefreshToken`（必需）                      |
| Bilibili        | `/bilibili/user/:uid`               | `X-RSSHub-Bilibili-Cookie-{UID}`（可选）                   |
| E-Hentai        | `/ehentai/:gid`                     | `X-RSSHub-Ehentai-Ipb-Member-Id` + `Ipb-Pass-Hash`（必需） |

更多服务请参考错误响应中的 `tokenRequirements` 列表。
