import React from "react";
import { Document, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingRight: 54,
    paddingBottom: 54,
    paddingLeft: 54,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#18181b",
    lineHeight: 1.45,
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d8",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  role: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#3f3f46",
    marginBottom: 5,
  },
  contact: {
    fontSize: 9.5,
    color: "#52525b",
  },
  section: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
    letterSpacing: 0.7,
    marginTop: 8,
    marginBottom: 1,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#e4e4e7",
    textTransform: "uppercase",
  },
  topLevelTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
    letterSpacing: 0.7,
    marginTop: 5,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 0.75,
    borderBottomColor: "#e4e4e7",
    textTransform: "uppercase",
  },
  subsectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#27272a",
    marginTop: 3,
    marginBottom: 3,
  },
  paragraph: {
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    fontSize: 10.5,
  },
  bulletText: {
    flex: 1,
  },
});

type ParsedLine = {
  type: "h1" | "h2" | "h3" | "bullet" | "paragraph";
  text: string;
};

function cleanMarkdown(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
}

function renderRichText(text: string) {
  const parts: React.ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(
      <Link key={`lnk-${i}`} src={match[2]} style={{ color: "#2563eb", textDecoration: "none" }}>
        {match[1]}
      </Link>,
    );
    last = match.index + match[0].length;
    i++;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

function parseMarkdown(markdown: string): ParsedLine[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("### ")) {
        return { type: "h3", text: cleanMarkdown(line.slice(4)) };
      }

      if (line.startsWith("## ")) {
        return { type: "h2", text: cleanMarkdown(line.slice(3)) };
      }

      if (line.startsWith("# ")) {
        return { type: "h1", text: cleanMarkdown(line.slice(2)) };
      }

      if (/^[-*]\s+/.test(line)) {
        return { type: "bullet", text: cleanMarkdown(line.replace(/^[-*]\s+/, "")) };
      }

      return { type: "paragraph", text: cleanMarkdown(line) };
    });
}

function splitHeader(lines: ParsedLine[]) {
  const firstSectionIndex = lines.findIndex((line, index) => index > 0 && line.type === "h2" && /summary|profile|skills|experience|education|projects?/i.test(line.text));
  const headerLines = firstSectionIndex === -1 ? lines.slice(0, 3) : lines.slice(0, firstSectionIndex);
  const bodyLines = firstSectionIndex === -1 ? lines.slice(3) : lines.slice(firstSectionIndex);
  const headingLines = headerLines.filter((line) => line.type === "h1" || line.type === "h2" || line.type === "h3" || line.type === "paragraph");

  return {
    name: headingLines[0]?.text ?? "Curriculum Vitae",
    role: headingLines[1]?.text,
    contact: headingLines.slice(2).map((line) => line.text).join(" • "),
    bodyLines,
  };
}

function CvDocument({ markdown }: { markdown: string }) {
  const { name, role, contact, bodyLines } = splitHeader(parseMarkdown(markdown));

  return (
    <Document title={`${name} CV`} author={name} subject="Optimised CV">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed={false}>
          <Text style={styles.name}>{renderRichText(name)}</Text>
          {role ? <Text style={styles.role}>{renderRichText(role)}</Text> : null}
          {contact ? <Text style={styles.contact}>{renderRichText(contact)}</Text> : null}
        </View>

        {bodyLines.map((line, index) => {
          if (line.type === "h1") {
            return (
              <View key={`${line.type}-${index}`} style={styles.section} wrap={false}>
                <Text style={styles.topLevelTitle}>{renderRichText(line.text)}</Text>
              </View>
            );
          }

          if (line.type === "h2") {
            return (
              <View key={`${line.type}-${index}`} style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>{renderRichText(line.text)}</Text>
              </View>
            );
          }

          if (line.type === "h3") {
            return <Text key={`${line.type}-${index}`} style={styles.subsectionTitle}>{renderRichText(line.text)}</Text>;
          }

          if (line.type === "bullet") {
            return (
              <View key={`${line.type}-${index}`} style={styles.bulletRow} wrap={false}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{renderRichText(line.text)}</Text>
              </View>
            );
          }

          return <Text key={`${line.type}-${index}`} style={styles.paragraph}>{renderRichText(line.text)}</Text>;
        })}
      </Page>
    </Document>
  );
}

export async function renderCvPdf(markdown: string) {
  return renderToBuffer(<CvDocument markdown={markdown} />);
}
