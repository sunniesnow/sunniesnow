// Markdown rendering for the static site.
//
// The plugins below replace the Kramdown features that the site's Markdown used to
// rely on:
//   - marked-gfm-heading-id gives the headings their GFM IDs,
//   - marked-custom-heading-id gives a heading the ID of the extended syntax,
//     `#### Online {#level-file-online}`,
//   - marked-katex-extension renders `$...$` and `$$...$$` with KaTeX,
//   - marked-smartypants converts the quotes of the prose, as Kramdown's smart quotes did,
//   - ./table-of-contents.mjs expands the `[TOC]` marker of the help page.
import {Marked} from 'marked';
import customHeadingId from 'marked-custom-heading-id';
import {gfmHeadingId} from 'marked-gfm-heading-id';
import markedKatex from 'marked-katex-extension';
import {markedSmartypants} from 'marked-smartypants';
import {tableOfContents} from './table-of-contents.mjs';

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
