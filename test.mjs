import { normalizeInbound } from './parser.mjs';

console.log('=== dingtalk-message-normalizer 测试 ===\n');

// 测试 1: 普通文本 + 图片
const test1 = {
  msgId: 'msg-plain-001',
  conversationId: 'conv-demo-123',
  senderStaffId: 'user-placeholder',
  senderNick: '示例用户',
  content: {
    text: '你好<font color="#068C39">世界</font>',
    downloadCodeList: ['dc-placeholder-1', 'dc-placeholder-2'],
  },
};

console.log('测试 1: 普通文本 + 图片');
console.log(JSON.stringify(normalizeInbound(test1), null, 2));
console.log('');

// 测试 2: 富文本（含 @提及）
const test2 = {
  msgId: 'msg-rich-002',
  conversationId: 'conv-demo-456',
  senderStaffId: 'user-placeholder-2',
  senderNick: '测试用户',
  content: {
    richText: [
      { type: 'text', content: '大家好' },
      { type: 'at', atName: '张三', text: '@张三' },
      { type: 'text', content: '请查看文档' },
      { type: 'picture' },
    ],
  },
};

console.log('测试 2: 富文本（含 @提及）');
console.log(JSON.stringify(normalizeInbound(test2), null, 2));
console.log('');

// 测试 3: 引用消息
const test3 = {
  msgId: 'msg-quote-003',
  conversationId: 'conv-demo-789',
  senderNick: '回复者',
  content: {
    text: '这是回复内容',
    quoteContent: '这是被引用的原始消息',
  },
};

console.log('测试 3: 引用消息');
console.log(JSON.stringify(normalizeInbound(test3), null, 2));
console.log('');

// 测试 4: 聊天记录
const test4 = {
  msgId: 'msg-chatrecord-004',
  conversationId: 'conv-demo-group',
  senderNick: '机器人',
  content: {
    summary: '群聊记录摘要',
    chatRecord: JSON.stringify([
      { senderNick: '用户 A', content: '第一条消息' },
      { senderNick: '用户 B', content: '第二条消息' },
    ]),
  },
};

console.log('测试 4: 聊天记录');
console.log(JSON.stringify(normalizeInbound(test4), null, 2));
console.log('');

// 测试 5: content.text + downloadCodeList
const test5 = {
  msgId: 'msg-content-005',
  conversationId: 'conv-demo-content',
  senderNick: '内容发送者',
  content: {
    text: '富文本内容',
    downloadCodeList: ['dc-img-001', 'dc-img-002', 'dc-img-003'],
  },
};

console.log('测试 5: content.text + downloadCodeList');
console.log(JSON.stringify(normalizeInbound(test5), null, 2));
console.log('');

console.log('=== 测试完成 ===');
