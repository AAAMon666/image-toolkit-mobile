# 图像助手

适配手机端的全栈图片工具，基于 Next.js + Supabase。

## 当前功能

- 用户名 + 密码注册/登录
- 图片压缩
- 任意尺寸图片拼接长图
- 常用证件照尺寸裁切导出

## 本地启动

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env.local` 并填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

## 登录说明

- 用户名仅支持字母、数字和下划线
- 系统内部会把用户名映射为一个 Supabase 邮箱账号
- 当前已创建超级管理员：`Zhouyi`

## Supabase

当前项目已关联：`hviacvenudyzkjyuxgcz`
