import type { Language } from "./catalog";
export const messages: Record<string, Record<Exclude<Language, "en" | "ru" | "vi">, string>> = {
  "Meeting location": {"uz": "Uchrashuv joyi", "ko": "만남 장소"},
  "Meeting location on map (optional)": {"uz": "Xaritada uchrashuv joyi (ixtiyoriy)", "ko": "지도에서 만남 장소 선택 (선택)"},
  "Zoom in and select a public meeting place. This pin will be visible to everyone.": {"uz": "Xaritani yaqinlashtirib, jamoat joyini belgilang. Bu nuqta hammaga ko‘rinadi.", "ko": "지도를 확대하고 공공장소를 선택하세요. 이 위치는 모두에게 공개됩니다."},
  "Use current location": {"uz": "Joriy joylashuvdan foydalanish", "ko": "현재 위치 사용"},
  "Latitude": {"uz": "Kenglik", "ko": "위도"},
  "Longitude": {"uz": "Uzunlik", "ko": "경도"},
  "Remove map pin": {"uz": "Xarita nuqtasini olib tashlash", "ko": "지도 위치 삭제"},
  "Open map": {"uz": "Xaritani ochish", "ko": "지도 열기"},
  "The seller has not selected a map pin. This map shows the listed area.": {"uz": "Sotuvchi xaritada nuqta belgilamagan. Xaritada e’lon hududi ko‘rsatilgan.", "ko": "판매자가 위치를 지정하지 않았습니다. 등록된 지역을 표시합니다."},
  "For a stronger password, combine uppercase and lowercase letters, numbers, and symbols. Avoid your name and simple sequences.": {"uz": "Kuchli parol uchun katta-kichik harflar, raqamlar va maxsus belgilarni birlashtiring. Ismingiz va oddiy ketma-ketliklardan foydalanmang.", "ko": "대소문자, 숫자, 특수문자를 조합하세요. 이름이나 단순한 연속 문자는 피하세요."},
  "ZUNO Assistant": {"uz": "ZUNO yordamchisi", "ko": "ZUNO 도우미"},
  "Get help with using ZUNO.": {"uz": "ZUNO’dan foydalanish bo‘yicha yordam oling.", "ko": "ZUNO 사용법을 알아보세요."},
  "Ask about ZUNO": {"uz": "ZUNO haqida so‘rang", "ko": "ZUNO에 대해 질문하기"},
  "Your question is processed by Google Gemini. Avoid sharing passwords or private details.": {"uz": "Savolingizni Google Gemini qayta ishlaydi. Parol yoki shaxsiy ma’lumot yozmang.", "ko": "질문은 Google Gemini에서 처리됩니다. 비밀번호나 개인정보를 입력하지 마세요."},
  "Finding help\u2026": {"uz": "Javob qidirilmoqda…", "ko": "도움말을 찾는 중…"},
  "Ask ZUNO": {"uz": "ZUNO’dan so‘rash", "ko": "ZUNO에 질문"},
  "Open in ZUNO": {"uz": "ZUNO’da ochish", "ko": "ZUNO에서 열기"},
  "Help topics": {"uz": "Yordam mavzulari", "ko": "도움말 주제"},
  "Find an item": {"uz": "Buyum topish", "ko": "상품 찾기"},
  "Confirm a trade": {"uz": "Savdoni tasdiqlash", "ko": "거래 확인"},
  "Sign in to ask the ZUNO assistant.": {"uz": "ZUNO yordamchisiga savol berish uchun hisobga kiring.", "ko": "ZUNO 도우미에게 질문하려면 로그인하세요."},
  "The assistant is unavailable. Choose a help topic below.": {"uz": "Yordamchi vaqtincha ishlamayapti. Quyidan yordam mavzusini tanlang.", "ko": "도우미를 사용할 수 없습니다. 아래에서 도움말을 선택하세요."},
  "Enter a question of up to 400 characters.": {"uz": "400 belgigacha savol kiriting.", "ko": "400자 이내로 질문을 입력하세요."},
  "You reached today\u2019s assistant limit. Help topics are still available.": {"uz": "Bugungi savollar limiti tugadi. Yordam mavzularidan foydalanishingiz mumkin.", "ko": "오늘 질문 한도에 도달했습니다. 도움말은 계속 이용할 수 있습니다."},
  "I can only answer supported questions about using ZUNO. Choose a help topic below.": {"uz": "Men faqat ZUNO’dan foydalanish bo‘yicha yordam beraman. Quyidan mavzu tanlang.", "ko": "ZUNO 사용법에 관한 질문만 답변할 수 있습니다. 아래에서 주제를 선택하세요."},
  "Sign in, open Sell, add photos and details, then publish. Use Your listings to edit the listing or mark it reserved or sold.": {"uz": "Hisobga kiring, Sotish bo‘limida rasm va tafsilotlarni qo‘shib e’lonni joylang. E’lonlaringiz bo‘limida uni tahrirlang yoki band va sotildi deb belgilang.", "ko": "로그인하고 판매 메뉴에서 사진과 정보를 추가해 게시하세요. 내 판매 글에서 수정하거나 예약 또는 판매 완료로 표시할 수 있습니다."},
  "On the homepage, choose your area and search or filter the listings. Open an item and message the seller to agree on a meetup.": {"uz": "Bosh sahifada hududni tanlab, e’lonlarni qidiring yoki saralang. Buyumni ochib, uchrashuvni kelishish uchun sotuvchiga yozing.", "ko": "홈에서 지역을 선택하고 매물을 검색하거나 필터를 적용하세요. 상품을 열고 판매자에게 메시지를 보내 만나기로 약속하세요."},
  "Open a listing to start a conversation with the seller. Go to Messages to read and reply. You can also send supported photos and files there.": {"uz": "Sotuvchiga yozish uchun e’lonni oching. Suhbatlar bo‘limida javob bering, rasm va mos fayllarni yuboring.", "ko": "매물을 열어 판매자와 채팅을 시작하세요. 메시지에서 읽고 답장하거나 지원되는 사진과 파일을 보낼 수 있습니다."},
  "In Your listings, select Mark reserved or Mark sold. If you choose a buyer, the status appears in their chat. After the buyer confirms receipt, both people can leave optional feedback in that chat.": {"uz": "E’lonlaringizda Band yoki Sotildi deb belgilang. Xaridorni tanlasangiz, holat uning chatida chiqadi. Xaridor buyumni olganini tasdiqlagach, ikkala tomon chatda ixtiyoriy fikr qoldirishi mumkin.", "ko": "내 판매 글에서 예약 또는 판매 완료로 표시하세요. 구매자를 선택하면 채팅에 상태가 표시됩니다. 구매자가 수령을 확인하면 양쪽 모두 채팅에서 후기를 남길 수 있습니다."},
  "Go to My ZUNO and choose Edit profile to update your profile. Use Change neighborhood in My ZUNO to select a different country or area.": {"uz": "Profilni yangilash uchun Mening ZUNO → Profilni tahrirlash bo‘limiga o‘ting. Davlat yoki hududni almashtirish uchun Mahallani o‘zgartirishni tanlang.", "ko": "나의 ZUNO에서 프로필 편집으로 정보를 변경하세요. 국가나 지역을 바꾸려면 동네 변경을 이용하세요."},
  "Meet in a public place and inspect the item before paying. Use the chat options to block a user or report a listing.": {"uz": "Jamoat joyida uchrashing va to‘lashdan oldin buyumni tekshiring. Suhbat menyusida foydalanuvchini bloklash yoki e’lon haqida shikoyat qilish mumkin.", "ko": "공공장소에서 만나 결제 전에 상품을 확인하세요. 채팅 메뉴에서 사용자를 차단하거나 매물을 신고할 수 있습니다."},
  "Open Log in and choose Continue with Google or enter your ZUNO email and password. If Google sign-in stalls inside another app, start again in your regular browser.": {"uz": "Kirish sahifasida Google orqali davom eting yoki ZUNO email va parolingizni kiriting. Boshqa ilova ichida Google orqali kirish to‘xtab qolsa, odatiy brauzeringizdan qayta urinib ko‘ring.", "ko": "로그인에서 Google로 계속하거나 ZUNO 이메일과 비밀번호를 입력하세요. 다른 앱 안에서 Google 로그인이 멈추면 일반 브라우저에서 다시 시작하세요."},
  "Tap the bookmark on a listing to save it. Open Saved to find it later, or tap the bookmark again to remove it from Saved.": {"uz": "E’lonni saqlash uchun xatcho‘p belgisini bosing. Uni Saqlanganlar bo‘limidan topasiz. Olib tashlash uchun belgini yana bosing.", "ko": "매물의 북마크를 눌러 저장하세요. 저장 목록에서 다시 찾거나 북마크를 다시 눌러 저장을 해제할 수 있습니다."},
  "Mark this item sold to {buyer}?": {"uz": "Bu buyumni {buyer}ga sotildi deb belgilaysizmi?", "ko": "{buyer}님에게 판매 완료로 표시할까요?"},
  "Reserve this item for {buyer}?": {"uz": "Bu buyumni {buyer} uchun band qilasizmi?", "ko": "{buyer}님을 위해 상품을 예약할까요?"},
  "Choose a valid buyer.": {"uz": "Ro‘yxatdan mos xaridorni tanlang.", "ko": "유효한 구매자를 선택하세요."},
  "Choose a buyer (optional)": {"uz": "Xaridorni tanlang (ixtiyoriy)", "ko": "구매자 선택 (선택 사항)"},
  "Continue without a buyer": {"uz": "Xaridorsiz davom etish", "ko": "구매자 없이 진행"},
  "This item was reserved for you.": {"uz": "Bu buyum siz uchun band qilindi.", "ko": "이 상품은 고객님을 위해 예약되었습니다."},
  "Item marked sold. Confirm receipt in this conversation.": {"uz": "Buyum sotildi deb belgilandi. Buyumni olganingizni shu suhbatda tasdiqlang.", "ko": "판매 완료로 표시되었습니다. 이 대화에서 수령을 확인하세요."},
  "Buyer confirmed receipt. Feedback is now available.": {"uz": "Xaridor buyumni olganini tasdiqladi. Endi fikr qoldirish mumkin.", "ko": "구매자가 수령을 확인했습니다. 이제 후기를 남길 수 있습니다."},
  "Choose the buyer when marking the listing sold. Confirm receipt and leave feedback in Messages.": {"uz": "Sotildi deb belgilashda xaridorni tanlashingiz mumkin. Buyumni olganingizni tasdiqlash va fikr qoldirish suhbatda amalga oshiriladi.", "ko": "판매 완료로 표시할 때 구매자를 선택할 수 있습니다. 메시지에서 수령을 확인하고 후기를 남기세요."},
  "Choose a buyer": {"uz": "Xaridorni tanlang", "ko": "구매자 선택"},
  "Choose a buyer first.": {"uz": "Avval xaridorni tanlang.", "ko": "먼저 구매자를 선택하세요."},
  "Buyer choices could not be loaded.": {"uz": "Xaridorlar ro‘yxati yuklanmadi.", "ko": "구매자 목록을 불러오지 못했습니다."},
  "No buyers have messaged about this listing yet.": {"uz": "Hozircha bu e’lon bo‘yicha hech kim yozmagan.", "ko": "이 매물에 대해 메시지를 보낸 구매자가 아직 없습니다."},
  "Buyer notified.": {"uz": "Xaridorga bildirishnoma yuborildi.", "ko": "구매자에게 알림을 보냈습니다."},
  "Reserved buyer": {"uz": "Band qilingan xaridor", "ko": "예약한 구매자"},
  "Mark available": {"uz": "Sotuvga qaytarish", "ko": "판매 중으로 변경"},
  "An item was reserved for you": {"uz": "Buyum siz uchun band qilindi", "ko": "상품이 고객님을 위해 예약되었습니다"},
  "Confirm that you received your item": {"uz": "Buyumni olganingizni tasdiqlang", "ko": "상품 수령을 확인해 주세요"},
  "Your buyer confirmed receipt": {"uz": "Xaridor buyumni olganini tasdiqladi", "ko": "구매자가 수령을 확인했습니다"},
  "Choose the buyer when marking the listing sold. The buyer confirms receipt here.": {"uz": "Sotildi deb belgilashda xaridorni tanlang. Xaridor buyumni olganini shu yerda tasdiqlaydi.", "ko": "판매 완료 시 구매자를 선택하세요. 구매자는 여기에서 수령을 확인합니다."},
  "Leave feedback (optional)": {"uz": "Fikr qoldirish (ixtiyoriy)", "ko": "후기 남기기 (선택)"},
  "Feedback for the buyer": {"uz": "Xaridor haqida fikr", "ko": "구매자 후기"},
  "Feedback for the seller": {"uz": "Sotuvchi haqida fikr", "ko": "판매자 후기"},
  "Positive": {"uz": "Ijobiy", "ko": "긍정적"},
  "Negative": {"uz": "Salbiy", "ko": "부정적"},
  "Skip for now": {"uz": "Hozircha o‘tkazib yuborish", "ko": "지금은 건너뛰기"},
  "Feedback sent": {"uz": "Fikr yuborildi", "ko": "후기가 전송되었습니다"},
  "Arrived on time": {"uz": "Vaqtida keldi", "ko": "시간을 지켰어요"},
  "Good communication": {"uz": "Muloqot yaxshi bo‘ldi", "ko": "소통이 좋았어요"},
  "Kept the agreement": {"uz": "Kelishuvga amal qildi", "ko": "약속을 지켰어요"},
  "Item as described": {"uz": "Buyum tavsifga mos", "ko": "상품이 설명과 일치해요"},
  "Missed the meetup": {"uz": "Uchrashuvga kelmadi", "ko": "약속 장소에 오지 않았어요"},
  "Difficult communication": {"uz": "Muloqot qiyin bo‘ldi", "ko": "소통이 어려웠어요"},
  "Did not keep the agreement": {"uz": "Kelishuvga amal qilmadi", "ko": "약속을 지키지 않았어요"},
  "Item not as described": {"uz": "Buyum tavsifga mos emas", "ko": "상품이 설명과 달라요"},
  "New neighbor": {"uz": "Yangi qo‘shni", "ko": "새로운 이웃"},
  "Active neighbor": {"uz": "Faol qo‘shni", "ko": "활동적인 이웃"},
  "Experienced neighbor": {"uz": "Tajribali qo‘shni", "ko": "경험 많은 이웃"},
  "Level {level}": {"uz": "{level}-daraja", "ko": "레벨 {level}"},
  "From a buyer": {"uz": "Xaridordan", "ko": "구매자가 남김"},
  "From a seller": {"uz": "Sotuvchidan", "ko": "판매자가 남김"},
  "All feedback": {"uz": "Barcha fikrlar", "ko": "모든 후기"},
  "No feedback yet.": {"uz": "Hozircha fikrlar yo‘q.", "ko": "아직 후기가 없습니다."},
  "Feedback could not be loaded.": {"uz": "Fikrlar yuklanmadi.", "ko": "후기를 불러오지 못했습니다."},
  "Approve": {"uz": "Tasdiqlash", "ko": "승인"},
  "Decline": {"uz": "Rad etish", "ko": "거절"},
  "Approved": {"uz": "Tasdiqlangan", "ko": "승인됨"},
  "Declined": {"uz": "Rad etilgan", "ko": "거절됨"},
  "Help": {"uz": "Yordam", "ko": "도움말"},
  "Keyword": {"uz": "Kalit so‘z", "ko": "키워드"},
  "Mark as read": {"uz": "O‘qilgan deb belgilash", "ko": "읽음으로 표시"},
  "Open conversation": {"uz": "Suhbatni ochish", "ko": "대화 열기"},
  "Publish": {"uz": "Joylash", "ko": "게시"},
  "Set your language and text size.": {"uz": "Til va matn hajmini sozlang.", "ko": "언어와 글자 크기를 설정하세요."},
  "Create a post": {"uz": "Post yaratish", "ko": "게시글 작성"},
  "Create business profile": {"uz": "Biznes profil yaratish", "ko": "비즈니스 프로필 만들기"},
  "Manage post": {"uz": "Postni boshqarish", "ko": "게시글 관리"},
  "Remove post": {"uz": "Postni o‘chirish", "ko": "게시글 삭제"},
  "Start time (UTC)": {"uz": "Boshlanish vaqti (UTC)", "ko": "시작 시간 (UTC)"},
  "Nothing here yet.": {"uz": "Hozircha bu yer bo‘sh.", "ko": "아직 항목이 없습니다."},
  "Choose your neighborhood in Profile settings.": {"uz": "Profil sozlamalarida mahallangizni tanlang.", "ko": "프로필 설정에서 동네를 선택하세요."},
  "Clear viewing history": {"uz": "Ko‘rish tarixini tozalash", "ko": "조회 기록 지우기"},
  "Stop promotion": {"uz": "Targ‘ibotni to‘xtatish", "ko": "홍보 중지"},
  "Featured nearby": {"uz": "Yaqindagi targ‘ibot e’lonlari", "ko": "우리 동네 추천 매물"},
  "Confirm this buyer": {"uz": "Shu xaridorni tasdiqlash", "ko": "이 구매자 확인"},
  "Confirm receipt": {"uz": "Qabul qilganimni tasdiqlash", "ko": "수령 확인"},
  "Trade confirmed": {"uz": "Savdo tasdiqlandi", "ko": "거래 확인 완료"},
  "Waiting for buyer confirmation": {"uz": "Xaridor tasdig‘i kutilmoqda", "ko": "구매자 확인 대기 중"},
  "Waiting for seller confirmation": {"uz": "Sotuvchi tasdig‘i kutilmoqda", "ko": "판매자 확인 대기 중"},
  "Another buyer was confirmed": {"uz": "Boshqa xaridor tasdiqlangan", "ko": "다른 구매자가 확인되었습니다"},
  "Save search alert": {"uz": "Qidiruv ogohlantirishini saqlash", "ko": "검색 알림 저장"},
  "Remove alert": {"uz": "Ogohlantirishni o‘chirish", "ko": "알림 삭제"},
  "Use larger text": {"uz": "Matnni kattalashtirish", "ko": "글자 크게 표시"},
  "Show matching search alerts in notifications": {"uz": "Mos e’lonlarni bildirishnomalarda ko‘rsatish", "ko": "일치하는 매물 검색 알림 표시"},
  "New listing matches your search": {"uz": "Qidiruvingizga mos yangi e’lon", "ko": "검색에 맞는 새 매물이 있습니다"},
  "Publish announcement": {"uz": "Yangilikni e’lon qilish", "ko": "공지 게시"},
  "Remove announcement": {"uz": "Yangilikni o‘chirish", "ko": "공지 삭제"},
  "Send feedback": {"uz": "Fikr yuborish", "ko": "의견 보내기"},
  "Feedback inbox": {"uz": "Kelgan fikrlar", "ko": "받은 의견"},
  "Your feedback": {"uz": "Siz yuborgan fikrlar", "ko": "보낸 의견"},
  "Neighborhood changed": {"uz": "Mahalla o‘zgargan", "ko": "동네가 변경되었습니다"},
  "Remove verification request": {"uz": "Tasdiqlash so‘rovini o‘chirish", "ko": "인증 요청 삭제"},
  "Request review": {"uz": "Tasdiqlashga yuborish", "ko": "검토 요청"},
  "Why are you connected to this neighborhood?": {"uz": "Bu mahalla bilan qanday aloqangiz bor?", "ko": "이 동네와 어떤 관련이 있나요?"},
  "Verification queue": {"uz": "Tasdiqlash navbati", "ko": "인증 대기 목록"},
  "Could not save this change. Please try again.": {"uz": "O‘zgarishni saqlab bo‘lmadi. Qayta urinib ko‘ring.", "ko": "변경사항을 저장하지 못했습니다. 다시 시도해 주세요."},
  "Promotion is free. Active promoted items appear in this neighborhood showcase.": {"uz": "Targ‘ibot bepul. Faol e’lonlar shu mahalla vitrinasida ko‘rinadi.", "ko": "홍보는 무료입니다. 판매 중인 홍보 매물은 이 동네 목록에 표시됩니다."},
  "After marking an item sold, the seller confirms the buyer here. The buyer then confirms receipt. ZUNO does not process payment.": {"uz": "E’lon sotildi deb belgilanganidan keyin sotuvchi xaridorni, xaridor esa buyumni olganini tasdiqlaydi. To‘lov ZUNO orqali amalga oshirilmaydi.", "ko": "판매 완료 후 판매자가 구매자를 확인하고 구매자가 수령을 확인합니다. ZUNO는 결제를 처리하지 않습니다."},
  "Get an in-app notification when a new listing title matches your keyword in your selected country.": {"uz": "Tanlangan davlatda kalit so‘zingizga mos sarlavhali e’lon chiqsa, ZUNO bildirishnoma yuboradi.", "ko": "선택한 국가에서 키워드와 일치하는 제목의 새 매물이 등록되면 앱에서 알림을 받습니다."},
  "Request manual review of your selected neighborhood. Do not include your exact address or identity documents.": {"uz": "Tanlangan mahallani moderator ko‘rib chiqishi uchun so‘rov yuboring. Aniq manzil yoki shaxsiy hujjatlarni yozmang.", "ko": "선택한 동네의 검토를 요청하세요. 정확한 주소나 신분증 정보는 입력하지 마세요."},
  "Delete account": {"uz": "Hisobni o‘chirish", "ko": "계정 삭제"},
  "Your profile, listings, conversations and uploaded files will be permanently deleted.": {"uz": "Profilingiz, e’lonlaringiz, suhbatlaringiz va yuklagan fayllaringiz butunlay o‘chiriladi.", "ko": "프로필, 판매 글, 대화 및 업로드한 파일이 영구적으로 삭제됩니다."},
  "Type DELETE to confirm.": {"uz": "Tasdiqlash uchun DELETE deb yozing.", "ko": "확인하려면 DELETE를 입력하세요."},
  "Deleting account…": {"uz": "Hisob o‘chirilmoqda…", "ko": "계정을 삭제하는 중…"},
  "Account deletion is temporarily unavailable.": {"uz": "Hisobni o‘chirish vaqtincha mavjud emas.", "ko": "현재 계정을 삭제할 수 없습니다."},
  "Please log in again to delete your account.": {"uz": "Hisobingizni o‘chirish uchun qayta kiring.", "ko": "계정을 삭제하려면 다시 로그인하세요."},
  "We couldn’t finish deleting your account. Please try again.": {"uz": "Hisobni o‘chirish yakunlanmadi. Qayta urinib ko‘ring.", "ko": "계정 삭제를 완료하지 못했습니다. 다시 시도해 주세요."},
  "Notifications, {count} unread": {"uz": "Bildirishnomalar, {count} ta o‘qilmagan", "ko": "알림, 읽지 않음 {count}개"},
  "Notifications are temporarily unavailable.": {"uz": "Bildirishnomalar vaqtincha mavjud emas.", "ko": "알림을 일시적으로 사용할 수 없습니다."},
  "Loading notifications\u2026": {"uz": "Bildirishnomalar yuklanmoqda…", "ko": "알림을 불러오는 중…"},
  "Sign in to see your notifications.": {"uz": "Bildirishnomalarni ko‘rish uchun kiring.", "ko": "알림을 보려면 로그인하세요."},
  "Some notifications could not be loaded.": {"uz": "Ba’zi bildirishnomalar yuklanmadi.", "ko": "일부 알림을 불러오지 못했습니다."},
  "Could not mark notifications as read. Please try again.": {"uz": "Bildirishnomalarni o‘qilgan deb belgilab bo‘lmadi. Qayta urinib ko‘ring.", "ko": "알림을 읽음으로 표시하지 못했습니다. 다시 시도해 주세요."},
  "No unread messages.": {"uz": "O‘qilmagan xabarlar yo‘q.", "ko": "읽지 않은 메시지가 없습니다."},
  "Open messages": {"uz": "Xabarlarni ochish", "ko": "메시지 열기"},
  "From ZUNO": {"uz": "ZUNO’dan", "ko": "ZUNO 소식"},
  "Mark all as read": {"uz": "Barchasini o‘qilgan deb belgilash", "ko": "모두 읽음으로 표시"},
  "No website notifications yet.": {"uz": "Hozircha sayt bildirishnomalari yo‘q.", "ko": "아직 사이트 알림이 없습니다."},
  "New message": {"uz": "Yangi xabar", "ko": "새 메시지"},
  "Your listing was removed": {"uz": "E’loningiz olib tashlandi", "ko": "회원님의 게시글이 삭제되었습니다"},
  "Your report was reviewed": {"uz": "Shikoyatingiz ko‘rib chiqildi", "ko": "신고가 검토되었습니다"},
  "Phones & Tablets": {"uz": "Telefonlar va planshetlar", "ko": "휴대폰·태블릿"},
  "Computers": {"uz": "Kompyuterlar", "ko": "컴퓨터"},
  "Furniture": {"uz": "Mebel", "ko": "가구"},
  "Appliances": {"uz": "Maishiy texnika", "ko": "가전제품"},
  "Baby & Kids": {"uz": "Bolalar buyumlari", "ko": "유아·아동용품"},
  "Beauty & Care": {"uz": "Go‘zallik va parvarish", "ko": "뷰티·미용"},
  "Pet Supplies": {"uz": "Hayvonlar uchun buyumlar", "ko": "반려동물용품"},
  "Outdoor & Camping": {"uz": "Sayohat va kemping", "ko": "캠핑·아웃도어"},
  "Tools & DIY": {"uz": "Asboblar va ta’mirlash", "ko": "공구·DIY"},
  "Games & Hobbies": {"uz": "O‘yinlar va hobbi", "ko": "게임·취미"},
  "Musical Instruments": {"uz": "Musiqa asboblari", "ko": "악기"},
  "Close": {"uz": "Yopish", "ko": "닫기"},
  "Filters": {"uz": "Filtrlar", "ko": "필터"},
  "Keep your home address private. Choose a public meeting place and inspect the item together.": {"uz": "Uy manzilingizni oshkor qilmang. Jamoat joyida uchrashing va buyumni birga tekshiring.", "ko": "집 주소는 공개하지 마세요. 공공장소에서 만나 물품을 함께 확인하세요."},
  "Meet safely.": {"uz": "Xavfsiz uchrashing.", "ko": "안전하게 만나요."},
  "Trade thoughtfully.": {"uz": "O‘ylab savdo qiling.", "ko": "신중하게 거래해요."},
  "Add a profile photo and display name so neighbors can recognize you in conversations.": {"uz": "Suhbatlarda qo‘shnilar sizni tanishi uchun profil rasmi va ism qo‘shing.", "ko": "대화에서 이웃이 나를 알아볼 수 있도록 프로필 사진과 이름을 추가하세요."},
  "Meet your neighbors.": {"uz": "Qo‘shnilar bilan tanishing.", "ko": "이웃을 만나요."},
  "Make it yours.": {"uz": "O‘zingizga moslang.", "ko": "나답게 꾸며요."},
  "Share photos and files in Messages when a buyer needs more information about your item.": {"uz": "Xaridorga qo‘shimcha ma’lumot kerak bo‘lsa, Xabarlarda rasm va fayllar yuboring.", "ko": "구매자가 물품에 대해 더 알고 싶어 하면 메시지로 사진과 파일을 보내 주세요."},
  "A clearer chat.": {"uz": "Aniqroq suhbat.", "ko": "더 쉽게 소통해요."},
  "A closer look.": {"uz": "Yaqinroq ko‘ring.", "ko": "더 자세히 봐요."},
  "Open Your listings to edit details and photos, change availability, or remove an item.": {"uz": "E’lonlaringiz bo‘limida tafsilot va rasmlarni tahrirlang, holatini o‘zgartiring yoki buyumni olib tashlang.", "ko": "내 판매글에서 설명과 사진을 수정하고, 판매 상태를 바꾸거나 물품을 삭제하세요."},
  "Easy to update.": {"uz": "Oson yangilang.", "ko": "간편하게 수정해요."},
  "Your listing.": {"uz": "E’loningiz.", "ko": "내 게시글."},
  "Mark your item reserved when a pickup is arranged, and sold when the exchange is complete.": {"uz": "Uchrashuv kelishilganda buyumni bron qilingan, savdo tugagach esa sotilgan deb belgilang.", "ko": "거래 약속을 잡으면 예약 중으로, 거래를 마치면 판매 완료로 표시하세요."},
  "Update the status.": {"uz": "Holatni yangilang.", "ko": "상태를 알려요."},
  "Found a buyer?": {"uz": "Xaridor topildimi?", "ko": "구매자를 찾았나요?"},
  "New listing prices use so‘m in Uzbekistan and won in Korea. Check the amount before publishing.": {"uz": "Yangi e’lon narxi Uzbekistan’da so‘mda, Koreada wonda belgilanadi. Joylashdan oldin summani tekshiring.", "ko": "새 게시글 가격은 우즈베키스탄에서는 숨, 한국에서는 원으로 표시돼요. 등록 전에 금액을 확인하세요."},
  "A local price.": {"uz": "Mahalliy narx.", "ko": "현지 가격."},
  "A local market.": {"uz": "Mahalliy bozor.", "ko": "동네 마켓."},
  "Set minimum and maximum prices, then sort from low to high to find items in your budget.": {"uz": "Eng past va yuqori narxni belgilang, so‘ng arzonidan qimmatiga saralab budjetingizga mosini toping.", "ko": "최저·최고 가격을 정하고 낮은 가격순으로 정렬해 예산에 맞는 물건을 찾아보세요."},
  "Your next find.": {"uz": "Yangi topilmangiz.", "ko": "새로운 발견."},
  "Your budget.": {"uz": "Budjetingizga mos.", "ko": "예산에 맞게."},
  "Neatly folded clothing and sneakers beside a wooden chair": {"uz": "Yog‘och stul yonidagi tartibli kiyimlar va krossovkalar", "ko": "나무 의자 옆에 정리한 옷과 운동화"},
  "Choose the item’s condition and mention signs of wear. Honest details help buyers decide.": {"uz": "Buyum holatini tanlang va eskirish belgilarini yozing. To‘g‘ri tavsif xaridorga qaror qilishda yordam beradi.", "ko": "물품 상태를 고르고 사용 흔적을 알려 주세요. 솔직한 설명은 구매자의 선택을 도와줘요."},
  "Build trust.": {"uz": "Ishonch yarating.", "ko": "신뢰를 쌓아요."},
  "Be clear.": {"uz": "Aniq yozing.", "ko": "솔직하게 알려요."},
  "Add clear photos from different angles. Put your best photo first to make it the cover.": {"uz": "Turli burchaklardan olingan tiniq rasmlarni qo‘shing. Eng yaxshi rasmni muqova qilish uchun birinchi qo‘ying.", "ko": "여러 각도에서 찍은 선명한 사진을 올리세요. 가장 좋은 사진을 첫 번째 대표 사진으로 두세요."},
  "Let photos help.": {"uz": "Rasmlar yordam bersin.", "ko": "사진으로 전해요."},
  "Show the details.": {"uz": "Tafsilotlarni ko‘rsating.", "ko": "디테일을 보여줘요."},
  "A city bicycle outside a neighborhood cafe": {"uz": "Mahalla kafesi oldidagi shahar velosipedi", "ko": "동네 카페 앞의 시티 자전거"},
  "Use All nearby to choose a region and district in your selected country.": {"uz": "Yaqin atrof bo‘limida tanlangan davlatingizning viloyati va tumanini belgilang.", "ko": "주변 전체에서 선택한 국가의 시·도와 시·군·구를 고르세요."},
  "Stay close.": {"uz": "Yaqindan toping.", "ko": "가까이서 찾아요."},
  "Choose your area.": {"uz": "Hududingizni tanlang.", "ko": "동네를 선택해요."},
  "A laptop, headphones and books arranged on a wooden desk": {"uz": "Yog‘och stol ustidagi noutbuk, quloqchin va kitoblar", "ko": "나무 책상 위의 노트북, 헤드폰, 책"},
  "Search by item name, then choose a category to narrow down your nearby finds.": {"uz": "Buyum nomini qidiring, so‘ng mos toifani tanlab natijalarni saralang.", "ko": "물품 이름으로 검색하고 카테고리를 선택해 주변 물건을 좁혀 보세요."},
  "Search for it.": {"uz": "Qidirib toping.", "ko": "검색해 보세요."},
  "Looking for it?": {"uz": "Qidiryapsizmi?", "ko": "찾는 게 있나요?"},
  "Slide {current} of {total}: {title}": {"uz": "{total} slayddan {current}: {title}", "ko": "{total}개 중 {current}번째 슬라이드: {title}"},
  "Next slide": {"uz": "Keyingi slayd", "ko": "다음 슬라이드"},
  "Previous slide": {"uz": "Oldingi slayd", "ko": "이전 슬라이드"},
  "Show slide {number}: {title}": {"uz": "{number}-slaydni ko‘rish: {title}", "ko": "슬라이드 {number} 보기: {title}"},
  "Choose a slide": {"uz": "Slaydni tanlang", "ko": "슬라이드 선택"},
  "How ZUNO works": {"uz": "ZUNO qanday ishlaydi", "ko": "ZUNO 이용 방법"},
  "carousel": {"uz": "slayder", "ko": "캐러셀"},
  "Headphones, a camera and books collected on a wooden table": {"uz": "Yog‘och stol ustidagi quloqchin, kamera va kitoblar", "ko": "나무 테이블 위에 모아 놓은 헤드폰, 카메라, 책"},
  "Tap the bookmark on a listing to keep it in Saved. Compare your finds and come back when you’re ready.": {"uz": "E’londagi xatcho‘p belgisini bosib, uni Saqlanganlarga qo‘shing. Topilmalarni solishtiring va tayyor bo‘lganingizda qayting.", "ko": "게시글의 북마크를 누르면 저장 목록에 보관돼요. 마음에 드는 물건을 비교하고 준비되면 다시 찾아보세요."},
  "Find it later.": {"uz": "Keyin qayting.", "ko": "나중에 다시 봐요."},
  "See it. Save it.": {"uz": "Ko‘ring. Saqlang.", "ko": "발견하고 저장해요."},
  "Two neighbors inspecting a camera at a public cafe": {"uz": "Ikki qo‘shni jamoat kafesida kamerani tekshiryapti", "ko": "공공 카페에서 카메라를 확인하는 두 이웃"},
  "Ask the seller a question in Messages. Agree on a public meeting place and inspect the item before paying.": {"uz": "Xabarlarda sotuvchiga savol bering. Jamoat joyida uchrashishga kelishing va pul to‘lashdan oldin buyumni tekshiring.", "ko": "메시지로 판매자에게 물어보세요. 공공장소에서 만나기로 약속하고, 결제 전에 물품을 확인하세요."},
  "Meet nearby.": {"uz": "Yaqinda uchrashing.", "ko": "동네에서 만나요."},
  "Say hello.": {"uz": "Salomlashing.", "ko": "인사를 나눠요."},
  "A neighbor photographing a second-hand camera for a listing": {"uz": "Qo‘shni e’lon uchun ishlatilgan kamerani suratga olyapti", "ko": "판매 글을 올리려고 중고 카메라를 촬영하는 이웃"},
  "Add up to 10 photos, describe your item, and choose a price. Your next sale starts with a simple listing.": {"uz": "10 tagacha rasm qo‘shing, buyumni tavsiflang va narx belgilang. Savdo oddiy e’londan boshlanadi.", "ko": "사진을 최대 10장 올리고, 물품을 설명하고, 가격을 정하세요. 간단한 게시글로 판매를 시작해 보세요."},
  "Sell locally.": {"uz": "Yaqinda soting.", "ko": "가까이서 팔아요."},
  "Make space.": {"uz": "Joy bo‘shating.", "ko": "공간을 비워요."},
  "We couldn’t save your country. Please try again.": {"uz": "Davlatni saqlab bo‘lmadi. Qayta urinib ko‘ring.", "ko": "국가를 저장하지 못했어요. 다시 시도해 주세요."},
  "Please log in again to choose your country.": {"uz": "Davlatni tanlash uchun qayta kiring.", "ko": "국가를 선택하려면 다시 로그인하세요."},
  "Choose your country to continue.": {"uz": "Davom etish uchun davlatni tanlang.", "ko": "계속하려면 국가를 선택하세요."},
  "All districts": {"uz": "Barcha tumanlar", "ko": "모든 시·군·구"},
  "District / city": {"uz": "Tuman / shahar", "ko": "시·군·구"},
  "Choose region": {"uz": "Viloyatni tanlang", "ko": "시·도를 선택하세요"},
  "Korea": {"uz": "Korea", "ko": "한국"},
  "You can change your country later in Change neighborhood.": {"uz": "Davlatni keyinchalik “Change neighborhood” bo‘limida o‘zgartirishingiz mumkin.", "ko": "나중에 동네 변경에서 국가를 바꿀 수 있어요."},
  "Confirm & continue": {"uz": "Tasdiqlash va davom etish", "ko": "확인하고 계속하기"},
  "Choose your country": {"uz": "Davlatingizni tanlang", "ko": "국가를 선택하세요"},
  "Choose your country to find great things nearby.": {"uz": "Yaqin atrofdagi yaxshi topilmalar uchun davlatingizni tanlang.", "ko": "주변의 좋은 물건을 찾으려면 국가를 선택하세요."},
  "Welcome to ZUNO": {"uz": "ZUNO’ga xush kelibsiz", "ko": "ZUNO에 오신 것을 환영합니다"},
  "Listing status": {"uz":"E’lon holati","ko":"게시글 상태"},
  "No listings with this status.": {"uz":"Bu holatda e’lonlar yo‘q.","ko":"해당 상태의 게시글이 없습니다."},
  "Likes and saves count people who still have this item liked or saved in the selected period. Messages count distinct buyers who sent a message.": {"uz": "Layk va saqlashlar tanlangan davrda qo‘shilib, hozir ham saqlangan belgilarni hisoblaydi. Xabarlar — xabar yuborgan alohida xaridorlar soni.", "ko": "좋아요와 저장 수는 선택 기간에 추가되어 현재 유지 중인 항목입니다. 문의 수는 메시지를 보낸 구매자 수입니다."},
  "Date": {"uz": "Sana", "ko": "날짜"},
  "View data table": {"uz": "Ma’lumotlar jadvalini ko‘rish", "ko": "데이터 표 보기"},
  "Daily view history starts when statistics tracking is enabled. Dates use UTC.": {"uz": "Kunlik ko‘rishlar tarixi statistika yoqilgandan boshlanadi. Sanalar UTC bo‘yicha.", "ko": "일별 조회 기록은 통계 수집을 시작한 시점부터 제공됩니다. 날짜는 UTC 기준입니다."},
  "Statistics are temporarily unavailable. Please try again.": {"uz": "Statistika vaqtincha mavjud emas. Qayta urinib ko‘ring.", "ko": "일시적으로 통계를 불러올 수 없습니다. 다시 시도해 주세요."},
  "Loading listing statistics…": {"uz": "E’lon statistikasi yuklanmoqda…", "ko": "게시글 통계를 불러오는 중…"},
  "Listed on": {"uz": "Joylangan sana", "ko": "등록일"},
  "Views over time": {"uz": "Vaqt bo‘yicha ko‘rishlar", "ko": "기간별 조회수"},
  "Saves": {"uz": "Saqlashlar", "ko": "저장 수"},
  "People messaged": {"uz": "Xabar yozganlar", "ko": "문의한 사람"},
  "Likes": {"uz": "Layklar", "ko": "좋아요"},
  "Views": {"uz": "Ko‘rishlar", "ko": "조회수"},
  "All time": {"uz": "Barcha vaqt", "ko": "전체 기간"},
  "30 days": {"uz": "30 kun", "ko": "30일"},
  "7 days": {"uz": "7 kun", "ko": "7일"},
  "Time period": {"uz": "Vaqt oralig‘i", "ko": "기간"},
  "Listing statistics": {"uz": "E’lon statistikasi", "ko": "게시글 통계"},
  "View statistics": {"uz": "Statistikani ko‘rish", "ko": "통계 보기"},
  "Language": {
    "uz": "Til",
    "ko": "언어"
  },
  "Language selected: {language}": {
    "uz": "Tanlangan til: {language}",
    "ko": "선택한 언어: {language}"
  },
  "Home": {
    "uz": "Bosh sahifa",
    "ko": "홈"
  },
  "Saved": {
    "uz": "Saqlanganlar",
    "ko": "관심 목록"
  },
  "Messages": {
    "uz": "Xabarlar",
    "ko": "메시지"
  },
  "Chats": {
    "uz": "Suhbatlar",
    "ko": "채팅"
  },
  "Sell": {
    "uz": "Sotish",
    "ko": "판매"
  },
  "Sell an Item": {
    "uz": "E’lon berish",
    "ko": "물건 판매하기"
  },
  "Sell an item": {
    "uz": "E’lon berish",
    "ko": "물건 판매하기"
  },
  "My ZUNO": {
    "uz": "Mening ZUNO",
    "ko": "나의 ZUNO"
  },
  "Account": {
    "uz": "Hisob",
    "ko": "계정"
  },
  "Log in": {
    "uz": "Kirish",
    "ko": "로그인"
  },
  "Log out": {
    "uz": "Chiqish",
    "ko": "로그아웃"
  },
  "Logging out…": {
    "uz": "Chiqilmoqda…",
    "ko": "로그아웃 중…"
  },
  "Your listings": {
    "uz": "Mening e’lonlarim",
    "ko": "내 판매 목록"
  },
  "Saved items": {
    "uz": "Saqlangan e’lonlar",
    "ko": "관심 상품"
  },
  "Profile settings": {
    "uz": "Profil sozlamalari",
    "ko": "프로필 설정"
  },
  "Safety & privacy": {
    "uz": "Xavfsizlik va maxfiylik",
    "ko": "안전 및 개인정보"
  },
  "Help center": {
    "uz": "Yordam markazi",
    "ko": "고객센터"
  },
  "Back to marketplace": {
    "uz": "Bozorga qaytish",
    "ko": "마켓으로 돌아가기"
  },
  "Buy · Sell · Connect Locally": {
    "uz": "Xarid qiling · Soting · Yaqinlar bilan bog‘laning",
    "ko": "우리 동네에서 사고 · 팔고 · 연결해요"
  },
  "All nearby": {
    "uz": "Barcha hududlar",
    "ko": "모든 지역"
  },
  "All regions": {
    "uz": "Barcha viloyatlar",
    "ko": "모든 시·도"
  },
  "Country": {
    "uz": "Davlat",
    "ko": "국가"
  },
  "Region": {
    "uz": "Viloyat",
    "ko": "시·도"
  },
  "Uzbekistan": {
    "uz": "O‘zbekiston",
    "ko": "우즈베키스탄"
  },
  "S. Korea": {
    "uz": "Janubiy Koreya",
    "ko": "대한민국"
  },
  "South Korea": {
    "uz": "Janubiy Koreya",
    "ko": "대한민국"
  },
  "Cities": {
    "uz": "Shaharlar",
    "ko": "광역시·특별시"
  },
  "Provinces": {
    "uz": "Viloyatlar",
    "ko": "도"
  },
  "Viloyatlar": {
    "uz": "Viloyatlar",
    "ko": "도"
  },
  "Alohida hududlar": {
    "uz": "Alohida hududlar",
    "ko": "특별 지역"
  },
  "Choose your local area": {
    "uz": "Hududingizni tanlang",
    "ko": "내 동네를 선택하세요"
  },
  "Choose your neighborhood": {
    "uz": "Mahallangizni tanlang",
    "ko": "내 동네를 선택하세요"
  },
  "Search second-hand listings": {
    "uz": "Ishlatilgan buyumlarni qidirish",
    "ko": "중고 물품 검색"
  },
  "Search for your next local find…": {
    "uz": "Yaqiningizdagi buyumlarni qidiring…",
    "ko": "우리 동네 물건을 검색해 보세요…"
  },
  "Clear search": {
    "uz": "Qidiruvni tozalash",
    "ko": "검색 지우기"
  },
  "Good finds.": {
    "uz": "Ajoyib topilmalar.",
    "ko": "좋은 물건."
  },
  "Great neighbors.": {
    "uz": "Yaxshi qo‘shnilar.",
    "ko": "좋은 이웃."
  },
  "Give pre-loved things a new beginning, right here in your neighborhood.": {
    "uz": "Ishlatilgan buyumlarga o‘z mahallangizda yangi hayot bering.",
    "ko": "우리 동네에서 중고 물건에 새로운 시작을 선물하세요."
  },
  "Explore nearby": {
    "uz": "Yaqindagilarni ko‘rish",
    "ko": "내 주변 둘러보기"
  },
  "All items": {
    "uz": "Barcha buyumlar",
    "ko": "전체"
  },
  "Electronics": {
    "uz": "Elektronika",
    "ko": "디지털 기기"
  },
  "Home & Living": {
    "uz": "Uy va turmush",
    "ko": "가구·생활"
  },
  "Fashion": {
    "uz": "Kiyim va moda",
    "ko": "패션"
  },
  "Sports": {
    "uz": "Sport",
    "ko": "스포츠"
  },
  "Books": {
    "uz": "Kitoblar",
    "ko": "도서"
  },
  "Other": {
    "uz": "Boshqa",
    "ko": "기타"
  },
  "Min price (": {
    "uz": "Eng arzon narx (",
    "ko": "최저 가격 ("
  },
  "Max price (": {
    "uz": "Eng yuqori narx (",
    "ko": "최고 가격 ("
  },
  "local currency": {
    "uz": "mahalliy valyuta",
    "ko": "현지 통화"
  },
  "Available only": {
    "uz": "Faqat sotuvdagilar",
    "ko": "판매 중인 상품만"
  },
  "Sort by": {
    "uz": "Saralash",
    "ko": "정렬"
  },
  "Newest first": {
    "uz": "Eng yangilari",
    "ko": "최신순"
  },
  "Price: low to high": {
    "uz": "Narx: arzondan qimmatga",
    "ko": "낮은 가격순"
  },
  "Price: high to low": {
    "uz": "Narx: qimmatdan arzonga",
    "ko": "높은 가격순"
  },
  "Clear filters": {
    "uz": "Filtrlarni tozalash",
    "ko": "필터 초기화"
  },
  "Choose a country to filter and sort prices in its local currency.": {
    "uz": "Narxlarni mahalliy valyutada saralash uchun davlatni tanlang.",
    "ko": "현지 통화로 가격을 검색하고 정렬하려면 국가를 선택하세요."
  },
  "Fresh finds nearby": {
    "uz": "Yaqiningizdagi yangi e’lonlar",
    "ko": "우리 동네 새 상품"
  },
  "Updating results…": {
    "uz": "Natijalar yangilanmoqda…",
    "ko": "검색 결과 업데이트 중…"
  },
  "Check filters": {
    "uz": "Filtrlarni tekshiring",
    "ko": "필터를 확인해 주세요"
  },
  "Updating nearby listings…": {
    "uz": "Yaqindagi e’lonlar yangilanmoqda…",
    "ko": "주변 상품 업데이트 중…"
  },
  "Retry search": {
    "uz": "Qayta qidirish",
    "ko": "다시 검색"
  },
  "No finds just yet": {
    "uz": "Hozircha e’lonlar yo‘q",
    "ko": "아직 상품이 없어요"
  },
  "Try another search, category, price, country, or region.": {
    "uz": "Boshqa so‘z, toifa, narx, davlat yoki hududni tanlang.",
    "ko": "검색어, 카테고리, 가격 또는 지역을 바꿔 보세요."
  },
  "Load more": {
    "uz": "Yana ko‘rish",
    "ko": "더 보기"
  },
  "Loading more…": {
    "uz": "Yuklanmoqda…",
    "ko": "더 불러오는 중…"
  },
  "You’ve reached the end of these results.": {
    "uz": "Barcha natijalar ko‘rsatildi.",
    "ko": "모든 검색 결과를 확인했어요."
  },
  "A little closer. A little more connected.": {
    "uz": "Yana ham yaqinroq. Yana ham hamjihat.",
    "ko": "조금 더 가깝게. 조금 더 따뜻하게."
  },
  "Your neighborhood marketplace": {
    "uz": "Mahallangiz bozori",
    "ko": "우리 동네 중고 마켓"
  },
  "Skip to listings": {
    "uz": "E’lonlarga o‘tish",
    "ko": "상품 목록으로 건너뛰기"
  },
  "Skip to listing": {
    "uz": "E’longa o‘tish",
    "ko": "상품으로 건너뛰기"
  },
  "Your neighborhood, your little corner.": {
    "uz": "O‘z mahallangiz, o‘zingizga yaqin maskan.",
    "ko": "우리 동네, 나만의 공간."
  },
  "Your profile": {
    "uz": "Mening profilim",
    "ko": "내 프로필"
  },
  "Edit profile": {
    "uz": "Profilni tahrirlash",
    "ko": "프로필 수정"
  },
  "Manage the items you’re selling.": {
    "uz": "Sotayotgan buyumlaringizni boshqaring.",
    "ko": "판매 중인 물건을 관리하세요."
  },
  "View the items you’ve saved for later.": {
    "uz": "Saqlab qo‘ygan buyumlaringizni ko‘ring.",
    "ko": "관심 상품을 확인하세요."
  },
  "Check your conversations with neighbors.": {
    "uz": "Qo‘shnilar bilan suhbatlaringizni ko‘ring.",
    "ko": "이웃과 나눈 대화를 확인하세요."
  },
  "Make room for something new.": {
    "uz": "Yangilikka joy oching.",
    "ko": "새로운 것을 위한 공간을 만드세요."
  },
  "Give your items a new home in your neighborhood.": {
    "uz": "Buyumlaringizga yaqin atrofda yangi egasini toping.",
    "ko": "우리 동네에서 물건의 새 주인을 찾아보세요."
  },
  "Your neighborhood": {
    "uz": "Mening mahallam",
    "ko": "내 동네"
  },
  "Good things happen close to home.": {
    "uz": "Yaxshiliklar yaqiningizda.",
    "ko": "좋은 일은 가까이에 있어요."
  },
  "Change neighborhood": {
    "uz": "Mahallani o‘zgartirish",
    "ko": "동네 변경"
  },
  "Help & more": {
    "uz": "Yordam va boshqalar",
    "ko": "도움말 및 더 보기"
  },
  "Public profile": {
    "uz": "Ommaviy profil",
    "ko": "공개 프로필"
  },
  "About ZUNO": {
    "uz": "ZUNO haqida",
    "ko": "ZUNO 소개"
  },
  "Community": {
    "uz": "Hamjamiyat",
    "ko": "동네 생활"
  },
  "Neighborhood posts": {
    "uz": "Mahalla yangiliklari",
    "ko": "동네 소식"
  },
  "See what’s happening nearby.": {
    "uz": "Yaqin atrofdagi yangiliklarni ko‘ring.",
    "ko": "우리 동네 소식을 확인하세요."
  },
  "Local events": {
    "uz": "Mahalliy tadbirlar",
    "ko": "동네 행사"
  },
  "Find events in your area.": {
    "uz": "Hududingizdagi tadbirlarni toping.",
    "ko": "주변 행사를 찾아보세요."
  },
  "Meetups": {
    "uz": "Uchrashuvlar",
    "ko": "모임"
  },
  "Connect with neighbors.": {
    "uz": "Qo‘shnilar bilan tanishing.",
    "ko": "이웃과 함께해요."
  },
  "Local services": {
    "uz": "Mahalliy xizmatlar",
    "ko": "동네 서비스"
  },
  "Local jobs": {
    "uz": "Yaqindagi ishlar",
    "ko": "동네 일자리"
  },
  "Discover opportunities nearby.": {
    "uz": "Yaqiningizdagi imkoniyatlarni toping.",
    "ko": "가까운 곳의 기회를 찾아보세요."
  },
  "Home services": {
    "uz": "Uy xizmatlari",
    "ko": "생활 서비스"
  },
  "Find help in your area.": {
    "uz": "Hududingizda yordam toping.",
    "ko": "주변의 도움을 찾아보세요."
  },
  "Neighborhood guide": {
    "uz": "Mahalla qo‘llanmasi",
    "ko": "동네 안내"
  },
  "Explore useful places nearby.": {
    "uz": "Yaqindagi foydali joylarni toping.",
    "ko": "주변의 유용한 장소를 둘러보세요."
  },
  "For business": {
    "uz": "Biznes uchun",
    "ko": "비즈니스"
  },
  "Business profile": {
    "uz": "Biznes profili",
    "ko": "비즈니스 프로필"
  },
  "Showcase your business locally.": {
    "uz": "Biznesingizni mahallada taniting.",
    "ko": "우리 동네에 사업을 소개하세요."
  },
  "Promote a listing": {
    "uz": "E’lonni targ‘ib qilish",
    "ko": "상품 홍보"
  },
  "Reach more neighbors.": {
    "uz": "Ko‘proq qo‘shnilarga yetib boring.",
    "ko": "더 많은 이웃을 만나보세요."
  },
  "Business insights": {
    "uz": "Biznes statistikasi",
    "ko": "비즈니스 통계"
  },
  "Learn about your audience.": {
    "uz": "Mijozlaringizni yaxshiroq biling.",
    "ko": "고객을 더 잘 알아보세요."
  },
  "Buying & selling": {
    "uz": "Xarid va sotuv",
    "ko": "구매 및 판매"
  },
  "Purchase history": {
    "uz": "Xaridlar tarixi",
    "ko": "구매 내역"
  },
  "View your past transactions.": {
    "uz": "Oldingi savdolaringizni ko‘ring.",
    "ko": "지난 거래를 확인하세요."
  },
  "Recently viewed": {
    "uz": "Yaqinda ko‘rilganlar",
    "ko": "최근 본 상품"
  },
  "See items you looked at.": {
    "uz": "Ko‘rgan buyumlaringizni qayta toping.",
    "ko": "최근 본 물건을 다시 확인하세요."
  },
  "Search alerts": {
    "uz": "Qidiruv bildirishnomalari",
    "ko": "키워드 알림"
  },
  "Get notified about new listings.": {
    "uz": "Yangi e’lonlar haqida xabar oling.",
    "ko": "새 상품 알림을 받아보세요."
  },
  "Preferences": {
    "uz": "Afzalliklar",
    "ko": "환경 설정"
  },
  "Notifications": {
    "uz": "Bildirishnomalar",
    "ko": "알림"
  },
  "Choose what you want to hear about.": {
    "uz": "Qaysi xabarlarni olishni tanlang.",
    "ko": "받고 싶은 알림을 선택하세요."
  },
  "Language & appearance": {
    "uz": "Til va ko‘rinish",
    "ko": "언어 및 화면"
  },
  "Set your language and theme.": {
    "uz": "Til va ko‘rinishni sozlang.",
    "ko": "언어와 화면을 설정하세요."
  },
  "Location verification": {
    "uz": "Joylashuvni tasdiqlash",
    "ko": "동네 인증"
  },
  "Help keep ZUNO safe and local.": {
    "uz": "ZUNO xavfsizligiga hissa qo‘shing.",
    "ko": "안전한 동네 거래를 함께 만들어요."
  },
  "Support": {
    "uz": "Qo‘llab-quvvatlash",
    "ko": "지원"
  },
  "Announcements": {
    "uz": "E’lon va yangiliklar",
    "ko": "공지사항"
  },
  "Get the latest updates from ZUNO.": {
    "uz": "ZUNO yangiliklaridan xabardor bo‘ling.",
    "ko": "ZUNO의 새 소식을 확인하세요."
  },
  "Feedback": {
    "uz": "Fikr bildirish",
    "ko": "의견 보내기"
  },
  "Share your ideas with us.": {
    "uz": "Fikrlaringizni biz bilan bo‘lishing.",
    "ko": "여러분의 의견을 알려주세요."
  },
  "Account & privacy": {
    "uz": "Hisob va maxfiylik",
    "ko": "계정 및 개인정보"
  },
  "Manage your account and data.": {
    "uz": "Hisobingiz va ma’lumotlaringizni boshqaring.",
    "ko": "계정과 정보를 관리하세요."
  },
  "Explore": {
    "uz": "Kashf eting",
    "ko": "둘러보기"
  },
  "More ways to connect with your neighborhood.": {
    "uz": "Mahallangiz bilan bog‘lanish uchun ko‘proq imkoniyatlar.",
    "ko": "이웃과 함께하는 더 많은 방법."
  },
  "Search ZUNO features": {
    "uz": "ZUNO imkoniyatlarini qidirish",
    "ko": "ZUNO 기능 검색"
  },
  "Coming soon": {
    "uz": "Tez kunda",
    "ko": "준비 중"
  },
  "No features found. Try another search.": {
    "uz": "Imkoniyat topilmadi. Boshqa so‘z bilan qidiring.",
    "ko": "기능을 찾지 못했어요. 다른 검색어를 입력해 보세요."
  },
  "Clear feature search": {
    "uz": "Qidiruvni tozalash",
    "ko": "기능 검색 지우기"
  },
  "This feature is planned for ZUNO. It isn’t available yet. You can already browse, sell, save items, and chat with neighbors.": {
    "uz": "Bu imkoniyat hali tayyorlanmoqda. Hozircha e’lonlarni ko‘rish, sotish, saqlash va qo‘shnilar bilan yozishish mumkin.",
    "ko": "이 기능은 준비 중이에요. 지금도 상품 둘러보기, 판매, 관심 등록, 이웃과의 채팅을 이용할 수 있어요."
  },
  "Your place in the ZUNO neighborhood.": {
    "uz": "ZUNO mahallasidagi o‘z joyingiz.",
    "ko": "ZUNO 동네 속 나의 공간."
  },
  "Display name": {
    "uz": "Ko‘rinadigan ism",
    "ko": "닉네임"
  },
  "Email": {
    "uz": "Email",
    "ko": "이메일"
  },
  "Email address": {
    "uz": "Email manzili",
    "ko": "이메일 주소"
  },
  "Neighborhood": {
    "uz": "Mahalla",
    "ko": "동네"
  },
  "Neighborhood not selected": {
    "uz": "Mahalla tanlanmagan",
    "ko": "동네 미선택"
  },
  "Neighborhood not shared": {
    "uz": "Mahalla ko‘rsatilmagan",
    "ko": "동네 정보 비공개"
  },
  "Not selected": {
    "uz": "Tanlanmagan",
    "ko": "선택 안 됨"
  },
  "Not shared": {
    "uz": "Ko‘rsatilmagan",
    "ko": "공개 안 됨"
  },
  "View public profile": {
    "uz": "Ommaviy profilni ko‘rish",
    "ko": "공개 프로필 보기"
  },
  "Use 2–40 characters. Save profile updates your display name.": {
    "uz": "2–40 ta belgi kiriting. Saqlash orqali ismingiz yangilanadi.",
    "ko": "2~40자로 입력하세요. 저장하면 닉네임이 변경돼요."
  },
  "Cancel": {
    "uz": "Bekor qilish",
    "ko": "취소"
  },
  "Save profile": {
    "uz": "Profilni saqlash",
    "ko": "프로필 저장"
  },
  "Save neighborhood": {
    "uz": "Mahallani saqlash",
    "ko": "동네 저장"
  },
  "Saving…": {
    "uz": "Saqlanmoqda…",
    "ko": "저장 중…"
  },
  "Change email": {
    "uz": "Emailni o‘zgartirish",
    "ko": "이메일 변경"
  },
  "Current email:": {
    "uz": "Joriy email:",
    "ko": "현재 이메일:"
  },
  "Requesting…": {
    "uz": "So‘rov yuborilmoqda…",
    "ko": "요청 중…"
  },
  ". A new address may need email confirmation.": {
    "uz": ". Yangi manzil email orqali tasdiqlanishi mumkin.",
    "ko": ". 새 주소는 이메일 인증이 필요할 수 있어요."
  },
  "Choose a public profile photo. JPG, PNG or WebP, up to 3 MB. It uploads after selection.": {
    "uz": "Profil uchun JPG, PNG yoki WebP rasm tanlang, 3 MB gacha. Tanlagandan so‘ng yuklanadi.",
    "ko": "공개 프로필 사진을 선택하세요. JPG, PNG, WebP, 최대 3MB. 선택하면 업로드돼요."
  },
  "Uploading profile photo…": {
    "uz": "Profil rasmi yuklanmoqda…",
    "ko": "프로필 사진 업로드 중…"
  },
  "Add profile photo": {
    "uz": "Profil rasmini qo‘shish",
    "ko": "프로필 사진 추가"
  },
  "Change profile photo": {
    "uz": "Profil rasmini o‘zgartirish",
    "ko": "프로필 사진 변경"
  },
  "Your saved finds, ready when you are. Removed listings are hidden.": {
    "uz": "Saqlangan buyumlaringiz shu yerda. O‘chirilgan e’lonlar ko‘rsatilmaydi.",
    "ko": "관심 상품을 모아두었어요. 삭제된 상품은 표시되지 않아요."
  },
  "Saved items are temporarily unavailable": {
    "uz": "Saqlangan e’lonlar vaqtincha ochilmayapti",
    "ko": "관심 상품을 일시적으로 불러올 수 없어요"
  },
  "Retry saved items": {
    "uz": "Qayta yuklash",
    "ko": "관심 상품 다시 불러오기"
  },
  "Browse local finds": {
    "uz": "Yaqindagi e’lonlarni ko‘rish",
    "ko": "동네 상품 둘러보기"
  },
  "Your listings are temporarily unavailable": {
    "uz": "E’lonlaringiz vaqtincha ochilmayapti",
    "ko": "내 판매 목록을 일시적으로 불러올 수 없어요"
  },
  "You have no listings yet.": {
    "uz": "Hali e’lon bermagansiz.",
    "ko": "아직 등록한 상품이 없어요."
  },
  "Showing your latest": {
    "uz": "Oxirgi e’lonlar:",
    "ko": "최근 상품"
  },
  "listing": {
    "uz": "e’lon",
    "ko": "개 상품"
  },
  "listings": {
    "uz": "e’lon",
    "ko": "개 상품"
  },
  "Available": {
    "uz": "Sotuvda",
    "ko": "판매 중"
  },
  "Reserved": {
    "uz": "Band qilingan",
    "ko": "예약 중"
  },
  "Sold": {
    "uz": "Sotilgan",
    "ko": "판매 완료"
  },
  "Mark reserved": {
    "uz": "Band deb belgilash",
    "ko": "예약 중으로 변경"
  },
  "Mark sold": {
    "uz": "Sotildi deb belgilash",
    "ko": "판매 완료로 변경"
  },
  "Edit item details": {
    "uz": "E’lonni tahrirlash",
    "ko": "상품 정보 수정"
  },
  "Remove item": {
    "uz": "E’lonni o‘chirish",
    "ko": "상품 삭제"
  },
  "This hides the item and its photos from the marketplace.": {
    "uz": "Bu e’lon va rasmlarini bozordan yashiradi.",
    "ko": "상품과 사진이 마켓에서 숨겨져요."
  },
  "Confirm removal of this item": {
    "uz": "E’lonni o‘chirishni tasdiqlayman",
    "ko": "상품 삭제 확인"
  },
  "Item details and photos": {
    "uz": "Buyum tafsilotlari va rasmlari",
    "ko": "상품 정보 및 사진"
  },
  "Title": {
    "uz": "Sarlavha",
    "ko": "제목"
  },
  "Price (": {
    "uz": "Narx (",
    "ko": "가격 ("
  },
  "Condition": {
    "uz": "Holati",
    "ko": "상태"
  },
  "Choose condition": {
    "uz": "Holatini tanlang",
    "ko": "상태 선택"
  },
  "Like new": {
    "uz": "Yangidek",
    "ko": "거의 새것"
  },
  "Good": {
    "uz": "Yaxshi",
    "ko": "좋음"
  },
  "Used": {
    "uz": "Ishlatilgan",
    "ko": "사용감 있음"
  },
  "Category": {
    "uz": "Toifa",
    "ko": "카테고리"
  },
  "Choose category": {
    "uz": "Toifani tanlang",
    "ko": "카테고리 선택"
  },
  "Description": {
    "uz": "Tavsif",
    "ko": "설명"
  },
  "Save changes": {
    "uz": "O‘zgarishlarni saqlash",
    "ko": "변경 사항 저장"
  },
  "Saving changes…": {
    "uz": "O‘zgarishlar saqlanmoqda…",
    "ko": "변경 사항 저장 중…"
  },
  "Add photos": {
    "uz": "Rasm qo‘shish",
    "ko": "사진 추가"
  },
  "Add 1–10 JPG, PNG or WebP photos, up to 10 MB each. Photos are optimized before upload. The first photo is the cover.": {
    "uz": "1–10 ta JPG, PNG yoki WebP rasm qo‘shing, har biri 10 MB gacha. Rasmlar yuklashdan oldin optimallashtiriladi. Birinchi rasm muqova bo‘ladi.",
    "ko": "JPG, PNG, WebP 사진 1~10장, 장당 최대 10MB. 업로드 전에 최적화돼요. 첫 사진이 대표 사진이에요."
  },
  "Make cover": {
    "uz": "Muqova qilish",
    "ko": "대표 사진으로 설정"
  },
  "Cover": {
    "uz": "Muqova",
    "ko": "대표"
  },
  "Cover photo": {
    "uz": "Muqova rasmi",
    "ko": "대표 사진"
  },
  "Remove": {
    "uz": "O‘chirish",
    "ko": "삭제"
  },
  "Choose country": {
    "uz": "Davlatni tanlang",
    "ko": "국가 선택"
  },
  "Choose country first": {
    "uz": "Avval davlatni tanlang",
    "ko": "국가를 먼저 선택하세요"
  },
  "Choose your area": {
    "uz": "Hududingizni tanlang",
    "ko": "지역 선택"
  },
  "Region / neighborhood": {
    "uz": "Viloyat / mahalla",
    "ko": "지역 / 동네"
  },
  "Choose your country, then your area. Share your neighborhood, not your exact address.": {
    "uz": "Avval davlatni, keyin hududni tanlang. Aniq manzilingizni emas, mahallangizni ko‘rsating.",
    "ko": "국가를 선택한 후 지역을 선택하세요. 정확한 주소 대신 동네만 알려주세요."
  },
  "Neighborhoods for this country are being prepared.": {
    "uz": "Bu davlat hududlari tayyorlanmoqda.",
    "ko": "이 국가의 지역 정보를 준비 중이에요."
  },
  "Posting in this country is being prepared.": {
    "uz": "Bu davlatda e’lon berish tayyorlanmoqda.",
    "ko": "이 국가의 상품 등록을 준비 중이에요."
  },
  "Changing country changes the price currency. Enter the appropriate amount; prices are not converted.": {
    "uz": "Davlat o‘zgarsa valyuta ham o‘zgaradi. Mos narxni kiriting; narx avtomatik aylantirilmaydi.",
    "ko": "국가를 변경하면 통화도 변경돼요. 가격은 환산되지 않으니 알맞은 금액을 입력하세요."
  },
  "Find it a new home": {
    "uz": "Buyumingizga yangi egasini toping",
    "ko": "새 주인을 찾아주세요"
  },
  "Share a few details with your neighbors.": {
    "uz": "Buyum haqida qo‘shnilaringizga aytib bering.",
    "ko": "이웃에게 물건을 소개해 주세요."
  },
  "Use 0 if you’re giving it away. Currency follows the selected country; amounts are not converted.": {
    "uz": "Bepul bersangiz 0 kiriting. Valyuta davlatga mos bo‘ladi; narx aylantirilmaydi.",
    "ko": "무료 나눔은 0을 입력하세요. 통화는 국가에 따라 바뀌며 가격은 환산되지 않아요."
  },
  "Share your neighborhood, not your home address or phone number.": {
    "uz": "Uy manzili yoki telefon raqamingizni emas, mahallangizni ko‘rsating.",
    "ko": "집 주소나 전화번호 대신 동네만 알려주세요."
  },
  "Your listing and photos will be visible to other visitors when published.": {
    "uz": "E’lon berilgach, buyum va rasmlar boshqalarga ko‘rinadi.",
    "ko": "등록하면 상품과 사진이 다른 사람에게 공개돼요."
  },
  "Publish item": {
    "uz": "E’lonni joylash",
    "ko": "상품 등록"
  },
  "Publishing your item…": {
    "uz": "E’lon joylanmoqda…",
    "ko": "상품 등록 중…"
  },
  "Uploading photos and saving your listing. Please keep this page open.": {
    "uz": "Rasmlar yuklanmoqda va e’lon saqlanmoqda. Sahifani yopmang.",
    "ko": "사진 업로드 및 상품 저장 중이에요. 페이지를 열어 두세요."
  },
  "Mention its condition, what’s included, and pickup arrangements.": {
    "uz": "Holati, to‘plami va olib ketish shartlarini yozing.",
    "ko": "상태, 구성품, 거래 방법을 알려주세요."
  },
  "E.g. IKEA wooden chair, like new": {
    "uz": "Masalan: yog‘och stul, yangidek",
    "ko": "예: 거의 새것인 원목 의자"
  },
  "About this item": {
    "uz": "Buyum haqida",
    "ko": "상품 소개"
  },
  "Availability": {
    "uz": "Mavjudligi",
    "ko": "판매 상태"
  },
  "Meet nearby": {
    "uz": "Yaqin atrofda uchrashing",
    "ko": "가까운 곳에서 만나요"
  },
  "Local pickup": {
    "uz": "Olib ketish",
    "ko": "직거래"
  },
  "Local pickup · Inspect the item before exchanging.": {
    "uz": "Olib ketish · Savdodan oldin buyumni tekshiring.",
    "ko": "직거래 · 거래 전에 물건을 확인하세요."
  },
  "Pickup in": {
    "uz": "Olib ketish hududi",
    "ko": "거래 지역"
  },
  "Contact seller": {
    "uz": "Sotuvchiga yozish",
    "ko": "판매자에게 연락"
  },
  "Opening chat…": {
    "uz": "Suhbat ochilmoqda…",
    "ko": "채팅 여는 중…"
  },
  "Save item": {
    "uz": "Saqlash",
    "ko": "관심 등록"
  },
  "Save this find to your account.": {
    "uz": "Buyumni hisobingizga saqlang.",
    "ko": "계정에 관심 상품을 저장하세요."
  },
  "Saved to your account.": {
    "uz": "Hisobingizga saqlandi.",
    "ko": "관심 상품으로 저장했어요."
  },
  "Save a sample for this visit.": {
    "uz": "Namuna shu tashrif uchun saqlanadi.",
    "ko": "이번 방문 동안 샘플을 저장하세요."
  },
  "Sample saved for this visit.": {
    "uz": "Namuna shu tashrif uchun saqlandi.",
    "ko": "이번 방문 동안 샘플을 저장했어요."
  },
  "This item has been sold.": {
    "uz": "Bu buyum sotilgan.",
    "ko": "판매 완료된 상품이에요."
  },
  "This item is reserved.": {
    "uz": "Bu buyum band qilingan.",
    "ko": "예약 중인 상품이에요."
  },
  "Exchange": {
    "uz": "Savdo",
    "ko": "거래"
  },
  "Report this listing": {
    "uz": "E’lon ustidan shikoyat",
    "ko": "상품 신고"
  },
  "View profile": {
    "uz": "Profilni ko‘rish",
    "ko": "프로필 보기"
  },
  "· View profile": {
    "uz": "· Profilni ko‘rish",
    "ko": "· 프로필 보기"
  },
  "Local seller": {
    "uz": "Mahalliy sotuvchi",
    "ko": "동네 판매자"
  },
  "Nearby": {
    "uz": "Yaqin atrof",
    "ko": "내 주변"
  },
  "Sample listing · Explore the demo. No purchases or messages are sent.": {
    "uz": "Namuna e’lon · Sinab ko‘ring. Xarid va xabarlar yuborilmaydi.",
    "ko": "샘플 상품 · 둘러보세요. 실제 구매나 메시지는 전송되지 않아요."
  },
  "Sample listings · Demo marketplace": {
    "uz": "Namuna e’lonlar · Sinov bozori",
    "ko": "샘플 상품 · 체험 마켓"
  },
  "Messaging is coming soon. No message has been sent. You can save this item for now.": {
    "uz": "Xabarlar tez kunda. Xabar yuborilmadi. Hozircha buyumni saqlashingiz mumkin.",
    "ko": "메시지 기능을 준비 중이에요. 메시지는 전송되지 않았어요. 관심 상품으로 저장해 두세요."
  },
  "Messaging is coming soon. This is a sample seller and no message will be sent.": {
    "uz": "Xabarlar tez kunda. Bu namuna sotuvchi, xabar yuborilmaydi.",
    "ko": "메시지 기능을 준비 중이에요. 샘플 판매자이므로 메시지가 전송되지 않아요."
  },
  ". Agree on a public meeting place and inspect the item before exchanging. Exact addresses are not displayed.": {
    "uz": ". Jamoat joyida uchrashib, buyumni tekshiring. Aniq manzillar ko‘rsatilmaydi.",
    "ko": ". 공공장소에서 만나 물건을 확인하세요. 정확한 주소는 표시되지 않아요."
  },
  "A little closer, one message at a time.": {
    "uz": "Har bir xabar bilan yanada yaqinroq.",
    "ko": "메시지 하나로 조금 더 가까워져요."
  },
  "Search conversations": {
    "uz": "Suhbatlarni qidirish",
    "ko": "대화 검색"
  },
  "All": {
    "uz": "Barchasi",
    "ko": "전체"
  },
  "Unread": {
    "uz": "O‘qilmagan",
    "ko": "안 읽음"
  },
  "Unread status unavailable": {
    "uz": "O‘qilganlik holati mavjud emas",
    "ko": "읽음 상태를 확인할 수 없어요"
  },
  "View all conversations while unread counts reconnect.": {
    "uz": "Hisoblar tiklanguncha barcha suhbatlarni ko‘ring.",
    "ko": "읽지 않은 메시지 수를 다시 확인하는 동안 모든 대화를 보세요."
  },
  "View all conversations": {
    "uz": "Barcha suhbatlar",
    "ko": "모든 대화 보기"
  },
  "Open the conversation": {
    "uz": "Suhbatni ochish",
    "ko": "대화 열기"
  },
  "No matching conversations": {
    "uz": "Mos suhbatlar topilmadi",
    "ko": "검색된 대화가 없어요"
  },
  "No conversations yet": {
    "uz": "Hali suhbatlar yo‘q",
    "ko": "아직 대화가 없어요"
  },
  "Try another search or view all conversations.": {
    "uz": "Boshqa so‘z bilan qidiring yoki barcha suhbatlarni ko‘ring.",
    "ko": "다른 검색어를 입력하거나 모든 대화를 확인하세요."
  },
  "Find an item you like and contact its seller.": {
    "uz": "Yoqtirgan buyumingizni topib, sotuvchiga yozing.",
    "ko": "마음에 드는 상품의 판매자에게 연락해 보세요."
  },
  "Explore marketplace": {
    "uz": "Bozorni ko‘rish",
    "ko": "마켓 둘러보기"
  },
  "Choose a conversation to share photos, send files and make plans with a neighbor.": {
    "uz": "Rasm, fayl yuborish va qo‘shni bilan kelishish uchun suhbatni tanlang.",
    "ko": "사진과 파일을 보내고 이웃과 약속을 잡으려면 대화를 선택하세요."
  },
  "Live messages connected.": {
    "uz": "Xabarlar jonli yangilanmoqda.",
    "ko": "실시간 메시지가 연결됐어요."
  },
  "Connecting to live messages. Updates are also checked automatically.": {
    "uz": "Jonli xabarlarga ulanmoqda. Yangilanishlar avtomatik ham tekshiriladi.",
    "ko": "실시간 메시지 연결 중이에요. 새 메시지도 자동으로 확인해요."
  },
  "Load older messages": {
    "uz": "Oldingi xabarlarni ko‘rish",
    "ko": "이전 메시지 불러오기"
  },
  "Say hello to your neighbor.": {
    "uz": "Qo‘shningizga salom ayting.",
    "ko": "이웃에게 인사해 보세요."
  },
  "You": {
    "uz": "Siz",
    "ko": "나"
  },
  "View larger ↗": {
    "uz": "Kattalashtirish ↗",
    "ko": "크게 보기 ↗"
  },
  "Messaging is unavailable between you and this user. You can still read previous messages.": {
    "uz": "Bu foydalanuvchi bilan yozishib bo‘lmaydi. Oldingi xabarlarni o‘qish mumkin.",
    "ko": "이 사용자와 메시지를 주고받을 수 없어요. 이전 메시지는 읽을 수 있어요."
  },
  "Photo and file sharing is being prepared. Text messages still work.": {
    "uz": "Rasm va fayl yuborish tayyorlanmoqda. Matnli xabarlar ishlaydi.",
    "ko": "사진 및 파일 공유를 준비 중이에요. 텍스트 메시지는 사용할 수 있어요."
  },
  "Sending your message…": {
    "uz": "Xabar yuborilmoqda…",
    "ko": "메시지 전송 중…"
  },
  "Your message": {
    "uz": "Xabaringiz",
    "ko": "메시지"
  },
  "Write a message…": {
    "uz": "Xabar yozing…",
    "ko": "메시지를 입력하세요…"
  },
  "Photo": {
    "uz": "Rasm",
    "ko": "사진"
  },
  "File": {
    "uz": "Fayl",
    "ko": "파일"
  },
  "Photos up to 10 MB · Files up to 3 MB": {
    "uz": "Rasmlar 10 MB gacha · Fayllar 3 MB gacha",
    "ko": "사진 최대 10MB · 파일 최대 3MB"
  },
  "Up to 4 attachments · 3 MB total after photo preparation": {
    "uz": "4 tagacha ilova · Tayyorlangandan so‘ng jami 3 MB",
    "ko": "첨부 최대 4개 · 사진 최적화 후 총 3MB"
  },
  "Send message": {
    "uz": "Xabar yuborish",
    "ko": "메시지 보내기"
  },
  "Attach files": {
    "uz": "Fayl biriktirish",
    "ko": "파일 첨부"
  },
  "Add attachment": {
    "uz": "Ilova qo‘shish",
    "ko": "첨부 추가"
  },
  "Photos": {
    "uz": "Rasmlar",
    "ko": "사진"
  },
  "Welcome back": {
    "uz": "Xush kelibsiz",
    "ko": "다시 오셨네요"
  },
  "Log in to your ZUNO neighborhood.": {
    "uz": "ZUNO mahallangizga kiring.",
    "ko": "ZUNO 동네에 로그인하세요."
  },
  "Create an account": {
    "uz": "Hisob yaratish",
    "ko": "계정 만들기"
  },
  "Join your ZUNO neighborhood.": {
    "uz": "ZUNO mahallasiga qo‘shiling.",
    "ko": "ZUNO 동네에 함께하세요."
  },
  "Create account": {
    "uz": "Hisob yaratish",
    "ko": "가입하기"
  },
  "Continue with Google": {
    "uz": "Google orqali davom etish",
    "ko": "Google로 계속하기"
  },
  "Connecting to Google…": {
    "uz": "Google’ga ulanmoqda…",
    "ko": "Google에 연결 중…"
  },
  "or continue with email": {
    "uz": "yoki email orqali",
    "ko": "또는 이메일로 계속하기"
  },
  "Password": {
    "uz": "Parol",
    "ko": "비밀번호"
  },
  "Use at least 8 characters.": {
    "uz": "Kamida 8 ta belgi kiriting.",
    "ko": "8자 이상 입력하세요."
  },
  "Please wait…": {
    "uz": "Biroz kuting…",
    "ko": "잠시만 기다려 주세요…"
  },
  "New to ZUNO?": {
    "uz": "ZUNO’da yangimisiz?",
    "ko": "ZUNO가 처음이신가요?"
  },
  "Already a neighbor?": {
    "uz": "Hisobingiz bormi?",
    "ko": "이미 이웃이신가요?"
  },
  "Log in again": {
    "uz": "Qayta kirish",
    "ko": "다시 로그인"
  },
  "We couldn’t complete sign-in. Please try again with Google or use your email and password.": {
    "uz": "Kirish amalga oshmadi. Google orqali qayta urinib ko‘ring yoki email va paroldan foydalaning.",
    "ko": "로그인하지 못했어요. Google로 다시 시도하거나 이메일과 비밀번호를 사용하세요."
  },
  "Please log in to access your account.": {
    "uz": "Hisobingizga kirish uchun tizimga kiring.",
    "ko": "계정을 이용하려면 로그인하세요."
  },
  "Loading…": {
    "uz": "Yuklanmoqda…",
    "ko": "불러오는 중…"
  },
  "Loading your account…": {
    "uz": "Hisobingiz yuklanmoqda…",
    "ko": "계정 불러오는 중…"
  },
  "Loading your listings…": {
    "uz": "E’lonlaringiz yuklanmoqda…",
    "ko": "내 상품 불러오는 중…"
  },
  "Loading your messages…": {
    "uz": "Xabarlar yuklanmoqda…",
    "ko": "메시지 불러오는 중…"
  },
  "Loading saved items…": {
    "uz": "Saqlanganlar yuklanmoqda…",
    "ko": "관심 상품 불러오는 중…"
  },
  "Loading safety controls…": {
    "uz": "Xavfsizlik sozlamalari yuklanmoqda…",
    "ko": "안전 설정 불러오는 중…"
  },
  "Loading your local find…": {
    "uz": "E’lon yuklanmoqda…",
    "ko": "상품 불러오는 중…"
  },
  "Getting your listing form ready…": {
    "uz": "E’lon shakli tayyorlanmoqda…",
    "ko": "상품 등록 양식 준비 중…"
  },
  "Getting the listing ready.": {
    "uz": "E’lon tayyorlanmoqda.",
    "ko": "상품 준비 중이에요."
  },
  "Back to browsing": {
    "uz": "Ko‘rishga qaytish",
    "ko": "둘러보기로 돌아가기"
  },
  "Return to ZUNO": {
    "uz": "ZUNO’ga qaytish",
    "ko": "ZUNO로 돌아가기"
  },
  "Go back": {
    "uz": "Orqaga",
    "ko": "뒤로"
  },
  "Go to homepage": {
    "uz": "Bosh sahifaga",
    "ko": "홈으로"
  },
  "Page navigation": {
    "uz": "Sahifa navigatsiyasi",
    "ko": "페이지 탐색"
  },
  "Main navigation": {
    "uz": "Asosiy menyu",
    "ko": "주 메뉴"
  },
  "Marketplace": {
    "uz": "Bozor",
    "ko": "마켓"
  },
  "Marketplace categories": {
    "uz": "Bozor toifalari",
    "ko": "마켓 카테고리"
  },
  "Quick actions": {
    "uz": "Tezkor amallar",
    "ko": "빠른 작업"
  },
  "Page not found": {
    "uz": "Sahifa topilmadi",
    "ko": "페이지를 찾을 수 없어요"
  },
  "Listing not found": {
    "uz": "E’lon topilmadi",
    "ko": "상품을 찾을 수 없어요"
  },
  "This listing may have moved, or the link may be incorrect.": {
    "uz": "E’lon o‘chirilgan yoki havola noto‘g‘ri bo‘lishi mumkin.",
    "ko": "상품이 이동했거나 링크가 올바르지 않을 수 있어요."
  },
  "This item may no longer be available.": {
    "uz": "Bu buyum endi mavjud bo‘lmasligi mumkin.",
    "ko": "더 이상 구매할 수 없는 상품일 수 있어요."
  },
  "This page is unavailable.": {
    "uz": "Bu sahifa mavjud emas.",
    "ko": "이 페이지를 사용할 수 없어요."
  },
  "This page is temporarily unavailable": {
    "uz": "Sahifa vaqtincha ochilmayapti",
    "ko": "페이지를 일시적으로 사용할 수 없어요"
  },
  "We couldn’t load this page": {
    "uz": "Sahifani yuklab bo‘lmadi",
    "ko": "페이지를 불러오지 못했어요"
  },
  "We couldn’t load this find": {
    "uz": "E’lonni yuklab bo‘lmadi",
    "ko": "상품을 불러오지 못했어요"
  },
  "Your profile is temporarily unavailable": {
    "uz": "Profil vaqtincha ochilmayapti",
    "ko": "프로필을 일시적으로 불러올 수 없어요"
  },
  "Posting is temporarily unavailable": {
    "uz": "E’lon berish vaqtincha ishlamayapti",
    "ko": "상품 등록을 일시적으로 사용할 수 없어요"
  },
  "Posting is being prepared. Please try again later.": {
    "uz": "E’lon berish tayyorlanmoqda. Keyinroq urinib ko‘ring.",
    "ko": "상품 등록을 준비 중이에요. 나중에 다시 시도해 주세요."
  },
  "Messages are temporarily unavailable": {
    "uz": "Xabarlar vaqtincha ochilmayapti",
    "ko": "메시지를 일시적으로 불러올 수 없어요"
  },
  "Please try again, or head back to the marketplace.": {
    "uz": "Qayta urinib ko‘ring yoki bozorga qayting.",
    "ko": "다시 시도하거나 마켓으로 돌아가세요."
  },
  "Please try again in a moment.": {
    "uz": "Birozdan keyin qayta urinib ko‘ring.",
    "ko": "잠시 후 다시 시도해 주세요."
  },
  "Please try again shortly.": {
    "uz": "Birozdan keyin qayta urinib ko‘ring.",
    "ko": "잠시 후 다시 시도해 주세요."
  },
  "Try again": {
    "uz": "Qayta urinish",
    "ko": "다시 시도"
  },
  "Retry": {
    "uz": "Qayta urinish",
    "ko": "다시 시도"
  },
  "Updates will retry automatically.": {
    "uz": "Yangilanishlar avtomatik qayta tekshiriladi.",
    "ko": "자동으로 업데이트를 다시 시도해요."
  },
  "That confirmation link is invalid or expired. Try logging in, or request a new confirmation email from registration.": {
    "uz": "Tasdiqlash havolasi noto‘g‘ri yoki eskirgan. Kiring yoki yangi tasdiqlash xati so‘rang.",
    "ko": "인증 링크가 올바르지 않거나 만료됐어요. 로그인하거나 새 인증 메일을 요청하세요."
  },
  "Active listings": {
    "uz": "Sotuvdagi e’lonlar",
    "ko": "판매 중인 상품"
  },
  "No active listings right now.": {
    "uz": "Hozircha sotuvdagi e’lonlar yo‘q.",
    "ko": "현재 판매 중인 상품이 없어요."
  },
  "Your ZUNO neighbor": {
    "uz": "ZUNO qo‘shningiz",
    "ko": "ZUNO 이웃"
  },
  "Safety tools": {
    "uz": "Xavfsizlik vositalari",
    "ko": "안전 도구"
  },
  "Manage blocked users and follow your listing reports.": {
    "uz": "Bloklanganlarni boshqaring va shikoyatlaringizni kuzating.",
    "ko": "차단한 사용자와 상품 신고 내역을 관리하세요."
  },
  "Open moderation queue": {
    "uz": "Moderatsiyani ochish",
    "ko": "신고 관리 열기"
  },
  "Blocked users": {
    "uz": "Bloklanganlar",
    "ko": "차단한 사용자"
  },
  "Blocking stops new chats and messages in both directions. Previous messages and public listings remain visible.": {
    "uz": "Bloklash ikki tomonga ham yangi xabarlarni to‘xtatadi. Oldingi xabarlar va e’lonlar ko‘rinadi.",
    "ko": "차단하면 서로 새 채팅과 메시지를 보낼 수 없어요. 이전 메시지와 공개 상품은 계속 보여요."
  },
  "You haven’t blocked anyone.": {
    "uz": "Hali hech kimni bloklamagansiz.",
    "ko": "아직 차단한 사용자가 없어요."
  },
  "Unblock user": {
    "uz": "Blokdan chiqarish",
    "ko": "차단 해제"
  },
  "Your reports": {
    "uz": "Shikoyatlarim",
    "ko": "내 신고 내역"
  },
  "Latest 100 reports. Reporting does not automatically remove an item.": {
    "uz": "Oxirgi 100 ta shikoyat. Shikoyat e’lonni avtomatik o‘chirmaydi.",
    "ko": "최근 신고 100건이에요. 신고만으로 상품이 자동 삭제되지 않아요."
  },
  "No reports submitted.": {
    "uz": "Shikoyatlar yuborilmagan.",
    "ko": "접수한 신고가 없어요."
  },
  "Listing report": {
    "uz": "E’lon shikoyati",
    "ko": "상품 신고"
  },
  "Awaiting review": {
    "uz": "Ko‘rib chiqilmoqda",
    "ko": "검토 대기"
  },
  "Listing hidden": {
    "uz": "E’lon yashirildi",
    "ko": "상품 숨김"
  },
  "Reviewed — no removal": {
    "uz": "Ko‘rib chiqildi — o‘chirilmagan",
    "ko": "검토 완료 — 유지"
  },
  "Safety tools unavailable": {
    "uz": "Xavfsizlik vositalari mavjud emas",
    "ko": "안전 도구를 사용할 수 없어요"
  },
  "We couldn’t load your safety settings. Try again shortly.": {
    "uz": "Xavfsizlik sozlamalari yuklanmadi. Birozdan keyin urinib ko‘ring.",
    "ko": "안전 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
  },
  "View your reports": {
    "uz": "Shikoyatlarni ko‘rish",
    "ko": "신고 내역 보기"
  },
  "Block user": {
    "uz": "Foydalanuvchini bloklash",
    "ko": "사용자 차단"
  },
  "Block this user": {
    "uz": "Bu foydalanuvchini bloklash",
    "ko": "이 사용자 차단"
  },
  "Block": {
    "uz": "Bloklash",
    "ko": "차단"
  },
  "Manage blocked user": {
    "uz": "Bloklangan foydalanuvchini boshqarish",
    "ko": "차단한 사용자 관리"
  },
  "Blocking stops new messages in both directions. Existing messages and public listings remain visible.": {
    "uz": "Bloklash ikki tomonga ham yangi xabarlarni to‘xtatadi. Oldingi xabar va e’lonlar ko‘rinadi.",
    "ko": "차단하면 서로 새 메시지를 보낼 수 없어요. 이전 메시지와 공개 상품은 계속 보여요."
  },
  "Reason": {
    "uz": "Sabab",
    "ko": "사유"
  },
  "Choose a reason": {
    "uz": "Sababni tanlang",
    "ko": "사유 선택"
  },
  "Details (optional)": {
    "uz": "Tafsilotlar (ixtiyoriy)",
    "ko": "상세 내용 (선택)"
  },
  "Describe the concern. Avoid sharing passwords, payment details or home addresses.": {
    "uz": "Muammoni tushuntiring. Parol, to‘lov ma’lumoti yoki uy manzilini yozmang.",
    "ko": "문제를 설명하세요. 비밀번호, 결제 정보, 집 주소는 공유하지 마세요."
  },
  "Submit report": {
    "uz": "Shikoyat yuborish",
    "ko": "신고 제출"
  },
  "Submitting…": {
    "uz": "Yuborilmoqda…",
    "ko": "제출 중…"
  },
  "and stop messages between us": {
    "uz": "va o‘zaro xabarlarni to‘xtatish",
    "ko": "및 서로 메시지 차단"
  },
  "Moderation queue": {
    "uz": "Moderatsiya navbati",
    "ko": "신고 관리"
  },
  "Oldest 100 open reports. Review the concern before deciding; hiding an item prevents its owner from restoring it.": {
    "uz": "Eng eski 100 ta ochiq shikoyat. Qarordan oldin tekshiring; yashirilgan e’lonni egasi tiklay olmaydi.",
    "ko": "접수순 미처리 신고 100건이에요. 내용을 검토한 후 결정하세요. 숨긴 상품은 판매자가 복구할 수 없어요."
  },
  "No reports awaiting review.": {
    "uz": "Kutilayotgan shikoyatlar yo‘q.",
    "ko": "검토 대기 중인 신고가 없어요."
  },
  "Review report": {
    "uz": "Shikoyatni tekshirish",
    "ko": "신고 검토"
  },
  "View listing": {
    "uz": "E’lonni ko‘rish",
    "ko": "상품 보기"
  },
  "No additional details.": {
    "uz": "Qo‘shimcha tafsilotlar yo‘q.",
    "ko": "추가 내용이 없어요."
  },
  "Confirm hiding this listing from the marketplace": {
    "uz": "E’lonni bozordan yashirishni tasdiqlash",
    "ko": "마켓에서 상품 숨기기 확인"
  },
  "Hide listing": {
    "uz": "E’lonni yashirish",
    "ko": "상품 숨기기"
  },
  "Dismiss report": {
    "uz": "Shikoyatni rad etish",
    "ko": "신고 종결"
  },
  "Saving review…": {
    "uz": "Natija saqlanmoqda…",
    "ko": "검토 내용 저장 중…"
  },
  "View item": {
    "uz": "Buyumni ko‘rish",
    "ko": "상품 보기"
  },
  "· Reported by": {
    "uz": "· Shikoyatchi",
    "ko": "· 신고자"
  },
  "Safety tips & help": {
    "uz": "Xavfsizlik maslahatlari",
    "ko": "안전 거래 도움말"
  },
  "How can we help?": {
    "uz": "Qanday yordam beramiz?",
    "ko": "무엇을 도와드릴까요?"
  },
  "How do I sell an item?": {
    "uz": "Qanday e’lon beraman?",
    "ko": "물건을 어떻게 판매하나요?"
  },
  "Sign in, select Sell an Item, add photos and a description, choose your neighborhood, and publish your listing. Manage it from Your listings.": {
    "uz": "Hisobga kiring, E’lon berish tugmasini bosing, rasm va tavsif qo‘shing, hududni tanlab e’lonni joylang. Mening e’lonlarim bo‘limidan boshqaring.",
    "ko": "로그인 후 물건 판매하기를 눌러 사진과 설명을 추가하고 동네를 선택해 등록하세요. 내 판매 목록에서 관리할 수 있어요."
  },
  "How do I contact a seller?": {
    "uz": "Sotuvchiga qanday yozaman?",
    "ko": "판매자에게 어떻게 연락하나요?"
  },
  "Open a listing and start a conversation. Your messages are available in Chats.": {
    "uz": "E’lonni ochib suhbat boshlang. Xabarlar Suhbatlar bo‘limida bo‘ladi.",
    "ko": "상품을 열고 대화를 시작하세요. 메시지는 채팅에서 확인할 수 있어요."
  },
  "How can I trade safely?": {
    "uz": "Qanday xavfsiz savdo qilaman?",
    "ko": "안전하게 거래하려면 어떻게 하나요?"
  },
  "Meet in a public place, inspect the item before paying, and keep your personal information private.": {
    "uz": "Jamoat joyida uchrashing, to‘lashdan oldin buyumni tekshiring va shaxsiy ma’lumotlarni sir tuting.",
    "ko": "공공장소에서 만나 결제 전에 물건을 확인하고 개인정보를 보호하세요."
  },
  "What does Coming soon mean?": {
    "uz": "Tez kunda nimani anglatadi?",
    "ko": "준비 중은 무슨 뜻인가요?"
  },
  "These menus preview planned features. They do not yet save preferences, send alerts, or provide services.": {
    "uz": "Bu menyular rejalashtirilgan imkoniyatlarni ko‘rsatadi. Hali sozlamalarni saqlamaydi yoki xizmat ko‘rsatmaydi.",
    "ko": "예정된 기능을 미리 보여주는 메뉴예요. 아직 설정 저장, 알림 전송, 서비스 제공은 하지 않아요."
  },
  "ZUNO is a neighborhood marketplace for buying and selling second-hand items in Uzbekistan and South Korea.": {
    "uz": "ZUNO — Uzbekistan va Koreada ishlatilgan buyumlarni mahalliy sotib olish va sotish bozori.",
    "ko": "ZUNO는 우즈베키스탄과 한국에서 중고 물품을 사고파는 동네 마켓입니다."
  },
  "{count} finds shown": {
    "uz": "{count} ta e’lon ko‘rsatildi",
    "ko": "상품 {count}개 표시"
  },
  "{count} saved": {
    "uz": "{count} ta saqlangan",
    "ko": "관심 상품 {count}개"
  },
  "{count} conversations shown.": {
    "uz": "{count} ta suhbat ko‘rsatildi.",
    "ko": "대화 {count}개 표시."
  },
  "{count} messages loaded.": {
    "uz": "{count} ta xabar yuklandi.",
    "ko": "메시지 {count}개 불러옴."
  },
  "{count} planned features found.": {
    "uz": "{count} ta rejalashtirilgan imkoniyat topildi.",
    "ko": "예정된 기능 {count}개 찾음."
  },
  "{count} views": {
    "uz": "{count} marta ko‘rilgan",
    "ko": "조회 {count}회"
  },
  "{count} people messaged": {
    "uz": "{count} kishi yozgan",
    "ko": "채팅 {count}명"
  },
  "{count} people sent a message": {
    "uz": "{count} kishi xabar yuborgan",
    "ko": "{count}명이 메시지를 보냈어요"
  },
  "Listing activity": {
    "uz": "E’lon faolligi",
    "ko": "상품 활동"
  },
  "{feature} — coming soon": {
    "uz": "{feature} — tez kunda",
    "ko": "{feature} — 준비 중"
  },
  "Conversation filters": {
    "uz": "Suhbat filtrlari",
    "ko": "대화 필터"
  },
  "Profile saved.": {
    "uz": "Profil saqlandi.",
    "ko": "프로필을 저장했어요."
  },
  "Neighborhood saved.": {
    "uz": "Mahalla saqlandi.",
    "ko": "동네를 저장했어요."
  },
  "Edit": {
    "uz": "Tahrirlash",
    "ko": "수정"
  },
  "ZUNO home": {
    "uz": "ZUNO bosh sahifa",
    "ko": "ZUNO 홈"
  },
  "Back to messages": {
    "uz": "Xabarlarga qaytish",
    "ko": "메시지로 돌아가기"
  },
  "Conversation options": {
    "uz": "Suhbat sozlamalari",
    "ko": "대화 옵션"
  },
  "Meet your neighborhood": {
    "uz": "Mahallangiz bilan tanishing",
    "ko": "우리 동네를 만나보세요"
  },
  "How neighbors will know you": {
    "uz": "Qo‘shnilarga qanday ko‘rinasiz",
    "ko": "이웃에게 보여줄 이름"
  },
  "Saved items notification": {
    "uz": "Saqlanganlar bildirishnomasi",
    "ko": "관심 상품 알림"
  },
  "Dismiss notification": {
    "uz": "Bildirishnomani yopish",
    "ko": "알림 닫기"
  },
  "What are you selling?": {
    "uz": "Nima sotyapsiz?",
    "ko": "어떤 물건을 판매하나요?"
  },
  "Item photos": {
    "uz": "Buyum rasmlari",
    "ko": "상품 사진"
  },
  "Breadcrumb": {
    "uz": "Sahifa yo‘li",
    "ko": "탐색 경로"
  },
  "Listing photos": {
    "uz": "E’lon rasmlari",
    "ko": "상품 사진"
  },
  "No product photo": {
    "uz": "Buyum rasmi yo‘q",
    "ko": "상품 사진 없음"
  },
  "Remove photo": {
    "uz": "Rasmni o‘chirish",
    "ko": "사진 삭제"
  },
  "A wooden chair, plant, lamp and vintage camera ready for a new home": {
    "uz": "Yangi uyga tayyor stul, gul, chiroq va kamera",
    "ko": "새 주인을 기다리는 의자, 화분, 조명과 카메라"
  },
  "Conversation messages": {
    "uz": "Suhbat xabarlari",
    "ko": "대화 메시지"
  },
  "Message history": {
    "uz": "Xabarlar tarixi",
    "ko": "메시지 기록"
  },
  "Sent": {
    "uz": "Yuborildi",
    "ko": "전송됨"
  },
  "Selected attachments": {
    "uz": "Tanlangan ilovalar",
    "ko": "선택한 첨부 파일"
  },
  "Attach photos or files": {
    "uz": "Rasm yoki fayl biriktirish",
    "ko": "사진 또는 파일 첨부"
  },
  "Choose photos": {
    "uz": "Rasmlarni tanlash",
    "ko": "사진 선택"
  },
  "Choose chat photos": {
    "uz": "Suhbat rasmlarini tanlash",
    "ko": "채팅 사진 선택"
  },
  "Choose chat files": {
    "uz": "Suhbat fayllarini tanlash",
    "ko": "채팅 파일 선택"
  },
  "Messages navigation": {
    "uz": "Xabarlar menyusi",
    "ko": "메시지 메뉴"
  },
  "Conversations": {
    "uz": "Suhbatlar",
    "ko": "대화"
  },
  "Selected conversation": {
    "uz": "Tanlangan suhbat",
    "ko": "선택한 대화"
  },
  "Conversation preview": {
    "uz": "Suhbat ko‘rinishi",
    "ko": "대화 미리보기"
  },
  "Choose a profile photo": {
    "uz": "Profil rasmini tanlash",
    "ko": "프로필 사진 선택"
  },
  "Dismiss photo notification": {
    "uz": "Rasm bildirishnomasini yopish",
    "ko": "사진 알림 닫기"
  },
  "Sending message": {
    "uz": "Xabar yuborilmoqda",
    "ko": "메시지 전송 중"
  },
  "Suspected scam": {
    "uz": "Firibgarlik gumoni",
    "ko": "사기 의심"
  },
  "Prohibited item": {
    "uz": "Taqiqlangan buyum",
    "ko": "거래 금지 물품"
  },
  "Misleading listing": {
    "uz": "Chalg‘ituvchi e’lon",
    "ko": "잘못된 상품 정보"
  },
  "Duplicate or spam": {
    "uz": "Takroriy e’lon yoki spam",
    "ko": "중복 또는 스팸"
  },
  "Other concern": {
    "uz": "Boshqa muammo",
    "ko": "기타 문제"
  },
  "Changes saved.": {
    "uz": "O‘zgarishlar saqlandi.",
    "ko": "변경 사항을 저장했어요."
  },
  "Profile updated.": {
    "uz": "Profil yangilandi.",
    "ko": "프로필을 수정했어요."
  },
  "Neighborhood updated.": {
    "uz": "Mahalla yangilandi.",
    "ko": "동네를 변경했어요."
  },
  "Profile photo updated.": {
    "uz": "Profil rasmi yangilandi.",
    "ko": "프로필 사진을 변경했어요."
  },
  "Email updated.": {
    "uz": "Email yangilandi.",
    "ko": "이메일을 변경했어요."
  },
  "This is already your current email.": {
    "uz": "Bu allaqachon joriy emailingiz.",
    "ko": "이미 사용 중인 이메일이에요."
  },
  "Check your email inboxes to confirm the change. Your current address stays until confirmation.": {
    "uz": "O‘zgarishni tasdiqlash uchun emailingizni tekshiring. Tasdiqlanguncha joriy manzil saqlanadi.",
    "ko": "이메일을 확인해 변경을 인증하세요. 인증 전까지 현재 주소가 유지돼요."
  },
  "Enter a valid email address.": {
    "uz": "To‘g‘ri email manzilini kiriting.",
    "ko": "올바른 이메일 주소를 입력하세요."
  },
  "Please log in again to change your email.": {
    "uz": "Emailni o‘zgartirish uchun qayta kiring.",
    "ko": "이메일을 변경하려면 다시 로그인하세요."
  },
  "Please wait a little before trying again.": {
    "uz": "Qayta urinishdan oldin biroz kuting.",
    "ko": "잠시 기다린 후 다시 시도해 주세요."
  },
  "We couldn’t request the email change. Please try again.": {
    "uz": "Emailni o‘zgartirish so‘rovi yuborilmadi. Qayta urinib ko‘ring.",
    "ko": "이메일 변경을 요청하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t connect. Please try again.": {
    "uz": "Ulanib bo‘lmadi. Qayta urinib ko‘ring.",
    "ko": "연결하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t connect right now. Please try again shortly.": {
    "uz": "Hozir ulanib bo‘lmadi. Birozdan keyin urinib ko‘ring.",
    "ko": "지금 연결하지 못했어요. 잠시 후 다시 시도해 주세요."
  },
  "Please log in again to update your profile.": {
    "uz": "Profilni yangilash uchun qayta kiring.",
    "ko": "프로필을 수정하려면 다시 로그인하세요."
  },
  "Please log in again to update your neighborhood.": {
    "uz": "Mahallani yangilash uchun qayta kiring.",
    "ko": "동네를 변경하려면 다시 로그인하세요."
  },
  "Choose a neighborhood from the list.": {
    "uz": "Ro‘yxatdan mahallani tanlang.",
    "ko": "목록에서 동네를 선택하세요."
  },
  "Choose a neighborhood from this country.": {
    "uz": "Tanlangan davlatdagi mahallani tanlang.",
    "ko": "선택한 국가의 동네를 선택하세요."
  },
  "Choose your neighborhood.": {
    "uz": "Mahallangizni tanlang.",
    "ko": "내 동네를 선택하세요."
  },
  "Choose a country first.": {
    "uz": "Avval davlatni tanlang.",
    "ko": "국가를 먼저 선택하세요."
  },
  "We couldn’t check the neighborhood. Please try again.": {
    "uz": "Mahallani tekshirib bo‘lmadi. Qayta urinib ko‘ring.",
    "ko": "동네를 확인하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t save your name. Please try again.": {
    "uz": "Ism saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "닉네임을 저장하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t save your neighborhood. Please try again.": {
    "uz": "Mahalla saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "동네를 저장하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t save your profile. Please try again.": {
    "uz": "Profil saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "프로필을 저장하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t connect. Your changes have been kept.": {
    "uz": "Ulanib bo‘lmadi. O‘zgarishlaringiz saqlab turildi.",
    "ko": "연결하지 못했어요. 작성한 내용은 유지돼요."
  },
  "We couldn’t connect. Your selection has been kept.": {
    "uz": "Ulanib bo‘lmadi. Tanlovingiz saqlab turildi.",
    "ko": "연결하지 못했어요. 선택한 내용은 유지돼요."
  },
  "Check your display name.": {
    "uz": "Ismingizni tekshiring.",
    "ko": "닉네임을 확인하세요."
  },
  "Check your profile details.": {
    "uz": "Profil ma’lumotlarini tekshiring.",
    "ko": "프로필 정보를 확인하세요."
  },
  "Choose a display name between 2 and 40 characters.": {
    "uz": "2–40 ta belgidan iborat ism kiriting.",
    "ko": "닉네임은 2~40자로 입력하세요."
  },
  "Choose a JPG, PNG or WebP photo up to 3 MB.": {
    "uz": "3 MB gacha JPG, PNG yoki WebP rasm tanlang.",
    "ko": "최대 3MB의 JPG, PNG, WebP 사진을 선택하세요."
  },
  "Choose a photo up to 3 MB.": {
    "uz": "3 MB gacha rasm tanlang.",
    "ko": "최대 3MB의 사진을 선택하세요."
  },
  "Profile photos are temporarily unavailable. Please try again later.": {
    "uz": "Profil rasmlari vaqtincha ishlamayapti. Keyinroq urinib ko‘ring.",
    "ko": "프로필 사진을 일시적으로 사용할 수 없어요. 나중에 다시 시도해 주세요."
  },
  "We couldn’t upload the photo. Please try again.": {
    "uz": "Rasm yuklanmadi. Qayta urinib ko‘ring.",
    "ko": "사진을 업로드하지 못했어요. 다시 시도해 주세요."
  },
  "Your profile changed while uploading. Please refresh and try again.": {
    "uz": "Yuklash paytida profil o‘zgardi. Sahifani yangilab qayta urinib ko‘ring.",
    "ko": "업로드 중 프로필이 변경됐어요. 새로고침 후 다시 시도해 주세요."
  },
  "Your profile is temporarily unavailable. Please try again.": {
    "uz": "Profil vaqtincha ochilmayapti. Qayta urinib ko‘ring.",
    "ko": "프로필을 일시적으로 불러올 수 없어요. 다시 시도해 주세요."
  },
  "We couldn’t connect. Your photo has been kept for retry.": {
    "uz": "Ulanib bo‘lmadi. Rasm qayta urinish uchun saqlab turildi.",
    "ko": "연결하지 못했어요. 다시 시도할 수 있도록 사진은 유지돼요."
  },
  "Confirm your email using the link in your inbox, then log in.": {
    "uz": "Emaildagi havola orqali tasdiqlang, keyin kiring.",
    "ko": "이메일의 링크로 인증한 후 로그인하세요."
  },
  "Login failed. Check your email and password, or try again shortly.": {
    "uz": "Kirish amalga oshmadi. Email va parolni tekshiring yoki keyinroq urinib ko‘ring.",
    "ko": "로그인하지 못했어요. 이메일과 비밀번호를 확인하거나 잠시 후 다시 시도하세요."
  },
  "Use at least 8 characters for your password.": {
    "uz": "Parol uchun kamida 8 ta belgi kiriting.",
    "ko": "비밀번호는 8자 이상 입력하세요."
  },
  "Enter a password of up to 128 characters.": {
    "uz": "128 ta belgigacha parol kiriting.",
    "ko": "비밀번호는 최대 128자로 입력하세요."
  },
  "We couldn’t complete registration. Try again later, or log in if you already have an account.": {
    "uz": "Ro‘yxatdan o‘tib bo‘lmadi. Keyinroq urinib ko‘ring yoki mavjud hisobga kiring.",
    "ko": "가입하지 못했어요. 나중에 다시 시도하거나 기존 계정으로 로그인하세요."
  },
  "Check your inbox for a confirmation link. If this address already has an account, you can log in instead.": {
    "uz": "Tasdiqlash havolasi uchun emailingizni tekshiring. Hisobingiz bo‘lsa, kirishingiz mumkin.",
    "ko": "인증 링크가 담긴 이메일을 확인하세요. 이미 계정이 있다면 로그인하세요."
  },
  "We couldn’t start Google sign-in. Please try again or use email.": {
    "uz": "Google orqali kirish boshlanmadi. Qayta urinib ko‘ring yoki emaildan foydalaning.",
    "ko": "Google 로그인을 시작하지 못했어요. 다시 시도하거나 이메일을 사용하세요."
  },
  "We couldn’t start Google sign-in. Please try again.": {
    "uz": "Google orqali kirish boshlanmadi. Qayta urinib ko‘ring.",
    "ko": "Google 로그인을 시작하지 못했어요. 다시 시도해 주세요."
  },
  "Google sign-in is unavailable right now. Please try again or use email.": {
    "uz": "Google orqali kirish vaqtincha ishlamayapti. Qayta urinib ko‘ring yoki emaildan foydalaning.",
    "ko": "지금 Google 로그인을 사용할 수 없어요. 다시 시도하거나 이메일을 사용하세요."
  },
  "We couldn’t log you out. Please try again.": {
    "uz": "Chiqib bo‘lmadi. Qayta urinib ko‘ring.",
    "ko": "로그아웃하지 못했어요. 다시 시도해 주세요."
  },
  "Log in to save items to your account.": {
    "uz": "Buyumlarni saqlash uchun hisobga kiring.",
    "ko": "관심 상품을 저장하려면 로그인하세요."
  },
  "Item saved to your account.": {
    "uz": "Buyum hisobingizga saqlandi.",
    "ko": "관심 상품으로 저장했어요."
  },
  "Item removed from saved items.": {
    "uz": "Buyum saqlanganlardan olindi.",
    "ko": "관심 상품에서 삭제했어요."
  },
  "Sample items are saved only for this visit.": {
    "uz": "Namuna buyumlar faqat shu tashrif uchun saqlanadi.",
    "ko": "샘플 상품은 이번 방문 동안만 저장돼요."
  },
  "We couldn’t update saved items. Please try again.": {
    "uz": "Saqlanganlar yangilanmadi. Qayta urinib ko‘ring.",
    "ko": "관심 상품을 변경하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t save your change. Please try again.": {
    "uz": "O‘zgarish saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "변경 사항을 저장하지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t check your saved items. Retry loading them first.": {
    "uz": "Saqlanganlar tekshirilmadi. Avval ularni qayta yuklang.",
    "ko": "관심 상품을 확인하지 못했어요. 먼저 다시 불러오세요."
  },
  "Saved items are temporarily unavailable. Please try again.": {
    "uz": "Saqlanganlar vaqtincha ochilmayapti. Qayta urinib ko‘ring.",
    "ko": "관심 상품을 일시적으로 불러올 수 없어요. 다시 시도해 주세요."
  },
  "Updating saved items…": {
    "uz": "Saqlanganlar yangilanmoqda…",
    "ko": "관심 상품 업데이트 중…"
  },
  "Listings are temporarily unavailable. Please try again.": {
    "uz": "E’lonlar vaqtincha ochilmayapti. Qayta urinib ko‘ring.",
    "ko": "상품을 일시적으로 불러올 수 없어요. 다시 시도해 주세요."
  },
  "Listings could not be loaded. Please try again.": {
    "uz": "E’lonlar yuklanmadi. Qayta urinib ko‘ring.",
    "ko": "상품을 불러오지 못했어요. 다시 시도해 주세요."
  },
  "Could not load listings. Please try again.": {
    "uz": "E’lonlar yuklanmadi. Qayta urinib ko‘ring.",
    "ko": "상품을 불러오지 못했어요. 다시 시도해 주세요."
  },
  "Could not load more listings.": {
    "uz": "Ko‘proq e’lon yuklanmadi.",
    "ko": "추가 상품을 불러오지 못했어요."
  },
  "We couldn’t reach the marketplace. Please check your connection and try again.": {
    "uz": "Bozorga ulanib bo‘lmadi. Internetni tekshirib qayta urinib ko‘ring.",
    "ko": "마켓에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도하세요."
  },
  "We couldn’t reach the marketplace. Please try again.": {
    "uz": "Bozorga ulanib bo‘lmadi. Qayta urinib ko‘ring.",
    "ko": "마켓에 연결하지 못했어요. 다시 시도해 주세요."
  },
  "Search is too long.": {
    "uz": "Qidiruv juda uzun.",
    "ko": "검색어가 너무 길어요."
  },
  "Minimum price must not exceed maximum price.": {
    "uz": "Eng arzon narx eng yuqori narxdan oshmasin.",
    "ko": "최저 가격은 최고 가격보다 높을 수 없어요."
  },
  "Enter whole prices between 0 and 1,000,000,000,000.": {
    "uz": "0 dan 1 000 000 000 000 gacha butun narx kiriting.",
    "ko": "0~1,000,000,000,000 사이의 정수 가격을 입력하세요."
  },
  "Results changed. Refresh the search and try again.": {
    "uz": "Natijalar o‘zgardi. Qidiruvni yangilab qayta urinib ko‘ring.",
    "ko": "검색 결과가 변경됐어요. 새로고침 후 다시 시도해 주세요."
  },
  "Loading conversation…": {
    "uz": "Suhbat yuklanmoqda…",
    "ko": "대화 불러오는 중…"
  },
  "Loading messages…": {
    "uz": "Xabarlar yuklanmoqda…",
    "ko": "메시지 불러오는 중…"
  },
  "Loading moderation queue…": {
    "uz": "Moderatsiya yuklanmoqda…",
    "ko": "신고 목록 불러오는 중…"
  },
  "Loading nearby listings…": {
    "uz": "Yaqindagi e’lonlar yuklanmoqda…",
    "ko": "주변 상품 불러오는 중…"
  },
  "Loading neighbor…": {
    "uz": "Qo‘shni profili yuklanmoqda…",
    "ko": "이웃 프로필 불러오는 중…"
  },
  "Loading safety settings…": {
    "uz": "Xavfsizlik sozlamalari yuklanmoqda…",
    "ko": "안전 설정 불러오는 중…"
  },
  "Loading this local find…": {
    "uz": "E’lon yuklanmoqda…",
    "ko": "상품 불러오는 중…"
  },
  "Create a ZUNO account with your email.": {
    "uz": "Email orqali ZUNO hisobi yarating.",
    "ko": "이메일로 ZUNO 계정을 만드세요."
  },
  "Choose valid files.": {
    "uz": "To‘g‘ri fayllarni tanlang.",
    "ko": "올바른 파일을 선택하세요."
  },
  "Choose valid photos.": {
    "uz": "To‘g‘ri rasmlarni tanlang.",
    "ko": "올바른 사진을 선택하세요."
  },
  "Choose a valid listing.": {
    "uz": "To‘g‘ri e’lonni tanlang.",
    "ko": "올바른 상품을 선택하세요."
  },
  "Please log in again.": {
    "uz": "Qayta kiring.",
    "ko": "다시 로그인하세요."
  },
  "Please log in again to send messages.": {
    "uz": "Xabar yuborish uchun qayta kiring.",
    "ko": "메시지를 보내려면 다시 로그인하세요."
  },
  "Please log in again to read messages.": {
    "uz": "Xabarlarni o‘qish uchun qayta kiring.",
    "ko": "메시지를 읽으려면 다시 로그인하세요."
  },
  "Write a message between 1 and 2,000 characters.": {
    "uz": "1–2000 ta belgidan iborat xabar yozing.",
    "ko": "메시지는 1~2,000자로 입력하세요."
  },
  "Check your message.": {
    "uz": "Xabaringizni tekshiring.",
    "ko": "메시지를 확인하세요."
  },
  "Messaging is unavailable between you and this user. Your draft has been kept.": {
    "uz": "Bu foydalanuvchi bilan yozishib bo‘lmaydi. Xabaringiz saqlab turildi.",
    "ko": "이 사용자와 메시지를 주고받을 수 없어요. 작성한 메시지는 유지돼요."
  },
  "We couldn’t send your message. Please try again.": {
    "uz": "Xabar yuborilmadi. Qayta urinib ko‘ring.",
    "ko": "메시지를 보내지 못했어요. 다시 시도해 주세요."
  },
  "We couldn’t connect. Your message has been kept.": {
    "uz": "Ulanib bo‘lmadi. Xabaringiz saqlab turildi.",
    "ko": "연결하지 못했어요. 작성한 메시지는 유지돼요."
  },
  "We couldn’t confirm delivery. Retry to send safely; your draft has been kept.": {
    "uz": "Yetkazilgani tasdiqlanmadi. Xabaringiz saqlab turildi; qayta urinib ko‘ring.",
    "ko": "전송을 확인하지 못했어요. 작성한 메시지는 유지되니 다시 시도하세요."
  },
  "We couldn’t refresh messages. Please try again.": {
    "uz": "Xabarlar yangilanmadi. Qayta urinib ko‘ring.",
    "ko": "메시지를 새로 불러오지 못했어요. 다시 시도해 주세요."
  },
  "Messages could not be loaded. Please try again.": {
    "uz": "Xabarlar yuklanmadi. Qayta urinib ko‘ring.",
    "ko": "메시지를 불러오지 못했어요. 다시 시도해 주세요."
  },
  "Could not load older messages. Please try again.": {
    "uz": "Oldingi xabarlar yuklanmadi. Qayta urinib ko‘ring.",
    "ko": "이전 메시지를 불러오지 못했어요. 다시 시도해 주세요."
  },
  "Read status could not be saved. It will retry shortly.": {
    "uz": "O‘qilganlik saqlanmadi. Tez orada qayta tekshiriladi.",
    "ko": "읽음 상태를 저장하지 못했어요. 곧 다시 시도해요."
  },
  "Chat is temporarily unavailable. Please try again.": {
    "uz": "Suhbat vaqtincha ishlamayapti. Qayta urinib ko‘ring.",
    "ko": "채팅을 일시적으로 사용할 수 없어요. 다시 시도해 주세요."
  },
  "This item is unavailable for a new conversation, or it’s your own listing.": {
    "uz": "Bu buyum uchun yangi suhbat ochib bo‘lmaydi yoki e’lon sizniki.",
    "ko": "새 대화를 시작할 수 없는 상품이거나 본인의 상품이에요."
  },
  "Message sent. Refresh to see the latest messages.": {
    "uz": "Xabar yuborildi. Yangilarini ko‘rish uchun yangilang.",
    "ko": "메시지를 보냈어요. 새로고침해 최신 메시지를 확인하세요."
  },
  "Could not upload your files. Please try again.": {
    "uz": "Fayllar yuklanmadi. Qayta urinib ko‘ring.",
    "ko": "파일을 업로드하지 못했어요. 다시 시도해 주세요."
  },
  "Files could not be sent. Please retry.": {
    "uz": "Fayllar yuborilmadi. Qayta urinib ko‘ring.",
    "ko": "파일을 보내지 못했어요. 다시 시도해 주세요."
  },
  "Could not confirm delivery. Your files have been kept. Please retry.": {
    "uz": "Yetkazilgani tasdiqlanmadi. Fayllar saqlab turildi. Qayta urinib ko‘ring.",
    "ko": "전송을 확인하지 못했어요. 파일은 유지되니 다시 시도하세요."
  },
  "Photo and file sharing is temporarily unavailable. Your files have been kept.": {
    "uz": "Rasm va fayl yuborish vaqtincha ishlamayapti. Fayllaringiz saqlab turildi.",
    "ko": "사진 및 파일 공유를 일시적으로 사용할 수 없어요. 파일은 유지돼요."
  },
  "Choose up to 4 photos or files.": {
    "uz": "4 tagacha rasm yoki fayl tanlang.",
    "ko": "사진 또는 파일을 최대 4개 선택하세요."
  },
  "Send up to 3 MB of files at a time.": {
    "uz": "Bir martada 3 MB gacha fayl yuboring.",
    "ko": "한 번에 최대 3MB의 파일을 보내세요."
  },
  "Choose photos up to 10 MB.": {
    "uz": "10 MB gacha rasm tanlang.",
    "ko": "최대 10MB의 사진을 선택하세요."
  },
  "Choose files up to 3 MB.": {
    "uz": "3 MB gacha fayl tanlang.",
    "ko": "최대 3MB의 파일을 선택하세요."
  },
  "Empty files cannot be sent.": {
    "uz": "Bo‘sh fayllarni yuborib bo‘lmaydi.",
    "ko": "빈 파일은 보낼 수 없어요."
  },
  "Choose a PDF, TXT, CSV, ZIP, DOCX or XLSX file.": {
    "uz": "PDF, TXT, CSV, ZIP, DOCX yoki XLSX fayl tanlang.",
    "ko": "PDF, TXT, CSV, ZIP, DOCX, XLSX 파일을 선택하세요."
  },
  "We couldn’t publish your item. Please try again; your form has been kept.": {
    "uz": "E’lon joylanmadi. Ma’lumotlar saqlab turildi; qayta urinib ko‘ring.",
    "ko": "상품을 등록하지 못했어요. 입력한 내용은 유지되니 다시 시도하세요."
  },
  "We couldn’t confirm the listing. Please try again.": {
    "uz": "E’lonni tasdiqlab bo‘lmadi. Qayta urinib ko‘ring.",
    "ko": "상품을 확인하지 못했어요. 다시 시도해 주세요."
  },
  "Please log in before posting an item.": {
    "uz": "E’lon berishdan oldin hisobga kiring.",
    "ko": "상품을 등록하려면 로그인하세요."
  },
  "Posting is temporarily unavailable. Please try again later.": {
    "uz": "E’lon berish vaqtincha ishlamayapti. Keyinroq urinib ko‘ring.",
    "ko": "상품 등록을 일시적으로 사용할 수 없어요. 나중에 다시 시도해 주세요."
  },
  "Please reload the form and try again.": {
    "uz": "Shaklni yangilab qayta urinib ko‘ring.",
    "ko": "양식을 새로고침한 후 다시 시도하세요."
  },
  "Use a title between 3 and 120 characters.": {
    "uz": "3–120 ta belgidan iborat sarlavha kiriting.",
    "ko": "제목은 3~120자로 입력하세요."
  },
  "Use a description between 10 and 5,000 characters.": {
    "uz": "10–5000 ta belgidan iborat tavsif kiriting.",
    "ko": "설명은 10~5,000자로 입력하세요."
  },
  "Enter a whole price between 0 and 1,000,000,000,000.": {
    "uz": "0 dan 1 000 000 000 000 gacha butun narx kiriting.",
    "ko": "0~1,000,000,000,000 사이의 정수 가격을 입력하세요."
  },
  "Choose a category and neighborhood.": {
    "uz": "Toifa va mahallani tanlang.",
    "ko": "카테고리와 동네를 선택하세요."
  },
  "Choose the item’s condition.": {
    "uz": "Buyum holatini tanlang.",
    "ko": "상품 상태를 선택하세요."
  },
  "Choose between 1 and 10 photos.": {
    "uz": "1–10 ta rasm tanlang.",
    "ko": "사진을 1~10장 선택하세요."
  },
  "Choose up to 10 photos in total.": {
    "uz": "Jami 10 tagacha rasm tanlang.",
    "ko": "사진을 총 10장까지 선택하세요."
  },
  "Use JPG, PNG or WebP photos up to 10 MB each.": {
    "uz": "Har biri 10 MB gacha JPG, PNG yoki WebP rasm tanlang.",
    "ko": "장당 최대 10MB의 JPG, PNG, WebP 사진을 사용하세요."
  },
  "Use still JPG, PNG or WebP photos.": {
    "uz": "Harakatsiz JPG, PNG yoki WebP rasmlar tanlang.",
    "ko": "움직이지 않는 JPG, PNG, WebP 사진을 사용하세요."
  },
  "One of the photos could not be read. Choose still JPG, PNG or WebP images.": {
    "uz": "Rasmlardan biri o‘qilmadi. Harakatsiz JPG, PNG yoki WebP rasmlar tanlang.",
    "ko": "사진을 읽지 못했어요. 움직이지 않는 JPG, PNG, WebP 사진을 선택하세요."
  },
  "Your browser could not prepare this photo.": {
    "uz": "Brauzeringiz bu rasmni tayyorlay olmadi.",
    "ko": "브라우저에서 이 사진을 처리하지 못했어요."
  },
  "This photo could not be reduced. Please choose a smaller image.": {
    "uz": "Rasmni kichraytirib bo‘lmadi. Kichikroq rasm tanlang.",
    "ko": "사진을 줄이지 못했어요. 더 작은 사진을 선택하세요."
  },
  "This photo could not be read. Choose a still JPG, PNG or WebP image.": {
    "uz": "Rasm o‘qilmadi. Harakatsiz JPG, PNG yoki WebP rasm tanlang.",
    "ko": "사진을 읽지 못했어요. 움직이지 않는 JPG, PNG, WebP 사진을 선택하세요."
  },
  "Could not prepare or upload photos. Your selection has been kept.": {
    "uz": "Rasmlar tayyorlanmadi yoki yuklanmadi. Tanlovingiz saqlab turildi.",
    "ko": "사진 처리 또는 업로드에 실패했어요. 선택한 사진은 유지돼요."
  },
  "Please log in again to manage your listings.": {
    "uz": "E’lonlarni boshqarish uchun qayta kiring.",
    "ko": "상품을 관리하려면 다시 로그인하세요."
  },
  "Item removed from the marketplace.": {
    "uz": "E’lon bozordan o‘chirildi.",
    "ko": "상품을 마켓에서 삭제했어요."
  },
  "Item details saved. Photos could not be saved; check the photo section and retry.": {
    "uz": "Tafsilotlar saqlandi. Rasmlar saqlanmadi; rasmlar bo‘limini tekshirib qayta urinib ko‘ring.",
    "ko": "상품 정보는 저장됐어요. 사진은 저장되지 않았으니 확인 후 다시 시도하세요."
  },
  "We couldn’t confirm your changes. Your draft has been kept; please try again.": {
    "uz": "O‘zgarishlar tasdiqlanmadi. Ma’lumotlar saqlab turildi; qayta urinib ko‘ring.",
    "ko": "변경 사항을 확인하지 못했어요. 작성한 내용은 유지되니 다시 시도하세요."
  },
  "We couldn’t save your changes. Please try again.": {
    "uz": "O‘zgarishlar saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "변경 사항을 저장하지 못했어요. 다시 시도해 주세요."
  },
  "Keep at least one photo.": {
    "uz": "Kamida bitta rasm qoldiring.",
    "ko": "사진을 최소 한 장 남겨주세요."
  },
  "Photos are still saving. Please wait.": {
    "uz": "Rasmlar hali saqlanmoqda. Kuting.",
    "ko": "사진을 저장 중이에요. 기다려 주세요."
  },
  "Could not save photos. Please try again.": {
    "uz": "Rasmlar saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "사진을 저장하지 못했어요. 다시 시도해 주세요."
  },
  "Could not save. Please try again.": {
    "uz": "Saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "저장하지 못했어요. 다시 시도해 주세요."
  },
  "Choose a report reason.": {
    "uz": "Shikoyat sababini tanlang.",
    "ko": "신고 사유를 선택하세요."
  },
  "Keep report details within 1,000 characters.": {
    "uz": "Shikoyat tafsilotlari 1000 ta belgidan oshmasin.",
    "ko": "신고 내용은 1,000자 이내로 입력하세요."
  },
  "Confirm blocking this user.": {
    "uz": "Foydalanuvchini bloklashni tasdiqlang.",
    "ko": "사용자 차단을 확인하세요."
  },
  "Confirm removal first.": {
    "uz": "Avval o‘chirishni tasdiqlang.",
    "ko": "먼저 삭제를 확인하세요."
  },
  "Report received. You can follow its status in Safety & privacy. Duplicate reports are combined.": {
    "uz": "Shikoyat olindi. Holatini Xavfsizlik va maxfiylik bo‘limida kuzating. Takroriy shikoyatlar birlashtiriladi.",
    "ko": "신고를 접수했어요. 안전 및 개인정보에서 상태를 확인하세요. 중복 신고는 합쳐져요."
  },
  "User blocked. Messaging is now disabled between you.": {
    "uz": "Foydalanuvchi bloklandi. O‘zaro yozishish to‘xtatildi.",
    "ko": "사용자를 차단했어요. 서로 메시지를 보낼 수 없어요."
  },
  "User unblocked. Messaging is available unless they have blocked you.": {
    "uz": "Blok olib tashlandi. U sizni bloklamagan bo‘lsa, yozishish mumkin.",
    "ko": "차단을 해제했어요. 상대가 나를 차단하지 않았다면 메시지를 보낼 수 있어요."
  },
  "Review saved.": {
    "uz": "Tekshiruv natijasi saqlandi.",
    "ko": "검토 내용을 저장했어요."
  },
  "Today": {
    "uz": "Bugun",
    "ko": "오늘"
  },
  "Yesterday": {
    "uz": "Kecha",
    "ko": "어제"
  },
  "Just now": {
    "uz": "Hozirgina",
    "ko": "방금"
  },
  "{count}m": {
    "uz": "{count} daq",
    "ko": "{count}분 전"
  },
  "{count}h": {
    "uz": "{count} soat",
    "ko": "{count}시간 전"
  },
  "View {title}": {
    "uz": "{title} — ko‘rish",
    "ko": "{title} 보기"
  },
  "Save {title}": {
    "uz": "{title} — saqlash",
    "ko": "{title} 관심 등록"
  },
  "Unsave {title}": {
    "uz": "{title} — saqlanganlardan olish",
    "ko": "{title} 관심 해제"
  },
  "Download {name}": {
    "uz": "{name} — yuklab olish",
    "ko": "{name} 다운로드"
  },
  "Remove {name}": {
    "uz": "{name} — o‘chirish",
    "ko": "{name} 삭제"
  },
  "Chat with {name} about {title}": {
    "uz": "{title} haqida {name} bilan suhbat",
    "ko": "{title}에 관해 {name}님과 채팅"
  },
  "Now": {
    "uz": "Hozir",
    "ko": "지금"
  },
  "{count}m ago": {
    "uz": "{count} daqiqa oldin",
    "ko": "{count}분 전"
  },
  "{count}h ago": {
    "uz": "{count} soat oldin",
    "ko": "{count}시간 전"
  },
  "{count}d ago": {
    "uz": "{count} kun oldin",
    "ko": "{count}일 전"
  },
  "Choose your interface language. Theme settings are coming soon.": {
    "uz": "Interfeys tilini tanlang. Ko‘rinish sozlamalari tez kunda.",
    "ko": "화면 언어를 선택하세요. 테마 설정은 준비 중이에요."
  },
  "{count} unread messages": {
    "uz": "{count} ta o‘qilmagan xabar",
    "ko": "읽지 않은 메시지 {count}개"
  },
  "Seoul": {
    "uz": "Seul",
    "ko": "서울"
  },
  "Busan": {
    "uz": "Pusan",
    "ko": "부산"
  },
  "Daegu": {
    "uz": "Tegu",
    "ko": "대구"
  },
  "Incheon": {
    "uz": "Inchon",
    "ko": "인천"
  },
  "Gwangju": {
    "uz": "Kvanju",
    "ko": "광주"
  },
  "Daejeon": {
    "uz": "Tejon",
    "ko": "대전"
  },
  "Ulsan": {
    "uz": "Ulsan",
    "ko": "울산"
  },
  "Sejong": {
    "uz": "Sejong",
    "ko": "세종"
  },
  "Gyeonggi-do": {
    "uz": "Kyonggi viloyati",
    "ko": "경기도"
  },
  "Gangwon Special Self-Governing Province": {
    "uz": "Kangvon maxsus viloyati",
    "ko": "강원특별자치도"
  },
  "Chungcheongbuk-do": {
    "uz": "Shimoliy Chxunchxon viloyati",
    "ko": "충청북도"
  },
  "Chungcheongnam-do": {
    "uz": "Janubiy Chxunchxon viloyati",
    "ko": "충청남도"
  },
  "Jeonbuk Special Self-Governing Province": {
    "uz": "Chonbuk maxsus viloyati",
    "ko": "전북특별자치도"
  },
  "Jeollanam-do": {
    "uz": "Janubiy Cholla viloyati",
    "ko": "전라남도"
  },
  "Gyeongsangbuk-do": {
    "uz": "Shimoliy Kyongsang viloyati",
    "ko": "경상북도"
  },
  "Gyeongsangnam-do": {
    "uz": "Janubiy Kyongsang viloyati",
    "ko": "경상남도"
  },
  "Jeju Special Self-Governing Province": {
    "uz": "Cheju maxsus viloyati",
    "ko": "제주특별자치도"
  },
  "Andijon viloyati": {
    "uz": "Andijon viloyati",
    "ko": "안디잔주"
  },
  "Buxoro viloyati": {
    "uz": "Buxoro viloyati",
    "ko": "부하라주"
  },
  "Farg‘ona viloyati": {
    "uz": "Farg‘ona viloyati",
    "ko": "페르가나주"
  },
  "Jizzax viloyati": {
    "uz": "Jizzax viloyati",
    "ko": "지자흐주"
  },
  "Namangan viloyati": {
    "uz": "Namangan viloyati",
    "ko": "나망간주"
  },
  "Navoiy viloyati": {
    "uz": "Navoiy viloyati",
    "ko": "나보이주"
  },
  "Qashqadaryo viloyati": {
    "uz": "Qashqadaryo viloyati",
    "ko": "카슈카다리야주"
  },
  "Samarqand viloyati": {
    "uz": "Samarqand viloyati",
    "ko": "사마르칸트주"
  },
  "Sirdaryo viloyati": {
    "uz": "Sirdaryo viloyati",
    "ko": "시르다리야주"
  },
  "Surxondaryo viloyati": {
    "uz": "Surxondaryo viloyati",
    "ko": "수르한다리야주"
  },
  "Toshkent viloyati": {
    "uz": "Toshkent viloyati",
    "ko": "타슈켄트주"
  },
  "Xorazm viloyati": {
    "uz": "Xorazm viloyati",
    "ko": "호레즘주"
  },
  "Qoraqalpog‘iston Respublikasi": {
    "uz": "Qoraqalpog‘iston Respublikasi",
    "ko": "카라칼파크스탄 공화국"
  },
  "Toshkent shahri": {
    "uz": "Toshkent shahri",
    "ko": "타슈켄트시"
  },
  "{count} find shown": {
    "uz": "{count} ta e’lon ko‘rsatildi",
    "ko": "상품 {count}개 표시"
  },
  "Photos ({count}/{max})": {
    "uz": "Rasmlar ({count}/{max})",
    "ko": "사진 ({count}/{max})"
  },
  "Item photos · {count}/{max}": {
    "uz": "Buyum rasmlari · {count}/{max}",
    "ko": "상품 사진 · {count}/{max}"
  },
  "Photo {count}": {
    "uz": "Rasm {count}",
    "ko": "사진 {count}"
  },
  "Item photo {count}": {
    "uz": "Buyum rasmi {count}",
    "ko": "상품 사진 {count}"
  },
  "Use photo {count} as cover": {
    "uz": "{count}-rasmni muqova qilish",
    "ko": "사진 {count}을 대표 사진으로 설정"
  },
  "Remove photo {count}": {
    "uz": "{count}-rasmni o‘chirish",
    "ko": "사진 {count} 삭제"
  },
  "Add item photos": {
    "uz": "Buyum rasmlarini qo‘shish",
    "ko": "상품 사진 추가"
  },
  "Current cover": {
    "uz": "Joriy muqova",
    "ko": "현재 대표 사진"
  },
  "You have no saved items. Tap the bookmark on a marketplace listing to save it.": {
    "uz": "Saqlangan e’lonlar yo‘q. Saqlash uchun e’londagi xatcho‘p belgisini bosing.",
    "ko": "아직 관심 상품이 없어요. 상품의 북마크를 눌러 저장하세요."
  },
  "Log in to like items.": {
    "uz": "Like bosish uchun hisobga kiring.",
    "ko": "좋아요를 누르려면 로그인하세요."
  },
  "We couldn’t update your like. Please try again.": {
    "uz": "Like saqlanmadi. Qayta urinib ko‘ring.",
    "ko": "좋아요를 변경하지 못했어요. 다시 시도해 주세요."
  },
  "Likes notification": {
    "uz": "Like bildirishnomasi",
    "ko": "좋아요 알림"
  },
  "Like {title}": {
    "uz": "{title} — yoqtirish",
    "ko": "{title} 좋아요"
  },
  "Unlike {title}": {
    "uz": "{title} — like’ni bekor qilish",
    "ko": "{title} 좋아요 취소"
  },
  "{count} likes": {
    "uz": "{count} ta like",
    "ko": "좋아요 {count}개"
  },
  "Retry likes": {
    "uz": "Like’larni qayta yuklash",
    "ko": "좋아요 다시 불러오기"
  },
  "Likes are temporarily unavailable. Click to retry.": {
    "uz": "Like’lar vaqtincha ishlamayapti. Qayta yuklash uchun bosing.",
    "ko": "좋아요를 일시적으로 사용할 수 없어요. 눌러서 다시 시도하세요."
  }
};
