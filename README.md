# Convexity Labs Full-Stack Challenge

## Goal

The goal of this take-home assignment is to **turn a small, hacked-together app into something production-ready**. You'll be working on both the frontend and backend of a mono-repo project to display a user's USDT0 transfer history and token balances.

This exercise is meant to simulate a real-world task you might encounter at Convexity Labs. You have full ownership of the codebase—feel free to refactor architecture, apply best practices, and use libraries or patterns you're comfortable with.

⏱ **Expected time commitment**: 4 hours

---

## Tech Stack

The project is a mono-repo managed by [pnpm workspaces](https://pnpm.io/workspaces):

- `/server`: a [NestJS](https://docs.nestjs.com/) app for the backend
- `/client`: a [Next.js](https://nextjs.org/docs/app/getting-started) app for the frontend

---

## Deliverables

You should complete the following features:

### Backend

Found in `/server` – a NestJS app using SQLite and TypeORM, with blockchain access via [viem](https://viem.sh/).

1. **Index USDT0 transfers**  
   Use the provided `indexUsdt0Transfers` method in `app.service.ts` as a starting point.

2. **Store data in SQLite**  
   Use TypeORM to persist indexed transfer data.

3. **Create API endpoints**  
   Expose the indexed transfer history and token balances via controller routes (`app.controller.ts`).

---

### Frontend

Found in `/client` – a Next.js app styled with TailwindCSS.

1. **Display the user's USDT0 transfer history**
2. **Show the user’s USDT0 balance**
3. **Show the user’s HYPE (gas) balance**

You’re free to structure and style the UI however you like, but clarity and maintainability matter more than polish.

---

## Setup

Install dependencies:

```bash
pnpm install
pnpm dev:server     # start backend
pnpm dev:client     # start frontend
```

## Helpful Bits

- User address: `0xde7D4ca820d141d655420D959AfFa3920bb1E07A`

- USDT0 token address: `0xaa480c5f5eb436d0645189ca20e5ade13aecaf27`