# 图像助手

适配手机端的全栈图片工具，基于 Next.js + Supabase。

## 当前功能

- 用户名 + 密码注册/登录
- 图片压缩
- 任意尺寸图片拼接长图
- 常用证件照尺寸裁切导出
- AI 生图（比例、清晰度、多参考图、多图生成、结果预览）
- 管理后台（角色管理、额度管理、申请审批、使用记录）

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
SUPABASE_SERVICE_ROLE_KEY=
FOROPENCODE_BASE_URL=
FOROPENCODE_API_KEY=
FOROPENCODE_IMAGE_MODEL=
```

## 登录说明

- 用户名仅支持字母、数字和下划线
- 系统内部会把用户名映射为一个 Supabase 邮箱账号
- 普通用户注册后默认 2 额度
- 已创建超级管理员：`Zhouyi`

## AI 生图额度规则

- 1 额度 = 生成 1 张图
- 无论成功或失败，只要发起生成并计入张数，就会扣额度
- 普通用户可在网页内提交额度申请
- 管理员与超级管理员可在后台处理角色、额度和申请

## Supabase

当前项目已关联：`hviacvenudyzkjyuxgcz`
