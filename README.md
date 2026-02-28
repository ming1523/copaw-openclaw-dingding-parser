# dingtalk-message-normalizer

> Keywords: **dingding openclaw**, **dingtalk openclaw**, **钉钉 openclaw**, **OpenClaw DingTalk parser**, **DingTalk message parser for OpenClaw**

从钉钉（DingTalk / DingDing）Stream 事件中提取并归一化可读文本的工具模块。兼容多种消息格式，输出统一的文本结构。

## OpenClaw + DingTalk（DingDing）

如果你在找以下内容，这个仓库就是对应实现：

- DingTalk / DingDing message parser for OpenClaw
- 钉钉 openclaw 消息解析
- dingtalk openclaw richText / quote / chatRecord 解析

## 为什么做这个（背景）

这个仓库不是为了做一个完整机器人，而是为了解决一个很具体的问题：

- 在实际接入里，发现钉钉消息形态很多（`text` / `richText` / `quote` / `chatRecord` / `content.text + downloadCodeList`）。
- 在 CoPaw 接入口与 OpenClaw 推理链路之间，最容易出错的就是“消息结构解析”。
- 如果解析逻辑散落在业务代码里，调试和迁移都很痛苦。

所以把解析能力单独抽成一个模块：

- 先从 **CoPaw 桥接 PoC** 中抽出可用解析逻辑；
- 再结合 **openclaw-channel-dingtalk** 的字段经验做统一归一化；
- 形成可独立复用的“解析层”，专门服务 OpenClaw 场景（也可给其他项目复用）。

一句话：**这个仓库是为了让 OpenClaw 更稳定地吃懂钉钉消息，而不是重复造一个机器人框架。**

## 用途

解析钉钉机器人/事件订阅推送的消息载荷，将不同格式的消息（普通文本、富文本、引用消息、聊天记录等）转换为统一的归一化文本，便于后续处理、存储或转发。

## 来源与组合说明

本仓库是从多个已有实现中抽取并合并出的“纯解析模块”：

1. `integrations/copaw-openclaw-poc`（桥接 PoC 中的解析与归一化逻辑，作为起点）
2. `openclaw-channel-dingtalk`（钉钉消息接入与字段形态经验，用于补齐兼容）

目标是把“消息解析”单独沉淀为可复用组件，避免与网关/发送逻辑耦合。

## 致谢（Inspired by）

- `agentscope-ai/CoPaw`：提供了 CoPaw 侧钉钉接入与桥接方向启发
- `soimy/openclaw-channel-dingtalk`：非常好用的 OpenClaw 钉钉通道实现，很多字段兼容思路都受其启发

感谢两位作者/团队的开源工作 🙌

## 支持的消息类型

| 类型 | 说明 | 示例场景 |
|------|------|----------|
| `text` | 普通文本消息 | 纯文本内容 |
| `richText` | 富文本节点数组 | 带格式、@提及、图片的消息 |
| `quote` | 引用回复消息 | 回复某条历史消息 |
| `chatRecord` | 聊天记录摘要 | 群聊历史记录 |
| `content.text + downloadCodeList` | 富文本 + 图片下载码 | 含图片的富文本消息 |

## 安装

```bash
# 直接克隆使用
git clone <your-repo-url>
cd dingtalk-message-normalizer
```

无需依赖，纯 ESM 模块，Node.js 14+ 即可运行。

## 快速上手

```js
import { normalizeInbound } from './parser.mjs';

// 假设 payload 是钉钉推送的事件数据
const payload = {
  msgId: 'msg-123456',
  conversationId: 'conv-789',
  senderStaffId: 'user-001',
  senderNick: '张三',
  content: {
    text: '你好，世界',
    richText: [
      { type: 'text', content: '你好' },
      { type: 'at', atName: '李四' },
      { type: 'picture' }
    ],
    downloadCodeList: ['dc-abc123', 'dc-def456']
  }
};

const result = normalizeInbound(payload);

console.log('归一化文本:', result.normalized_text);
console.log('引用内容:', result.quote_text);
console.log('图片下载码:', result.image_download_codes);
```

## 输入字段（钉钉事件载荷）

| 字段 | 类型 | 说明 |
|------|------|------|
| `msgId` | string | 消息唯一 ID |
| `conversationId` | string | 会话 ID |
| `conversationType` | string | 会话类型（单聊/群聊） |
| `senderStaffId` | string | 发送人员工 ID |
| `senderId` | string | 发送人 ID（备用） |
| `senderNick` | string | 发送人昵称 |
| `text.content` | string | 普通文本内容 |
| `content.text` | string | 富文本内容 |
| `content.richText` | array | 富文本节点数组 |
| `content.downloadCodeList` | array | 图片下载码列表 |
| `content.quoteContent` | string | 引用消息内容 |
| `content.chatRecord` | string/array | 聊天记录 |
| `content.summary` | string | 聊天记录摘要 |

## 输出字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `msg_id` | string | 消息 ID |
| `conversation_id` | string | 会话 ID 或类型 |
| `sender_id` | string | 发送人 ID |
| `sender_nick` | string | 发送人昵称 |
| `normalized_text` | string | **归一化后的主文本**（含图片标记如 `[图片 x2]`） |
| `quote_text` | string | 引用消息的文本内容 |
| `image_download_codes` | array | 图片下载码数组 |
| `raw` | object | 原始输入数据（便于调试） |

## 运行测试

```bash
node test.mjs
```

测试将输出示例解析结果，验证模块正常工作。

## 注意事项

1. **隐私脱敏**：本模块仅解析消息结构，不会存储或发送任何数据。使用时请确保输入数据已获授权。
2. **图片处理**：模块仅提取 `downloadCodeList`，不下载图片。如需获取图片，需调用钉钉 API。
3. **富文本清理**：自动清理 HTML 实体（`&nbsp;`、`&amp;` 等）和 `<font>` 标签。
4. **空值处理**：所有字段均有默认值，不会抛出异常。
5. **ESM 模块**：使用 `import` 语法，不支持 CommonJS `require`。

## 示例输出

```json
{
  "msg_id": "msg-demo",
  "conversation_id": "conv-789",
  "sender_id": "user-001",
  "sender_nick": "张三",
  "normalized_text": "你好 @李四 [图片]\n[图片 x2]",
  "quote_text": "引用的历史消息",
  "image_download_codes": ["dc-abc123", "dc-def456"],
  "raw": { ... }
}
```

## 许可证

MIT License
