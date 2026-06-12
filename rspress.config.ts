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
    sidebar: {
      ...sidebar,
      '/risc-v/': [
        { text: 'RISC-V', link: '/risc-v/' },
        { text: 'Getting started', link: '/risc-v/getting-started' },
        { text: 'Arithmetic', link: '/risc-v/arithmetic' },
        { text: 'Input & output', link: '/risc-v/io' },
        { text: 'Decisions & loops', link: '/risc-v/branches' },
        { text: 'Functions & the stack', link: '/risc-v/functions' },
        { text: 'Memory', link: '/risc-v/memory' },
        { text: 'Instruction reference', link: '/risc-v/instruction-reference' },
      ],
      '/tesserae-venus/': [
        { text: 'Tesserae Venus', link: '/tesserae-venus/' },
        { text: 'Using the simulator', link: '/tesserae-venus/using-the-simulator' },
        { text: 'Engine architecture', link: '/tesserae-venus/engine' },
      ],
    },
    nav: [
      { text: 'Projects', link: '/projects/', activeMatch: '/projects/' },
      { text: 'RISC-V', link: '/risc-v/', activeMatch: '/risc-v/' },
      { text: 'Tesserae Venus', link: '/tesserae-venus/', activeMatch: '/tesserae-venus/' },
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
