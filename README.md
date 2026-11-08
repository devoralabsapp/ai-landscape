# AI Atlas · AI Landscape tiếng Việt

**Website:** [ai-landscape-mocha.vercel.app](https://ai-landscape-mocha.vercel.app) · **Repo public:** [devoralabsapp/ai-landscape](https://github.com/devoralabsapp/ai-landscape)

Bản đồ tương tác lấy cảm hứng từ [CNCF Landscape](https://landscape.cncf.io/): **120 công cụ, nền tảng, họ model và giao thức**, chia thành **15 nhóm** trong 4 lớp sử dụng.

**Đối chiếu nguồn: 08/11/2026.** Đây là danh mục tuyển chọn mở rộng dần, không phải toàn bộ công cụ AI đang tồn tại hay bảng xếp hạng. Không liên kết với CNCF hoặc các hãng được liệt kê.

## Chức năng

- Bản đồ theo nhóm và chế độ danh mục có mô tả.
- Tiếng Việt / English cho giao diện, 120 mục, model, gói và CSV/JSON.
- Giao diện AI Atlas gốc cùng 6 theme chọn tay, lưu lựa chọn trong trình duyệt; hỗ trợ `?theme=...&lang=en`.
- Tìm kiếm tiếng Việt có/không dấu, tên cũ, tên hãng, model, gói và công việc.
- Lọc giao diện, mô hình cung cấp, local/self-host và vòng đời sản phẩm.
- Chi tiết từng mục có ba tab: Model, Gói sử dụng và Tổng quan.
- Model theo họ/provider, phân tầng từ cao xuống thấp; tìm nhanh phiên bản ngay trong khung chi tiết.
- Gói thuê bao, API và self-host được ghi riêng, có link giá chính thức và mốc đối chiếu.
- So sánh tối đa 3 công cụ; lưu danh sách bằng localStorage.
- Deep link cho từng mục và bộ lọc; xuất kết quả lọc thành CSV.
- Responsive, điều khiển bàn phím, dialog có focus management từ trình duyệt.

## Nội dung

1. **Sử dụng AI:** trợ lý đa năng, agent thực thi, nghiên cứu, công việc & tài liệu, họp & ghi chú.
2. **Xây sản phẩm:** coding agent, app builder, automation.
3. **Sáng tạo:** hình ảnh, video & avatar, âm thanh & âm nhạc.
4. **Hệ thống AI:** framework, inference & API, dữ liệu & đánh giá, giao thức & browser.

Các tên được yêu cầu có trong danh mục: ChatGPT, Claude, **Muse của Meta**, Gemini, Antigravity, OpenCode, OpenClaw và Qoder.

Đọc bản tổng hợp đầy đủ trong [AI-Landscape.vi.md](AI-Landscape.vi.md), hoặc lấy dữ liệu từ [CSV](dist/catalog.csv) / [JSON](dist/catalog.json).

## Nguồn và cách biên tập

Mỗi mục trỏ đến nguồn chính thức: trang sản phẩm, tài liệu hoặc repository của nhà cung cấp. `checked` là mốc đối chiếu biên tập, không khẳng định đã thử mọi khả năng.

- `description`: tóm tắt công dụng từ nguồn.
- `best`, `note`: gợi ý và lưu ý biên tập; không phải benchmark độc lập.
- `status`: ghi nhận thông báo hoặc chuyển hướng ở nguồn. Chuyển hướng URL không chứng minh hai sản phẩm hoàn toàn tương đương.
- `aliases`: tên trước đây hoặc tên liên quan để hỗ trợ tìm kiếm; không nhất thiết là sản phẩm đồng nhất.
- `openness`: mô hình cung cấp ở mức khái quát. “Có mã nguồn”, “Hỗn hợp” và “Source-available” không có nghĩa mọi thành phần đều có giấy phép OSI hay quyền dùng thương mại không điều kiện. Xem LICENSE của từng phiên bản.
- `hosting`: có thành phần chạy local/self-host không bảo đảm mọi lời gọi model hoặc connector đều local.

Danh sách model và gói là snapshot có nguồn trong `dist/product-data.js`. Phân tầng model theo định vị của hãng trong cùng họ; không phải bảng điểm benchmark và không so ngang model ảnh, video, giọng nói với model hội thoại. Tên model API/Work/Codex không mặc định có trong mọi bộ chọn Chat. Công cụ BYOK, gateway và framework dùng catalog động của provider; mục chưa có danh mục đầy đủ được ghi rõ và dẫn catalog nguồn. Giá USD (khi nguồn xác nhận), thuế, kỳ thanh toán, quota và quốc gia hỗ trợ cần kiểm tra trực tiếp khi lựa chọn. Một số mục lịch sử được giữ lại với nhãn rõ ràng, như Relay.app đã đóng và Sora 2 **API** đã ngừng; trạng thái API không được suy rộng sang mọi sản phẩm Sora.

Chưa bao quát mọi ngành dọc, plugin, checkpoint model hoặc nhà cung cấp địa phương. Dữ liệu không tự cập nhật. Gửi issue/PR để bổ sung hoặc sửa nguồn.

## Theme & ngôn ngữ

Sáu theme đầu theo thứ tự gallery của [Creative Theme System](https://github.com/devoralabsapp/creative-theme-system-skill): `retro`, `mono-os`, `chapter-desk`, `afterhours-fm`, `margin-notes`, `sticker-sprint`. Các palette và cấu trúc được chuyển sang thành phần thực tế của AI Atlas trong `dist/themes.css`; theme `atlas` giữ giao diện ban đầu. Thứ tự lựa chọn: URL → localStorage → mặc định. Đổi theme giữ bộ lọc, tìm kiếm, mục lưu và so sánh.

Bản dịch được biên tập trong `dist/translations.en.json`. Build sinh `translations.en.js`, `catalog.en.csv` và `catalog.en.json`. `i18n.js` dùng cùng catalog dịch cho nội dung, nhãn, thông báo và accessibility; dữ liệu ID, filter value và URL giữ nguyên. Chuyển ngôn ngữ tải lại URL hiện tại, giữ bộ lọc và mục đang mở. Để thêm nội dung tiếng Việt, thêm bản dịch tương ứng và chạy build; check sẽ báo mục dữ liệu chưa dịch.

## Motion

Áp dụng [Web Motion System Skill](https://github.com/devoralabsapp/web-motion-system-skill/tree/main/skills/web-motion-system-skill): line reveal (033), vector drawing (077), scroll reveal (081), FLIP (091), tab transitions (099), press feedback (111) và stagger (238). `dist/motion.js` sở hữu animation, observer, một requestAnimationFrame chờ và các hàm `stop`, `refresh`, `destroy`. Chuyển động không sửa dữ liệu, không cuộn tự động và chỉ lặp liên tục cho minh họa AI ở đầu trang khi hình nằm trong vùng nhìn.

- Minh họa AI là SVG tự vẽ: lõi có chiều sâu, monogram, ba vệ tinh chạy liên tục theo quỹ đạo elip, vòng halo, nét sáng và chuyển động nhịp thở. `ai-illustration.css` thích ứng palette và bố cục theo theme/màn hình.
- Vòng lặp minh họa có owner riêng, giữ pha khi đổi theme/lọc/mở dialog; tạm dừng khi rời viewport hoặc tab bị ẩn, hủy khi giảm motion/destroy. UI motion còn lại vẫn hữu hạn.
- Tiêu đề và nét SVG xuất hiện theo nhịp; nút ↻ phát lại riêng phần mở đầu, không reset vòng lặp của minh họa.
- Các nhóm hiện một lần khi cuộn tới; filter không phát lại toàn trang. FLIP giữ node thẻ theo ID, đo wrapper tĩnh và chuyển động lớp nội dung.
- Hover/press, phản hồi lưu/so sánh, thanh so sánh, toast, nội dung dialog và thanh chỉ tab có chuyển động riêng.
- Nút Motion bật/tắt giảm chuyển động, lưu vào trình duyệt; luôn kết hợp với `prefers-reduced-motion` của hệ thống. Hệ thống yêu cầu giảm thì nút không thể bật lại full motion. Thông báo có thể đóng trong phiên tab.
- Nội dung mặc định nhìn thấy kể cả khi animation bị hủy; Escape và resize dừng UI motion hữu hạn; minh họa có vòng đời tạm dừng riêng khi bị khuất hoặc tab bị ẩn.
- Khoảng trống trong lưới nền trắng phẳng ở theme sáng, cùng nền bề mặt ở theme tối; không màu nhấn, shadow hoặc motion của riêng ô trống.

## Chạy local

Yêu cầu Node.js 22 trở lên. Ứng dụng không có dependency runtime hoặc API key.

```sh
npm run build
npm run dev
```

Mở `http://127.0.0.1:4173`. `npm run check` kiểm tra tính toàn vẹn dữ liệu, URL nguồn, mục bắt buộc, liên kết asset và cú pháp JavaScript.

## Sửa nội dung

Sửa `dist/data.js` cho danh mục và `dist/product-data.js` cho model/gói, nguồn, quan hệ tích hợp và mốc đối chiếu. Mỗi profile có `mode`, `groups`, `plans`, `modelUrl`, `pricingUrl`, `modelNote`; `tier` là tầng biên tập 0–4 trong cùng họ và `status` tách current/other/preview/special. Không tự suy ra model được hỗ trợ từ toàn bộ catalog của hãng.

Trong `dist/data.js`, Mỗi dòng trong `RAW` có 12 trường ngăn bằng `|`:

```text
name|organization|kind|surfaces|hosting|openness|description|best|note|official URL|aliases|status
```

`surfaces` và `aliases` ngăn bằng dấu phẩy. Để trống `status` cho mục đang hoạt động. Cập nhật mốc `checked` và snapshot khi rà soát phiên bản mới. Chạy `npm run build` để sinh CSV, JSON và Markdown trước khi commit. Nếu thay số lượng mục, cập nhật README và mô tả HTML.

Giao diện dùng ký hiệu chữ riêng thay logo nhà cung cấp. Tên và nhãn hiệu thuộc chủ sở hữu tương ứng. Font Be Vietnam Pro được tải từ Google Fonts, với system font dự phòng. Danh sách lưu và so sánh nằm trên trình duyệt, không có tài khoản hoặc backend.

## Deploy Vercel

Import repo, chọn framework **Other**. `vercel.json` cấu hình lệnh build `npm run build` và thư mục output `dist`. Không cần biến môi trường. Git integration deploy lại khi push nhánh production `main`.

Mã nguồn và phần ghi chú tự biên tập: MIT. Tên, nhãn hiệu và nội dung của bên thứ ba giữ các quyền tương ứng; giấy phép repo không cấp quyền dùng nhãn hiệu hoặc thay đổi giấy phép của sản phẩm được liệt kê.
