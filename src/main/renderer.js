
import mdit from 'markdown-it';
import ejs from 'ejs';

const mditConfig = {
    html:         true,  // Enable html tags in source
    xhtmlOut:     true,  // Use '/' to close single tags (<br />)
    breaks:       false, // Convert '\n' in paragraphs into <br>
    // langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      true,  // Autoconvert url-like texts to links
    typographer:  false, // Enable smartypants and other sweet transforms
  
    // Highlighter function. Should return escaped html,
    // or '' if input not changed
    highlight: function (/*str, , lang*/) { return ''; }
};
const md = mdit(mditConfig);

const layouts = [];

export function renderContent(content, layoutFile) {
    const text = md.render(content);
    const layout = layouts[layoutFile];
    const rendered = ejs.render(layout, {
        title: 'Page Title',
        content: text
    });
    return rendered;
}

layouts['layout1.html'] = `
<html>
    <head>
        <title><%= title %></title>
        <style>
        H1, h2, h3, h4 { color: red; }
        pre {
            background: rgb(59, 58, 58);
            color: white;
        }
        </style>
    </head>
    <body>
        <%- content %>
    </body>
</html>
`;

