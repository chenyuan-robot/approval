import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: [
      '**/dist/**',
      '**/.vscode/**',
      '**/.idea/**',
      '**/dist/**',
      '**/uni_modules/**',
      '**/unpackage/**',
      '**/harmony-configs/**',
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**'
    ]
  },

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        uni: true, // uni-app
        wx: true // 微信小程序
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }]
    }
  },

  // TypeScript 配置
  ...tseslint.configs.recommended,

  // Vue 配置
  ...pluginVue.configs['flat/essential'],

  // Vue 文件特殊配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue']
        // project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        uni: true,
        wx: true
      }
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
])
