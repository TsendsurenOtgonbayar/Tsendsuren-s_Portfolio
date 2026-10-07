# Tsendsuren portfolio — Vercel хувилбар

Өвлийн тал, адуутай Монгол төрх бүхий портфолио. Монгол–англи хэл, нийтлэлийн удирдлага, зөвхөн эзэмшигчийн имэйлээр зөвшөөрөх нэвтрэлттэй.

**Эхлээд `VERCEL-SETUP.mn.md` зааврыг уншаарай.** Үйлчилгээний тохиргоо, GitHub, Vercel, локал ажиллуулах алхмууд тэнд бий.

## Технологи

React + Next.js + TypeScript + CSS. Сервер нь Node.js, SQL сан нь PostgreSQL (`pg`), зураг нь Vercel Private Blob, имэйл нь Resend. Тест нь Node test runner + тусгаарласан PostgreSQL engine PGlite ашиглана.

## Код унших дараалал

| Файл | Үүрэг |
| --- | --- |
| `lib/project-types.ts` | Нэг нийтлэлийн мэдээллийн хэлбэр |
| `app/components/language-provider.tsx` | MN/EN төлөв, React context |
| `app/components/portfolio-home.tsx` | Нүүр хуудас |
| `app/components/admin-editor.tsx` | Нийтлэл нэмэх/засах form |
| `app/components/login-form.tsx` | Имэйлээр зөвшөөрөл хүсэх UI |
| `app/components/approval-form.tsx` | Имэйлээс нээгээд зөвшөөрөх UI |
| `app/api/auth/request/route.ts` | Зөвхөн ADMIN_EMAIL рүү холбоос илгээнэ |
| `app/api/auth/approve/route.ts` | Нэг удаагийн холбоосоор session үүсгэнэ |
| `app/api/auth/logout/route.ts` | Session хүчингүй болгоно |
| `lib/auth-core.mjs` | Токен үүсгэх, hash, хугацаа, SQL хамгаалалт |
| `lib/server-auth.ts` | Cookie унших, API-ийн админ эрх шалгах |
| `lib/database.mjs` | PostgreSQL холболтын pool |
| `lib/projects.ts` | Нийтлэлийн SQL асуулгууд |
| `lib/project-validation.ts` | Сервер дээр оролтын шалгалт |
| `db/schema.sql` | PostgreSQL хүснэгтүүд |
| `app/globals.css` | Загвар, responsive хэмжээ |

## Ойлгох гол хувьсагчид

- `projectList` — сангаас уншсан нийтлэлүүд.
- `projectForm` — одоо form-д оруулж буй утгууд.
- `editingId` — засаж буй нийтлэлийн ID; null бол шинэ.
- `language` — mn эсвэл en.
- `published` — 0 бол ноорог, 1 бол нийтэлсэн.
- `dirty` — хадгалаагүй өөрчлөлт байгаа эсэх.
- `token` — имэйлийн нэг удаагийн нэвтрэх нууц утга.
- `sessionToken` — нэвтэрсний дараах cookie-ийн нууц утга.
- `token_hash` — сан дотор хадгалах SHA-256 hash; эх токен биш.
- `expires_at` — хүчингүй болох хугацаа.

Нийтлэл хадгалах: `React form → fetch → API → эрх шалгах → оролт шалгах → PostgreSQL → жагсаалт шинэчлэх`.

Нэвтрэх: `request → хугацаатай холбоос → имэйл → approve POST → session cookie → админ`.

Нийтлэлүүд browser storage-д хадгалагдахгүй. localStorage зөвхөн хэлний сонголтод ашиглагдана.

## Командууд

```sh
npm ci
cp .env.example .env.local
# .env.local дотор үйлчилгээнүүдийн тохиргоог бичнэ.
npm run db:migrate
npm run dev
```

```sh
npm test
npm run build
```

## Өөрчлөх

Нүүрийн текстийг `portfolio-home.tsx`, өнгийг `globals.css`, админы имэйлийг серверийн `ADMIN_EMAIL` тохиргоогоор өөрчилнө. Имэйл болон Blob түлхүүрүүдэд NEXT_PUBLIC_ prefix бүү ашигла.

Өмнөх хувилбарт бүртгэсэн нийтлэл/зураг автоматаар шилжихгүй. Энэ бол тусдаа PostgreSQL сан ашиглах Vercel хувилбар. Эхний бодит нийтлэл гарахад нүүрийн “Жишээ нийтлэл” автоматаар солигдоно. Монгол, англи нийтлэл тус бүрийг гараар бичнэ.

Зургийг солих/нийтлэл устгахад хуучин Blob объект үлдэж болно; автомат файл цэвэрлэгээ нэмээгүй. Нийтлэгдээгүй файлыг API нийтэд буцаахгүй.
