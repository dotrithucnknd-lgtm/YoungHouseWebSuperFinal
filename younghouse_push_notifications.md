# Hướng dẫn bật thông báo đẩy lên điện thoại — YoungHouse

> Làm theo checklist này khi sẵn sàng triển khai push notification. Code đã có sẵn trong repo; bạn chỉ cần cấu hình server + Supabase.

---

## 1. Hai loại thông báo

| Loại | Khi nào thấy | Cần cấu hình thêm? |
| :--- | :--- | :--- |
| **Trong app** (icon chuông) | Chỉ khi đang mở website | Không |
| **Push điện thoại** | Màn hình khóa / thanh thông báo | Có — làm các bước dưới |

---

## 2. Checklist cấu hình server (làm 1 lần)

### Bước 1 — Tạo VAPID keys

Trong thư mục project:

```bash
npx web-push generate-vapid-keys
```

Kết quả có 2 dòng: `Public Key` và `Private Key`. Giữ private key bí mật.

### Bước 2 — Thêm biến môi trường

Mở `.env.local` và thêm:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<dán Public Key>
VAPID_PRIVATE_KEY=<dán Private Key>
VAPID_SUBJECT=mailto:admin@younghouse.vn
```

Trên **Vercel / hosting production**, thêm cùng 3 biến trong Environment Variables.

### Bước 3 — Chạy SQL trên Supabase

1. Vào **Supabase Dashboard → SQL Editor**
2. Copy toàn bộ nội dung file `database/push_subscriptions.sql`
3. Chạy (Run)

File này tạo bảng `push_subscriptions` lưu thiết bị đã đăng ký nhận push.

### Bước 4 — Restart server

```bash
npm run dev
```

Hoặc redeploy production sau khi thêm env vars.

### Bước 5 — HTTPS (bắt buộc trên production)

Web Push chỉ hoạt động trên **HTTPS**. Localhost vẫn test được khi dev.

---

## 3. Người dùng bật trên điện thoại

### Android (Chrome)

1. Đăng nhập YoungHouse
2. Vào **Tenant → Cài đặt** (`/tenant/settings`) hoặc **Tài khoản** (`/account`)
3. Nhấn **Bật thông báo đẩy**
4. Chọn **Cho phép** khi trình duyệt hỏi

### iPhone (Safari)

1. Mở site bằng **Safari**
2. Nút **Chia sẻ** → **Thêm vào Màn hình chính**
3. Mở app từ icon trên màn hình chính (PWA)
4. Đăng nhập → **Cài đặt** → **Bật thông báo đẩy**
5. Cho phép thông báo trong iOS (iOS 16.4+)

> Safari trên tab thường hạn chế push; thêm vào Màn hình chính là cách ổn định nhất trên iPhone.

---

## 4. Admin gửi thông báo

1. Đăng nhập **Admin** hoặc **Manager**
2. Vào **Admin → Quản lý thông báo** (`/admin/notifications`)
3. Tạo thông báo mới, bật **Kích hoạt**
4. Chọn **Đối tượng** (Tất cả / Người thuê / Chủ nhà / Quản trị)

Hệ thống sẽ:

- Lưu vào bảng `notifications` (hiện icon chuông trong app)
- Gửi **Web Push** tới thiết bị đã đăng ký thuộc đúng nhóm role

Mapping đối tượng → role:

| Đối tượng trong form | Role nhận push |
| :--- | :--- |
| Tất cả | Mọi role |
| Người thuê | `tenant`, `user` |
| Chủ nhà | `sales`, `operator`, `staff` |
| Quản trị | `admin`, `manager` |

---

## 5. File liên quan trong code

| File | Mục đích |
| :--- | :--- |
| `database/push_subscriptions.sql` | Schema Supabase |
| `public/manifest.json` | PWA manifest |
| `public/sw.js` | Service worker nhận push |
| `src/lib/webPushClient.ts` | Đăng ký push phía client |
| `src/lib/broadcastPushNotification.ts` | Gọi API gửi push |
| `src/components/PushNotificationPrompt.tsx` | UI bật/tắt push |
| `src/app/api/push/subscribe/route.ts` | Lưu subscription |
| `src/app/api/push/broadcast/route.ts` | Gửi push theo audience |
| `src/app/api/push/vapid-public-key/route.ts` | Trả public key cho client |

---

## 6. Kiểm tra nhanh

1. **VAPID đã cấu hình?**  
   Mở `http://localhost:3000/api/push/vapid-public-key` → phải thấy `"configured": true`

2. **User đã đăng ký?**  
   Supabase → Table `push_subscriptions` → có dòng sau khi user bấm Bật thông báo

3. **Push gửi được?**  
   Admin tạo thông báo mới → thiết bị đã bật push nhận trên màn hình khóa

4. **Lỗi thường gặp**

   | Triệu chứng | Cách xử lý |
   | :--- | :--- |
   | Không thấy nút bật push | Trình duyệt không hỗ trợ; thử Chrome Android hoặc Safari PWA iOS |
   | `VAPID keys chưa được cấu hình` | Kiểm tra `.env.local` và restart server |
   | Push không tới | User chưa bấm Bật; chưa chạy SQL; site chưa HTTPS (production) |
   | iPhone không nhận | Phải **Thêm vào Màn hình chính** trước |

---

## 7. Ghi chú bảo mật

- **Không** commit `VAPID_PRIVATE_KEY` lên Git
- Chỉ `NEXT_PUBLIC_VAPID_PUBLIC_KEY` được expose ra client
- API `/api/push/broadcast` chỉ cho role `admin` / `manager`

---

*Cập nhật: tháng 6/2026 — YoungHouse PMS*
