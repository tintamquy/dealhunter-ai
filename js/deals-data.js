/**
 * DealHunter AI - Kho dữ liệu Deal & Tiếp thị liên kết
 * Hỗ trợ lưu trữ local và đồng bộ với LocalStorage
 */

const DEFAULT_SETTINGS = {
    siteName: "DealHunter AI",
    affiliateTagShopee: "dealhunter-20",
    affiliateTagLazada: "dealhunter_laz",
    affiliateTagTiki: "dealhunter_tk",
    affiliateTagTiktok: "dealhunter_tt",
    customShortener: "",
    defaultCommissionRate: 6.5 // trung bình 6.5% hoa hồng
};

const INITIAL_DEALS = [
    {
        id: "deal-01",
        title: "Tai nghe chống ồn Sony WH-1000XM5 Chính Hãng Hi-Res Audio",
        category: "electronics",
        platform: "shopee",
        originalPrice: 8490000,
        dealPrice: 6290000,
        discountPercent: 26,
        rating: 4.9,
        reviewsCount: 1420,
        soldCount: 3890,
        badge: "HOT SALE 26%",
        featured: true,
        flashSale: true,
        expiresInHours: 7,
        couponCode: "SONYSONIC10",
        couponDiscount: "Giảm thêm 200K",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://shopee.vn/product/sony-wh-1000xm5",
        description: "Tai nghe chống ồn chủ động hàng đầu thế giới với vi xử lý V1 và QN1 kép, thời lượng pin 30 giờ, đàm thoại AI siêu nét.",
        highlights: [
            "Công nghệ khử ồn tốt nhất hiện nay",
            "Thời lượng pin 30h sạc nhanh 3 phút nghe 3h",
            "Thiết kế công thái học siêu êm ái"
        ]
    },
    {
        id: "deal-02",
        title: "Bàn phím cơ không dây NuPhy Air75 V2 Slim Gateron Low Profile",
        category: "electronics",
        platform: "lazada",
        originalPrice: 3200000,
        dealPrice: 2490000,
        discountPercent: 22,
        rating: 4.8,
        reviewsCount: 560,
        soldCount: 1200,
        badge: "GIÁ ĐÁY",
        featured: true,
        flashSale: true,
        expiresInHours: 14,
        couponCode: "NUPHYTECH",
        couponDiscount: "Giảm 150K đơn từ 2TR",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://lazada.vn/products/nuphy-air75-v2",
        description: "Bàn phím cơ low profile mỏng nhẹ cho Mac & Windows, kết nối 3 chế độ (2.4Ghz, Bluetooth 5.1, Type-C), hỗ trợ QMK/VIA.",
        highlights: [
            "Tương thích Mac/Windows hoàn hảo",
            "Switch Gateron Low-profile gõ êm mượt",
            "Thiết kế siêu mỏng tiện mang di chuyển"
        ]
    },
    {
        id: "deal-03",
        title: "Nồi chiên không dầu Philips NA230/00 Dung tích 6.2L Cửa sổ kính",
        category: "home",
        platform: "shopee",
        originalPrice: 3890000,
        dealPrice: 1990000,
        discountPercent: 49,
        rating: 4.9,
        reviewsCount: 2310,
        soldCount: 8400,
        badge: "GIẢM SÂU 49%",
        featured: true,
        flashSale: false,
        expiresInHours: 24,
        couponCode: "PHILIPSSHOP50",
        couponDiscount: "Giảm 50K phí vận chuyển",
        image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://shopee.vn/product/philips-na230-airfryer",
        description: "Công nghệ Rapid Air giảm 90% dầu mỡ thừa, khoang nấu lớn 6.2 lít cho cả gia đình, kính quan sát thông minh không cần mở nắp.",
        highlights: [
            "Dung tích lớn 6.2L nấu cả con gà",
            "Mặt kính trong suốt dễ theo dõi món ăn",
            "Công nghệ Rapid Air hạn chế khói và mỡ"
        ]
    },
    {
        id: "deal-04",
        title: "Máy hút ẩm và lọc không khí thông minh Xiaomi Smart Dehumidifier 22L",
        category: "home",
        platform: "tiktok",
        originalPrice: 5490000,
        dealPrice: 4150000,
        discountPercent: 24,
        rating: 4.8,
        reviewsCount: 890,
        soldCount: 3100,
        badge: "BÁN CHẠY",
        featured: true,
        flashSale: false,
        expiresInHours: 48,
        couponCode: "XIAOMIHOME",
        couponDiscount: "Voucher 100K",
        image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://shop.tiktok.com/view/product/xiaomi-dehumidifier",
        description: "Công suất hút ẩm mạnh mẽ 22L/ngày, kết nối app Mi Home điều khiển từ xa, vận hành êm ái chống ồn dưới 35.5dB.",
        highlights: [
            "Hút ẩm cực nhanh cho diện tích lên tới 40m²",
            "Bình chứa nước lớn 4.5L có ống xả liên tục",
            "Độ ồn cực thấp không ảnh hưởng giấc ngủ"
        ]
    },
    {
        id: "deal-05",
        title: "Đồng hồ thông minh Apple Watch Series 9 GPS 45mm Viền Nhôm",
        category: "electronics",
        platform: "shopee",
        originalPrice: 11290000,
        dealPrice: 8890000,
        discountPercent: 21,
        rating: 5.0,
        reviewsCount: 3400,
        soldCount: 6500,
        badge: "APPLE CHÍNH HÃNG",
        featured: true,
        flashSale: true,
        expiresInHours: 5,
        couponCode: "APPLECARE",
        couponDiscount: "Giảm ngay 300K",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://shopee.vn/product/apple-watch-s9-45mm",
        description: "Chip S9 SiP đột phá, thao tác cử chỉ Double Tap tiện lợi, màn hình sáng gấp đôi 2000 nits, theo dõi sức khỏe và ECG chuẩn xác.",
        highlights: [
            "Cử chỉ chạm hai lần thông minh",
            "Màn hình OLED sáng rực 2000 nits ngoài trời",
            "Đo nồng độ oxy trong máu và điện tâm đồ"
        ]
    },
    {
        id: "deal-06",
        title: "Serum chống lão hóa Kiehl's Retinol Skin-Renewing Daily Micro-Dose 50ml",
        category: "beauty",
        platform: "lazada",
        originalPrice: 2600000,
        dealPrice: 1890000,
        discountPercent: 27,
        rating: 4.9,
        reviewsCount: 1780,
        soldCount: 4900,
        badge: "MỸ PHẨM CAO CẤP",
        featured: false,
        flashSale: false,
        expiresInHours: 36,
        couponCode: "KIEHLS2026",
        couponDiscount: "Tặng kèm minisize 10ml",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://lazada.vn/products/kiehls-retinol-micro-dose",
        description: "Retinol tái tạo da hằng ngày với công nghệ vi liều nhẹ nhàng, giảm thiểu tối đa kích ứng, da căng mịn và săn chắc rõ rệt sau 4 tuần.",
        highlights: [
            "Công thức Retinol nguyên chất vi liều an toàn",
            "Kết hợp Peptide và Ceramides củng cố màng da",
            "Dùng được cho cả làn da nhạy cảm mới bắt đầu"
        ]
    },
    {
        id: "deal-07",
        title: "Giày Chạy Bộ Nam Nike Pegasus 41 Công Nghệ Đệm ReactX",
        category: "fashion",
        platform: "shopee",
        originalPrice: 3829000,
        dealPrice: 2590000,
        discountPercent: 32,
        rating: 4.8,
        reviewsCount: 920,
        soldCount: 2200,
        badge: "SALE THỂ THAO",
        featured: false,
        flashSale: true,
        expiresInHours: 11,
        couponCode: "NIKERUNNER",
        couponDiscount: "Giảm 120K",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://shopee.vn/product/nike-pegasus-41",
        description: "Bọt đệm ReactX đàn hồi năng lượng cao hơn 13%, túi khí Air Zoom đôi êm ái, lưới kỹ thuật thoáng khí tối đa cho cự ly dài.",
        highlights: [
            "Đệm bọt ReactX phản hồi lực bứt phá",
            "Thân giày lưới thoáng khí cao cấp",
            "Đế cao su dẻo bám đường cực tốt"
        ]
    },
    {
        id: "deal-08",
        title: "Ghế công thái học Ergonomic Sihoo Doro C300 Đỡ thắt lưng tự động",
        category: "home",
        platform: "tiki",
        originalPrice: 7990000,
        dealPrice: 5590000,
        discountPercent: 30,
        rating: 4.9,
        reviewsCount: 450,
        soldCount: 980,
        badge: "CHỐNG ĐAU LƯNG",
        featured: false,
        flashSale: false,
        expiresInHours: 72,
        couponCode: "SIHOOFURN",
        couponDiscount: "Freeship toàn quốc",
        image: "https://images.unsplash.com/photo-1580481077195-c328a37db729?w=600&auto=format&fit=crop&q=80",
        affiliateUrl: "https://tiki.vn/ghe-cong-thai-hoc-sihoo-doro-c300",
        description: "Đệm lưng tự thích ứng đa chiều Dynamic Lumbar, tựa tay 6D gập mở linh hoạt, đệm lưới Cloud đàn hồi cao cấp không bị chùng lún.",
        highlights: [
            "Lưng ghế tự điều chỉnh theo chuyển động",
            "Lưới Cloud thông thoáng ngồi 8 tiếng không bí",
            "Piston Class 4 đạt chứng nhận an toàn quốc tế"
        ]
    }
];

// Helper lưu trữ & nạp deal
function getStoredDeals() {
    try {
        const stored = localStorage.getItem("dealhunter_deals");
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Lỗi đọc deals từ localStorage:", e);
    }
    return INITIAL_DEALS;
}

function saveDeals(deals) {
    localStorage.setItem("dealhunter_deals", JSON.stringify(deals));
}

function getSettings() {
    try {
        const stored = localStorage.getItem("dealhunter_settings");
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
        console.error("Lỗi đọc settings:", e);
    }
    return DEFAULT_SETTINGS;
}

function saveSettings(settings) {
    localStorage.setItem("dealhunter_settings", JSON.stringify(settings));
}

// Hàm tự động gắn affiliate tag theo từng sàn
function buildAffiliateUrl(originalUrl, platform) {
    const settings = getSettings();
    try {
        const url = new URL(originalUrl);
        if (platform === "shopee" && settings.affiliateTagShopee) {
            url.searchParams.set("af_sub1", settings.affiliateTagShopee);
            url.searchParams.set("utm_source", "dealhunter_affiliate");
        } else if (platform === "lazada" && settings.affiliateTagLazada) {
            url.searchParams.set("aff_sub", settings.affiliateTagLazada);
        } else if (platform === "tiki" && settings.affiliateTagTiki) {
            url.searchParams.set("utm_aff", settings.affiliateTagTiki);
        } else if (platform === "tiktok" && settings.affiliateTagTiktok) {
            url.searchParams.set("referral_code", settings.affiliateTagTiktok);
        }
        return url.toString();
    } catch (e) {
        // Nếu không phải URL tuyệt đối, return kèm query
        return originalUrl;
    }
}
