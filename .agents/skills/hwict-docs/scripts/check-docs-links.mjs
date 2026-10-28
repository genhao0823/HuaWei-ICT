#!/usr/bin/env node

// 文档引用体检：相对 Markdown 链接与反引号内的仓库路径必须真实存在。
// 规则刻意保持窄，避免把"示例 / 占位 / 分支名"误报为错误：
// - 只检查 .agents/、docs/、.github/ 前缀；server/、web/ 在工程骨架建立前不参与。
// - 只检查"以 / 结尾的目录"或"最后一段带扩展名的文件"；分支名、裸目录名不检查。
// - 跳过代码围栏、HTML 注释、外链、含 *{}<>$… 的占位路径与全大写占位 token。
// 需要写不存在的示例路径时，把它放进代码围栏，或使用 * / {} / … 等占位符。

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = resolve(dirname(__filename), "../../../.."); // 仓库根：.agents/skills/hwict-docs/scripts 向上四层

const rootDocs = ["README.md", "AGENTS.md"];
const scanDirs = [".agents", "docs", ".github"];
const checkedPathPrefixes = [".agents/", "docs/", ".github/"];
const skippedDirs = new Set([
    ".git",
    ".zcode",
    ".artifacts",
    "node_modules",
    "dist",
    "build",
    "target",
    "coverage",
]);

const errors = [];

function toRepoRelative(path) {
    return relative(rootDir, path).replaceAll("\\", "/");
}

function listMarkdownFiles(dir, out = []) {
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (skippedDirs.has(entry.name)) continue;
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            listMarkdownFiles(path, out);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
            out.push(path);
        }
    }
    return out;
}

// 代码围栏（``` 或 ~~~，长度 ≥3）内的内容是示例，不参与检查。
function stripFencedCode(raw) {
    let fence = null; // 开启围栏的字符序列，用于匹配同字符、不短于开启长度的结束行
    return raw
        .split(/\r?\n/)
        .map((line) => {
            const trimmed = line.trimStart();
            const match = /^(`{3,}|~{3,})/.exec(trimmed);
            if (!fence) {
                if (match) {
                    fence = match[1];
                    return "";
                }
                return line;
            }
            if (match && match[1][0] === fence[0] && match[1].length >= fence.length) {
                fence = null;
            }
            return "";
        })
        .join("\n");
}

// HTML 注释里的路径多为写作提示，不当作引用。
function stripHtmlComments(raw) {
    return raw.replaceAll(/<!--[\s\S]*?-->/g, "");
}

function checkRelativeLinks(file, relPath, prose) {
    for (const match of prose.matchAll(/!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
        const href = match[1].trim();
        if (!href || href.startsWith("#")) continue;
        if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
        const clean = href.split("#")[0].split("?")[0];
        if (!clean) continue;
        const target = resolve(dirname(file), decodeURI(clean));
        if (!existsSync(target)) {
            errors.push(`[链接] ${relPath} → ${href}`);
        }
    }
}

function checkInlinePaths(relPath, prose) {
    for (const match of prose.matchAll(/`([^`\r\n]+)`/g)) {
        const value = match[1].trim();
        if (!value || /\s/.test(value)) continue;
        if (/[\*\{\}<>$…]/.test(value) || value.includes("...")) continue;
        if (/[A-Z]{2,}/.test(value)) continue; // YYYYMMDD / SERVER_IP 等模板占位
        if (/^[a-z][a-z0-9+.-]*:/i.test(value)) continue;
        const normalized = value.replace(/^\.\//, "");
        if (!checkedPathPrefixes.some((prefix) => normalized.startsWith(prefix))) continue;
        const clean = normalized.split("#")[0].replace(/\/+$/, "");
        const isDirectoryHint = normalized.endsWith("/");
        const hasExtension = /\.[A-Za-z0-9]+$/.test(clean);
        if (!isDirectoryHint && !hasExtension) continue;
        if (!clean || !existsSync(resolve(rootDir, clean))) {
            errors.push(`[路径] ${relPath} → ${value}`);
        }
    }
}

const files = [];
for (const name of rootDocs) {
    const path = resolve(rootDir, name);
    if (existsSync(path)) files.push(path);
}
for (const name of scanDirs) {
    listMarkdownFiles(resolve(rootDir, name), files);
}

const uniqueFiles = [...new Set(files)].sort();
for (const file of uniqueFiles) {
    const relPath = toRepoRelative(file);
    const prose = stripHtmlComments(stripFencedCode(readFileSync(file, "utf8")));
    checkRelativeLinks(file, relPath, prose);
    checkInlinePaths(relPath, prose);
}

if (errors.length > 0) {
    for (const error of errors) console.error(error);
    console.error(`\n文档引用检查失败：${errors.length} 条`);
    process.exit(1);
}

console.log(`ok: ${uniqueFiles.length} 篇文档的相对链接与仓库路径引用均存在`);
