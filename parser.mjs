export function extractRichText(content = {}) {
  const rich = content?.richText || [];
  const out = [];
  for (const node of rich) {
    const t = String(node?.type || "").toLowerCase();
    if (t === "text" || t === "msgtext") {
      if (node?.text || node?.content) out.push(node.text || node.content);
    } else if (t === "at") {
      out.push(`@${node?.atName || node?.text || "someone"}`);
    } else if (t === "picture" || t === "image") {
      out.push("[图片]");
    } else if (node?.text || node?.content) {
      out.push(node.text || node.content);
    }
  }
  return out.join(" ").trim();
}

export function extractQuoteText(data = {}) {
  const qc = String(data?.content?.quoteContent || "").trim();
  if (qc) return qc;

  const replied = data?.text?.repliedMsg?.content || {};
  if (Array.isArray(replied?.richText)) {
    const out = replied.richText
      .map((n) => n?.content || n?.text || "")
      .filter(Boolean)
      .join(" ")
      .trim();
    if (out) return out;
  }
  return String(replied?.text || "").trim();
}

function extractChatRecordText(content = {}) {
  const summary = String(content?.summary || "").trim();
  const raw = content?.chatRecord;
  if (!raw) return summary;
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return summary;
    const lines = arr
      .map((x) => {
        const sender = x?.senderNick || x?.senderName || "";
        const body = x?.content || "";
        if (!body) return "";
        return sender ? `${sender}: ${body}` : String(body);
      })
      .filter(Boolean);
    return lines.join("\n").trim() || summary;
  } catch {
    return summary;
  }
}

function cleanRichLikeText(s = "") {
  return String(s)
    .replace(/&#8203;/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/\\\\/g, "\\")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeInbound(data = {}) {
  const plain = cleanRichLikeText(data?.text?.content || "");
  const rich = cleanRichLikeText(extractRichText(data?.content || {}));
  const contentText = cleanRichLikeText(data?.content?.text || "");
  const chatRecordText = cleanRichLikeText(extractChatRecordText(data?.content || {}));
  const dcList = data?.content?.downloadCodeList;
  const imageCount = Array.isArray(dcList) ? dcList.length : 0;
  const imageHint = imageCount > 0 ? `\n[图片x${imageCount}]` : "";
  const normalizedText = (rich || plain || contentText || chatRecordText) + imageHint;
  const quoteText = extractQuoteText(data);

  return {
    msg_id: data?.msgId,
    conversation_id: data?.conversationId || data?.conversationType,
    sender_id: data?.senderStaffId || data?.senderId || "",
    sender_nick: data?.senderNick || "",
    normalized_text: normalizedText,
    quote_text: quoteText,
    image_download_codes: Array.isArray(dcList) ? dcList : [],
    raw: data,
  };
}
