// SES inbound forwarder.
//
// Flow: SES receives mail for talks@pabloalbaladejo.com, stores the raw MIME in
// S3, then invokes this function. We fetch the message, rewrite the envelope so
// SES will re-send it from a verified address, and deliver it to the personal
// Gmail via SendRawEmail. Reply-To is set to the original sender so replies work.
//
// This follows the well-known aws-lambda-ses-forwarder approach, trimmed to the
// single route this account needs.
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";

const s3 = new S3Client({});
const ses = new SESClient({});

const BUCKET = process.env.MAIL_BUCKET;
const PREFIX = process.env.MAIL_PREFIX ?? "";
const FROM = process.env.FORWARD_FROM; // talks@pabloalbaladejo.com
const FROM_NAME = process.env.FORWARD_FROM_NAME ?? "Pablo (talks)";
const TO = process.env.FORWARD_TO; // pablo.albaladejo.mestre@gmail.com

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

// Rewrite the MIME header block: force a verified From, redirect To, and set
// Reply-To to whoever originally wrote in. The body is preserved verbatim.
const rewrite = (raw) => {
  const match = raw.match(/^((?:.+\r?\n)*)(\r?\n[\s\S]*)$/);
  let header = match ? match[1] : raw;
  const body = match ? match[2] : "\r\n";

  const fromMatch = header.match(/^from:[\t ]?(.*(?:\r?\n\s+.*)*)\r?\n/im);
  const originalFrom = fromMatch
    ? fromMatch[1].replace(/\r?\n\s+/g, " ").trim()
    : "";

  header = header
    .replace(/^from:[\t ]?.*(?:\r?\n\s+.*)*\r?\n/im, "")
    .replace(/^to:[\t ]?.*(?:\r?\n\s+.*)*\r?\n/im, "")
    .replace(/^cc:[\t ]?.*(?:\r?\n\s+.*)*\r?\n/im, "")
    .replace(/^reply-to:[\t ]?.*(?:\r?\n\s+.*)*\r?\n/im, "")
    .replace(/^return-path:[\t ]?.*\r?\n/gim, "")
    .replace(/^sender:[\t ]?.*\r?\n/gim, "")
    .replace(/^message-id:[\t ]?.*\r?\n/gim, "")
    // Old DKIM signatures no longer match once we rewrite From; drop them so SES
    // does not reject a "Duplicate header 'DKIM-Signature'".
    .replace(/^dkim-signature:[\t ]?.*\r?\n(\s+.*\r?\n)*/gim, "");

  const injected =
    `From: ${FROM_NAME} <${FROM}>\r\n` +
    `To: ${TO}\r\n` +
    (originalFrom ? `Reply-To: ${originalFrom}\r\n` : "");

  return injected + header + body;
};

export const handler = async (event) => {
  const messageId = event?.Records?.[0]?.ses?.mail?.messageId;
  if (!messageId) {
    console.error("No SES messageId on event; nothing to forward.");
    return;
  }

  const key = `${PREFIX}${messageId}`;
  const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const raw = (await streamToBuffer(obj.Body)).toString("utf8");

  await ses.send(
    new SendRawEmailCommand({
      Source: FROM,
      Destinations: [TO],
      RawMessage: { Data: Buffer.from(rewrite(raw), "utf8") },
    })
  );

  console.log(`Forwarded ${messageId} -> ${TO}`);
};
