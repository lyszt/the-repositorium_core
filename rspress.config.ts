import * as path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from '@rspress/core';
import remarkGithubVideo from './theme/lib/remark-github-video';

const sidebarPath = path.join(__dirname, 'docs/data/sidebar.json');
const sidebar = existsSync(sidebarPath)
  ? JSON.parse(readFileSync(sidebarPath, 'utf-8'))
  : {};

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'The Repositorium - Documentation for LYSZT Projects',
  description: 'Technical documentation and dev logs for projects built under LYSZT.',
  icon: '/favicon.ico',
  markdown: {
    remarkPlugins: [remarkGithubVideo],
  },
  themeConfig: {
    sidebar,
    nav: [
      { text: 'Projects', link: '/projects/', activeMatch: '/projects/' },
    ],
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/lyszt',
      },
    ],
  },
});
