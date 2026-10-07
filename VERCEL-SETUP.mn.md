# Vercel дээр байрлуулах заавар

Энэ заавар **tsendsuren-portfolio-vercel** шинэ хувилбарт хамаарна. Өмнөх Cloudflare/Vinext хавтсыг Vercel-д шууд импортлохгүй.

## 1. Юу бэлэн болсон бэ?

Нүүрийн загвар, хоёр хэл, нийтлэл бичих хэсэг хадгалагдсан. Серверийн хэсэг одоо Next.js + PostgreSQL, зургууд Vercel-ийн **private Blob**, нэвтрэлтийн имэйл Resend ашиглана.

Нэвтрэх урсгал:

1. `/admin` → нэвтрэх хуудас.
2. **Имэйлээр зөвшөөрөл авах** товч.
3. Зөвхөн `ADMIN_EMAIL` хаяг руу имэйл очно. Хэрэглэгч хүлээн авагч сонгохгүй.
4. Имэйл дэх холбоосыг нээнэ.
5. **Зөвшөөрч нэвтрэх** товчийг дарна.
6. Тэр холбоосыг нээсэн хөтөч дээр 8 цагийн админ session үүснэ.

Компьютер дээр ажиллах бол имэйлийн холбоосоо тухайн компьютерийн хөтчөөр нээгээрэй. Утсаар зөвшөөрвөл утасны хөтөч нэвтэрнэ; хүсэлт гаргасан өөр хөтөч автоматаар нэвтрэхгүй.

Холбоос 10 минутын хугацаатай, нэг удаа хэрэглэгдэнэ. Имэйл scanner GET хүсэлтээр нээхэд эрх үүсэхгүй; зөвшөөрөх POST үйлдэл шаардлагатай. Сан дотор холбоос болон session-ийн зөвхөн SHA-256 hash хадгална. Session cookie нь HttpOnly, production-д Secure, SameSite=Lax байна. **Гарах** товч серверийн session-ийг устгана.

Имэйл илгээх хүсэлтийг минутанд нэг, цагт тав болгон серверийн сангаар хязгаарласан. Та хүсээгүй имэйл авбал холбоосыг нээж зөвшөөрөхгүй байхад хангалттай. Зөвшөөрөх холбоосыг бусдад дамжуулж болохгүй.

## 2. Эх кодоо GitHub-д оруулах

ZIP-ээ задалж, **package.json байгаа шинэ хавтсыг** VS Code-оор нээнэ. GitHub дээр шинэ repository үүсгэнэ; private байж болно.

Терминалд:

```sh
git init
git add .
git commit -m "Prepare portfolio for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

`YOUR_USERNAME`, `YOUR_REPOSITORY`-г өөрийн утгаар солино. `.env.local`, API key болон database password-оо GitHub-д оруулахгүй. `.gitignore` эдгээрийг хасдаг. Жишээ утгуудтай `.env.example` орох нь зөв.

## 3. Vercel төсөл үүсгэх

1. [Vercel](https://vercel.com)-д өөрийн бүртгэлээр нэвтэрнэ.
2. **Add New → Project** → GitHub repository-гоо Import хийнэ.
3. Framework Preset: **Next.js**.
4. Root Directory: `package.json` байгаа хавтас. Repository-ийн үндэст байвал өөрчлөхгүй.
5. Build Command: `npm run build`.
6. Install Command: `npm ci` (эсвэл Vercel-ийн default).
7. Output Directory-г өөрчлөхгүй. Энэ нь static `dist` сайт биш.
8. Node.js **22.x** эсвэл түүнээс шинэ дэмжигдсэн хувилбар сонгоно.
9. Эхний Deploy-ийг хийж төслийн production домэйныг авна, жишээ нь `https://your-project.vercel.app`.

Энэ эхний шатанд database/email тохируулаагүй учир нийтлэл ачаалах болон нэвтрэх хэсэг алдаа харуулж болно. Дараах алхмуудыг хийсний дараа дахин deploy хийнэ. [Vercel-ийн Next.js заавар](https://vercel.com/docs/frameworks/full-stack/nextjs).

## 4. PostgreSQL үүсгэх

Vercel төслийн Storage/Marketplace хэсгээс **Neon Postgres** холбож болно, эсвэл Neon дээр тусдаа database үүсгээд connection string-ийг ашиглаж болно. [Vercel Storage Marketplace](https://vercel.com/docs/marketplace-storage).

1. Neon project/database үүсгэнэ.
2. **Connect** хэсгээс Node.js/PostgreSQL connection string авна. Vercel-д зориулж pooled connection ашиглахад тохиромжтой.
3. Vercel Environment Variables-д `DATABASE_URL` нэрээр нэмнэ. Интеграцаар өөр нэрээр орсон бол кодын ашиглах `DATABASE_URL` байгаа эсэхийг шалгана.
4. Neon-ийн **SQL Editor**-т төслийн `db/schema.sql` файлын агуулгыг хуулж ажиллуулна.
5. `projects`, `admin_login_requests`, `admin_sessions`, `admin_email_limits` гэсэн дөрвөн хүснэгт үүссэн байна.

Эсвэл локал `.env.local` дотор `DATABASE_URL` тохируулсны дараа:

```sh
npm ci
npm run db:migrate
```

Энэ команд `.env.local` дахь сан дээр хүснэгт үүсгэнэ. Шинэ хувилбарт өмнөх D1 сангийн нийтлэлүүд автоматаар шилжихгүй. Бодит нийтлэлүүдээ өмнө нэмсэн бол хуучин сангаа хадгалж, өгөгдөл болон зургийг тусад нь шилжүүлнэ.

## 5. Зураг хадгалах private Blob

1. Vercel төслийн **Storage → Create Database/Store → Blob** хэсэгт орно.
2. Хандалтыг **Private** сонгоно.
3. Store-ийг энэ төсөлтэй холбоно.
4. `BLOB_READ_WRITE_TOKEN` server environment variable нэмэгдсэн эсэхийг шалгана.

Зургуудыг нийтлэлтэй холбоотой эсэх, нийтлэгдсэн эсэх, админ эрх байгаа эсэхийг API шалгаад харуулна. Private Blob-ийн холбоосыг шууд нийтэд ашиглахгүй. [Private Blob заавар](https://vercel.com/docs/vercel-blob/private-storage).

Энэ хувилбар зураг бүрийг **4 MB** хүртэл авна. Vercel Functions-ийн request хэмжээ 4.5 MB тул multipart өгөгдлийн зайг тооцон хязгаарыг багасгасан. PNG, JPG, WebP дэмжинэ. [Хэмжээний хязгаар](https://vercel.com/docs/functions/limitations).

## 6. Имэйл илгээх Resend

1. [Resend](https://resend.com)-д бүртгэл үүсгэнэ.
2. **API Keys** хэсгээс имэйл илгээх эрхтэй түлхүүр үүсгэнэ.
3. Vercel-д `RESEND_API_KEY` нэрээр хадгална.
4. Тогтмол ашиглах бол өөрийн домэйныг **Domains** хэсэгт нэмээд заасан DNS бичлэгүүдээр баталгаажуулна.
5. `EMAIL_FROM`-д тэр домэйн дээрх илгээгч хаяг өгнө, жишээ нь `Tsendsuren <admin@your-domain.com>`.

`EMAIL_FROM` нь **илгээгч**, `ADMIN_EMAIL` нь **хүлээн авагч**. Өөрийн Gmail хаягийг баталгаажуулсан илгээгчийн домэйн мэт `EMAIL_FROM`-д тавихгүй. Gmail нууц үг шаардлагагүй. [Resend Node.js заавар](https://resend.com/docs/send-with-nodejs).

**Домэйнгүй эхний туршилт:** Resend-д `ttsendee518@gmail.com` хаягаараа бүртгүүлсэн бол `EMAIL_FROM=Tsendsuren <onboarding@resend.dev>` ашиглан зөвхөн тэр бүртгэлийн өөрийн имэйл рүү туршиж болно. `resend.dev` нь туршилтын зориулалттай; өөр хүлээн авагч руу илгээхэд баталгаажуулсан домэйн хэрэгтэй. [Resend-ийн хязгаарлалт](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

## 7. Environment Variables

Vercel → Project → **Settings → Environment Variables** дотор дараах утгуудыг нэмнэ:

| Нэр | Утга |
| --- | --- |
| `DATABASE_URL` | Neon/PostgreSQL connection string |
| `ADMIN_EMAIL` | `ttsendee518@gmail.com` |
| `APP_URL` | Өөрийн бодит production домэйн, жишээ `https://your-project.vercel.app` |
| `RESEND_API_KEY` | Resend-ээс авсан нууц түлхүүр |
| `EMAIL_FROM` | Баталгаажуулсан домэйны илгээгч, эсвэл өөрийн имэйл рүү турших `onboarding@resend.dev` |
| `BLOB_READ_WRITE_TOKEN` | Private Blob store-ийн нууц түлхүүр |

Production орчныг сонгоно. Эдгээр нэрийн өмнө **NEXT_PUBLIC_ нэмж болохгүй**. Серверийн түлхүүрүүд браузерт ил гарах ёсгүй.

`APP_URL` нь зам, query, fragment-гүй үндсэн домэйн байна. `https://your-project.vercel.app/admin` гэж бичихгүй. Энэ утгаар имэйлийн холбоос үүсгэж, хүсэлтийн Origin-ийг шалгана. Өөр preview домэйнээс admin ашиглах бол тэр орчны `APP_URL`-ийг тусад нь тохируулна; production-ын утгатай өөр URL-аас бичих хүсэлтийг хориглоно.

Environment Variables-ийг өөрчилсний дараа **Deployments → Redeploy** хийнэ. [Vercel тохиргооны заавар](https://vercel.com/docs/environment-variables/managing-environment-variables).

## 8. Байршуулсны дараах шалгалт

1. Нүүр хуудас, MN/EN сонголтыг шалгана.
2. `/admin` нээхэд нэвтрэх хуудас гарна.
3. Имэйлээр зөвшөөрөл хүснэ. Inbox/Spam-аа шалгана.
4. Холбоосыг нээхэд шууд нэвтрэхгүй, зөвшөөрөх дэлгэц гарна.
5. **Зөвшөөрч нэвтрэх** дарж админд орно.
6. Нэг ноорог нийтлэл үүсгэж зураг нэмнэ.
7. Нууц цонхоор тэр ноорог нийтлэл харагдахгүйг шалгана.
8. Нийтэлж нүүр хуудсанд гарсныг шалгана.
9. **Гарах** дарж админ дахин түгжигдсэнийг шалгана.
10. Өмнөх имэйлийн холбоосыг дахин ашиглахад нэвтрэхгүй байх ёстой.

## 9. Локал ажиллуулах

Node.js 22.13+ суулгасан компьютер дээр шинэ төслийн хавтсанд:

```sh
npm ci
cp .env.example .env.local
```

`.env.local`-д жинхэнэ үйлчилгээний утгуудаа бичнэ. `APP_URL=http://127.0.0.1:3000` болгоно. Локал болон production туршилтад тусдаа database ашиглавал бодит нийтлэлд хүрэхгүй.

```sh
npm run db:migrate
npm run dev
```

`http://127.0.0.1:3000/admin` руу орно. Шинэ хувилбар хуучин Seedy/ChatGPT mock нэвтрэлт ашиглахгүй: локалд ч жинхэнэ имэйл зөвшөөрөл шаардлагатай.

Build шалгах:

```sh
npm test
npm run build
```

Хэрэв компьютерийн file watcher хязгаараас `EMFILE` алдаа гарвал локал хөгжүүлэлтийг `WATCHPACK_POLLING=true npm run dev -- --webpack` гэж эхлүүлэх эсвэл `npm run build` дараа `npm start` ашиглана. Production preview хийх үед `APP_URL` HTTPS байх ёстой; жинхэнэ локал нэвтрэлтийг `npm run dev`-ээр шалгана.

## 10. Түгээмэл алдаа

- **Имэйл ирэхгүй:** Resend Logs, Spam, API key, EMAIL_FROM болон Resend бүртгэлийн имэйлийг шалгах.
- **429:** минутанд нэг/цагт тавын хязгаар. Өмнөх хүчинтэй холбоосоо ашиглах эсвэл хүлээх.
- **403:** браузер дахь домэйн `APP_URL`-тай яг тохирч байгаа эсэхийг шалгах.
- **Нийтлэл ачаалахгүй:** DATABASE_URL, database холболт, schema ажиллуулсан эсэх.
- **Зураг орохгүй:** private Blob, token, 4 MB хязгаар.
- **Өөр төхөөрөмж нэвтрэхгүй:** имэйлийн холбоосыг зөвхөн нээсэн хөтөч нэвтэрдэг.

## Шалгалтын хүрээ

Өгсөн багц production build болон TypeScript шалгалтад тэнцсэн. Автомат тестүүд нь тусгаарласан PostgreSQL engine (PGlite) дээр холбоосын hash, хугацаа, давхар хэрэглээ, өөр имэйлийн татгалзал, session хугацаа/устгал, хүсэлтийн хязгаар, Origin хамгаалалтыг шалгадаг.

Resend/Neon/Blob-ийн жинхэнэ түлхүүр өгөгдөөгүй тул бодит имэйл хүргэлт, production PostgreSQL болон Blob холболтыг хараахан баталгаажуулаагүй. Vercel-д өөрөө байршуулалт хийгдээгүй. Дээрх тохиргоо болон байршуулсны дараах шалгалтыг гүйцэтгэнэ.
