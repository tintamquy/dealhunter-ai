#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DealHunter AI - Công Cụ Tự Động Hóa Săn Deal & Tạo Bài Viết Tiếp Thị Liên Kết
Hỗ trợ:
1. Tạo kịch bản chia sẻ Facebook / Zalo / Telegram tự động kèm link Affiliate
2. Tạo bài viết chuẩn SEO dạng Markdown để đăng blog / website
3. Tính toán hoa hồng và doanh số ước tính
"""

import json
import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def format_vnd(amount):
    return f"{amount:,.0f} ₫".replace(",", ".")

def generate_social_share_copy(deal, affiliate_id="dealhunter-20"):
    """Tạo mẫu bài đăng mạng xã hội (Facebook, Telegram, Zalo) thu hút click"""
    savings = deal['originalPrice'] - deal['dealPrice']
    aff_link = f"{deal['affiliateUrl']}?af_sub1={affiliate_id}"
    
    template = f"""
🔥 [HOT SALE {deal['discountPercent']}%] {deal['title']}
📉 Giá gốc: {format_vnd(deal['originalPrice'])}
💥 GIÁ ĐÁY HÔM NAY: {format_vnd(deal['dealPrice'])} (Tiết kiệm {format_vnd(savings)})

🌟 Điểm nổi bật:
{chr(10).join(f"• {h}" for h in deal.get('highlights', []))}

🎟️ Mã giảm giá độc quyền: {deal.get('couponCode', 'Không có')}
🛒 Link săn deal chính hãng tại đây:
👉 {aff_link}

(Số lượng voucher có hạn, nhanh tay kẻo hết!)
--------------------------------------------------
"""
    return template

def generate_seo_markdown(deal):
    """Tạo bài viết review chuẩn SEO định dạng Markdown"""
    savings = deal['originalPrice'] - deal['dealPrice']
    md = f"""# Đánh Giá Chi Tiết: {deal['title']}

## 1. Giới thiệu tổng quan
Sản phẩm **{deal['title']}** trên nền tảng **{deal['platform'].upper()}** hiện đang có mức giảm giá chấn động lên tới **{deal['discountPercent']}%**.

- **Giá gốc:** {format_vnd(deal['originalPrice'])}
- **Giá ưu đãi:** {format_vnd(deal['dealPrice'])}
- **Mức tiết kiệm:** {format_vnd(savings)}
- **Đánh giá người dùng:** ⭐ {deal['rating']}/5.0 ({deal['reviewsCount']} lượt mua)

## 2. Vì sao nên mua lúc này?
{deal['description']}

### Các ưu điểm vượt trội:
{chr(10).join(f"- **{h}**" for h in deal.get('highlights', []))}

## 3. Mã giảm giá kèm theo
Áp dụng mã **`{deal.get('couponCode', 'DEALHOT')}`** để nhận thêm ưu đãi: *{deal.get('couponDiscount', 'Giảm trực tiếp')}*.

[👉 BẤM VÀO ĐÂY ĐỂ ĐẾN SÀN MUA VỚI GIÁ RẺ NHẤT]({deal['affiliateUrl']})
"""
    return md

def main():
    print("=" * 60)
    print(" DealHunter AI - Công Cụ Hỗ Trợ Tạo Thu Nhập Thụ Động ")
    print("=" * 60)
    
    sample_deal = {
        "title": "Tai nghe Sony WH-1000XM5 Chống Ồn Cao Cấp",
        "platform": "shopee",
        "originalPrice": 8490000,
        "dealPrice": 6290000,
        "discountPercent": 26,
        "rating": 4.9,
        "reviewsCount": 1420,
        "couponCode": "SONYSONIC10",
        "couponDiscount": "Giảm 200K",
        "affiliateUrl": "https://shopee.vn/product/sony-wh-1000xm5",
        "description": "Tai nghe khử ồn hàng đầu thế giới với vi xử lý V1 kép và thời lượng pin 30 giờ.",
        "highlights": [
            "Công nghệ khử ồn tốt nhất phân khúc",
            "Thời lượng pin 30 giờ sạc siêu nhanh",
            "Âm thanh Hi-Res Audio Wireless sắc nét"
        ]
    }
    
    print("\n[1] Mẫu nội dung đăng Facebook / Telegram / Zalo tự động:")
    print(generate_social_share_copy(sample_deal))
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(output_dir, "sample_review.md")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(generate_seo_markdown(sample_deal))
        
    print(f"[2] Đã xuất bản bài viết SEO mẫu tại: {output_file}")
    print("\n✓ Hoàn tất! Bạn có thể tích hợp kịch bản này vào Bot Telegram hoặc tự động đăng bài.")

if __name__ == "__main__":
    main()
