import React from "react";
import { Document, Page, StyleSheet, Text, Link, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingRight: 54,
    paddingBottom: 54,
    paddingLeft: 54,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#18181b",
    lineHeight: 1.5,
  },
  paragraph: {
    marginBottom: 8,
  },
});

function renderRich(text: string) {
  const parts: React.ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <Link key={`lnk-${i}`} src={match[2]} style={{ color: "#2563eb", textDecoration: "none" }}>
        {match[1]}
      </Link>,
    );
    last = match.index + match[0].length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

export async function renderCoverLetterPdf(letter: string, opts: { company?: string; companyUrl?: string; cvMarkdown?: string }) {
  const paras = letter
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const Doc = (
    <Document title="Cover Letter" subject="Cover Letter">
      <Page size="A4" style={styles.page}>
        {paras.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {renderRich(p)}
          </Text>
        ))}
      </Page>
    </Document>
  );

  return renderToBuffer(Doc);
}
