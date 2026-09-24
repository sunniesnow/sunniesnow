// Markdown rendering for the static site.
//
// The plugins below replace the Kramdown features that the site's Markdown used to
// rely on:
//   - marked-gfm-heading-id gives the headings their GFM IDs,
//   - marked-custom-heading-id gives a heading the ID of the extended syntax,
//     `#### Online {#level-file-online}`,
//   - marked-katex-extension renders `$...$` and `$$...$$` with KaTeX,
//   - marked-smartypants converts the quotes of the prose, as Kramdown's smart quotes did,
//   - the table of contents below expands the `[TOC]` marker of the help page.
import {Marked} from 'marked';
import customHeadingId from 'marked-custom-heading-id';
import {gfmHeadingId} from 'marked-gfm-heading-id';
import markedKatex from 'marked-katex-extension';
import {markedSmartypants} from 'marked-smartypants';
import {parse as parseHtml} from 'node-html-parser';

// The comment that the `[TOC]` marker is rendered as, and that the table of contents
// replaces once the whole page is rendered, when the IDs of the headings are known.
const markerText = 'sunniesnow:table-of-contents';
const marker = `<!--${markerText}-->`;
const tocMarker = /^\[TOC][ \t]*(\n|$)/i;
const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

// help.md no longer has front matter (the build passes the title and the KaTeX
// stylesheet to the layout instead), but a file that grows one again should not have
// it rendered as content.
export function stripFrontMatter(markdown) {
	return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '');
}

export function renderMarkdown(markdown) {
	const marked = new Marked({gfm: true, breaks: false});
	// A renderer that returns false falls through to the one registered before it,
	// so a heading with an explicit ID keeps it and every other heading gets a GFM ID.
	marked.use(gfmHeadingId());
	marked.use(customHeadingId());
	// `nonStandard` also matches math that is directly followed by punctuation, e.g. "($\\mu$)".
	marked.use(markedKatex({throwOnError: false, nonStandard: true}));
	marked.use(markedSmartypants());
	marked.use(tableOfContents());
	return marked.parse(markdown);
}

// The table of contents of the help page.
//
// marked has a table of contents extension (marked-toc-extension), but it derives the
// links of the table of contents from the heading *text*, with github-slugger, so it
// cannot link to the explicit heading IDs of help.md, e.g.
// `#### Online {#level-file-online}`: those IDs are what the page's cross-references and
// its readers' bookmarks point at. This extension reads the headings from the rendered
// HTML instead, where the IDs are the ones that the heading plugins produced, using
// marked's `postprocess` hook and an HTML parser.
//
// The headings that come before the marker are not listed: on the help page those are
// the title of the page and the title of the table of contents itself.
export function tableOfContents({id = 'markdown-toc'} = {}) {
	return {
		extensions: [{
			name: 'tableOfContents',
			level: 'block',
			start(source) {
				return tocMarker.exec(source)?.index;
			},
			tokenizer(source) {
				const match = tocMarker.exec(source);
				if (!match) {
					return undefined;
				}
				return {type: 'tableOfContents', raw: match[0]};
			},
			renderer() {
				return marker;
			},
		}],
		hooks: {
			postprocess(html) {
				return html.includes(marker) ? html.replace(marker, renderTableOfContents(html, id)) : html;
			},
		},
	};
}

function collectHeadings(html) {
	const root = parseHtml(html, {comment: true});
	const headings = [];
	let afterMarker = false;
	const visit = node => {
		if (node.nodeType === 8 && node.rawText === markerText) {
			afterMarker = true;
		}
		if (afterMarker && node.nodeType === 1 && headingTags.has(node.rawTagName)) {
			headings.push({
				level: Number(node.rawTagName.slice(1)),
				id: node.getAttribute('id') ?? '',
				text: node.innerHTML.trim(),
			});
		}
		for (const child of node.childNodes ?? []) {
			visit(child);
		}
	};
	visit(root);
	return headings;
}

function renderTableOfContents(html, id) {
	const headings = collectHeadings(html);
	if (headings.length === 0) {
		return '';
	}
	// Nest the headings by their level. The root is one level above the first heading,
	// and it is never popped, so that a heading that is shallower than the first one
	// still becomes an entry.
	const root = {children: []};
	const stack = [{level: -Infinity, node: root}];
	for (const heading of headings) {
		while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
			stack.pop();
		}
		const node = {heading, children: []};
		stack[stack.length - 1].node.children.push(node);
		stack.push({level: heading.level, node});
	}
	const renderNodes = nodes => nodes.map(node => {
		const link = `<a href="#${node.heading.id}">${node.heading.text}</a>`;
		if (node.children.length === 0) {
			return `<li>${link}</li>`;
		}
		return `<li>${link}\n<ul>\n${renderNodes(node.children)}\n</ul>\n</li>`;
	}).join('\n');
	return `<ul id="${id}">\n${renderNodes(root.children)}\n</ul>`;
}
