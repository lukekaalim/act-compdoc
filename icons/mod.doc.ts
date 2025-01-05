import { h, useEffect, useRef } from "@lukekaalim/act";
import { DocMark } from "@lukekaalim/act-doc";
import md from './readme.md?raw';
import { SVGRepo } from "./mod";
import { MarkdownComponent } from "@lukekaalim/act-markdown";

const SVGRepoDemo: MarkdownComponent = (props) => {
  const href = `https://www.svgrepo.com/svg/${props.attributes.key}`;
  return h('a', { href, style: { fontSize: '48px', display: 'flex', justifyContent: 'center' } },
    h(SVGRepo, { key: props.attributes.key as string }));
}

export default h(DocMark, {
  text: md,
  options: { inlineComponents: { SVGRepoDemo }}
});