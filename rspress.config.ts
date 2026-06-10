import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import remarkGithubVideo from './theme/lib/remark-github-video';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'The Repositorium',
  description: 'Technical documentation and dev logs for projects built under LYSZT.',
  icon: '/favicon.ico',
  markdown: {
    remarkPlugins: [remarkGithubVideo],
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/lyszt',
      },
    ],
  },
});
