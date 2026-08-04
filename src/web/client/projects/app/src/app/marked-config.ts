import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import pgsql from 'highlight.js/lib/languages/pgsql';

hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('pgsql', pgsql);

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return code;
    },
  }),
);

export { marked };
