import { Component, h, Node } from '@lukekaalim/act';
import { Nodes as MdastNode, Paragraph } from 'mdast';
import { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

export type MarkdownProps = {
  attributes: Record<string, string | number | boolean>
}

type MarkdownComponent = Component<MarkdownProps>;

type MarkdownRendererOptions = {
  components?: Record<string, MarkdownComponent>,
  classNames?: { [key in MdastNode["type"]]?: string },
  styles?: { [key in MdastNode["type"]]?: Record<string, unknown> },
}

export const createMdastRenderer = (options: MarkdownRendererOptions = {}) => {
  const mdastToNode = (node: MdastNode, ): Node => {
    const className = (options.classNames || {})[node.type];
    const style = (options.styles || {})[node.type];

    const props: Record<string, unknown> = {};
    if (className)
      props.className = className;
    if (style)
      props.style = style;

    switch (node.type) {
      case 'root':
        return node.children.map(mdastToNode);
      case 'heading':
        return h(`h${node.depth}`, { ...props }, node.children.map(mdastToNode));
      case 'text':
        return node.value;
      case 'paragraph':
        return h('p', { ...props }, node.children.map(mdastToNode));
  
      case 'blockquote':
        return h('blockquote', { ...props }, node.children.map(mdastToNode));
      case 'break':
        return h('br', props);
      case 'code':
      case 'inlineCode':
        return h('code', { ...props }, node.value);
      case 'image':
        return h('img', { ...props, src: node.url, alt: node.alt, title: node.title });
      case 'emphasis':
        return h('i', { ...props }, node.children.map(mdastToNode));
      case 'link':
        return h('a', { ...props, href: node.url }, node.children.map(mdastToNode));
      case 'list':
        return h('ul', { ...props }, node.children.map(mdastToNode));
      case 'listItem':
        if (node.checked !== null)
          return h('li', { ...props }, [
            h('input', { type: 'checkbox', disabled: true, checked: node.checked, style: { display: 'inline' } }),
            (node.children[0] as Paragraph).children.map(mdastToNode)
          ]);
        return h('li', { ...props }, (node.children[0] as Paragraph).children.map(mdastToNode));
      case 'table':
        return h('table', { ...props }, node.children.map(mdastToNode));
      case 'tableRow':
        return h('tr', { ...props }, node.children.map(mdastToNode));
      case 'tableCell':
        return h('td', { ...props }, node.children.map(mdastToNode));
      case 'strong':
        return h('strong', { ...props }, node.children.map(mdastToNode));

      case 'yaml':
      case 'mdxjsEsm':
        return h('pre', {}, 'Not Supported');
      case 'mdxJsxFlowElement':
        return mdxJsxFlowElementToNode(node);
      default:
        console.warn(`Unknown element "${node.type}"`, node)
        return null;
    }
  }

  const mdxJsxFlowElementToNode = (node: MdxJsxFlowElement) => {
    if (!node.name)
      return null;
    const component = (options.components || {})[node.name];

    const attributes = Object.fromEntries(node.attributes.map(attribute => {
      switch (attribute.type) {
        case 'mdxJsxAttribute':
          switch (typeof attribute.value) {
            case 'string':
              return [attribute.name, attribute.value];
            case 'object':
              if (attribute.value === null)
                return [];
              switch (attribute.value.type) {
                case 'mdxJsxAttributeValueExpression':
                  console.log(attribute.name, attribute.value.value)
                  return [attribute.name, JSON.parse(attribute.value.value)]
                default:
                  return [];
              }
          }
        case 'mdxJsxExpressionAttribute':
          return []
      }
    }))
    return h(component, { attributes }, node.children.map(mdastToNode))
  }

  return mdastToNode;
}
