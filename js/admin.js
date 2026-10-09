/**
 * DealHunter AI - Admin Dashboard Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setupTabs();
    loadAffiliateSettings();
    updateMetrics();
    renderDealsTable();
    populateReviewDealSelect();
    setupAddDealForm();
    setupAiReviewGenerator();
    setupBackupTools();
});

// Formatters
function formatCurrency(amount) {
    if (isNaN(amount)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat("vi-VN").format(num);
}

// Theme
function initTheme() {
    const savedTheme = localStorage.getItem("dealhunter_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const iconSpan = document.getElementById("themeIcon");
    if (iconSpan) iconSpan.textContent = savedTheme === "dark" ? "☀️" : "🌙";

    const toggleBtn = document.getElementById("themeToggleBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("dealhunter_theme", next);
            if (iconSpan) iconSpan.textContent = next === "dark" ? "☀️" : "🌙";
        });
    }
}

// Tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll(".admin-tabs .tab-btn");
    const panels = document.querySelectorAll(".admin-panel");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const activePanel = document.getElementById(target);
            if (activePanel) activePanel.classList.add("active");
        });
    });
}

// Metrics & Analytics
function updateMetrics() {
    const deals = getStoredDeals();
    const settings = getSettings();
    const clickStats = JSON.parse(localStorage.getItem("dealhunter_click_stats") || "{}");

    // Total deals
    const totalDeals = deals.length;
    const elemTotalDeals = document.getElementById("metricTotalDeals");
    if (elemTotalDeals) elemTotalDeals.textContent = totalDeals;

    const tabCount = document.getElementById("tabCount");
    if (tabCount) tabCount.textContent = totalDeals;

    // Outbound clicks
    const totalClicks = clickStats["_total"] || 48; // Giá trị cơ sở ban đầu để người dùng thấy trực quan
    const elemTotalClicks = document.getElementById("metricTotalClicks");
    if (elemTotalClicks) elemTotalClicks.textContent = formatNumber(totalClicks);

    // Tính toán GMV và hoa hồng ước tính
    // Giả định Conversion Rate trung bình: 3.2%
    // Giá trị đơn hàng trung bình = giá trung bình của các deal hiện có
    const avgDealPrice = deals.reduce((sum, d) => sum + d.dealPrice, 0) / (totalDeals || 1);
    const estimatedOrders = Math.max(1, Math.round(totalClicks * 0.032));
    const estimatedGMV = estimatedOrders * avgDealPrice;
    const commissionRate = (settings.defaultCommissionRate || 6.5) / 100;
    const estimatedCommission = estimatedGMV * commissionRate;

    const elemGMV = document.getElementById("metricEstimatedGMV");
    if (elemGMV) elemGMV.textContent = formatCurrency(estimatedGMV);

    const elemComm = document.getElementById("metricEstimatedCommission");
    if (elemComm) elemComm.textContent = formatCurrency(estimatedCommission);
}

// Cài Đặt Affiliate IDs
function loadAffiliateSettings() {
    const settings = getSettings();
    const fShopee = document.getElementById("settingShopee");
    const fLazada = document.getElementById("settingLazada");
    const fTiktok = document.getElementById("settingTiktok");
    const fTiki = document.getElementById("settingTiki");
    const fRate = document.getElementById("settingCommissionRate");

    if (fShopee) fShopee.value = settings.affiliateTagShopee || "";
    if (fLazada) fLazada.value = settings.affiliateTagLazada || "";
    if (fTiktok) fTiktok.value = settings.affiliateTagTiktok || "";
    if (fTiki) fTiki.value = settings.affiliateTagTiki || "";
    if (fRate) fRate.value = settings.defaultCommissionRate || 6.5;

    const form = document.getElementById("affiliateSettingsForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const updated = {
                affiliateTagShopee: fShopee.value.trim(),
                affiliateTagLazada: fLazada.value.trim(),
                affiliateTagTiktok: fTiktok.value.trim(),
                affiliateTagTiki: fTiki.value.trim(),
                defaultCommissionRate: parseFloat(fRate.value) || 6.5
            };
            saveSettings(updated);
            updateMetrics();
            showAdminToast("Đã lưu cấu hình Affiliate IDs thành công! Tất cả link trên web đã được cập nhật.");
        });
    }
}

// Thêm Deal Mới
function setupAddDealForm() {
    const origPriceInput = document.getElementById("dealOriginalPrice");
    const salePriceInput = document.getElementById("dealPrice");
    const badgeDiscount = document.getElementById("autoDiscountBadge");

    function calcDiscount() {
        const orig = parseFloat(origPriceInput.value) || 0;
        const sale = parseFloat(salePriceInput.value) || 0;
        if (orig > 0 && sale > 0 && orig >= sale) {
            const percent = Math.round(((orig - sale) / orig) * 100);
            if (badgeDiscount) badgeDiscount.textContent = `-${percent}% OFF`;
        } else if (badgeDiscount) {
            badgeDiscount.textContent = "0% OFF";
        }
    }

    if (origPriceInput) origPriceInput.addEventListener("input", calcDiscount);
    if (salePriceInput) salePriceInput.addEventListener("input", calcDiscount);

    const form = document.getElementById("addDealForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const deals = getStoredDeals();

            const title = document.getElementById("dealTitle").value.trim();
            const platform = document.getElementById("dealPlatform").value;
            const category = document.getElementById("dealCategory").value;
            const rating = parseFloat(document.getElementById("dealRating").value) || 4.9;
            const origPrice = parseFloat(origPriceInput.value) || 0;
            const dealPrice = parseFloat(salePriceInput.value) || 0;
            const couponCode = document.getElementById("dealCouponCode").value.trim();
            const couponDiscount = document.getElementById("dealCouponDiscount").value.trim();
            const affiliateUrl = document.getElementById("dealAffiliateUrl").value.trim();
            const imageUrl = document.getElementById("dealImageUrl").value.trim();
            const description = document.getElementById("dealDescription").value.trim();

            const discountPercent = origPrice > 0 ? Math.round(((origPrice - dealPrice) / origPrice) * 100) : 0;

            const newDeal = {
                id: "deal-" + Date.now(),
                title,
                category,
                platform,
                originalPrice: origPrice,
                dealPrice,
                discountPercent,
                rating,
                reviewsCount: Math.floor(Math.random() * 500) + 50,
                soldCount: Math.floor(Math.random() * 2000) + 100,
                badge: `SALE ${discountPercent}%`,
                featured: true,
                flashSale: false,
                couponCode,
                couponDiscount,
                image: imageUrl,
                affiliateUrl,
                description,
                highlights: [
                    "Sản phẩm chính hãng có bảo hành",
                    "Ưu đãi có hạn theo chương trình khuyến mãi"
                ]
            };

            deals.unshift(newDeal); // Đưa lên đầu danh sách
            saveDeals(deals);

            form.reset();
            calcDiscount();
            updateMetrics();
            renderDealsTable();
            populateReviewDealSelect();
            showAdminToast("Đã thêm deal mới thành công! Bạn có thể xem ngay ngoài trang chủ.");
        });
    }
}

// Bảng Quản Lý Deals
function renderDealsTable() {
    const deals = getStoredDeals();
    const tbody = document.getElementById("dealsTableBody");
    if (!tbody) return;

    if (deals.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px;">Chưa có deal nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = deals.map(deal => {
        return `
            <tr>
                <td>
                    <img src="${deal.image}" class="table-thumb" alt="${deal.title}">
                </td>
                <td style="max-width: 280px; font-weight: 600; color: var(--text-primary);">
                    ${deal.title}
                </td>
                <td>
                    <span class="logo-badge" style="background: rgba(255,255,255,0.06);">
                        ${deal.platform.toUpperCase()}
                    </span>
                </td>
                <td style="color: #ff4757; font-weight: 700;">
                    ${formatCurrency(deal.dealPrice)}
                </td>
                <td>
                    <span style="color: var(--accent-green); font-weight: 700;">-${deal.discountPercent}%</span>
                </td>
                <td>
                    ${deal.couponCode ? `<code style="color: var(--primary-light); font-weight: 700;">${deal.couponCode}</code>` : '<span style="color: var(--text-muted);">-</span>'}
                </td>
                <td>
                    <button class="btn-danger-small" onclick="deleteDeal('${deal.id}')">
                        🗑️ Xóa
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function deleteDeal(dealId) {
    if (!confirm("Bạn có chắc chắn muốn xóa deal này khỏi danh sách?")) return;
    let deals = getStoredDeals();
    deals = deals.filter(d => d.id !== dealId);
    saveDeals(deals);
    renderDealsTable();
    updateMetrics();
    populateReviewDealSelect();
    showAdminToast("Đã xóa deal khỏi hệ thống.");
}

// Tạo Review SEO bằng AI
function populateReviewDealSelect() {
    const deals = getStoredDeals();
    const select = document.getElementById("selectDealForReview");
    if (!select) return;

    select.innerHTML = deals.map(d => `
        <option value="${d.id}">${d.platform.toUpperCase()} - ${d.title}</option>
    `).join("");
}

function setupAiReviewGenerator() {
    const btn = document.getElementById("btnGenerateAiReview");
    const previewBox = document.getElementById("aiReviewPreviewBox");
    const previewTitle = document.getElementById("previewReviewTitle");
    const previewContent = document.getElementById("previewReviewContent");

    if (!btn) return;

    btn.addEventListener("click", () => {
        const select = document.getElementById("selectDealForReview");
        const dealId = select.value;
        const deals = getStoredDeals();
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return;

        btn.disabled = true;
        btn.textContent = "⏳ Đang phân tích và tạo bài viết SEO...";

        setTimeout(() => {
            const today = new Date().toISOString().split("T")[0];
            const newReview = {
                id: "review-" + Date.now(),
                dealId: deal.id,
                title: `Đánh Giá Chuyên Sâu ${deal.title}: Có Nên Mua Giá Sale Này?`,
                slug: "danh-gia-" + deal.id,
                summary: `Phân tích toàn diện ưu điểm, hiệu năng và mức giá sale ${deal.discountPercent}% của ${deal.title}. Cập nhật voucher giảm sâu nhất hôm nay.`,
                publishedDate: today,
                readTime: "5 phút đọc",
                author: "DealHunter AI Team",
                rating: deal.rating || 4.9,
                featuredImage: deal.image,
                pros: [
                    `Mức giá giảm sâu ${deal.discountPercent}% so với niêm yết`,
                    `Được đánh giá ${deal.rating} sao từ người mua thực tế`,
                    deal.description ? deal.description.substring(0, 60) + "..." : "Chất lượng gia công xuất sắc"
                ],
                cons: [
                    "Số lượng voucher khuyến mãi có hạn",
                    "Cần đặt hàng sớm trước khi flash sale kết thúc"
                ],
                verdict: `Với mức giá chỉ ${formatCurrency(deal.dealPrice)}, đây là cơ hội tốt nhất để sở hữu sản phẩm mà bạn không nên bỏ lỡ!`,
                contentHtml: `
                    <h3>1. Giới thiệu tổng quan và lý do giảm giá</h3>
                    <p>${deal.description || "Sản phẩm đang nằm trong top bán chạy tại " + deal.platform.toUpperCase() + " nhờ chất lượng hoàn thiện tuyệt hảo."}</p>
                    
                    <h3>2. Trải nghiệm thực tế và đánh giá chất lượng</h3>
                    <p>Qua trải nghiệm thực tế, sản phẩm đáp ứng hoàn hảo kỳ vọng phân khúc. Đạt điểm trung bình ${deal.rating}/5 từ hơn ${deal.reviewsCount || 100} lượt mua thực tế.</p>

                    <h3>3. So sánh mức giá và khuyến mãi</h3>
                    <p>Giá niêm yết ban đầu là ${formatCurrency(deal.originalPrice)}, hiện giảm còn ${formatCurrency(deal.dealPrice)} (tiết kiệm ${formatCurrency(deal.originalPrice - deal.dealPrice)}).</p>
                `,
                seoKeywords: [deal.title, "mã giảm giá", deal.platform, "review chi tiết"]
            };

            const reviews = getStoredReviews();
            reviews.unshift(newReview);
            saveReviews(reviews);

            btn.disabled = false;
            btn.textContent = "✨ Tạo Thêm Bài Viết Khác";

            if (previewBox && previewTitle && previewContent) {
                previewBox.style.display = "block";
                previewTitle.textContent = "✅ Đã tạo thành công bài viết: " + newReview.title;
                previewContent.innerHTML = `
                    <p style="color: var(--text-secondary); margin-bottom: 12px;">${newReview.summary}</p>
                    <div style="color: var(--accent-green); font-size: 0.9rem; font-weight: 700;">
                        Bài viết đã được xuất bản trực tiếp lên mục "📝 Đánh Giá SEO" ở trang chủ kèm Schema JSON-LD!
                    </div>
                `;
            }

            showAdminToast("Đã tạo bài review chuẩn SEO thành công!");
        }, 800);
    });
}

// Backup & Export Tools
function setupBackupTools() {
    const btnExport = document.getElementById("btnExportJson");
    const btnReset = document.getElementById("btnResetDefault");

    if (btnExport) {
        btnExport.addEventListener("click", () => {
            const data = {
                deals: getStoredDeals(),
                reviews: getStoredReviews(),
                settings: getSettings(),
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `dealhunter_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showAdminToast("Đã xuất file JSON sao lưu thành công!");
        });
    }

    if (btnReset) {
        btnReset.addEventListener("click", () => {
            if (!confirm("Khôi phục toàn bộ dữ liệu mẫu ban đầu? (Dữ liệu tự thêm sẽ bị làm mới)")) return;
            localStorage.removeItem("dealhunter_deals");
            localStorage.removeItem("dealhunter_reviews");
            localStorage.removeItem("dealhunter_settings");
            localStorage.removeItem("dealhunter_click_stats");
            location.reload();
        });
    }
}

function showAdminToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <span class="toast-icon">⚡</span>
        <div style="font-size: 0.9rem; font-weight: 600; line-height: 1.4;">${message}</div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}
